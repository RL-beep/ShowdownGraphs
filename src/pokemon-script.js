import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";


const firebaseConfig = {
  storageBucket: 'gs://smogon-stats.appspot.com/'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const spaceRef = ref(getStorage(app), 'smogon-stats.xls');

// Object to store all Pokémon details such as nam and image offsets
let allPokedexDetails = {
    name: [],
    imageXOffset: [],
    imageYOffset: []
}; 

let selectedPokemon = []; // Array to store selected Pokémon to be displayed on the graph

let sheetDataCache = {}; // Cache for storing sheet data

let uniqueSnapshots = []; // Array to store unique snapshot values

const sheetDropdown = document.getElementById('sheet-dropdown');
let selectedSheetName;
let minDateToMaxDate;
let slicedXAxis;
const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions-list');
const graphContainer = document.getElementById('pokemon-graph');
const minDataDropdown = document.getElementById('min-data-dropdown');
const maxDataDropdown = document.getElementById('max-data-dropdown');
const DateDataDropdowns = document.getElementById('date-data-dropdowns');
const clearAllButton = document.getElementById('clear-all-button');
const populateTop5Button = document.getElementById('populate-top-5-button');
const populateTop10Button = document.getElementById('populate-top-10-button');
const populateTop25Button = document.getElementById('populate-top-25-button');
const searchResults = document.getElementById('search-results');





// JavaScript for handling the search functionality
document.addEventListener('DOMContentLoaded', function(){
    getAllPokedexDetails();
    getAllSheetNames();
    getTierUsages();
    initializePage();
    populateTop5Button.addEventListener('click', populateTop5Button.addEventListener('click', () => populateTopPokemon(5)));
    populateTop10Button.addEventListener('click', populateTop10Button.addEventListener('click', () => populateTopPokemon(10)));
    populateTop25Button.addEventListener('click', populateTop25Button.addEventListener('click', () => populateTopPokemon(25)));
    clearAllButton.addEventListener('click', clearAllSelectedPokemon);
    toggleClearAllButtonVisibility();
    toggleSearchContainerVisibility();
});

function getAllPokedexDetails() {
    // Get the download URL for the file
    getDownloadURL(spaceRef)
      .then((url) => {
        // Now you have the download URL, you can use it to fetch the file
        fetch(url)
          .then((response) => response.arrayBuffer()) // Use arrayBuffer for XLSX files
          .then((data) => {
            // Parse the XLSX data
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const pokedexSheetName = 'Pokedex';
  
            // Convert XLSX sheet to an array of objects
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[pokedexSheetName]);
  
            // Extract Pokémon names from the sheet data (skip the first row)
            for (let i = 0; i < sheetData.length; i++) {
              const row = sheetData[i];
              const pokemonName = row['Pokemon Name'];
              const pokemonImageOffsetX = row['Pokemon Image Offset X'];
              const pokemonImageOffsetY = row['Pokemon Image Offset Y'];

              if (pokemonName) {
                allPokedexDetails.name.push(pokemonName);
                allPokedexDetails.imageXOffset.push(pokemonImageOffsetX);
                allPokedexDetails.imageYOffset.push(pokemonImageOffsetY);
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching file:", error);
          });
      })
      .catch((error) => {
        console.error("Error getting download URL:", error);
      });
}

function GraphErrorMessage(message) {

    let errorMessageContainer = document.getElementById('error-message');

    if (!errorMessageContainer) {
        // Create the error message container if it doesn't exist
        errorMessageContainer = document.createElement('div');
        errorMessageContainer.id = 'error-message';
        errorMessageContainer.style.fontWeight = "bold";
        errorMessageContainer.style.color = "red";
        DateDataDropdowns.appendChild(errorMessageContainer);
    }

    errorMessageContainer.innerText = message;
}


function updateGraph() {
    // Create data for the selected Pokémon
    const data = selectedPokemon.map(pokemonName => {

        slicedXAxis = minDateToMaxDate.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1)

        const usageData = sheetDataCache[selectedSheetName][pokemonName].usage.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1);
        const graphXAxis = slicedXAxis || minDateToMaxDate;

        // Check the length of graphXAxis
        if (Array.isArray(graphXAxis) && graphXAxis.length === 1) {
            // Clear the error message when there's data
            GraphErrorMessage('');
            // If the length is one, create a bar chart
            return {
                x: [pokemonName], // Use the Pokémon name as the x-axis value
                y: usageData,   // Pokémon's usage data for the y-axis
                type: 'bar',
                name: pokemonName,
            };
        } else if (Array.isArray(graphXAxis) && graphXAxis.length > 1) {
            // Clear the error message when there's data
            GraphErrorMessage('');
            // Otherwise, if it's greater than 1 create a scatter plot
            return {
                x: graphXAxis,
                y: usageData,
                type: 'scatter',
                mode: 'lines+markers',
                name: pokemonName,
                hovertemplate: `Pokémon: ${pokemonName} <br>Usage: %{y}%`
            };
        } else {
            // Return an empty object when there's no data
            GraphErrorMessage('Please enter a valid date range');
            return {};
        }
    });

    // Define the layout of the graph
    const layout = {
        title: `${formatSheetName(selectedSheetName)}`,
        xaxis: {
            title: 'Monthly Snapshot',
            dtick: 'M1',
            showline: true,
        },
        yaxis: {
            title: 'Usage (%)',
        },
        hovermode: 'closest', // Enable hover events
    };

    // Add a custom hover event handler to show only the data point for the current Pokemon being hovered over
    graphContainer.addEventListener('plotly_hover', (eventData) => {
        if (eventData.points.length > 0) {
            const pointIndex = eventData.points[0].pointIndex;
            const traceIndex = eventData.points[0].curveNumber;
            const hoverData = [];
            hoverData[traceIndex] = data[traceIndex];
            hoverData[traceIndex].x = hoverData[traceIndex].x.slice(pointIndex, pointIndex + 1);
            hoverData[traceIndex].y = hoverData[traceIndex].y.slice(pointIndex, pointIndex + 1);
            Plotly.update(graphContainer, hoverData);
        }
    });

    // Plot the graph
    Plotly.newPlot(graphContainer, data, layout);
}



