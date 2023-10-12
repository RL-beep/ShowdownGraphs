import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";


const firebaseConfig = {
  storageBucket: 'gs://smogon-stats.appspot.com/'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Object to store all Pokémon details such as nam and image offsets
let allPokedexDetails = {
    name: [],
    imageXOffset: [],
    imageYOffset: []
}; 

let selectedPokemon = []; // Array to store selected Pokémon to be displayed on the graph

let sheetDataCache = {}; // Cache for storing sheet data

let uniqueSnapshots = []; // Array to store unique snapshot values

let firstSelectionChanged = false; //flag to check if the default empty selection has changed

const sheetDropdown = document.getElementById('sheet-dropdown');
let selectedSheetName;
let minDateToMaxDate;
const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions-list');
const graphContainer = document.getElementById('pokemon-graph');
const minDataDropdown = document.getElementById('min-data-dropdown');
const maxDataDropdown = document.getElementById('max-data-dropdown');
const flexDirectionColumn = document.getElementById('flex-direction-column');
const clearAllButton = document.getElementById('clear-all-button');
const populateTop5Button = document.getElementById('populate-top-5-button');
const populateTop10Button = document.getElementById('populate-top-10-button');
const populateTop25Button = document.getElementById('populate-top-25-button');
const searchResults = document.getElementById('search-results');
const selectTierText = document.getElementById('select-tier-text');
const searchSectionContainer= document.getElementById("search-section-container")



// JavaScript for handling the search functionality
document.addEventListener('DOMContentLoaded', function(){
    updateGraph();
    getAllPokedexDetails();
    getAllSheetNames();
    searchInput.addEventListener('input', handleSearchInput);
    suggestionsList.addEventListener('click', handleSuggestionClick);
    populateTop5Button.addEventListener('click', populateTop5Button.addEventListener('click', () => populateTopPokemon(5)));
    populateTop10Button.addEventListener('click', populateTop10Button.addEventListener('click', () => populateTopPokemon(10)));
    populateTop25Button.addEventListener('click', populateTop25Button.addEventListener('click', () => populateTopPokemon(25)));
    clearAllButton.addEventListener('click', clearAllSelectedPokemon);
    minDataDropdown.addEventListener('change', updateGraph);
    maxDataDropdown.addEventListener('change', updateGraph);
    toggleClearAllButtonVisibility();
    toggleSearchContainerVisibility();
});

function isValueEmpty(value){
    if(value === '' || value === null){
        selectTierText.style.color="red"
        selectTierText.style.display = 'block';
    } else {
        selectTierText.style.display = 'none';
    }

    return value === '';
  }

function getAllPokedexDetails() {
    const spaceRef = ref(getStorage(app), 'pokedex.csv');
  
    return getDownloadURL(spaceRef)
      .then((url) => {
        return fetch(url)
          .then((response) => response.text()); // Read the CSV data as text
      })
      .then((csvData) => {
        const lines = csvData.split('\n');
  
        for (let i = 1; i < lines.length; i++) { // Start from the second row (index 1)
          const data = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split using comma with lookahead for quoted values
  
          // Assuming column A corresponds to index 0, column D to index 3, and column E to index 4
          const pokemonName = data[0] ? data[0].trim() : '';
          const pokemonImageOffsetX = data[3] ? parseFloat(data[3].trim()) : 0; // Convert to number or default to 0
          const pokemonImageOffsetY = data[4] ? parseFloat(data[4].trim()) : 0; // Convert to number or default to 0
  
          if (pokemonName) {
            allPokedexDetails.name.push(pokemonName);
            allPokedexDetails.imageXOffset.push(pokemonImageOffsetX);
            allPokedexDetails.imageYOffset.push(pokemonImageOffsetY);
          }
        }
      })
      .catch((error) => {
        console.error("Error reading Pokedex CSV file:", error);
      });
  }

  function boxErrorMessage(message) {
    let boxErrorMessageContainer = document.getElementById('error-message-box');

    if (!boxErrorMessageContainer) {
        // Create the error message container if it doesn't exist
        boxErrorMessageContainer = document.createElement('div');
        boxErrorMessageContainer.id = 'error-message-box';

        // Customize the font size and family
        boxErrorMessageContainer.style.fontSize = '3rem'; // Set the desired font size
        boxErrorMessageContainer.style.fontFamily = 'Pixelify Sans, sans-serif'; // Set the pixel-style font family

        // Set other styles
        boxErrorMessageContainer.style.fontWeight = 'bold';
        boxErrorMessageContainer.style.color = 'red';
        boxErrorMessageContainer.style.textAlign = 'center';

        searchSectionContainer.appendChild(boxErrorMessageContainer);
    }

    if (message === '') {
        // If the message is empty, remove the boxErrorMessageContainer
        if (boxErrorMessageContainer) {
            boxErrorMessageContainer.remove();
        }
    } else {
        // Set the error message if it's not empty
        boxErrorMessageContainer.innerText = message;
    }
}


  function graphErrorMessage(message) {
    let errorMessageContainer = document.getElementById('error-message');

    if (!errorMessageContainer) {
        // Create the error message container if it doesn't exist
        errorMessageContainer = document.createElement('div');
        errorMessageContainer.id = 'error-message';
        errorMessageContainer.style.fontWeight = "bold";
        errorMessageContainer.style.color = "red";
        flexDirectionColumn.appendChild(errorMessageContainer);
    }

    if (message === '') {
        // If the message is empty, remove the errorMessageContainer
        if (errorMessageContainer) {
            errorMessageContainer.remove();
        }
    } else {
        // Set the error message if it's not empty
        errorMessageContainer.innerText = message;
    }
}


// Function to create data for the selected Pokémon
function createPokemonData(selectedPokemon, minDataDropdown, maxDataDropdown, sheetDataCache, selectedSheetName) {
    return selectedPokemon.map(pokemonName => {
        const slicedXAxis = minDateToMaxDate.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1);
        const usageData = sheetDataCache[selectedSheetName][pokemonName].usage.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1);
        const graphXAxis = slicedXAxis || minDateToMaxDate;

        return createPokemonTrace(pokemonName, graphXAxis, usageData);
    });
}

// Function to create a single Pokémon trace based on data
function createPokemonTrace(pokemonName, graphXAxis, usageData) {
    if (Array.isArray(graphXAxis) && graphXAxis.length === 1) {
        graphErrorMessage('');
        return createBarChartTrace(pokemonName, usageData);
    } else if (Array.isArray(graphXAxis) && graphXAxis.length > 1) {
        graphErrorMessage('');
        return createScatterPlotTrace(pokemonName, graphXAxis, usageData);
    } else {
        graphErrorMessage('Please enter a valid date range...');
        return {};
    }
}

// Function to create a bar chart trace
function createBarChartTrace(pokemonName, usageData) {
    return {
        x: [pokemonName],
        y: usageData,
        type: 'bar',
        name: pokemonName,
    };
}

// Function to create a scatter plot trace
function createScatterPlotTrace(pokemonName, graphXAxis, usageData) {
    return {
        x: graphXAxis,
        y: usageData,
        type: 'scatter',
        mode: 'lines+markers',
        name: pokemonName,
        hovertemplate: `Pokémon: ${pokemonName} <br>Usage: %{y}% <extra></extra> `,
    };
}

// Function to update the graph container with hover data
function updateGraphContainerOnHover(graphContainer, data) {
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
}

function createGraphLayout(isNoData) {

    const whiteColor = 'whitesmoke';
    const plotBackgroundColor = '#0d1b2a';

    return {
        title: `${formatSheetName(selectedSheetName)}`,
        xaxis: {
            title: 'Monthly Snapshot',
            dtick: 'M1',
            showline: true,
            tickfont: {
                color: whiteColor
            },
            linecolor: whiteColor,
            titlefont: {
                color: whiteColor
            },
            rangemode: 'nonnegative',
            showticklabels: !isNoData
        },
        yaxis: {
            title: 'Usage (%)',
            tickfont: {
                color: whiteColor
            },
            linecolor: whiteColor,
            titlefont: {
                color: whiteColor
            },
            rangemode: 'nonnegative',
            showticklabels: !isNoData,
            gridcolor: isNoData ? plotBackgroundColor : whiteColor
        },
        hovermode: 'closest',
        plot_bgcolor: plotBackgroundColor,
        paper_bgcolor: plotBackgroundColor,
        legend: {
            font: {
                color: whiteColor
            }
        },
        titlefont: {
            color: whiteColor
        },
        xaxisfont: {
            color: whiteColor
        }
    };
}