function handleSearchInput() {

    const searchTerm = searchInput.value.toLowerCase();
    const matchingSuggestions = allPokedexDetails.name.filter(pokemon => {
        return pokemon.toLowerCase().includes(searchTerm);
    });

    // Clear previous suggestions
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'block';

    // Display matching suggestions
    matchingSuggestions.forEach(pokemon => {
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = pokemon;
        suggestionsList.appendChild(suggestionItem);
    });
}

function handleSuggestionClick(event) {
    if (event.target.tagName === 'LI') {
        const selectedPokemonName = event.target.textContent;
        // Check if the Pokémon is not already selected
        if (!selectedPokemon.includes(selectedPokemonName)) {
            selectedPokemon.push(selectedPokemonName);
            updateSelectedPokemonDisplay();
        } 

        // Hide the suggestions list if the input is empty
        suggestionsList.style.display = 'none';
        searchInput.value = ''; // Clear the search input
        suggestionsList.innerHTML = ''; // Clear suggestions
    }
}

function updateSelectedPokemonDisplay() {
    searchResults.innerHTML = '';

    selectedPokemon.forEach(function(pokemonName) {
    const result = sheetDataCache[selectedSheetName][pokemonName];

        if (result) {
            const listItem = document.createElement('li');

            // Get the index of the Pokémon in the allPokedexDetails object
            let resultPokemonIndex = (allPokedexDetails.name.indexOf(result.name));
            let resultPokemonImageXOffset = allPokedexDetails.imageXOffset[resultPokemonIndex];
            let resultPokemonImageYOffset = allPokedexDetails.imageYOffset[resultPokemonIndex];
            
            // Create the div element with the specified style (inside the li)
            const divElement = document.createElement('div');
            divElement.style.background = `transparent url(https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png?v14) no-repeat scroll ${resultPokemonImageXOffset}px ${resultPokemonImageYOffset}px`;
            divElement.style.width = '40px';
            divElement.style.height = '30px';
            
            // Create a container for the Pokémon name and remove button
            const contentContainer = document.createElement('div');
            contentContainer.textContent = pokemonName;

            // Create a remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'X';
            removeButton.className = 'remove-button';

            // Add a click event listener to the element
            listItem.addEventListener('click', function() {
                // Remove the Pokémon from the selectedPokemon array
                const index = selectedPokemon.indexOf(pokemonName);
                if (index !== -1) {
                    selectedPokemon.splice(index, 1);
                    // Update the display and graph
                    updateSelectedPokemonDisplay();
                    toggleSearchContainerVisibility();
                }
            });

            // Append the div element, content container, and remove button to the list item
            listItem.appendChild(divElement);
            listItem.appendChild(contentContainer);
            listItem.appendChild(removeButton);

            searchResults.appendChild(listItem);
            toggleClearAllButtonVisibility();
            toggleSearchContainerVisibility();
            // Hide the suggestions list if the input is empty
            suggestionsList.style.display = 'none';
        }
    });

    // Update the graph with the selected Pokémon's data
    updateGraph();
}

function getAllSheetNames() {
    getDownloadURL(spaceRef)
        .then((url) => {
            fetch(url)
                .then((response) => response.arrayBuffer())
                .then((data) => {
                    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });

                    // Get an array of sheet names from the workbook
                    const sheetNames = workbook.SheetNames;

                    // Call the function to populate the dropdown with sheet names
                    populateSheetDropdown(sheetNames);
                })
                .catch((error) => {
                    console.error("Error fetching file:", error);
                });
        })
        .catch((error) => {
            console.error("Error getting download URL:", error);
        });
}

// Function to format the sheet name
function formatSheetName(sheetName) {
    try {
        // Find the index of the first '-' character
        const dashIndex = sheetName.indexOf('-');
        
        // Use regex to find the first occurrence of a number
        const match = sheetName.match(/\d/);

        // If there is a dash, capitalize all characters before it and add a space after the first number
        if (dashIndex !== -1) {
            const formattedName = (match)
                ? sheetName.substr(0, dashIndex).toUpperCase().replace(/(\d)/, '$1 ')
                : sheetName.substr(0, dashIndex).toUpperCase();
            return formattedName;
        }
        
        // If no dash is found, simply capitalize the whole name
        return sheetName.toUpperCase();
    } catch (error) {
        // If an error occurs, return a blank string
        return '';
    }
}

function populateSheetDropdown(sheetNames) {

    // Populate the dropdown with formatted sheet names
    sheetNames.forEach(sheetName => {
        if (sheetName !== "Pokedex") {
            const option = document.createElement('option');
            option.value = sheetName;
            option.text = formatSheetName(sheetName);
            sheetDropdown.appendChild(option);
        }
    });

    // Set the initially selected sheet
    selectedSheetName = sheetNames[1]; // This will be first sheet that isn't pokedex
    // Add an event listener to the dropdown to handle sheet selection
    sheetDropdown.addEventListener('change', handleSheetSelection);

}

function getMinMaxDatesFromCurrentCache() {
    const sheetData = sheetDataCache[selectedSheetName];
    if (!sheetData) {
        return; // Selected sheet data not found in cache, do nothing
    }

    // Get all snapshots from the selected sheet's data
    const allSnapshots = [];
    for (const pokemonKey in sheetData) {
        if (sheetData.hasOwnProperty(pokemonKey)) {
            const snapshots = sheetData[pokemonKey].snapshot;
            allSnapshots.push(...snapshots);
        }
    }

    // Get unique snapshot values
    uniqueSnapshots = Array.from(new Set(allSnapshots));

    // Sort the snapshot values if needed
    uniqueSnapshots.sort(); // You can customize the sorting logic as per your requirements

    // Clear existing options
    minDataDropdown.innerHTML = '';
    maxDataDropdown.innerHTML = '';

    uniqueSnapshots.forEach((snapshot) => {
        const option = document.createElement('option');
        option.value = snapshot;
        option.text = snapshot;
        minDataDropdown.appendChild(option.cloneNode(true));
        maxDataDropdown.appendChild(option.cloneNode(true));
    });

   
    // Initial value for min is the earliest date
    minDataDropdown.value = uniqueSnapshots[0];
    // Initial value for max is the latest date
    maxDataDropdown.value = uniqueSnapshots[uniqueSnapshots.length - 1];

    // Array of snapshots to be used for the graph's x-axis
    minDateToMaxDate = uniqueSnapshots;

    // Add event listeners to handle changes in "Min Data" and "Max Data" dropdowns
    minDataDropdown.addEventListener('change', updateGraph);
    maxDataDropdown.addEventListener('change', updateGraph);
}