// Main updateGraph function
function updateGraph() {
    const data = createPokemonData(selectedPokemon, minDataDropdown, maxDataDropdown, sheetDataCache, selectedSheetName);
    const isNoData = data.length === 0 || data.every(trace => trace === {});
    const layout = createGraphLayout(isNoData);

    updateGraphContainerOnHover(graphContainer, data);
    Plotly.newPlot(graphContainer, data, layout);
}

function handleSearchInput() {

    // Do nothing if the current tier is empty
    if(isValueEmpty(sheetDropdown.value)){
        return;
    }

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

function checkSelectedPokemonCount() {
    const errorMessage = "Your box is full!";
    if (selectedPokemon.length > 29) {
        boxErrorMessage(errorMessage); // Display error message
      return false; // Return false to indicate an error
    } else {
        boxErrorMessage(''); // Clear any previous error message
      return true; // Return true to indicate no error
    }
  }

function handleSuggestionClick(event) {
    if (event.target.tagName === 'LI') {
        const selectedPokemonName = event.target.textContent;
        
        if (checkSelectedPokemonCount()) {
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
}

function createPokemonListItem(pokemonName, result, allPokedexDetails) {
    const listItem = document.createElement('li');
    const resultPokemonIndex = allPokedexDetails.name.indexOf(result.name);
    const resultPokemonImageXOffset = allPokedexDetails.imageXOffset[resultPokemonIndex];
    const resultPokemonImageYOffset = allPokedexDetails.imageYOffset[resultPokemonIndex];

    // Create the div element with the specified style (inside the li)
    const divElement = createPokemonIcon(resultPokemonImageXOffset, resultPokemonImageYOffset);

    // Create a container for the Pokémon name and remove button
    const contentContainer = createContentContainer(pokemonName);

    // Create a remove button
    const removeButton = createRemoveButton();

    // Add a click event listener to the element
    listItem.addEventListener('click', () => {
        removePokemon(pokemonName);
    });

    // Append the div element, content container, and remove button to the list item
    listItem.appendChild(divElement);
    listItem.appendChild(contentContainer);
    listItem.appendChild(removeButton);

    return listItem;
}

// Function to create a Pokemon icon div element
function createPokemonIcon(xOffset, yOffset) {
    const divElement = document.createElement('div');
    divElement.style.background = `transparent url(https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png?v14) no-repeat scroll ${xOffset}px ${yOffset}px`;
    divElement.style.width = '40px';
    divElement.style.height = '30px';
    return divElement;
}

// Function to create a container for Pokemon name and remove button
function createContentContainer(pokemonName) {
    const contentContainer = document.createElement('div');
    contentContainer.textContent = pokemonName;
    return contentContainer;
}

// Function to create a remove button
function createRemoveButton() {
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.className = 'remove-button';
    return removeButton;
}

// Function to remove a Pokemon from the selectedPokemon array and update the display
function removePokemon(pokemonName) {
    const index = selectedPokemon.indexOf(pokemonName);
    if (index !== -1) {
        selectedPokemon.splice(index, 1);
        // Update the display and graph
        boxErrorMessage('');
        updateSelectedPokemonDisplay();
        toggleSearchContainerVisibility();
        toggleClearAllButtonVisibility();
    }
}

// Main updateSelectedPokemonDisplay function
function updateSelectedPokemonDisplay() {
    searchResults.innerHTML = '';
    selectedPokemon.forEach(pokemonName => {
        const result = sheetDataCache[selectedSheetName][pokemonName];
        if (result) {
            const listItem = createPokemonListItem(pokemonName, result, allPokedexDetails);
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
  const spaceRef = ref(getStorage(app), 'metadata.csv');

  getDownloadURL(spaceRef)
    .then((url) => {
      return fetch(url);
    })
    .then((response) => {
      return response.text();
    })
    .then((csvData) => {
      const lines = csvData.split('\n');
      const sheetNames = [];

      for (let i = 1; i < lines.length; i++) { // Start from the second row (index 1)
        const data = lines[i].split(',');
        if (data.length > 0) {
          const value = data[0].trim(); // Trim spaces and \r characters
          if (value !== '') {
            sheetNames.push(value); // Assuming the first column is what you want
          }
        }
      }
      populateSheetDropdown(sheetNames);
    })
    .catch((error) => {
      console.error('Error reading Metadata CSV file:', error);
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

    sheetNames.unshift("")

    // Populate the dropdown with formatted sheet names
    sheetNames.forEach(sheetName => {
        const option = document.createElement('option');
        option.value = sheetName;
        option.text = formatSheetName(sheetName);
        sheetDropdown.appendChild(option);
    });

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

}

function handleSheetSelection() {
  selectedSheetName = sheetDropdown.value;

  // Check if this is the first selection change
  if (!firstSelectionChanged) {
    firstSelectionChanged = true;
    removeEmptyStringOptions();
  }

  // Continue with your code
  getTierUsages(selectedSheetName);
}

function removeEmptyStringOptions() {
  const emptyStringOptions = [...sheetDropdown.options].filter(option => option.value === "");
  emptyStringOptions.forEach(option => option.remove());
}

function getTierUsages(tier) {
    //Escape if the tier is empty (it is by default)
    if (isValueEmpty(tier)) {
        return;
    }

    // Check if the data for the selected sheet is already in the cache
    if (sheetDataCache[selectedSheetName]) {
      // Data for this sheet is already in the cache, update the graph
      getMinMaxDatesFromCurrentCache();
      updateGraph();
      return;
    }
  
    const spaceRef = ref(getStorage(app), `${tier}.csv`);
    // Data for this sheet is not in the cache, fetch it
    getDownloadURL(spaceRef)
      .then((url) => {
        // Now you have the download URL, you can use it to fetch the file
        fetch(url)
          .then((response) => response.text()) // Read the CSV data as text
          .then((csvData) => {
            const lines = csvData.split('\n');
  
            lines.forEach((line, index) => {
              if (index === 0) {
                // Skip the header row
                return;
              }
  
              const data = line.split(',');
  
              if (data.length >= 3) {
                // Assuming column A corresponds to index 0, column B to index 1, and column C to index 2
                const pokemonName = data[0].trim();
                const usageRate = data[1].trim();
                const snapshot = data[2].trim();
  
                // Create a new object for this sheet's data if it doesn't exist
                if (!sheetDataCache[selectedSheetName]) {
                  sheetDataCache[selectedSheetName] = {};
                }
  
                if (!sheetDataCache[selectedSheetName][pokemonName]) {
                  sheetDataCache[selectedSheetName][pokemonName] = {
                    name: pokemonName,
                    usage: [],
                    snapshot: [],
                  };
                }
                sheetDataCache[selectedSheetName][pokemonName].usage.push(usageRate);
                sheetDataCache[selectedSheetName][pokemonName].snapshot.push(snapshot);
              }
            });
            getMinMaxDatesFromCurrentCache();
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
  
function getSelectedSheetData() {
    // Ensure that the max date is selected
    const selectedMaxDate = maxDataDropdown.selectedIndex;
    // Check if data for the selected sheet is in the cache
    if (!selectedSheetName || !selectedMaxDate || !sheetDataCache[selectedSheetName]) {
        return null;
    }

    // Get the sheet data for the selected sheet
    return sheetDataCache[selectedSheetName];
}

function filterSheetData(sheetData, selectedMaxDate) {
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

    return sheetDataForSelectedIndex;
}

function getTopPokemon(sheetDataForSelectedIndex, topPokemonNumber) {
    // Convert sheetDataForSelectedIndex to an array of key-value pairs
    const sheetDataArray = Object.entries(sheetDataForSelectedIndex);

    // Sort the array based on the "usage" values in descending order
    sheetDataArray.sort((a, b) => b[1]["usage"] - a[1]["usage"]);

    // Convert the sorted array back to an object
    const sortedSheetData = Object.fromEntries(sheetDataArray);

    // Get the top N keys
    return Object.keys(sortedSheetData).slice(0, topPokemonNumber);
}

function populateTopPokemon(topPokemonNumber) {
    const sheetData = getSelectedSheetData();

    if (!sheetData) { // Check both conditions
        if(!firstSelectionChanged){
            isValueEmpty(sheetData);
        }
        return;
    }


    const sheetDataForSelectedIndex = filterSheetData(sheetData, maxDataDropdown.selectedIndex);
    selectedPokemon = getTopPokemon(sheetDataForSelectedIndex, topPokemonNumber);

    updateSelectedPokemonDisplay();
    boxErrorMessage('');
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