function handleSheetSelection() {
    selectedSheetName = sheetDropdown.value;
    getTierUsages()
}

function getTierUsages() {
    // Check if the data for the selected sheet is already in the cache
    if (sheetDataCache[selectedSheetName]) {
        // Data for this sheet is already in the cache, update the graph
        getMinMaxDatesFromCurrentCache()
        updateGraph();
        return;
    }

    // Data for this sheet is not in the cache, fetch it
    // Get the download URL for the file
    getDownloadURL(spaceRef)
        .then((url) => {
            // Now you have the download URL, you can use it to fetch the file
            fetch(url)
                .then((response) => response.arrayBuffer()) // Use arrayBuffer for XLSX files
                .then((data) => {
                    // Parse the XLSX data
                    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[selectedSheetName]);

                    sheetData.forEach((row) => {
                        const pokemonName = row['Pokemon Name'];

                        // Create a new object for this sheet's data if it doesn't exist
                        if (!sheetDataCache[selectedSheetName]) {
                            sheetDataCache[selectedSheetName] = {};
                        }

                        if (!sheetDataCache[selectedSheetName][pokemonName]) {
                            sheetDataCache[selectedSheetName][pokemonName] = {
                                name: pokemonName,
                                usage: [],
                                snapshot: []
                                
                            };
                        }

                        sheetDataCache[selectedSheetName][pokemonName].usage.push(row.Usage);
                        sheetDataCache[selectedSheetName][pokemonName].snapshot.push(row.Snapshot);

                    });
                    getMinMaxDatesFromCurrentCache()
                    updateGraph();
                })
                .catch((error) => {
                    console.error("Error fetching file:", error);
                });
        })
        .catch((error) => {
            console.error("Error getting download URL:", error);
        });
}


function populateTopPokemon(topPokemonNumber) {
    // Ensure that the max date is selected
    const selectedMaxDate = maxDataDropdown.selectedIndex;
    // Check if data for the selected sheet is in the cache
    if (!selectedSheetName || !selectedMaxDate || !sheetDataCache[selectedSheetName]) {
      return;
    }
  
    // Get the sheet data for the selected sheet
    const sheetData = sheetDataCache[selectedSheetName];
    const sheetDataForSelectedIndex = {};
  
    // Populate sheetDataForSelectedIndex as before
    Object.keys(sheetData).forEach((key) => {
      if (
        sheetData[key]["usage"].length > selectedMaxDate &&
        sheetData[key]["snapshot"].length > selectedMaxDate
      ) {
        sheetDataForSelectedIndex[key] = {
          "usage": sheetData[key]["usage"][selectedMaxDate],
          "snapshot": sheetData[key]["snapshot"][selectedMaxDate]
        };
      }
    });
  
    // Convert sheetDataForSelectedIndex to an array of key-value pairs
    const sheetDataArray = Object.entries(sheetDataForSelectedIndex);
  
    // Sort the array based on the "usage" values in descending order
    sheetDataArray.sort((a, b) => b[1]["usage"] - a[1]["usage"]);
  
    // Convert the sorted array back to an object
    const sortedSheetData = Object.fromEntries(sheetDataArray);
  
    // Get the top N keys
    selectedPokemon = Object.keys(sortedSheetData).slice(0, topPokemonNumber);

    updateSelectedPokemonDisplay();
  }

// Function to clear all selected Pokémon
function clearAllSelectedPokemon() {
    selectedPokemon = [];
    updateSelectedPokemonDisplay();
    toggleClearAllButtonVisibility();
    toggleSearchContainerVisibility();
}

// Hide or show the "Clear All" button based on selectedPokemon array
function toggleClearAllButtonVisibility() {
    if (selectedPokemon.length > 0) {
        clearAllButton.style.display = 'block';
    } else {
        clearAllButton.style.display = 'none';
    }
}

function toggleSearchContainerVisibility(){

    if (selectedPokemon.length > 0) {
        searchResults.style.display = 'flex';
    } else {
        searchResults.style.display = 'none';
    }
}


function initializePage() {

    // Initialize an empty graph when the page loads
    updateGraph();

    searchInput.addEventListener('input', handleSearchInput);
    suggestionsList.addEventListener('click', handleSuggestionClick);
}







