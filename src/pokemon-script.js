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

//Object to store all item data
let allItemDetails = {
    name: [],
    spriteNumber: [],
    itemImageXoffset: [],
    itemImageYoffset: [],
    itemDescription: [],
    generationIntroduced: [],
    flingBasePower: [],
    naturalGiftBasePower: [],
    naturalGiftType: []
}

let selectedPokemon = []; // Array to store selected Pokémon to be displayed on the graph
let selectedPokemonObjects = []; // Array to store selected Pokémon objects for advanced analysis

let sheetDataCache = {}; // Cache for storing sheet data
let pokemonType = {};
let pokemonStats = {};
let pokemonAbilities = {};
let pokemonItems = {};
let pokemonMoves = {};
let pokemonTeammates = {};
let pokemonCounters = {};
let pokemonSpreads = {};

let uniqueSnapshots = []; // Array to store unique snapshot values

let firstSelectionChanged = false; //flag to check if the default empty selection has changed

//Set default value for the pokemon box background
let selectedBoxBackground = "https://firebasestorage.googleapis.com/v0/b/smogon-stats.appspot.com/o/Box_Pokemon_Center_BDSP.png?alt=media&token=3776993a-2104-4546-bb90-4e5afc635326"
const boxSVGWidth = 640;
const boxSVGHeight = 580;
let boxSVG;
let analysisOneSVG;
let analysisTwoSVG;
let analysisTooltip;

let graphXAxis;

const sheetDropdown = document.getElementById('sheet-dropdown');
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
const searchSectionContainer= document.getElementById("search-section-container");
const lineBreakers = document.querySelector(".detailed-analysis-container");


const backgroundsContainer = document.querySelector('.detailed-pokemon-analysis-backgrounds');
const overlay = document.getElementById("overlay");

const analysisOneTierDropdown = document.getElementById('analysis-pokemon-parameters-tier1');
const analysisTwoTierDropdown = document.getElementById('analysis-pokemon-parameters-tier2');
const analysisOneSnapshotDropdown = document.getElementById("analysis-pokemon-parameters-snapshot1");
const analysisTwoSnapshotDropdown = document.getElementById("analysis-pokemon-parameters-snapshot2");

const spriteCheckbox1= document.querySelector('.sprite-checkboxes1');
const spriteCheckbox2= document.querySelector('.sprite-checkboxes2');
const analysisSidebar= document.getElementById("specific-detailed-analysis-sidebar");

  
overlay.addEventListener("click", () => {
  const expandedChart = document.querySelector(".expanded");
  expandedChart.classList.remove("active");
  overlay.style.display = "none";
});

//Event listener for the Pokemon Box Backgrounds
backgroundsContainer.addEventListener('click', function(e) {
  // Check if the clicked element has the class "detailed-pokemon-analysis-background"
  e.preventDefault();
  if (e.target.classList.contains('detailed-pokemon-analysis-background')) {
      // Get the background URL of the clicked element
      selectedBoxBackground = window.getComputedStyle(e.target).getPropertyValue('background-image').slice(5, -2);

      createPokeBallContainerAndContents(selectedPokemonObjects);
  }
});

spriteCheckbox1.addEventListener('change', function (e) {
  e.preventDefault();

  // Check if any checkbox within the container is checked
  const checkboxes = spriteCheckbox1.querySelectorAll('input[type="checkbox"]');
  const anyCheckboxChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

  // Check if the checkbox that triggered the event is the last checked one
  const lastCheckedCheckbox = e.target;
  const isLastCheckedCheckbox = anyCheckboxChecked && !lastCheckedCheckbox.checked;

  // Run the function if any checkbox is checked or the last checked checkbox is unchecked
  if (anyCheckboxChecked || !anyCheckboxChecked) {
    setSelectedPokemonAnimationOrImage(analysisOneTierDropdown, 1);
  }
});

spriteCheckbox2.addEventListener('change', function (e) {
  e.preventDefault();

  // Check if any checkbox within the container is checked
  const checkboxes = spriteCheckbox2.querySelectorAll('input[type="checkbox"]');
  const anyCheckboxChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

  // Check if the checkbox that triggered the event is the last checked one
  const lastCheckedCheckbox = e.target;
  const isLastCheckedCheckbox = anyCheckboxChecked && !lastCheckedCheckbox.checked;

  // Run the function if any checkbox is checked or the last checked checkbox is unchecked
  if (anyCheckboxChecked || !anyCheckboxChecked) {
    setSelectedPokemonAnimationOrImage(analysisTwoTierDropdown, 2);
  }
});


//Event listener for the analysis sidebar
analysisSidebar.addEventListener('click', function(e) {
  // Check if the clicked element has the class "detailed-pokemon-analysis-background"
  e.preventDefault();

  // Get all elements with the class "analysis-button"
  var sidebarButtons = document.querySelectorAll('.analysis-sidebar-buttons');

  function setColorAnalysisButtons(buttonDiv){

    // Get the element with the id "analysis-usage-button"
    var buttonElement = document.querySelector(`${buttonDiv}`);
    //Set other buttons color to orangey color
    sidebarButtons.forEach(function(button){
      if(button != buttonElement){
        button.style.backgroundColor = '#23272A';
      }
    })
    // Change the background color to orange
    buttonElement.style.backgroundColor = '#ff9900';
  }

  if (e.target.closest('#analysis-usage-button')) {
      setColorAnalysisButtons('#analysis-usage-button');
      analysisOneSVG = setUsageGraph(analysisOneTierDropdown,1);
      analysisTwoSVG = setUsageGraph(analysisTwoTierDropdown,2);
  } else if(e.target.closest('#analysis-stats-button')){
      setColorAnalysisButtons('#analysis-stats-button');
      analysisOneSVG = setStatsGraph(analysisOneTierDropdown,1);
      analysisTwoSVG = setStatsGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-abilities-button')){
    setColorAnalysisButtons('#analysis-abilities-button');
    analysisOneSVG = setAbilitiesGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setAbilitiesGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-items-button')){
    setColorAnalysisButtons('#analysis-items-button');
    analysisOneSVG = setItemsGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setItemsGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-moves-button')){
    setColorAnalysisButtons('#analysis-moves-button');
    analysisOneSVG = setMovesGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setMovesGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-spreads-button')){
    setColorAnalysisButtons('#analysis-spreads-button');
    analysisOneSVG = setSpreadsGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setSpreadsGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-teammates-button')){
    setColorAnalysisButtons('#analysis-teammates-button');
    analysisOneSVG = setTeammatesGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setTeammatesGraph(analysisTwoTierDropdown,2);
  }
  else if(e.target.closest('#analysis-counters-button')){
    setColorAnalysisButtons('#analysis-counters-button');
    analysisOneSVG = setCountersGraph(analysisOneTierDropdown,1);
    analysisTwoSVG = setCountersGraph(analysisTwoTierDropdown,2);
  }

});

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
    toggleElementVisibility(clearAllButton,"block");
    toggleElementVisibility(searchResults,"flex");
    toggleElementVisibility(lineBreakers,"flex");
    getItemsData();
});

// Error Message functions ----------------------------------------------------------------------
function isValueEmpty(value){
    if(value === '' || value === null){
        selectTierText.style.color="red"
        selectTierText.style.display = 'block';
    } else {
        selectTierText.style.display = 'none';
    }

    return value === '';
  }

function maxMinErrorMessage(message) {
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

// Extract Data functions ----------------------------------------------------------------------

function getItemsData() {
    const spaceRef = ref(getStorage(app), 'items.csv');
    return getDownloadURL(spaceRef)
        .then((url) => {
        return fetch(url)
            .then((response) => response.text()); // Read the CSV data as text
        })
        .then((csvData) => {
        const lines = csvData.split('\n');

        for (let i = 1; i < lines.length; i++) { // Start from the second row (index 1)
            const data = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split using comma with lookahead for quoted values

            //Column A corresponds to index 0, column D to index 3, and column E to index 4
            const itemName = data[0] ? data[0].trim() : '';
            const itemSprite = data[1] ? parseFloat(data[1].trim()) : 0; // Convert to number or default to 0
            const itemDescription = data[2] ? data[2].trim() : '';
            const itemGen = data[3] ? parseFloat(data[3].trim()) : 0; // Convert to number or default to 0
            const flingBasePower = data[4] ? parseFloat(data[4].trim()) : 0; // Convert to number or default to 0
            const naturalGiftBasePower = data[5] ? parseFloat(data[5].trim()) : 0; // Convert to number or default to 0
            const naturalGiftType = data[6] ? data[6].trim() : '';
            const itemImageOffsetX = data[7] ? parseFloat(data[7].trim()) : 0; // Convert to number or default to 0
            const itemImageOffsetY = data[8] ? parseFloat(data[8].trim()) : 0; // Convert to number or default to 0

            if (itemName) {
                allItemDetails.name.push(itemName);
                allItemDetails.spriteNumber.push(itemSprite);
                allItemDetails.itemDescription.push(itemDescription);
                allItemDetails.generationIntroduced.push(itemGen);
                allItemDetails.flingBasePower.push(flingBasePower);
                allItemDetails.naturalGiftBasePower.push(naturalGiftBasePower);
                allItemDetails.naturalGiftType.push(naturalGiftType);
                allItemDetails.itemImageXoffset.push(itemImageOffsetX);
                allItemDetails.itemImageYoffset.push(itemImageOffsetY);
            }
        }
        })
        .catch((error) => {
        console.error("Error reading Items CSV file:", error);
        });
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
  
          //Column A corresponds to index 0, column D to index 3, and column E to index 4
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

  function getPokemonTypes(tier) {
    const generation = tier[3];
  
    // Check if the data for the pokemon Types is already in the cache
    if (!pokemonType[generation]) {
      const spaceRef = ref(getStorage(app), `types gen${generation}.csv`);
  
      return getDownloadURL(spaceRef)
        .then((url) => fetch(url))
        .then((response) => response.text())
        .then((csvData) => {

        const lines = csvData.split('\n');
    
        lines.forEach((line, index) => {

          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const csvGeneration = data[1].trim();
          const typeOne = data[2].trim();
          const typeTwo = data[3].trim();

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonType[generation]) {
            pokemonType[generation] = {};
          }
          if (!pokemonType[generation][pokemonName]) {
            pokemonType[generation][pokemonName] = {
              name: pokemonName,
              generation:csvGeneration,
              types: []
            };
          }
          pokemonType[generation][pokemonName].types.push(typeOne);
          if(typeTwo != ''){
            pokemonType[generation][pokemonName].types.push(typeTwo);
          }
        })
        return pokemonType[generation]; // Return the created object
      })
      .catch((error) => {
        console.error("Error reading Pokedex CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonType[generation]);
  }
}

function getPokemonStats(tier) {
  const generation = tier[3];

  // Check if the data for the pokemon Types is already in the cache
  if (!pokemonStats[generation]) {
    const spaceRef = ref(getStorage(app), `stats gen${generation}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {

      const lines = csvData.split('\n');
  
      lines.forEach((line, index) => {

        if (index === 0) {
          // Skip the header row
          return;
        }
        const data = line.split(',');

        const pokemonName = data[0].trim();
        const csvGeneration = data[1].trim();
        const csvHp = data[2].trim();
        const attack = data[3].trim();
        const defense = data[4].trim();
        const SpecialAttack = data[5].trim();
        const SpecialDefense = data[6].trim();
        const speed = data[7].trim();

        // Create a new object for this sheet's data if it doesn't exist
        if (!pokemonStats[generation]) {
          pokemonStats[generation] = {};
        }
        if (!pokemonStats[generation][pokemonName]) {
          pokemonStats[generation][pokemonName] = {
            name: pokemonName,
            generation:csvGeneration,
            hp: csvHp,
            atk: attack,
            def: defense,
            SpAtk: SpecialAttack,
            SpDef: SpecialDefense,
            spe: speed,
          };
        }
      })
      return pokemonStats[generation]; // Return the created object
    })
    .catch((error) => {
      console.error("Error reading Pokedex CSV file:", error);
    });
} else {
  // If the data is already present, resolve the promise with the existing object
  return Promise.resolve(pokemonStats[generation]);
}
}

function getPokemonAbilities(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonAbilities[tier]) {
    const spaceRef = ref(getStorage(app), `abilities ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();
          const csvAbilityOne = data[2].trim();
          const csvUsageOne = parseFloat(data[3].trim());
          const csvAbilityTwo = data[4].trim();
          const csvUsageTwo = parseFloat(data[5].trim());
          const csvAbilityThree = data[6].trim();
          const csvUsageThree = parseFloat(data[7].trim());

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonAbilities[tier]) {
            pokemonAbilities[tier] = {};
          }

          if (!pokemonAbilities[tier][pokemonName]) {
            pokemonAbilities[tier][pokemonName] = {
              name: pokemonName,
              ability: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    abilities: createAbilitiesArray(csvAbilityOne, csvUsageOne, csvAbilityTwo, csvUsageTwo, csvAbilityThree, csvUsageThree),
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its abilities
            pokemonAbilities[tier][pokemonName].ability.snapshots.push({
              snapshot: snapshot,
              abilities: createAbilitiesArray(csvAbilityOne, csvUsageOne, csvAbilityTwo, csvUsageTwo, csvAbilityThree, csvUsageThree),
            });
          }
        });

        // Return the created object  
        return pokemonAbilities[tier];
      })
      .catch((error) => {
        console.error("Error reading Abilities CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonAbilities[tier]);
  }
}

function createAbilitiesArray(abilityOne, usageOne, abilityTwo, usageTwo, abilityThree, usageThree) {
  const abilitiesArray = [];

  if (abilityOne && abilityOne !== "") {
    abilitiesArray.push({ abilityName: abilityOne, usage: usageOne });
  }

  if (abilityTwo && abilityTwo !== "") {
    abilitiesArray.push({ abilityName: abilityTwo, usage: usageTwo });
  }

  if (abilityThree && abilityThree !== "") {
    abilitiesArray.push({ abilityName: abilityThree, usage: usageThree });
  }

  return abilitiesArray;
}

function getPokemonItems(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonItems[tier]) {
    const spaceRef = ref(getStorage(app), `items ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();

          // Extract items and usages dynamically
          const items = [];
          const usages = [];
          for (let i = 2; i < data.length; i += 2) {
            const item = data[i].trim();
            const usage = parseFloat(data[i + 1].trim());
            if(item != ""){
              items.push(item);
              usages.push(usage);
            }

          }

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonItems[tier]) {
            pokemonItems[tier] = {};
          }

          if (!pokemonItems[tier][pokemonName]) {
            pokemonItems[tier][pokemonName] = {
              name: pokemonName,
              item: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    items: items,
                    usages: usages,
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its items/usages
            pokemonItems[tier][pokemonName].item.snapshots.push({
              snapshot: snapshot,
              items: items,
              usages: usages,
            });
          }
        });

        // Return the created object

        return pokemonItems[tier];
      })
      .catch((error) => {
        console.error("Error reading Items CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonItems[tier]);
  }
}

function getPokemonMoves(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonMoves[tier]) {
    const spaceRef = ref(getStorage(app), `moves ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();

          // Extract moves and usages dynamically
          const moves = [];
          const usages = [];
          for (let i = 2; i < data.length; i += 2) {
            const move = data[i].trim();
            const usage = parseFloat(data[i + 1].trim());
            if(move != "" && move != "Nothing"){
              moves.push(move);
              usages.push(usage);
            }

          }

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonMoves[tier]) {
            pokemonMoves[tier] = {};
          }

          if (!pokemonMoves[tier][pokemonName]) {
            pokemonMoves[tier][pokemonName] = {
              name: pokemonName,
              move: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    moves: moves,
                    usages: usages,
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its moves/usages
            pokemonMoves[tier][pokemonName].move.snapshots.push({
              snapshot: snapshot,
              moves: moves,
              usages: usages,
            });
          }
        });

        // Return the created object
        return pokemonMoves[tier];
      })
      .catch((error) => {
        console.error("Error reading moves CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonMoves[tier]);
  }
}

function getPokemonSpreads(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonSpreads[tier]) {
    const spaceRef = ref(getStorage(app), `spreads ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();

          // Extract spreads and usages dynamically
          const natures = [];
          const usages = [];
          const hps = [];
          const attacks = [];
          const defenses = [];
          const spAttacks = [];
          const spDefenses = [];
          const speeds = [];
          for (let i = 2; i < data.length; i += 8) {
            const nature = data[i].trim();
            const usage = parseFloat(data[i + 1].trim());
            const hp = parseFloat(data[i + 2].trim());
            const attack = parseFloat(data[i + 3].trim());
            const defense = parseFloat(data[i + 4].trim());
            const spAttack = parseFloat(data[i + 5].trim());
            const spDefense = parseFloat(data[i + 6].trim());
            const speed = parseFloat(data[i + 7].trim());
            if(nature != "" && nature != "Nothing"){
              natures.push(nature);
              usages.push(usage);
              hps.push(hp);
              attacks.push(attack);
              defenses.push(defense);
              spAttacks.push(spAttack);
              spDefenses.push(spDefense);
              speeds.push(speed);
            }

          }

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonSpreads[tier]) {
            pokemonSpreads[tier] = {};
          }

          if (!pokemonSpreads[tier][pokemonName]) {
            pokemonSpreads[tier][pokemonName] = {
              name: pokemonName,
              spread: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    natures: natures,
                    usages: usages,
                    HP: hps,
                    Atk: attacks,
                    Def: defenses,
                    SpA: spAttacks,
                    SpD: spDefenses,
                    Spe: speeds,
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its spreads/usages
            pokemonSpreads[tier][pokemonName].spread.snapshots.push({
              snapshot: snapshot,
              natures: natures,
              usages: usages,
              HP: hps,
              Atk: attacks,
              Def: defenses,
              SpA: spAttacks,
              SpD: spDefenses,
              Spe: speeds,
            });
          }
        });

        // Return the created object
        return pokemonSpreads[tier];
      })
      .catch((error) => {
        console.error("Error reading spreads CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonSpreads[tier]);
  }
}

function getPokemonTeammates(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonTeammates[tier]) {
    const spaceRef = ref(getStorage(app), `teammates ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();

          // Extract teammates and usages dynamically
          const teammates = [];
          const usages = [];
          for (let i = 2; i < data.length; i += 2) {
            const teammate = data[i].trim();
            const usage = parseFloat(data[i + 1].trim());
            if(teammate != "" && teammate != "Nothing"){
              var modifiedTeammate = teammate.split('+').join('');
              teammates.push(modifiedTeammate);
              usages.push(usage);
            }

          }

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonTeammates[tier]) {
            pokemonTeammates[tier] = {};
          }

          if (!pokemonTeammates[tier][pokemonName]) {
            pokemonTeammates[tier][pokemonName] = {
              name: pokemonName,
              teammate: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    teammates: teammates,
                    usages: usages,
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its teammates/usages
            pokemonTeammates[tier][pokemonName].teammate.snapshots.push({
              snapshot: snapshot,
              teammates: teammates,
              usages: usages,
            });
          }
        });

        // Return the created object
        return pokemonTeammates[tier];
      })
      .catch((error) => {
        console.error("Error reading teammates CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonTeammates[tier]);
  }
}

function getPokemonCounters(tier) {
  // Check if the data for the pokemon Abilities is already in the cache
  if (!pokemonCounters[tier]) {
    const spaceRef = ref(getStorage(app), `counters ${tier}.csv`);

    return getDownloadURL(spaceRef)
      .then((url) => fetch(url))
      .then((response) => response.text())
      .then((csvData) => {
        const lines = csvData.split('\n');

        lines.forEach((line, index) => {
          if (index === 0) {
            // Skip the header row
            return;
          }
          const data = line.split(',');

          const pokemonName = data[0].trim();
          const snapshot = data[1].trim();

          // Extract counters and usages dynamically
          const counters = [];
          const usageErrors = [];
          const errors = [];
          const koErrors = [];
          const switchErrors = [];
          for (let i = 2; i < data.length; i += 5) {
            const counter = data[i].trim();
            const usage = parseFloat(data[i + 1].trim());
            const error = parseFloat(data[i + 2].trim());
            const koError = parseFloat(data[i + 3].trim());
            const switchError = parseFloat(data[i + 4].trim());
            if(counter != "" && counter != "Nothing"){
              var modifiedcounter = counter.split('+').join('');
              counters.push(modifiedcounter);
              usageErrors.push(usage);
              errors.push(error);
              koErrors.push(koError);
              switchErrors.push(switchError);
            }

          }

          // Create a new object for this sheet's data if it doesn't exist
          if (!pokemonCounters[tier]) {
            pokemonCounters[tier] = {};
          }

          if (!pokemonCounters[tier][pokemonName]) {
            pokemonCounters[tier][pokemonName] = {
              name: pokemonName,
              counter: {
                snapshots: [
                  {
                    snapshot: snapshot,
                    counters: counters,
                    usageErrors: usageErrors,
                    errors: errors,
                    koErrors: koErrors,
                    switchErrors: switchErrors,
                  },
                ],
              },
            };
          } else {
            // If the Pokemon already exists, add a new snapshot and its counters/usages
            pokemonCounters[tier][pokemonName].counter.snapshots.push({
              snapshot: snapshot,
              counters: counters,
              usageErrors: usageErrors,
              errors: errors,
              koErrors: koErrors,
              switchErrors: switchErrors,
            });
          }
        });

        // Return the created object
        return pokemonCounters[tier];
      })
      .catch((error) => {
        console.error("Error reading counters CSV file:", error);
      });
  } else {
    // If the data is already present, resolve the promise with the existing object
    return Promise.resolve(pokemonCounters[tier]);
  }
}


function getTierUsages(tier,mainDropdown,callback) {
    //Escape if the tier is empty (it is by default)
    if (isValueEmpty(tier)) {
        return;
    }

    // Check if the data for the selected sheet is already in the cache
    if (sheetDataCache[tier]) {
      if (callback) {
        callback(); // Invoke the callback function
      }
      // Data for this sheet is already in the cache, update the graph
      if(mainDropdown){
        getMinMaxDatesFromCurrentCache();
        updateGraph();  
      }
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
                if (!sheetDataCache[tier]) {
                  sheetDataCache[tier] = {};
                }
  
                if (!sheetDataCache[tier][pokemonName]) {
                  sheetDataCache[tier][pokemonName] = {
                    name: pokemonName,
                    usage: [],
                    snapshot: [],
                    resultPokemonImageXOffset: 0,
                    resultPokemonImageYOffset: 0,
                  };
                }
                const resultPokemonIndex = allPokedexDetails.name.indexOf(pokemonName);
                const resultPokemonImageXOffset = allPokedexDetails.imageXOffset[resultPokemonIndex];
                const resultPokemonImageYOffset = allPokedexDetails.imageYOffset[resultPokemonIndex];

                sheetDataCache[tier][pokemonName]["resultPokemonImageXOffset"] = resultPokemonImageXOffset;
                sheetDataCache[tier][pokemonName]["resultPokemonImageYOffset"] = resultPokemonImageYOffset;
                sheetDataCache[tier][pokemonName].usage.push(usageRate);
                sheetDataCache[tier][pokemonName].snapshot.push(snapshot);
              }
            });
            if(mainDropdown){
              getMinMaxDatesFromCurrentCache();
              updateGraph();  
            }
            if (callback) {
              callback(); // Invoke the callback function
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

//Update Graph Functions

// Function to create data for the selected Pokémon
function createPokemonData(selectedPokemon, minDataDropdown, maxDataDropdown, sheetDataCache) {
    return selectedPokemon.map(pokemonName => {
        const slicedXAxis = minDateToMaxDate.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1);
        const usageData = sheetDataCache[sheetDropdown.value][pokemonName].usage.slice(minDataDropdown.selectedIndex, maxDataDropdown.selectedIndex + 1);
        graphXAxis = slicedXAxis || minDateToMaxDate;

        return createPokemonTrace(pokemonName, graphXAxis, usageData);
    });
}

// Function to create a single Pokémon trace based on data
function createPokemonTrace(pokemonName, graphXAxis, usageData) {
    if (Array.isArray(graphXAxis) && graphXAxis.length === 1) {
        maxMinErrorMessage('');
        return createBarChartTrace(pokemonName, usageData);
    } else if (Array.isArray(graphXAxis) && graphXAxis.length > 1) {
        maxMinErrorMessage('');
        return createScatterPlotTrace(pokemonName, graphXAxis, usageData);
    } else {
        maxMinErrorMessage('Please enter a valid date range...');
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
        hovertemplate: `Pokémon: ${pokemonName} <br>Usage: %{y}%<extra></extra> `
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
        hovertemplate: `Pokémon: ${pokemonName} <br>Usage: %{y}% <br>Snapshot: %{x|%b %Y} <extra></extra> `
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

    if (!graphXAxis) {
        graphXAxis = [];
    }

    const numTicksToShow = 10; // Set a reasonable limit for the number of tick values

    // Use the length of the graphXAxis array to determine the tick placement
    const numTicks = graphXAxis.length;

    // Set the default dtick value to auto
    let dtick = 'M1';

    // If you have enough data points to display monthly ticks and not too many to clutter the x-axis
    if (numTicks >= 2) {
        // Calculate the difference between the first and last data points in months
        const firstDate = new Date(graphXAxis[0]); // Assuming graphXAxis contains date values
        const lastDate = new Date(graphXAxis[numTicks - 1]);
        const monthDifference = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth());

        // If the difference is less than or equal to 12, use monthly ticks
        if (monthDifference <= 12) {
            dtick = 'M1';
        } else {
            // Calculate how many months to skip between ticks based on the number of data points
            const monthsToSkip = Math.ceil(monthDifference / (numTicksToShow - 1)); // Adjust this number as needed

            dtick = 'M' + monthsToSkip;
        }
    }

    let tickValues = getTickValues(graphXAxis, numTicksToShow);
    let tickValuesFormatted = tickValues.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    let xAxisLabel;
    //This is so bar chart x-axis labels work properly
    if (tickValues.length === 1){
        tickValues = 'none'
        tickValuesFormatted = 'none'
        xAxisLabel = "Pokémon Name"
    } else {
        xAxisLabel = "Monthly Snapshot"
    }

    return {
        title: `${formatSheetName(sheetDropdown.value)}`,
        xaxis: {
            title: xAxisLabel,
            showline: true,
            dtick: dtick,
            tickvals: tickValues, // Set explicit tick values
            ticktext: tickValuesFormatted, // Format tick labels as "Mon YYYY"
            tickfont: {
                color: whiteColor,
                size: 10
            },
            linecolor: whiteColor,
            titlefont: {
                color: whiteColor
            },
            rangemode: 'nonnegative',
            showticklabels: !isNoData,
            titlepad: 30,
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
            gridcolor: isNoData ? plotBackgroundColor : whiteColor,
        },
        hovermode: 'closest',
        plot_bgcolor: plotBackgroundColor,
        paper_bgcolor: plotBackgroundColor,
        legend: {
            font: {
                color: whiteColor,
            },
        },
        titlefont: {
            color: whiteColor,
        },
        xaxisfont: {
            color: whiteColor,
        },
    };
}

// Function to generate an array of tick values based on the number of ticks to show
function getTickValues(ticks, numTicksToShow) {
    if (ticks.length <= numTicksToShow) {
        return ticks; // Use all ticks if there are fewer than or equal to numTicksToShow
    }

    const step = Math.ceil(ticks.length / (numTicksToShow - 1));
    const tickValues = [];
    for (let i = 0; i < numTicksToShow - 1; i++) {
        tickValues.push(ticks[i * step]);
    }
    tickValues.push(ticks[ticks.length - 1]); // Add the last data point as the last tick
    return tickValues;
}

// Main updateGraph function
function updateGraph() {
    const data = createPokemonData(selectedPokemon, minDataDropdown, maxDataDropdown, sheetDataCache);
    const isNoData = data.length === 0 || data.every(trace => trace === {});
    const layout = createGraphLayout(isNoData);

    updateGraphContainerOnHover(graphContainer, data);
    Plotly.newPlot(graphContainer, data, layout);
}

// Search Bar Functions

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

function handleSuggestionClick(event) {
    if (event.target.tagName === 'LI') {
        const selectedPokemonName = event.target.textContent;
        
        if (checkSelectedPokemonCount()) {
            // Check if the Pokémon is not already selected
            if (!selectedPokemon.includes(selectedPokemonName)) {
                selectedPokemon.push(selectedPokemonName);
                selectedPokemonObjects.push(sheetDataCache[sheetDropdown.value][selectedPokemonName]);
                updateSelectedPokemonDisplay();
            }
            
            // Hide the suggestions list if the input is empty
            suggestionsList.style.display = 'none';
            searchInput.value = ''; // Clear the search input
            suggestionsList.innerHTML = ''; // Clear suggestions
        }
    }
}

//Creation of Pokemon LI ELEMENTS
function createPokemonListItem(pokemonName, result, allPokedexDetails) {
    const listItem = document.createElement('li');
    listItem.draggable = true;

    const resultPokemonImageXOffset = sheetDataCache[sheetDropdown.value][pokemonName]["resultPokemonImageXOffset"];
    const resultPokemonImageYOffset = sheetDataCache[sheetDropdown.value][pokemonName]["resultPokemonImageYOffset"];

    const divElement = createPokemonIcon(resultPokemonImageXOffset, resultPokemonImageYOffset);

    const contentContainer = createContentContainer(pokemonName);
    const removeButton = createRemoveButton();

    // Add a dragstart event listener to the element
    listItem.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    });

    // Add a dragend event listener to the element
    listItem.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });

    // Add a click event listener to the remove button
    listItem.addEventListener('click', () => {
        removePokemon(pokemonName);
    });

    // Add a dragover event listener to the container
    listItem.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropEventListener(listItem);

    listItem.appendChild(divElement);
    listItem.appendChild(contentContainer);
    listItem.appendChild(removeButton);

    return listItem;
}




function dropEventListener(listItem){
    // Add a drop event listener to the container
    listItem.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedItem = document.querySelector('.dragging');
        if (draggedItem !== listItem) {
            // Swap the positions of the dragged item and the drop target
            const parent = listItem.parentNode;
            const index1 = Array.from(parent.children).indexOf(listItem);
            const index2 = Array.from(parent.children).indexOf(draggedItem);
        if (index1 < index2) {
            parent.insertBefore(draggedItem, listItem);
        } else {
            parent.insertBefore(draggedItem, listItem.nextSibling);
        }

        // Remove the item at index2 and insert it at index1
        selectedPokemon.splice(index1, 0, selectedPokemon.splice(index2, 1)[0]);
        selectedPokemonObjects.splice(index1, 0, selectedPokemonObjects.splice(index2, 1)[0]);

        updateSelectedPokemonDisplay()
        }
    });
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
        selectedPokemonObjects.splice(index, 1);
        // Update the display and graph
        boxErrorMessage('');
        updateSelectedPokemonDisplay();
        toggleElementVisibility(clearAllButton,"block");
        toggleElementVisibility(searchResults,"flex");
        toggleElementVisibility(lineBreakers,"flex");
    }
}

// Main updateSelectedPokemonDisplay function
function updateSelectedPokemonDisplay() {

    searchResults.innerHTML = '';
    selectedPokemon.forEach(pokemonName => {
        const result = sheetDataCache[sheetDropdown.value][pokemonName];
        if (result) {
            const listItem = createPokemonListItem(pokemonName, result, allPokedexDetails);
            searchResults.appendChild(listItem);
            toggleElementVisibility(clearAllButton,"block");
            toggleElementVisibility(searchResults,"flex");
            toggleElementVisibility(lineBreakers,"flex");
            // Hide the suggestions list if the input is empty
            suggestionsList.style.display = 'none';
        }
    });
    createPokeBallContainerAndContents(selectedPokemonObjects);
    // Update the graph with the selected Pokémon's data
    updateGraph();
}


//OTHERS

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

    // Populate the dropdown with formatted sheet names
    sheetNames.forEach(sheetName => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.text = formatSheetName(sheetName);
      analysisOneTierDropdown.appendChild(option);
  });
          
  // Populate the dropdown with formatted sheet names
    sheetNames.forEach(sheetName => {
      const option = document.createElement('option');
      option.value = sheetName;
      option.text = formatSheetName(sheetName);
      analysisTwoTierDropdown.appendChild(option);
  });

  // Add an event listener to the dropdown to handle sheet selection
  sheetDropdown.addEventListener('change', handleSheetSelection);
  analysisOneTierDropdown.addEventListener('change', handleAnalysisOneSheetSelection);
  analysisTwoTierDropdown.addEventListener('change', handleAnalysisTwoSheetSelection);
  analysisOneSnapshotDropdown.addEventListener('change', handleAnalysisOneSnapshotDropdownSelection)
  analysisTwoSnapshotDropdown.addEventListener('change', handleAnalysisTwoSnapshotDropdownSelection)
}

function getMinMaxDatesFromCurrentCache() {
    const sheetData = sheetDataCache[sheetDropdown.value];
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
    analysisOneSnapshotDropdown.innerHTML = '';
    analysisTwoSnapshotDropdown.innerHTML = '';

    uniqueSnapshots.forEach((snapshot) => {
        const option = document.createElement('option');
        option.value = snapshot;
        option.text = snapshot;
        minDataDropdown.appendChild(option.cloneNode(true));
        maxDataDropdown.appendChild(option.cloneNode(true));
        analysisOneSnapshotDropdown.appendChild(option.cloneNode(true));
        analysisTwoSnapshotDropdown.appendChild(option.cloneNode(true));
    });

   
    // Initial value for min is the earliest date
    minDataDropdown.value = uniqueSnapshots[0];
    // Initial value for max is the latest date
    maxDataDropdown.value = uniqueSnapshots[uniqueSnapshots.length - 1];

    analysisOneSnapshotDropdown.value = uniqueSnapshots[uniqueSnapshots.length - 1];
    analysisTwoSnapshotDropdown.value = uniqueSnapshots[uniqueSnapshots.length - 1];

    // Array of snapshots to be used for the graph's x-axis
    minDateToMaxDate = uniqueSnapshots;

}

function getMinMaxDatesFromAnalysisSlotTier(analysisTierSlot, analysisSnapshotSlot){

  const sheetData = sheetDataCache[analysisTierSlot.value];

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

  const currentSnapshot = analysisSnapshotSlot.value;
  let currentSnapshotExistInNewSnapshot = false; // Assess whether current snapshot exists in new snapshot
  let currentIndex; //Index of the currently selected snapshot in the new Snapshot list

  analysisSnapshotSlot.innerHTML = '';

  uniqueSnapshots.forEach((snapshot) => {
    const option = document.createElement('option');
    option.value = snapshot;
    option.text = snapshot;
    analysisSnapshotSlot.appendChild(option.cloneNode(true));

    if(option.value === currentSnapshot){
      currentSnapshotExistInNewSnapshot =  true;
      // Get the index of the current snapshot in the uniqueSnapshots array
      currentIndex = uniqueSnapshots.indexOf(currentSnapshot);
    }
});


if(currentSnapshotExistInNewSnapshot){
  analysisSnapshotSlot.value = uniqueSnapshots[currentIndex];
} else {
  analysisSnapshotSlot.value = uniqueSnapshots[uniqueSnapshots.length - 1];
}


}

function handleSheetSelection() {

  // Check if this is the first selection change
  if (!firstSelectionChanged) {
    firstSelectionChanged = true;
    removeEmptyStringOptions(sheetDropdown);
    removeEmptyStringOptions(analysisOneTierDropdown);
    removeEmptyStringOptions(analysisTwoTierDropdown);
  }

  //Set the analysis parameters initial values
  analysisOneTierDropdown.value = sheetDropdown.value;
  analysisTwoTierDropdown.value = sheetDropdown.value;

  // setSelectedPokemonGeneration(analysisOneTierDropdown,1);
  // setSelectedPokemonGeneration(analysisTwoTierDropdown,2);

  // setSelectedPokemonTier(analysisOneTierDropdown, 1);
  // setSelectedPokemonTier(analysisTwoTierDropdown, 2);

  // Continue with your code
  getTierUsages(sheetDropdown.value,true);

  // Define a function to handle the selected side bar buttons
  const runSelectedSideBarButtons = () => {
    runSelectedSideBarButton(analysisOneTierDropdown, 1);
    runSelectedSideBarButton(analysisTwoTierDropdown, 2);
  };

  // Use Promise.all to run all functions in parallel
  Promise.all([
    getPokemonTypes(sheetDropdown.value).then(() => {
      displayPokemonTypes(analysisOneTierDropdown, 1);
      displayPokemonTypes(analysisTwoTierDropdown, 2);
    }),
    getPokemonStats(sheetDropdown.value),
    getPokemonAbilities(sheetDropdown.value),
    getPokemonItems(sheetDropdown.value),
    getPokemonMoves(sheetDropdown.value),
    getPokemonSpreads(sheetDropdown.value),
    getPokemonTeammates(sheetDropdown.value),
    getPokemonCounters(sheetDropdown.value)
  ])
    .then(() => {
      // All promises are resolved, now run the selected side bar buttons
      runSelectedSideBarButtons();
    })
    .catch((error) => {
      console.error(error);
    });
  


  // setSelectedPokemonSnapshot(analysisOneSnapshotDropdown,1);
  // setSelectedPokemonSnapshot(analysisTwoSnapshotDropdown,2);

  setSelectedPokemonAnimationOrImage(analysisOneTierDropdown,1);
  setSelectedPokemonAnimationOrImage(analysisTwoTierDropdown,2);

  runSelectedSideBarButton(analysisOneTierDropdown, 1);
  runSelectedSideBarButton(analysisTwoTierDropdown, 2);

}

function removeEmptyStringOptions(dropdown) {
  const emptyStringOptions = [...dropdown.options].filter(option => option.value === "");
  emptyStringOptions.forEach(option => option.remove());
}

function handleAnalysisOneSheetSelection() {
  const selectedSheetName = analysisOneTierDropdown.value;

  // Run getTierUsages, getPokemonTypes, and getPokemonStats concurrently
  Promise.all([
    new Promise((resolve, reject) => {
      getTierUsages(selectedSheetName, false, () => {
        getMinMaxDatesFromAnalysisSlotTier(analysisOneTierDropdown, analysisOneSnapshotDropdown);
        setSelectedPokemonAnimationOrImage(analysisOneTierDropdown, 1);
        resolve(); // Resolve the promise when getTierUsages is done
      });
    }),
    getPokemonTypes(selectedSheetName),
    getPokemonStats(selectedSheetName),
    getPokemonAbilities(selectedSheetName),
    getPokemonItems(selectedSheetName),
    getPokemonMoves(selectedSheetName),
    getPokemonSpreads(selectedSheetName),
    getPokemonTeammates(selectedSheetName),
    getPokemonCounters(selectedSheetName),
  ])
    .then(([getTierUsagesResult, pokemonTypesResult, pokemonStatsResult]) => {
      // Use the results (getTierUsagesResult, pokemonTypesResult, and pokemonStatsResult) here
      // This block will be executed after all promises are completed
      displayPokemonTypes(analysisOneTierDropdown, 1);
      runSelectedSideBarButton(analysisOneTierDropdown, 1);
    })
    .catch((error) => {
      // Handle errors here
      console.error("Error in getTierUsages, getPokemonTypes, or getPokemonStats:", error);
    });
}

function handleAnalysisTwoSheetSelection() {
  const selectedSheetName = analysisTwoTierDropdown.value;

  // Run getTierUsages, getPokemonTypes, and getPokemonStats concurrently
  Promise.all([
    new Promise((resolve, reject) => {
      getTierUsages(selectedSheetName, false, () => {
        getMinMaxDatesFromAnalysisSlotTier(analysisTwoTierDropdown, analysisTwoSnapshotDropdown);
        setSelectedPokemonAnimationOrImage(analysisTwoTierDropdown, 2);
        resolve(); // Resolve the promise when getTierUsages is done
      });
    }),
    getPokemonTypes(selectedSheetName),
    getPokemonStats(selectedSheetName),
    getPokemonAbilities(selectedSheetName),
    getPokemonItems(selectedSheetName),
    getPokemonMoves(selectedSheetName),
    getPokemonSpreads(selectedSheetName),
    getPokemonTeammates(selectedSheetName),
    getPokemonCounters(selectedSheetName),
  ])
    .then(([getTierUsagesResult, pokemonTypesResult, pokemonStatsResult]) => {
      // Use the results (getTierUsagesResult, pokemonTypesResult, and pokemonStatsResult) here
      // This block will be executed after all promises are completed
      displayPokemonTypes(analysisTwoTierDropdown, 2);
      runSelectedSideBarButton(analysisTwoTierDropdown, 2);
    })
    .catch((error) => {
      // Handle errors here
      console.error("Error in getTierUsages, getPokemonTypes, or getPokemonStats:", error);
    });
}

function handleAnalysisOneSnapshotDropdownSelection(){
  // setSelectedPokemonSnapshot(analysisOneSnapshotDropdown,1);
  runSelectedSideBarButton(analysisOneTierDropdown,1);
}

function handleAnalysisTwoSnapshotDropdownSelection(){
  // setSelectedPokemonSnapshot(analysisTwoSnapshotDropdown,2);
  runSelectedSideBarButton(analysisTwoTierDropdown,2);
}

function runSelectedSideBarButton(analysisTierDropdown,analysisSlot){

  // Get all elements with the class "analysis-button"
  var sidebarButtons = document.querySelectorAll('.analysis-sidebar-buttons');

  let selectedButton = "";
  let analysisGraph;

  sidebarButtons.forEach(function(button){
    if(button.style.backgroundColor === 'rgb(255, 153, 0)'){ //The rgb value of #ff9900{
      selectedButton = button;
    }
  })
  //Run Slicer function Depending on the button clicked
  if(selectedButton.id === "analysis-stats-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setStatsGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setStatsGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-abilities-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setAbilitiesGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setAbilitiesGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-items-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setItemsGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setItemsGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-moves-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setMovesGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setMovesGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-spreads-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setSpreadsGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setSpreadsGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-teammates-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setTeammatesGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setTeammatesGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-counters-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setCountersGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setCountersGraph(analysisTierDropdown,analysisSlot);
    }
  }
  else if(selectedButton.id === "analysis-usage-button"){
    if(analysisSlot === 1){
      analysisOneSVG = setUsageGraph(analysisTierDropdown,analysisSlot);
    }
    else if(analysisSlot === 2){
      analysisTwoSVG = setUsageGraph(analysisTierDropdown,analysisSlot);
    }
  }
}

  
function getSelectedSheetData() {
    // Check if data for the selected sheet is in the cache
    if (!sheetDropdown.value || !sheetDataCache[sheetDropdown.value]) {
        return null;
    }

    // Get the sheet data for the selected sheet
    return sheetDataCache[sheetDropdown.value];
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
    selectedPokemonObjects = [];

    for(let index in selectedPokemon){
      selectedPokemonObjects.push(sheetDataCache[sheetDropdown.value][selectedPokemon[index]]);
    }

    updateSelectedPokemonDisplay();
    boxErrorMessage('');
}

// Function to clear all selected Pokémon
function clearAllSelectedPokemon() {
    selectedPokemon = [];
    selectedPokemonObjects = [];
    updateSelectedPokemonDisplay();
    toggleElementVisibility(clearAllButton,"block");
    toggleElementVisibility(searchResults,"flex");
    toggleElementVisibility(lineBreakers,"flex");
}

// Hide or show the "Clear All" button based on selectedPokemon array
function toggleElementVisibility(element,display) {
    if (selectedPokemon.length > 0) {
        element.style.display = `${display}`;
    } else {
        element.style.display = 'none';
    }
}

function getItemSprite(item) {

  // Find the index of the item in the 'name' array from allItemDetails
  const index = allItemDetails.name.indexOf(item);

  if (index !== -1) {
      const divElement = document.createElement('div');
      divElement.style.background = `url(https://play.pokemonshowdown.com/sprites/itemicons-sheet.png?v1) no-repeat scroll ${allItemDetails.itemImageXoffset[index]}px ${allItemDetails.itemImageYoffset[index]}px`;
      divElement.style.width = '24px'; // Set the width to the image width
      divElement.style.height = '24px'; // Set the height to the image height
      return divElement;
  } else {
      console.log(`${item} not found in allItemDetails`);
  }
}

function displayPokemonTypes(analysisTierDropdown,analysisSlot){
  const pokemonTypesDiv = document.getElementById(`analysis-pokemon-types${analysisSlot}`);
  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisSlot}`);
  const generationSelected = analysisTierDropdown.value[3];

  // Clear existing children of the pokemonTypesDiv
  pokemonTypesDiv.innerHTML = '';


 if(pokemonType[generationSelected][analysisSlotNameElement.innerText]){

    const numberOfImages= pokemonType[generationSelected][analysisSlotNameElement.innerText].types.length;

    for (let i = 0; i <= numberOfImages-1; i++) {
        // Create an image element
        var imgElement = document.createElement('img');
        imgElement.src = `https://play.pokemonshowdown.com/sprites/types/${pokemonType[generationSelected][analysisSlotNameElement.innerText].types[i]}.png`;
        // Append the image element to the div
        pokemonTypesDiv.appendChild(imgElement);
    }
  }
  else if(analysisSlotNameElement.innerText != "Analysis Slot #1" && analysisSlotNameElement.innerText != "Analysis Slot #2") {
    var imgElement = document.createElement('img');
            imgElement.src = `https://play.pokemonshowdown.com/sprites/types/%3f%3f%3f.png`;
            // Append the image element to the div
            pokemonTypesDiv.appendChild(imgElement);
  }
}


  function setSelectedPokemonGeneration(analysisTierDropdown,analysisSlot){
    const analysisGenerationSlotDivElement = document.getElementById(`analysis-gen-slot${analysisSlot}`);
    const generationSelected = analysisTierDropdown.value[3];
    analysisGenerationSlotDivElement.innerText =  `Generation : ${generationSelected}`
  }

  function setSelectedPokemonTier(analysisTierDropdown,analysisSlot){
    const analysisTierSlotDivElement = document.getElementById(`analysis-tier-slot${analysisSlot}`);
    const TierSelected = analysisTierDropdown.value.slice(4, analysisTierDropdown.value.indexOf('-')).toUpperCase();
    analysisTierSlotDivElement.innerText =  `Tier : ${TierSelected}`;
  }

  function setSelectedPokemonSnapshot(analysisSnapshotDropdown, analysisSlot) {
    const analysisSnapshotSlotDivElement = document.getElementById(`analysis-snapshot-slot${analysisSlot}`);
    
    let snapshotSelected = analysisSnapshotDropdown.value;

    // Define a function to poll for the non-empty value
    function pollForValue() {
        // Update snapshotSelected inside the loop
        snapshotSelected = analysisSnapshotDropdown.value;

        // If the value is still empty, schedule the next check
        if (!snapshotSelected.trim()) {
            setTimeout(pollForValue, 1000);
        } else {
            // Value is non-empty, proceed
            analysisSnapshotSlotDivElement.innerText = `Snapshot : ${snapshotSelected}`;
        }
    }

    // Start the polling loop
    pollForValue();
}

function setSelectedPokemonAnimationOrImage(analysisTierDropdown,analysisSlot) {

  const analysisSlotDivElement = document.getElementById(`pokemon-animation-or-image${analysisSlot}`);
  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisSlot}`);
  const backAnalysisCheckbox = document.getElementById(`sprite-back-checkbox${analysisSlot}`);
  const shinyAnalysisCheckbox = document.getElementById(`sprite-shiny-checkbox${analysisSlot}`);

  const generationSelected = analysisTierDropdown.value[3];
  const cleanedSelectedPokemon = analysisSlotNameElement.innerText.toLowerCase();
  const img = new Image();

  let pokemonImage;
  let pokemonAnimation;
  let pokemonSubstitute;

  analysisSlotDivElement.style.transform = "scale(1)";

  //Assign Image / Animation depending on the generation selected
  if(generationSelected == 1){
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1-back/substitute.png";
    }
    else if(backAnalysisCheckbox.checked){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen1-back/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1-back/substitute.png";
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1/substitute.png"; // No shinies in gen 1
    }
    else {
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen1rb/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1/substitute.png";
    }
  }
  else if(generationSelected == 2){
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen2-back-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1-back/substitute.png";
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen2-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1/substitute.png";
    }
    else if(backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen2-back/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1-back/substitute.png";
    }
    else{
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen2/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen1/substitute.png";
    }
  }
  else if(generationSelected == 3){
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen3-back-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen3-back/substitute.png";
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen3-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen3/substitute.png";
    }
    else if(backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen3-back/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen3-back/substitute.png";
    }
    else{
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen3/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen3/substitute.png";
    }
  }
  else if(generationSelected == 4){
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen4-back-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen4-back/substitute.png";
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen4-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen4/substitute.png";
    }
    else if(backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen4-back/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen4-back/substitute.png";
    }
    else{
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen4/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen4/substitute.png";
    }
  }
  else if(generationSelected == 5){
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5-back-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen5-back/substitute.png";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/gen5ani-back-shiny/${cleanedSelectedPokemon}.gif`;
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen5/substitute.png";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/gen5ani-shiny/${cleanedSelectedPokemon}.gif`;
    }
    else if(backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5-back/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen5-back/substitute.png";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/gen5ani-back/${cleanedSelectedPokemon}.gif`;
    }
    else{
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5/${cleanedSelectedPokemon}.png`;
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/substitutes/gen5/substitute.png";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/gen5ani/${cleanedSelectedPokemon}.gif`;
    }
  } else {
    if(shinyAnalysisCheckbox.checked && backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5-back-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/ani-back/substitute.gif";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/ani-back-shiny/${cleanedSelectedPokemon}.gif`;
    }
    else if(shinyAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/dex-shiny/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/ani/substitute.gif";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/ani-shiny/${cleanedSelectedPokemon}.gif`;
    }
    else if(backAnalysisCheckbox.checked ){
      pokemonImage = `https://play.pokemonshowdown.com/sprites/gen5-back/${cleanedSelectedPokemon}.png`
      pokemonSubstitute = "https://play.pokemonshowdown.com/sprites/ani-back/substitute.gif";
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/ani-back/${cleanedSelectedPokemon}.gif`;
    }
    else{
      pokemonImage = `https://play.pokemonshowdown.com/sprites/dex/${cleanedSelectedPokemon}.png`;
      pokemonAnimation = `https://play.pokemonshowdown.com/sprites/ani/${cleanedSelectedPokemon}.gif`;
      pokemonSubstitute = `https://play.pokemonshowdown.com/sprites/ani/substitute.gif`;
    }
  }

  //Create checks for certain pokemon so that image is cleaned up.
  // List of Pokémon names to cleaned up
  const pokemonNames = ["great tusk","charizard-mega-x","charizard-mega-y","mewtwo-mega-x","mewtwo-mega-y",
"brute bonnet","chi-yu","chien-pao","farfetch’d-galar","farfetch’d","flutter mane","flabébé","hakamo-o","ho-oh","iron bundle","iron crown",
"iron hands","iron jugulis","iron leaves","iron moth","iron thorns","iron treads","iron valiant","jangmo-o","kommo-o",
"mime jr.","mr. mime-galar","mr. mime","nidoran-m","nidoran-f","raging bolt","roaring moon","sandy shocks","scream tail","slither wing",
"sirfetch’d","tapu bulu","tapu fini","tapu koko","tapu lele","ting-lu","type: null","walking wake","wo-chien","urshifu-rapid-strike",
"tauros-paldea-combat","tauros-paldea-blaze","tauros-paldea-aqua","zygarde-10%","oricorio-pom-pom","oricorio-pa'u",
"necrozma-dusk-mane","necrozma-dawn-wings","gouging fire","iron boulder","terapagos-terastal","terapagos-stellar"


];

  if(pokemonImage){
    // Extract pokemonName between the last "/" and ".png"
    const pokemonName = pokemonImage.substring(pokemonImage.lastIndexOf("/") + 1, pokemonImage.lastIndexOf(".png"));

    pokemonNames.forEach(pokemonName => {
      const pathName = pokemonImage.substring(0, pokemonImage.lastIndexOf("/"));
      if (pokemonImage.includes(pokemonName)) {
        if (pokemonName === "charizard-mega-x" || 
            pokemonName === "charizard-mega-y" || 
            pokemonName === "mewtwo-mega-x" || 
            pokemonName === "mewtwo-mega-y") {
            const cleanedPokemonName = pokemonName.replace(/([ \-'.]*)-(?=[^\-]*$)/, '');
            pokemonImage = pathName + "/" + cleanedPokemonName + ".png";
        }
        else if(pokemonName === "flabébé") {
          pokemonImage = pathName + "/" + "flabebe" + ".png";
        }
        else if(pokemonName === "mr. mime"){
          pokemonImage = pathName + "/" + "mrmime" + ".png";
        }
        else if(pokemonName === "farfetch’d"){
          pokemonImage = pathName + "/" + "farfetchd" + ".png";
        }
        else if(pokemonName === "urshifu-rapid-strike"){
          pokemonImage = pathName + "/" + "urshifu-rapidstrike" + ".png";
        }
        else if(pokemonName === "tauros-paldea-combat"){
          pokemonImage = pathName + "/" + "tauros-paldeacombat" + ".png";
        }
        else if(pokemonName === "tauros-paldea-blaze"){
          pokemonImage = pathName + "/" + "tauros-paldeablaze" + ".png";
        }
        else if(pokemonName === "tauros-paldea-aqua"){
          pokemonImage = pathName + "/" + "tauros-paldeaaqua" + ".png";
        }
        else if(pokemonName === "zygarde-10%"){
          pokemonImage = pathName + "/" + "zygarde-10" + ".png";
        }
        else if(pokemonName === "oricorio-pom-pom"){
          pokemonImage = pathName + "/" + "oricorio-pompom" + ".png";
        }
        else if(pokemonName === "oricorio-pa'u"){
          pokemonImage = pathName + "/" + "oricorio-pau" + ".png";
        }
        else if(pokemonName === "necrozma-dusk-mane"){
          pokemonImage = pathName + "/" + "necrozma-duskmane" + ".png";
        }
        else if(pokemonName === "necrozma-dawn-wings"){
          pokemonImage = pathName + "/" + "necrozma-dawnwings" + ".png";
        }
        else{
          if(pokemonName === "mr. mime-galar"){
            pokemonImage = pathName + "/" + "mrmime-galar" + ".png";
          }
          else if(pokemonName === "farfetch’d-galar"){
            pokemonImage = pathName + "/" + "farfetchd-galar" + ".png";
          }
          else{
            const cleanedPokemonName = pokemonName.replace(/[ \-'.:’]/g, '');
            pokemonImage = pathName + "/" + cleanedPokemonName + ".png";
          }
        }
      }
    });

  }
 

  if (analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    analysisSlotDivElement.style.backgroundImage = `url(${pokemonSubstitute})`;
  } else {
    // Set the source of the image to the animation
    img.src = pokemonAnimation;

    // Handle the 'onerror' event for the image
    img.onerror = function () {
      // Animation failed to load, try using the image
      img.src = pokemonImage;
      
      if(generationSelected != 5){
        analysisSlotDivElement.style.backgroundSize = "cover";
      } else {
        analysisSlotDivElement.style.backgroundSize = "contain";
      }


      //Adjusts the height where the image / animation is displayed
      if (analysisSlotNameElement.scrollWidth >= 206) { // This is the width where the text starts wrapping
        analysisSlotDivElement.style.marginTop = '0px';
      } else if(generationSelected <= 3) {
        analysisSlotDivElement.style.marginTop = '90px';
      }
      else{
        analysisSlotDivElement.style.marginTop = '40px';
      }


      // Handle the 'onerror' event for the image again
      img.onerror = function () {
        // Image failed to load, set the substitute image as the background
        analysisSlotDivElement.style.backgroundImage = `url(${pokemonSubstitute})`;
        analysisSlotDivElement.style.backgroundSize = "contain";
      };

      // If the image loads successfully, set it as the background
      img.onload = function () {
        analysisSlotDivElement.style.backgroundImage = `url(${img.src})`;
      };
    };

    // If the animation loads successfully, set it as the background
    img.onload = function () {
      analysisSlotDivElement.style.backgroundImage = `url(${img.src})`;
      analysisSlotDivElement.style.backgroundSize = "contain";
    };
  }
}



// Function to create an SVG container
function createSVG(svgWidth, canvasHeight, containerSelector, imageUrl) {

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", canvasHeight);

  // Create a pattern with the image
  svg.append("defs").append("pattern")
    .attr("id", "image-pattern")
    .attr("width", 1)
    .attr("height", 1)
    .append("image")
    .attr("xlink:href", imageUrl) // Set the URL of the image
    .attr("width", svgWidth)
    .attr("height", canvasHeight);

  // Add a rectangle with the image fill
  svg.append("rect")
    .attr("width", svgWidth)
    .attr("height", canvasHeight)
    .style("fill", "url(#image-pattern)")
    .style("background-size","cover");

  return svg;
}

function createPokemonBox(svg, data, numCircles) {

  const group = svg.append("g").attr("class", "circles-group");

  const circleSpacingXOffset = 28;
  const circleSpacingYOffset = -42;

  // Calculate the spacing between circles in the x direction
  const circleSpacingX = 100; //Want a maximum of 6 columns

  // Calculate the spacing between circles in the y direction
  const circleSpacingY = 100; //Want a maximum of 5 rows

  let previouslyClickedPokemonIcon;

    // create a tooltip
    const nameTooltip = d3.select("#detailed-pokemon-box")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("cursor","default")
    .style("position", "absolute")
    .style("z-index", 999); 

    analysisTooltip = d3.select("#detailed-pokemon-box")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("display","none")
      .style("position", "absolute")
      .style("z-index", 999)
      .html(`
      <li id="analysis-1" style="list-style-type: none;">Analysis Slot #1</li>
      <li id="analysis-2" style="list-style-type: none;">Analysis Slot #2</li>
      `);



  svg.selectAll(".pokemon-icon-background")
    .data(data.slice(0, numCircles))
    .enter()
    .append("foreignObject")
    .attr("class", "pokemon-icon-background")
    .attr("x", (d, i) => {
      if ([0, 6, 12, 18, 24].includes(i)) {
        return circleSpacingXOffset; // Start the first circle at the left; // Start the first circle at the left
      } else {
        const groupIndex = Math.floor((i - 1) % 6) + 1;
        return (circleSpacingX * groupIndex) + circleSpacingXOffset; // Spread out the others
      }
    })
    .attr("y", (d, i) => {
        const groupIndex = Math.floor(i / 6) + 1;
        return (circleSpacingY * (groupIndex))+ circleSpacingYOffset; // Spread out the others
    })
    .attr("width", 40)
    .attr("height", 30)
    .html(d => {
      const divElement = createPokemonIcon(d.resultPokemonImageXOffset, d.resultPokemonImageYOffset);
      divElement.classList.add("pokemon-icon");
      return divElement.outerHTML;
    })
    .on("mousemove", function(d) {
      
      let pokemonname; // Define the variable here
      if(d.target.attributes.class.nodeValue === "pokemon-icon-background" ){
        pokemonname = d.target.__data__.name 
      }
      else if(d.target.attributes.class.nodeValue === "pokemon-icon"){
        pokemonname = d.target.offsetParent.__data__.name
      }
      nameTooltip
          .style("top", (d.pageY - 70) + "px") 
          .style("left", (d.pageX + 20) + "px")
          .style("z-index", 999);
          nameTooltip.style("opacity", 1)
          .html(pokemonname);
    })
    .on("mouseout", function() {
      nameTooltip
        .style("opacity", 0)
        .style("z-index", -999);
    })
    .on("click", (d,i) => {
      analysisTooltip
      .style("top", (d.pageY -100) + "px") 
      .style("left", (d.pageX - 140) + "px")
      .style("display","block")
      .style("cursor","pointer")
      .style("z-index", 999);
      analysisTooltip.style("opacity", 1);

      if(previouslyClickedPokemonIcon || previouslyClickedPokemonIcon === 0 ){
        const previouslySelectedPokemonDiv = svg.selectAll(".pokemon-icon-background")
        .filter((_, index) => index === previouslyClickedPokemonIcon);
    
        previouslySelectedPokemonDiv
          .style("animation", null);
      }

      previouslyClickedPokemonIcon = data.indexOf(i);
      const selectedPokemon = svg.selectAll(".pokemon-icon-background")
      .filter((_, index) => index === previouslyClickedPokemonIcon);
  
      selectedPokemon
        .style("animation", "bobblingHoverOrange 0.5s infinite alternate");

      function setSelectedPokemonName(selectedPokemon,analysisSlot) {
        const analysisNameSlotDivElement = document.getElementById(`analysis-name-slot${analysisSlot}`);
        analysisNameSlotDivElement.innerText = selectedPokemon.name;
      }

      // Add event listeners for the clickable options
      d3.selectAll("#analysis-1")
      .on("click", () => {
        //i is the icon instance, 1 references the analysis slot
        setSelectedPokemonName(i,1);
        setSelectedPokemonAnimationOrImage(analysisOneTierDropdown,1);
        displayPokemonTypes(analysisOneTierDropdown, 1);
        runSelectedSideBarButton(analysisOneTierDropdown, 1);
        analysisTooltip.style("display","none");
        selectedPokemon.style("animation", null);
      });
  
      d3.selectAll("#analysis-2")
      .on("click", () => {
        //i is the icon instance, 2 references the analysis slot
        setSelectedPokemonName(i,2);
        setSelectedPokemonAnimationOrImage(analysisTwoTierDropdown,2);
        displayPokemonTypes(analysisTwoTierDropdown, 2);
        runSelectedSideBarButton(analysisTwoTierDropdown, 2);
        analysisTooltip.style("display","none");
        selectedPokemon.style("animation", null);
      });

    });    

  return group;
}

function applyClassToElementWithBackground(selectedBoxBackground, className) {
  // Find all elements with the specified class name
  const backgroundElements = document.querySelectorAll('.detailed-pokemon-analysis-background');

  // Remove the class from all elements with the specified class
  for (const element of backgroundElements) {
      if (element.classList.contains(className)) {
          element.classList.remove(className);
      }
  }

  // Find the element with the matching background image
  let matchedElement = null;

  for (const element of backgroundElements) {
      const computedBackgroundImage = window.getComputedStyle(element).getPropertyValue('background-image').slice(5, -2);

      if (computedBackgroundImage === selectedBoxBackground) {
          matchedElement = element;
          break; // Exit the loop once a match is found
      }
  }

  // Apply the class to the matched element
  if (matchedElement) {
      matchedElement.classList.add(className);
  }
}

function createPokeBallContainerAndContents(data) {

  // Remove the previous pokemonBox
  if(boxSVG){
    boxSVG.remove();
    analysisTooltip.style("display","none");
  };

  const numberPokemonInBox = Math.min(data.length, 30);

  boxSVG = createSVG(boxSVGWidth, boxSVGHeight, "#detailed-pokemon-box",selectedBoxBackground);
  const circlesGroup = createPokemonBox(boxSVG, data, numberPokemonInBox);
  applyClassToElementWithBackground(selectedBoxBackground,"detailed-pokemon-analysis-background-selected")
  

}

function setErrorGraphText(analysisGraphSlot) {

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();

  }

  // Set up the dimensions for the graph
  const width = 500; // Adjust the width as needed
  const height = 400; // Adjust the height as needed

  // Create the SVG element inside the specified div
  const SVG = d3
    .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Add the text to the center of the SVG
  SVG.append("text")
    .text("No data found!")
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("font-family", '"Pixelify Sans", sans-serif')
    .attr("font-weight", "bold")
    .attr("font-size", "68px") // Adjust the font size as needed
    .attr("fill", "red")
    .attr("text-anchor", "middle") // Center the text horizontally
    .attr("dominant-baseline", "middle"); // Center the text vertically

  return SVG;
}

function setUsageGraph(analysisTierDropdown,analysisGraphSlot) {

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }
  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }

  const currentUsageArray = [];
  const previousUsageArray = [];

  // Populate the usageArray with Pokémon names and their corresponding usage values
  for (let key in sheetDataCache[tierSelected]) {
      const pokemonName = key;
      const currentUsage = parseFloat(sheetDataCache[tierSelected][key].usage[sheetDataCache[tierSelected][key].snapshot.indexOf(snapshotSelected)]);
      const previousUsage = parseFloat(sheetDataCache[tierSelected][key].usage[sheetDataCache[tierSelected][key].snapshot.indexOf(snapshotSelected)-1]);
      
      currentUsageArray.push({ pokemonName, currentUsage });
      previousUsageArray.push({ pokemonName, previousUsage });
  }

  // Sort the usageArray based on the usage values in descending order
  currentUsageArray.sort((a, b) => {
    // Handle NaN values by treating them as the lowest value
    const aValue = isNaN(a.currentUsage) ? Number.NEGATIVE_INFINITY : a.currentUsage;
    const bValue = isNaN(b.currentUsage) ? Number.NEGATIVE_INFINITY : b.currentUsage;

    return bValue - aValue;
});

  // Sort the usageArray based on the usage values in descending order
  previousUsageArray.sort((a, b) => {
    // Handle NaN values by treating them as the lowest value
    const aValue = isNaN(a.previousUsage) ? Number.NEGATIVE_INFINITY : a.previousUsage;
    const bValue = isNaN(b.previousUsage) ? Number.NEGATIVE_INFINITY : b.previousUsage;

    return bValue - aValue;
});

  // Filter out values that are zero
  const filteredCurrentUsageArray = currentUsageArray.filter(item => item.currentUsage !== 0 && !isNaN(item.currentUsage));
  const filteredPreviousUsageArray = previousUsageArray.filter(item => item.previousUsage !== 0 && !isNaN(item.previousUsage));
  
  // Find the rank of the key for the current snapshot
  const currentRank = filteredCurrentUsageArray.findIndex(item => item.pokemonName === analysisSlotNameElement.innerText) + 1;
  // Find the rank of the key for the previous snapshot
  const previousRank = filteredPreviousUsageArray.findIndex(item => item.pokemonName === analysisSlotNameElement.innerText) + 1;

  const previousUsagePokemon = filteredPreviousUsageArray.find(item => item.pokemonName === analysisSlotNameElement.innerText);
  const previousUsageValuePokemon = previousUsagePokemon ? previousUsagePokemon.previousUsage : 0;
  const currentUsagePokemon = filteredCurrentUsageArray.find(item => item.pokemonName === analysisSlotNameElement.innerText);
  const currentUsageValuePokemon = currentUsagePokemon ? currentUsagePokemon.currentUsage : 0;
  
  // Calculate the change in rank
  let rankChange;
  let usageChange;

  if(currentRank === 0 ){
    return setErrorGraphText(analysisGraphSlot);
  }

  if(previousRank === 0 ){
    rankChange= filteredCurrentUsageArray.length - currentRank;
    usageChange = currentUsageValuePokemon;
  }
  else {
    rankChange = previousRank - currentRank;
    usageChange = (currentUsageValuePokemon - previousUsageValuePokemon).toFixed(5);
  }
  
  // Set up the dimensions for the graph
  const width = 500; 
  const height = 400;


  // Create the SVG element inside the specified div
  const SVG = d3
    .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Calculate the position for the text
  const textWidth = width / 2;
  const textHeight = height / 3; // Assuming you want it vertically centered

  // Calculate circle position
  const circleRadius = 13;
  // Determine circle fill color based on rankChange
  const circleFillColor = rankChange >= 0 ? "green" : "red";

  // Add text to the SVG
  SVG.append("text")
    .attr("x", textWidth)
    .attr("y", textHeight)
    .attr("dy", "-40px")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#B3C3D0")
    .style("text-anchor", "middle")
    .text("Usage Ranking");

  // Get the actual width of the second text (currentRank)
  const currentRankText = SVG.append("text")
    .attr("x", textWidth)
    .attr("y", textHeight)
    .attr("dy", "0px")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .style("fill", "#e8eef2")
    .style("text-anchor", "middle")
    .text(`${currentRank}`);

  const circleX = currentRankText.node().getBBox().x + currentRankText.node().getBBox().width + 20;
  const circleY = currentRankText.node().getBBox().y + currentRankText.node().getBBox().height / 2;

  // Append circle to the SVG
  SVG.append("circle")
    .attr("cx", circleX)
    .attr("cy", circleY)
    .attr("r", circleRadius)
    .style("fill", circleFillColor);

    // Scale factor for the arrow size
    const scaleFactor = 1.5; // You can adjust this value to increase or decrease the size

    // Variable to determine arrow direction
    const isUpsideDown = rankChange < 0;

    // Calculate arrow points with increased size and potential upside-down orientation
    const yOffset = 1.5;

    let arrowPoints;
    if (isUpsideDown) {
      arrowPoints = `${circleX - 5 * scaleFactor},${circleY - 5 * scaleFactor + yOffset} ${circleX},${circleY + 5 * scaleFactor + yOffset} ${circleX + 5 * scaleFactor},${circleY - 5 * scaleFactor + yOffset}`;
    } else {
      arrowPoints = `${circleX - 5 * scaleFactor},${circleY + 5 * scaleFactor - yOffset} ${circleX},${circleY - 5 * scaleFactor - yOffset} ${circleX + 5 * scaleFactor},${circleY + 5 * scaleFactor - yOffset}`;
    }

    // Append arrow to the SVG inside the circle
    SVG.append("polygon")
      .attr("points", arrowPoints)
      .style("fill", "#0d1b2a");

    // Add text to the SVG
    SVG.append("text")
    .attr("x", textWidth)
    .attr("y", textHeight)
    .attr("dy", "33px")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#B3C3D0")
    .style("text-anchor", "middle")
    .text(`A change of ${rankChange > 0 ? '+' : ''}${rankChange} from the previous month!`);

    const textHeight2 = height / 4 * 3; // Assuming you want it vertically centered
  
    // Add text to the SVG

    SVG.append("text")
      .attr("x", textWidth)
      .attr("y", textHeight2)
      .attr("dy", "-40px")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "#B3C3D0")
      .style("text-anchor", "middle")
      .text("Usage Percentage");
    
    // Add text to the SVG
    const currentRankText2 = SVG.append("text")
    .attr("x", textWidth)
    .attr("y", textHeight2)
    .attr("dy", "0px")
    .style("font-size", "32px")
    .style("font-weight", "bold")
    .style("fill", "#e8eef2")
    .style("text-anchor", "middle")
    .text(`${currentUsageValuePokemon}%`);

    const circleX2 = currentRankText2.node().getBBox().x + currentRankText2.node().getBBox().width + 20;
    const circleY2 = currentRankText2.node().getBBox().y + currentRankText2.node().getBBox().height / 2;

    // Determine circle fill color based on rankChange
    const circleFillColor2 = usageChange >= 0 ? "green" : "red";

    // Append circle to the SVG
    SVG.append("circle")
    .attr("cx", circleX2)
    .attr("cy", circleY2)
    .attr("r", circleRadius)
    .style("fill", circleFillColor2);

    // Variable to determine arrow direction
    const isUpsideDown2 = usageChange < 0;
    
    let arrowPoints2;
    if (isUpsideDown2) {
      arrowPoints2 = `${circleX2 - 5 * scaleFactor},${circleY2 - 5 * scaleFactor + yOffset} ${circleX2},${circleY2 + 5 * scaleFactor + yOffset} ${circleX2 + 5 * scaleFactor},${circleY2 - 5 * scaleFactor + yOffset}`;
    } else {
      arrowPoints2 = `${circleX2 - 5 * scaleFactor},${circleY2 + 5 * scaleFactor - yOffset} ${circleX2},${circleY2 - 5 * scaleFactor - yOffset} ${circleX2 + 5 * scaleFactor},${circleY2 + 5 * scaleFactor - yOffset}`;
    }

    // Append arrow to the SVG inside the circle
    SVG.append("polygon")
      .attr("points", arrowPoints2)
      .style("fill", "#0d1b2a");

      // Add text to the SVG
      SVG.append("text")
      .attr("x", textWidth)
      .attr("y", textHeight2)
      .attr("dy", "33px")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "#B3C3D0")
      .style("text-anchor", "middle")
      .text(`${usageChange >= 0 ? 'Up ' : 'Down '}${Math.abs(usageChange)}% from the previous month!`);

  return SVG;

}


function setStatsGraph(analysisTierDropdown,analysisGraphSlot) {

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const generationSelected = analysisTierDropdown.value[3];
  let NewPokemonStats = [];
 
  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!generationSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }
  

  if (!pokemonStats[generationSelected]?.[analysisSlotNameElement.innerText]) {
    return setErrorGraphText(analysisGraphSlot);
  }
 
  const pokemonStatObject = pokemonStats[generationSelected][analysisSlotNameElement.innerText]

    // Object to push
  const hpValue = { stat: "HP", value: parseInt(pokemonStatObject.hp) };
  const attackValue = { stat: "Attack", value: parseInt(pokemonStatObject.atk) };
  const defenseValue = { stat: "Defense", value: parseInt(pokemonStatObject.def) };
  const specialAttackValue = { stat: "Sp. Atk", value: parseInt(pokemonStatObject.SpAtk) };
  const specialDefenseValue = { stat: "Sp. Def", value: parseInt(pokemonStatObject.SpDef) };
  const speedValue = { stat: "Speed", value: parseInt(pokemonStatObject.spe) };

  // Push the object into the array
  NewPokemonStats.push(hpValue);
  NewPokemonStats.push(attackValue);
  NewPokemonStats.push(defenseValue);
  NewPokemonStats.push(specialAttackValue);
  NewPokemonStats.push(specialDefenseValue);
  NewPokemonStats.push(speedValue);

//If the stats are empty, return an empty graph
if (NewPokemonStats.length === 0 && analysisGraphSlot === 1) {
  analysisOneSVG = setErrorGraphText(1);
  return analysisOneSVG
} else if (NewPokemonStats.length === 0 && analysisGraphSlot === 2) {
  analysisTwoSVG = setErrorGraphText(2);
  return analysisTwoSVG
}

  // Set up the dimensions for the graph
  const width = 500; 
  const height = 400;

  // Maximum allowed width for the bars
  const maxWidth = 220;

  // Create the SVG element inside the specified div
  const SVG = d3
    .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group (g) element to hold the bars and text labels
  const graphGroup = SVG.append("g").attr("transform", "translate(20, 40)");

  // Define the maximum value (in this case, 255 for base stats)
  const maxValue = 255;

  // Define a color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(NewPokemonStats.map((d) => d.stat))
    .range(
      NewPokemonStats.map((d) => {
        let color;
        switch (d.stat) {
          case "HP":
            color = "#FA0202";
            break;
          case "Attack":
            color = "#F27F2C";
            break;
          case "Defense":
            color = "#F7CF31";
            break;
          case "Sp. Atk":
            color = "#6890F0";
            break;
          case "Sp. Def":
            color = "#79C74F";
            break;
          case "Speed":
            color = "#F85888";
            break;
          case "Special":
            color = "#6890F0"; // Gen 1 Represent 
            break;
          default:
            color = "white";
        }
        return color;
      })
    );

  // Calculate the scaling factor based on the maximum value and maximum allowed width
  const scale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([0, Math.min(maxWidth, width - 120)]);

  // Create the horizontal bars
  graphGroup
  .selectAll("rect")
  .data(NewPokemonStats)
  .enter()
  .append("rect")
  .attr("x", 125)
  .attr("y", (d, i) => i * 50)
  .attr("width", 0) // Set initial width to 0
  .attr("height", 40)
  .attr("fill", (d) => colorScale(d.stat))
  .transition() // Add transition
  .duration(450) // Set the duration of the transition in milliseconds
  .attr("width", (d) => scale(d.value));


  // Add labels to the left of the bars
  graphGroup
    .selectAll("text")
    .data(NewPokemonStats)
    .enter()
    .append("text")
    .text((d) => `${d.stat} :`)
    .attr("x", (d, i) => {
      if (i === 0) {
        return 35;
      } else if (i === 1) {
        return 7;
      }
      else if (i === 2) {
        return -8;
      }
      else if (i === 3) {
        return 2;
      }
      else if (i === 4) {
        return 1;
      }
      else if (i === 5) {
        return 9;
      }
    })
    .attr("y", (d, i) => i * 50 + 25) // Adjust the vertical position of labels
    .attr("font-size", "19px")
    .attr("font-weight", "bold")
    .attr("fill", "#DBDBDB");

  // Add labels with values to the right of the bars
  graphGroup
    .selectAll(".value-label")
    .data(NewPokemonStats)
    .enter()
    .append("text")
    .text((d) => d.value)
    .attr("x", (d, i) => {
      const valueLength = d.value.toString().length
      if (valueLength === 1) {
        return 106;
      } else if (valueLength === 2) {
        return 93;
      } else if (valueLength === 3) {
        return 83;
      }
      
    })
    .attr("y", (d, i) => i * 50 + 25) 
    .attr("font-size", "19px")
    .attr("font-weight", "bold") 
    .attr("fill", "#DBDBDB"); 


  // Calculate and display the total beneath the bars
  const total = NewPokemonStats.reduce((acc, d) => acc + d.value, 0);
  graphGroup
    .append("text")
    .text(`Base Stat Total : ${total}`)
    .attr("x", 0) // Adjust the position to the left of the bars
    .attr("y", NewPokemonStats.length * 50 + 40) // Adjust the vertical position beneath the bars
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .attr("fill", "#DBDBDB");

  // Add headers for Lv.50 and Lv.100
  const lvHeaders = ["Lv.50", "Lv.100"];
  graphGroup
    .selectAll(".lv-header")
    .data(lvHeaders)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", (d, i) => width - 138 + i * 61)
    .attr("y", -20)
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "#DBDBDB");

  // Add vertical lines between Lv.50 and Lv.100 columns
  const lvLines = [width - 146, width - 130 + 50];
  graphGroup
    .selectAll(".lv-line")
    .data(lvLines)
    .enter()
    .append("line")
    .attr("x1", (d) => d-5)
    .attr("y1", -200)
    .attr("x2", (d) => d-5)
    .attr("y2", height - 100)
    .attr("stroke", "lightgray")
    .attr("stroke-width", 2);

  function baseStatValueCalculation(generation,stat,level,limit){ //limit refers to lowest limit or highest limit (low and high) 

    let iv;
    let ev;
    let finalBaseStatValue;
    let stringValue;

    //Set evs and ivs depending on conditions
    if(limit === "low"){
       iv = 0;
       ev = 0;
    }
    else if(limit === "high"){
      if(generation <=2 ){
       iv = 15;
       ev = 65535;
      }
      else if (generation > 2){
       iv = 31;
       ev = 255;
      }
    }
  
    //First 2 generations
    if(generation <=2 ){
      if(stat.stat === "HP"){
        finalBaseStatValue = Math.floor(((((stat.value + iv) * 2) + (Math.sqrt(ev)/4)) * level) / 100) + level + 10;
      }
      else{
        finalBaseStatValue = Math.floor(((((stat.value + iv) * 2) + (Math.sqrt(ev)/4)) * level) / 100) + 5;
      }
    }
    //Later Generations
    else if(generation > 2){
      if(stat.value === 1){ // In the case of Shedinja
        finalBaseStatValue = 1;
        stringValue = finalBaseStatValue.toString();
        return stringValue;
      }
      if(stat.stat === "HP"){
        finalBaseStatValue = Math.floor(((((2*stat.value) + iv + (ev/4)) *level)/100)) + level + 10;
      }
      else{
        // bad nature
        if(limit === "low"){ 
          finalBaseStatValue = Math.floor((Math.floor(((((2*stat.value) + iv + (ev/4)) *level)/100)) + 5)*0.9);
        }
        //bad nature
        if(limit === "high"){
          finalBaseStatValue = Math.floor((Math.floor(((((2*stat.value) + iv + (ev/4)) *level)/100)) + 5)*1.1);
        }
      }
    } 
  // Convert the final value to a string
  stringValue = finalBaseStatValue.toString();

  return stringValue;
  }

  const hpStat50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "HP"), 50,"low");
  const hpStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "HP"), 50,"high");
  const hpStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "HP"), 100,"low");
  const hpStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "HP"), 100,"high");

  const attackStat50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Attack"), 50,"low");
  const attackStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Attack"), 50,"high");
  const attackStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Attack"), 100,"low");
  const attackStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Attack"), 100,"high");

  const defenseStat50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Defense"), 50,"low");
  const defenseStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Defense"), 50,"high");
  const defenseStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Defense"), 100,"low");
  const defenseStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Defense"), 100,"high");

  const spAttackStat50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Atk"), 50,"low");
  const spAttackStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Atk"), 50,"high");
  const spAttackStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Atk"), 100,"low");
  const spAttackStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Atk"), 100,"high");

  const spDefense50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Def"), 50,"low");
  const spDefenseStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Def"), 50,"high");
  const spDefenseStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Def"), 100,"low");
  const spDefenseStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Sp. Def"), 100,"high");

  const speedStat50Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Speed"), 50,"low");
  const speedStat50High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Speed"), 50,"high");
  const speedStat100Low = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Speed"), 100,"low");
  const speedStat100High = baseStatValueCalculation(generationSelected, NewPokemonStats.find(stat => stat.stat === "Speed"), 100,"high");


  // Set spacing depending on base values lengths
  function getSpaces(low, high){

    const stringSpaces = low.length + high.length;

    if(stringSpaces === 6){
      return "";
    }
    else if (stringSpaces === 5){
      return " "
    }
    else if (stringSpaces === 4){
      return "  "
    }
    else if (stringSpaces === 3){
      return "    "
    }
    else if (stringSpaces === 2){
      return "     "
    }
    else{
      return ""
    }
  }

  let hp50Spaces = getSpaces(hpStat50Low,hpStat50High);
  let hp100Spaces = getSpaces(hpStat100Low,hpStat100High);
  let attack50Spaces = getSpaces(attackStat50Low,attackStat50High);
  let attack100Spaces = getSpaces(attackStat100Low,attackStat100High);
  let defense50Spaces = getSpaces(defenseStat50Low,defenseStat50High);
  let defense100Spaces = getSpaces(defenseStat100Low,defenseStat100High);
  let spAttack50Spaces = getSpaces(spAttackStat50Low,spAttackStat50High);
  let spAttack100Spaces = getSpaces(spAttackStat100Low,spAttackStat100High);
  let spDefense50Spaces = getSpaces(spDefense50Low,spDefenseStat50High);
  let spDefense100Spaces = getSpaces(spDefenseStat100Low,spDefenseStat100High);
  let speed50Spaces = getSpaces(speedStat50Low,speedStat50High);
  let speed100Spaces = getSpaces(speedStat100Low,speedStat100High);

  //bro, good look decoding wtf this is
  if(hp50Spaces.length === 5){
    hp100Spaces += "   ";
  }
  if(attack50Spaces.length === 5){
    attack100Spaces += "   ";
  }
  if(defense50Spaces.length === 5){
    defense100Spaces += "   ";
  }
  if(spAttack50Spaces.length === 5){
    spAttack100Spaces += "   ";
  }
  if(spDefense50Spaces.length === 5){
    spDefense100Spaces += "   ";
  }
  if(speed50Spaces.length === 5){
    speed100Spaces += "   ";
  }
  
  if(hp50Spaces.length === 4){
    hp100Spaces += "  ";
  }
  if(attack50Spaces.length === 4){
    attack100Spaces += "  ";
  }
  if(defense50Spaces.length === 4){
    defense100Spaces += "  ";
  }
  if(spAttack50Spaces.length === 4){
    spAttack100Spaces += "  ";
  }
  if(spDefense50Spaces.length === 4){
    spDefense100Spaces += "  ";
  }
  if(speed50Spaces.length === 4){
    speed100Spaces += "  ";
  }

  if(hp50Spaces.length === 3){
    hp100Spaces += " ";
  }
  if(attack50Spaces.length === 3){
    attack100Spaces += " ";
  }
  if(defense50Spaces.length === 3){
    defense100Spaces += " ";
  }
  if(spAttack50Spaces.length === 3){
    spAttack100Spaces += " ";
  }
  if(spDefense50Spaces.length === 3){
    spDefense100Spaces += " ";
  }
  if(speed50Spaces.length === 3){
    speed100Spaces += " ";
  }
  if(hp50Spaces.length === 2){
    hp100Spaces += "  ";
  }
  if(attack50Spaces.length === 2){
    attack100Spaces += "  ";
  }
  if(defense50Spaces.length === 2){
    defense100Spaces += "  ";
  }
  if(spAttack50Spaces.length === 2){
    spAttack100Spaces += "  ";
  }
  if(spDefense50Spaces.length === 2){
    spDefense100Spaces += "  ";
  }
  if(speed50Spaces.length === 2){
    speed100Spaces += "  ";
  }

  if(hp50Spaces.length === 1){
    hp100Spaces += " ";
  }
  if(attack50Spaces.length === 1){
    attack100Spaces += " ";
  }
  if(defense50Spaces.length === 1){
    defense100Spaces += " ";
  }
  if(spAttack50Spaces.length === 1){
    spAttack100Spaces += " ";
  }
  if(spDefense50Spaces.length === 1){
    spDefense100Spaces += " ";
  }
  if(speed50Spaces.length === 1){
    speed100Spaces += " ";
  }


  // Add values for Lv.50 and Lv.100
  const lvValues = [
                  `${hp50Spaces}${hpStat50Low} - ${hpStat50High}${hp100Spaces}      ${hpStat100Low} - ${hpStat100High}`,
                  `${attack50Spaces}${attackStat50Low} - ${attackStat50High}${attack100Spaces}      ${attackStat100Low} - ${attackStat100High}`,
                  `${defense50Spaces}${defenseStat50Low} - ${defenseStat50High}${defense100Spaces}      ${defenseStat100Low} - ${defenseStat100High}`,
                  `${spAttack50Spaces}${spAttackStat50Low} - ${spAttackStat50High}${spAttack100Spaces}      ${spAttackStat100Low} - ${spAttackStat100High}`,
                  `${spDefense50Spaces}${spDefense50Low} - ${spDefenseStat50High}${spDefense100Spaces}      ${spDefenseStat100Low} - ${spDefenseStat100High}`,
                  `${speed50Spaces}${speedStat50Low} - ${speedStat50High}${speed100Spaces}      ${speedStat100Low} - ${speedStat100High}`,
  ];

  graphGroup
    .selectAll(".lv-value")
    .data(lvValues)
    .enter()
    .append("text")
    .text((d) => d)
    .attr("x", (d, i) => width - 143.5 )
    .attr("y", (d, i) => i * 50 + 25) // Adjust the vertical position of labels
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#DBDBDB")
    .style("white-space", "pre");  // Preserve consecutive spaces

    // Add horizontal lines between BST
    const hzLines = [height - 100];
    graphGroup
      .selectAll(".lv-line")
      .data(hzLines)
      .enter()
      .append("line")
      .attr("x1", (d) => d - 400)
      .attr("y1", (d) => d) // Set the y-coordinate for the start of the line
      .attr("x2", (d) => d + 250)
      .attr("y2", (d) => d) // Set the y-coordinate for the end of the line
      .attr("stroke", "lightgray")
      .attr("stroke-width", 2);

  return SVG;
}

function setAbilitiesGraph(analysisTierDropdown,analysisGraphSlot) {

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;
  const generationSelected = analysisTierDropdown.value[3];

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }
  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }


  if (!pokemonAbilities[tierSelected]?.[analysisSlotNameElement.innerText] || generationSelected == 1 || generationSelected == 2) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonAbilities[tierSelected][analysisSlotNameElement.innerText].ability;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  if(!desiredSnapshot){
    return setErrorGraphText(analysisGraphSlot);
  }
  const abilities = desiredSnapshot.abilities;


  // Set up the dimensions for the graph
  const width = 500; 
  const height = 400;
  const radius = Math.min(width, height) / 4;


  // Create the SVG element inside the specified div
  const SVG = d3
    .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    

  // Set up pie chart layout
  const pie = d3.pie().value(d => d.usage);
  const dataReady = pie(abilities);
  
  // Set up arc generator
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  
  // Create a group (g) element to hold the pie chart
  const graphGroup = SVG.append("g").attr("transform", "translate(120, 200)");
  
  // Add pie segments
  graphGroup
  .selectAll("path.slice")
  .data(dataReady)
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", (d, i) => d3.schemeCategory10[i])
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 1)
  .transition() // Add transition
  .duration(450) // Set the duration of the transition in milliseconds
  .attrTween("d", function (d) {
    // Interpolate between the initial and final arc shapes
    const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
    return function (t) {
      return arc(interpolate(t));
    };
  });

  // Create a circle for the circumference with a whitesmoke border
  graphGroup.append("circle")
  .attr("cx", 0)
  .attr("cy", 0)
  .attr("r", radius)
  .attr("fill", "none")          // Set fill to none so it's invisible
  .attr("stroke", "whitesmoke")  // Set the stroke color
  .attr("stroke-width", 1);      // Set the stroke width

// Calculate vertical translation based on the number of abilities
const verticalTranslation = (abilities.length === 1) ? 120 : 0;

// Create a group for labels
const labelsGroup = graphGroup.append("g").attr("class", "labels");

// Add labels
const labels = labelsGroup
  .selectAll("g.label")
  .data(dataReady)
  .enter()
  .append("g")
  .attr("class", "label")
  .attr("transform", (d, i) => `translate(0, ${i * 120 + verticalTranslation})`);

  // Add rectangles within each label group (background)
  labels
    .append("rect")
    .attr("width", 215)
    .attr("height", 85)
    .attr("fill", (d, i) => d3.schemeCategory10[i])
    .attr("stroke", "whitesmoke")
    .attr("stroke-width", 1)
    .attr("transform", (d, i) => `translate(133, -159)`)
    .style("opacity", 0) // Set the final opacity
    .transition() // Add transition
    .duration(700) // Set the duration of the transition in milliseconds
    .delay((d, i) => i * 80) // Add a delay based on the index
    .style("opacity", 1); // Set the final opacity

  // Add rectangles within each label group
  // labels
  //   .append("rect")
  //   .attr("width", 22)
  //   .attr("height", 22)
  //   .attr("fill", (d, i) => d3.schemeCategory10[i])
  //   .attr("stroke", "whitesmoke")
  //   .attr("stroke-width", 1)
  //   .attr("transform", (d, i) => `translate(152, -144)`);

  // Add abilities text within each label group
  labels
  .append("text")
  .attr("dy", "-115px")
  .html(d => `${d.data.abilityName}`)
  .style("fill", "#DBDBDB")
  .style("font-weight", "bold")
  .style("font-size", "24px")
  .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.5)") // Add text shadow
  .each(function (d, i) {
    const leftPosition = (145);
    d3.select(this).attr("dx", `${leftPosition}px`);

    // Store centerPosition value for later use
    d.leftPosition = leftPosition;
  })
  .style("opacity", 0) // Set the final opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 80) // Add a delay based on the index
  .style("opacity", 1); // Set the final opacity

// Add abilities usage text within each label group
labels
  .append("text")
  .attr("dy", "-88px")
  .html(d => `Usage: ${d.data.usage}%`)
  .style("fill", "#DBDBDB")
  .style("font-weight", "bold")
  .style("font-style", "italic")
  .style("font-size", "16px")
  .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.5)") // Add text shadow
  .each(function (d) {
    // Use the stored centerPosition value for the second label
    d3.select(this).attr("dx", `${d.leftPosition}px`);
  })
  .style("opacity", 0) // Set the final opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 80) // Add a delay based on the index
  .style("opacity", 1); // Set the final opacity
  return SVG;

}

function setItemsGraph(analysisTierDropdown,analysisGraphSlot){

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;
  const generationSelected = analysisTierDropdown.value[3];

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }

  if (!pokemonItems[tierSelected]?.[analysisSlotNameElement.innerText] || generationSelected == 1) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonItems[tierSelected][analysisSlotNameElement.innerText].item;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  function createListOfObjects(keys, values) {
    return keys.map((key, index) => {
      return { itemName: key, usage: values[index] };
    });
  }

  if(!desiredSnapshot){
    return setErrorGraphText(analysisGraphSlot);
  }

  const items = createListOfObjects(desiredSnapshot.items, desiredSnapshot.usages);

  // const abilities = desiredSnapshot.items;

  // Set up the dimensions for the graph
  const width = 500; 
  const height = 400;

  // Create the SVG element inside the specified div
  const SVG = d3
    .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height);  

  // Set up the treemap layout
  const treemap = d3.treemap()
    .size([350, 400]) // Set the size of the treemap container
    .padding(3) // Set padding between tiles

  // Create a hierarchical structure from the flat data
  const root = d3.hierarchy({ values: items }, d => d.values)
    .sum(d => d.usage);

  // Compute the treemap layout
  treemap(root);



  // Create treemap tiles
  SVG.selectAll("rect")
  .data(root.leaves())
  .enter().append("rect")
  .attr("x", d => (d.x0 + d.x1) / 2) // Start from the center horizontally
  .attr("y", d => (d.y0 + d.y1) / 2) // Start from the center vertically
  .attr("width", 0) // Set initial width to 0
  .attr("height", 0) // Set initial height to 0
  .style("fill", "#49A078")
  .transition() // Add transition
  .duration(500) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 60) // Add a delay based on the index
  .attr("x", d => d.x0) // Move to the actual x position
  .attr("y", d => d.y0) // Move to the actual y position
  .attr("width", d => d.x1 - d.x0) // Set the final width
  .attr("height", d => d.y1 - d.y0); // Set the final height

// Add text labels
SVG.selectAll("text")
  .data(root.leaves())
  .enter().append("text")
  .attr("x", d => (d.x0 + d.x1) / 2) // Center horizontally
  .attr("y", d => (d.y0 + d.y1) / 2) // Center vertically
  .text(d => d.data.itemName)
  .style("opacity", 0) // Set initial opacity to 0
  .attr("font-size", function(d) {
    // Calculate font size based on available width in the x direction
    const textWidth = d.x1 - d.x0;
    const fontSize = Math.min(textWidth / d.data.itemName.length, (d.y1 - d.y0) / 4) * 1.8; // Increase font size by a factor
    return fontSize;
  })
  .attr("font-weight", "bold") // Set the text to bold
  .attr("fill", "#DBDBDB")
  .attr("text-anchor", "middle") // Center-align horizontally
  .attr("dominant-baseline", "middle") // Center-align vertically
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 60) // Add a delay based on the index
  .style("opacity", 1); // Set the final opacity

  // Calculate the total number of leaves
  const itemLength = items.length;

  // Calculate the height of each "slot" for a text item
  const slotHeight = height / itemLength;

  // Calculate the remaining height for all elements
  const remainingHeight = slotHeight;

  items.sort((a, b) => {
    const dateA = new Date(a.usage);
    const dateB = new Date(b.usage);
  
    // Compare the dates
    return dateB - dateA;
  });

// Add additional text to the right with evenly spaced y values
const additionalText = SVG.selectAll("additional-text")
  .data(items)
  .enter().append("g"); // Use a group element to group the two text elements together

// Append the first text element (item name)
additionalText.append("text")
  .attr("x", 352) // Position to the right of the treemap, but not beyond the SVG width
  .attr("y", (d, i) => (i + 0.5) * slotHeight) // Evenly spaced y values
  .text((d, i) => `${i + 1}: ${d.itemName}`) // Concatenate ranking number
  .attr("font-size", function (d, i) {
    // Calculate font size based on the pre-calculated remaining height
    let fontSize = Math.min(remainingHeight-14, 13); // Adjust the max font size as needed
    if(itemLength >= 13 && itemLength <= 16){
      fontSize -= 3;
    }
    return fontSize;
  })
  .attr("font-weight", "bold")
  .attr("fill", "whitesmoke")
  .attr("text-anchor", "start") // Align text to the start (left)
  .style("opacity", 0) // Set the final opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 60) // Add a delay based on the index
  .style("opacity", 1); // Set the final opacity

  // Append the second text element (d.usage)
  additionalText.append("text")
  .attr("x", 352) // Position to the right of the treemap, but not beyond the SVG width
  .attr("y", (d, i) => {
    if(itemLength >= 18){
      return (i + 0.5) * slotHeight + 8;
    }
    else if (itemLength ==17){
      return (i + 0.5) * slotHeight + 10;
    }
    else if (itemLength >= 15 && itemLength <= 16){
      return (i + 0.5) * slotHeight + 9;
    }
    else if (itemLength ==13 || itemLength ==14){
      return (i + 0.5) * slotHeight + 10;
    }
    else {
      return (i + 0.5) * slotHeight + 14;
    }
  }) 
  .text((d) => `Usage: ${d.usage}%`) // Display the usage text
  .attr("font-size", function (d, i) {
    // Calculate font size based on the pre-calculated remaining height
    let fontSize = Math.min(remainingHeight - 14, 12); // Adjust the max font size as needed, subtracting 15 for the offset
    if(itemLength >= 13 && itemLength <= 16){
      fontSize -= 3;
    }
    return fontSize;
  })
  .attr("font-style", "italic")
  .attr("fill", "whitesmoke")
  .attr("text-anchor", "start") // Align text to the start (left)
  .style("opacity", 0) // Set the final opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => i * 60) // Add a delay based on the index
  .style("opacity", 1); // Set the final opacity


  
// Add foreignObject for div
const foreignObject = SVG.selectAll("foreignObject")
  .data(items)
  .enter().append("foreignObject")
  .attr("x", (d, i) => 352 + additionalText.nodes()[i].getBBox().width + 5)
  .attr("y", (d, i) => (i + 0.5) * slotHeight - 14)
  .attr("width", 24)
  .attr("height", 24)
  .style("vertical-align", "middle")
  .style("opacity", 0) // Set initial opacity to 0
  .html(d => {
    if (d.itemName === "Other" || d.itemName === "Nothing") {
      return '<div></div>';
    } else {
      try {
        const divElement = getItemSprite(d.itemName);
        if(!divElement){
          return '<div></div>';
        }
        divElement.classList.add("item-icon");
        return divElement.outerHTML;
      } catch (error) {
        console.error(`Error getting item sprite for ${d.itemName}:`, error);
        return '<div></div>';
      }
    }
  })
  .transition() // Apply transition to the elements
  .delay((d, i) => i * 60) // Set a delay based on the index
  .duration(700) // Set the duration of the transition
  .style("opacity", 1); // Set the final opacity to 1

  // Draw a vertical line
  const line = SVG.append("line")
  .attr("x1", 347) // X-coordinate of the start point
  .attr("y1", 3)    // Y-coordinate of the start point
  .attr("x2", 347) // X-coordinate of the end point
  .attr("y2", 3) // Initial Y-coordinate of the end point
  .style("stroke", "#DBDBDB") // Set the line color
  .style("stroke-width", 1) // Set the line width
  .transition() // Add transition
  .duration(700) // Set the duration of the first transition in milliseconds
  .attr("y2", height - 3) // Set the final Y-coordinate for the draw down animation
  .end(); // Complete the first transition before moving on


  return SVG;

}

function setMovesGraph(analysisTierDropdown,analysisGraphSlot){

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }

  if (!pokemonMoves[tierSelected]?.[analysisSlotNameElement.innerText]) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonMoves[tierSelected][analysisSlotNameElement.innerText].move;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  function createListOfObjects(keys, values) {
    return keys.map((key, index) => {
      return { moveName: key, usage: values[index] };
    });
  }

  if(!desiredSnapshot){
    return setErrorGraphText(analysisGraphSlot);
  }

  const moves = createListOfObjects(desiredSnapshot.moves, desiredSnapshot.usages);

// Set up the dimensions for the graph
const width = 500;
const height = 400;
const barMargin = 15;
const leftEmptySpace = 5; // Adjust this value for more empty space on the left
const rightAdjustment = 250; // Adjust this value for the desired reduction on the right
const topBottomMargin = 20; // Adjust this value for the desired margin at the top and bottom

// Create the SVG element inside the specified div
const SVG = d3
  .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Extract move names and usages
const moveNames = moves.map((move) => move.moveName);
const usages = moves.map((move) => move.usage);

// Create a color scale for the moves
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Calculate the bar height with margin
const barHeight = (height - 2 * topBottomMargin - (usages.length - 1) * barMargin) / usages.length;

// Create bars for each move with margin
const bars = SVG
  .selectAll("rect")
  .data(usages)
  .enter()
  .append("rect")
  .attr("x", leftEmptySpace) // Adjusted x-coordinate for more empty space on the left
  .attr("y", (d, i) => topBottomMargin + i * (barHeight + barMargin)) // Adjusted y-coordinate
  .attr("width", (d) => (d * (width - leftEmptySpace - rightAdjustment)) / 100) // Adjusted width calculation
  .attr("height", barHeight)
  .attr("fill", function(d, i) {
    const color = colorScale(i);
    return color;
  })
  .transition() // Apply transition to the elements
  .delay((d, i) => i * 20) // Set a delay based on the index
  .duration(600) // Set the duration of the transition
  .style("opacity", 1); // Set the final opacity to 1

// Add text labels to the left of each bar
const texts = SVG
  .selectAll("text")
  .data(moveNames)
  .enter()
  .append("text")
  .attr("x", leftEmptySpace - 10) // Adjusted x-coordinate to the left of the bars
  .attr("y", (d, i) => topBottomMargin + i * (barHeight + barMargin) + barHeight / 2) // Adjusted y-coordinate
  .attr("text-anchor", "end") // Align text to the end of the anchor
  .attr("font-weight", "bold") // Set the text to bold
  .attr("font-style", "italic") // Set the text to bold
  .attr("fill", "#DBDBDB") // Change text color
  .text((d) => d)
  .each(function (d, i) {
    const textHeight = this.getBBox().height;
    let fontSize = Math.min(barHeight, textHeight) ; // Set font size to the minimum of bar height and text height

    // Check if the text exceeds the specified width
    const textWidth = this.getBBox().width;
    if (textWidth > 122) {
      fontSize *= (122 / textWidth); // Adjust font size to fit the specified width
    }

    d3.select(this).attr("font-size", fontSize);
    d3.select(this).attr("dy", fontSize / 4); // Adjust dy based on the dynamic font size

  })
  .transition() // Apply transition to the elements
  .delay((d, i) => i * 20) // Set a delay based on the index
  .duration(600) // Set the duration of the transition
  .style("opacity", 1); // Set the final opacity to 1

  // Calculate the maximum text width
  const maxTextWidth = d3.max(texts.nodes(), (node) => node.getBBox().width);

  // Add text inside each bar
  const barTexts = SVG
  .selectAll(".bar-text")
  .data(usages)
  .enter()
  .append("text")
  .attr("class", "bar-text")
  .attr("x", (d, i) => leftEmptySpace + 5) // Adjusted x-coordinate for text inside the bar
  .attr("y", (d, i) => topBottomMargin + i * (barHeight + barMargin) + barHeight / 2 + 12 -7) // Adjusted y-coordinate
  .attr("text-anchor", "start") // Align text to the start of the anchor
  .attr("font-weight", "bold") // Set the text to bold
  .attr("fill", "#DBDBDB") // Change text color
  .attr("font-size","16")
  .text((d) => `${d}%`)
  .transition() // Apply transition to the elements
  .delay((d, i) => i * 20) // Set a delay based on the index
  .duration(600) // Set the duration of the transition
  .style("opacity", 1); // Set the final opacity to 1
  

  // Adjust x-coordinates based on the maximum text width
  bars.attr("x", leftEmptySpace + maxTextWidth + 10); // Adjust 10 for additional spacing, you can adjust it based on your preference
  texts.attr("x", leftEmptySpace + maxTextWidth);
  barTexts.attr("x", leftEmptySpace + maxTextWidth + 15);


// Calculate the position for the dotted line at 100% usage
const dottedLineX = leftEmptySpace + maxTextWidth + (100 * (width - leftEmptySpace - rightAdjustment)) / 100 + 10; // Adjusted 10 for additional spacing

// Add the dotted line
SVG.append("line")
  .attr("x1", dottedLineX)
  .attr("y1", topBottomMargin) // Start from the top
  .attr("x2", dottedLineX)
  .attr("y2", topBottomMargin) // Initially, at the top
  .attr("stroke", "whitesmoke")
  .attr("stroke-dasharray", "19") // Make it a dotted line
  .style("opacity", 0) // Set the initial opacity to 0
  .transition() // Apply transition to the elements
  .duration(600) // Set the duration of the transition
  .attr("y2", height - topBottomMargin) // Move to the bottom during the transition
  .style("opacity", 1); // Set the final opacity to 1

// Add a label to indicate 100%
SVG.append("text")
.attr("x", dottedLineX - 12) // Adjusted x-coordinate to the right of the line
.attr("y", topBottomMargin - 1)
.attr("dy", -5) // Adjusted vertical position
.attr("text-anchor", "start")
.attr("font-weight","bold")
.attr("font-size","12px")
.attr("fill", "whitesmoke")
.text("100%")
.style("opacity", 0) // Set the final opacity to 1
.transition() // Apply transition to the elements
.duration(600) // Set the duration of the transition
.style("opacity", 1); // Set the final opacity to 1

const remaningWidth = width - dottedLineX;

const circleRadius = Math.min((remaningWidth), (height / moves.length) + topBottomMargin) * 0.9;

// Create a pie chart generator
const pie = d3.pie();

// Create an arc generator for the pie chart
const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius((circleRadius - 10) / 3); // Set the outer radius based on the remaining width

// Add pie charts to the right of the dotted line
const pieCharts = SVG.selectAll(".pie-chart")
  .data(usages)
  .enter()
  .append("g")
  .attr("class", "pie-chart")
  .attr("transform", (d, i) => `translate(${dottedLineX + remaningWidth / 2}, ${topBottomMargin + i * (barHeight + barMargin) + barHeight / 2})`)
  .style("opacity", 0); // Set the initial opacity to 0 for the entire group

// Set the initial opacity to 0 for all elements inside each pie chart
pieCharts.style("opacity", 0);

// Apply transition to the entire group to make the circles appear
pieCharts.transition()
  .delay((d, i) => i * 40)
  .duration(0)
  .style("opacity", 1)
  .on("end", function () {
    const paths = d3.select(this).selectAll("path")
      .data(d => pie([d, 100 - d]))
      .enter()
      .append("path")
      .attr("stroke", "white")
      .style("opacity", 0) // Set the initial opacity to 0 for the entire group

    paths.transition()
      .delay((d, i) => i * 0) // Use i for staggered delay
      .duration(400)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          const interpolated = interpolate(t);
          return arcGenerator(interpolated);
        }
      })
      .attr("fill", function (d, i) {
        const color = i === 0 ? colorScale(usages.indexOf(d.data)) : "#DBDBDB";
        return color;
      });
  });


return SVG;

}

function setSpreadsGraph(analysisTierDropdown,analysisGraphSlot){

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }

  if (!pokemonSpreads[tierSelected]?.[analysisSlotNameElement.innerText]) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonSpreads[tierSelected][analysisSlotNameElement.innerText].spread;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  if(!desiredSnapshot){
    return setErrorGraphText(analysisGraphSlot);
  }

  let spreads = []; // Initialize the spreads array

  for (let i = 0; i < desiredSnapshot.natures.length; i++) {
  
    spreads[i] = {}; // Initialize each element as an empty object
  
    spreads[i]["nature"] = desiredSnapshot.natures[i];
    spreads[i]["usage"] = desiredSnapshot.usages[i];
    spreads[i]["HP"] = desiredSnapshot.HP[i];
    spreads[i]["Atk"] = desiredSnapshot.Atk[i];
    spreads[i]["Def"] = desiredSnapshot.Def[i];
    spreads[i]["SpA"] = desiredSnapshot.SpA[i];
    spreads[i]["SpD"] = desiredSnapshot.SpD[i];
    spreads[i]["Spe"] = desiredSnapshot.Spe[i];
  }
  
// Set up the dimensions and margins for the graph
const width = 500;
const height = 400;
const margin = { top: 5, right: 10, bottom: 5, left: 10 };
const rowMargin = 60; // Extra margin between rows

// Create the SVG element inside the specified div
const SVG = d3
  .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Set up the number of rows and columns
const numRows = 2;
const numCols = 3;

// Set the aspect ratio (width:height) for each graph
const aspectRatio = 1.4; // Width is twice the height

// Calculate the width and height for each individual graph with margins
const graphWidth = (width - margin.left - margin.right) / numCols;
const graphHeight = graphWidth / aspectRatio; // Calculate height based on aspect ratio

// Calculate the total width of the grouped rects
const totalGroupWidth = numCols * graphWidth;

// Calculate the horizontal center position for the group
const horizontalCenter = (width - totalGroupWidth) / 2;

// Calculate the total height of the grouped rects, accounting for extra margin
const totalGroupHeight = numRows * graphHeight + (numRows - 1) * rowMargin;

// Calculate the vertical center position for the group
const verticalCenter = (height - totalGroupHeight) / 2;

// Create the group for the rects and position it horizontally and vertically centered
const rectGroup = SVG.append("g")
  .attr("transform", `translate(${horizontalCenter}, ${verticalCenter})`);

let unknownUsage = 0; // Initialize unknownUsage to 0

let counter = 0; // Initialize unknownUsage to 0

// Create individual rects and labels for each object
spreads.forEach((spread, index) => {
  const row = Math.floor(index / numCols);
  const col = index % numCols;

  unknownUsage += spread.usage;
  counter += 1;

  // Create the group for each rect and label
  const group = rectGroup.append("g")
    .attr("transform", `translate(${col * graphWidth + margin.left}, ${row * (graphHeight + rowMargin) + margin.top})`);

  // Create rect
  const rect = group.append("rect")
  .attr("width", graphWidth - margin.left - margin.right)
  .attr("height", graphHeight - margin.top - margin.bottom + 20) // Increase the height
  .attr("fill", "#23272A")
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 1)
  .style("opacity", 0) // Set the initial opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => {
    return counter * 20;
  })
  .style("opacity", 1); // Set the final opacity

  // Create usage label below the rect
  const usageLabel = group.append("text")
    .attr("x", (graphWidth - margin.left - margin.right) / 2) // Centered horizontally
    .attr("y", graphHeight + 36) // Adjust this value based on your preference
    .attr("text-anchor", "middle") // Center align the text horizontally
    .attr("fill", "#DBDBDB")
    .attr("font-style","italic")
    .attr("font-weight","bold")
    .attr("font-size","16px")
    .text(`Usage: ${spread.usage}%`)
    .style("opacity", 0) // Set the initial opacity
    .transition() // Add transition
    .duration(700) // Set the duration of the transition in milliseconds
    .delay((d, i) => {
      return counter * 20;
    })
    .style("opacity", 1); // Set the final opacity


  // Create nature label below the rect
  const natureLabel = group.append("text")
    .attr("x", (graphWidth - margin.left - margin.right) / 2) // Centered horizontally
    .attr("y", graphHeight) // Adjust this value based on your preference
    .attr("text-anchor", "middle") // Center align the text horizontally
    .attr("fill", "#DBDBDB")
    .attr("font-weight","bold")
    .attr("font-size","22px")
    .text(`${spread.nature}`)
    .style("opacity", 0) // Set the initial opacity
    .transition() // Add transition
    .duration(700) // Set the duration of the transition in milliseconds
    .delay((d, i) => {
      return counter * 20;
    })
    .style("opacity", 1); // Set the final opacity

  const stats = ["HP","Atk", "Def", "SpA", "SpD", "Spe"];

 // Create text labels for each stat to the left of the bars
 const statLabels = group.selectAll(".stat-label")
 .data(stats)
 .enter()
 .append("text")
 .attr("class", "stat-label")
 .attr("x", 30) // Adjust the x-coordinate based on your preference
 .attr("y", (d, i) => (i * 13) + 21) // Adjust the y-coordinate based on your preference
 .attr("text-anchor", "end") // Align text to the end (left)
 .attr("fill", "#DBDBDB")
 .attr("font-size","12px")
 .text(d => d)
 .style("opacity", 0) // Set the initial opacity
 .transition() // Add transition
 .duration(700) // Set the duration of the transition in milliseconds
 .delay((d, i) => {
   return counter * 20;
 })
 .style("opacity", 1); // Set the final opacity

// Create horizontal bars for each stat
const statBars = group.selectAll(".stat-bar")
  .data(stats)
  .enter()
  .append("rect")
  .attr("class", "stat-bar")
  .attr("x", 35) // Adjust the x-coordinate based on your preference
  .attr("y", (d, i) => (i * 13) + 13) // Adjust the y-coordinate based on your preference
  .attr("width", 0) // Initial width set to 0
  .attr("height", 8) // Adjust the height based on your preference
  .attr("fill", "steelblue") // Adjust the fill color based on your preference
  .style("opacity", 0) // Set the initial opacity
  .transition() // Add opacity transition
  .duration(200) // Set the duration of the opacity transition in milliseconds
  .delay((d, i) => counter * 20)
  .style("opacity", 1) // Set the final opacity for the bars
  .on("end", function () {
    // Add width transition after opacity transition is complete
    d3.select(this)
      .transition()
      .duration(400) // Set the duration of the width transition in milliseconds
      .attr("width", (d) => (spread[d] / 252) * (graphWidth - margin.left - margin.right - 75)) // Scale the width based on stat value
      .style("opacity", 1); // Set the final opacity for the bars
  });



 // Function to determine the nature modifier for a specific stat
function getNatureModifier(stat, nature) {
  // Define nature modifiers
  const natureModifiers = {
    Atk: { plus: ["Lonely", "Brave", "Adamant", "Naughty"], minus: ["Bold", "Modest", "Calm", "Timid"] },
    Def: { plus: ["Bold", "Impish", "Lax", "Relaxed"], minus: ["Lonely", "Mild", "Gentle", "Hasty"] },
    SpA: { plus: ["Modest", "Mild", "Rash", "Quiet"], minus: ["Adamant", "Impish", "Careful", "Jolly"] },
    SpD: { plus: ["Calm", "Gentle", "Careful", "Sassy"], minus: ["Naughty", "Lax", "Rash", "Naive"] },
    Spe: { plus: ["Timid", "Hasty", "Jolly", "Naive"], minus: ["Brave", "Relaxed", "Quiet", "Sassy"] },
  };

  // Check if the stat has a nature modifier
  if (natureModifiers[stat]) {
    if (natureModifiers[stat].plus.includes(nature)) {
      return "+";
    } else if (natureModifiers[stat].minus.includes(nature)) {
      return "- ";
    }
  }

  // Default case (no modifier)
  return "";
}

 // Create text labels Values for each stat to the right of the bars
 const statLabelsValues = group.selectAll(".stat-label-value")
 .data(stats)
 .enter()
 .append("text")
 .attr("class", "stat-label-value")
 .attr("x", 132) // Adjust the x-coordinate based on your preference
 .attr("y", (d, i) => (i * 13) + 21) // Adjust the y-coordinate based on your preference
 .attr("text-anchor", "end") // Align text to the start (right)
 .attr("fill", "#DBDBDB")
 .attr("font-size", "12px")
 .text(d => getNatureModifier(d, spread.nature) + spread[d])
 .style("opacity", 0) // Set the initial opacity
 .transition() // Add transition
 .duration(700) // Set the duration of the transition in milliseconds
 .delay((d, i) => {
   return counter * 20;
 })
 .style("opacity", 1); // Set the final opacity

});

unknownUsage = (100 - unknownUsage).toFixed(3);

// Add unknown usage text to the top left of the SVG
const text = SVG.append("text")
  .attr("x", margin.left + 7)
  .attr("y", margin.top + 35) // Adjust the y-coordinate based on your preference
  .attr("fill", "whitesmoke") // Adjust the fill color based on your preference
  .attr("font-style", "italic")
  .attr("font-weight", "bold")
  .attr("font-size", "22px")
  .text(`Remaining Other Usage Spreads: ${unknownUsage}%`)
  .style("opacity", 0) // Set the initial opacity
  .transition() // Add transition
  .duration(700) // Set the duration of the transition in milliseconds
  .delay((d, i) => counter - 1 * 40)
  .style("opacity", 1) // Set the final opacity
  .attr("text-anchor", "start"); // Animate text-anchor property

return SVG;

}

function setTeammatesGraph(analysisTierDropdown,analysisGraphSlot){

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;
  const pokemonIndex = allPokedexDetails.name.indexOf(analysisSlotNameElement.innerText);
  const pokemonImageXOffset = allPokedexDetails.imageXOffset[pokemonIndex];
  const pokemonImageYOffset = allPokedexDetails.imageYOffset[pokemonIndex];

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }

  if (!pokemonTeammates[tierSelected]?.[analysisSlotNameElement.innerText]) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonTeammates[tierSelected][analysisSlotNameElement.innerText].teammate;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  function createListOfObjects(keys, values) {
    return keys.map((key, index) => {
      return { pokemonName: key, usage: values[index] };
    });
  }

  if(!desiredSnapshot){
    return setErrorGraphText(analysisGraphSlot);
  }

  let teammate = createListOfObjects(desiredSnapshot.teammates, desiredSnapshot.usages);

  for (let i = 0; i < teammate.length; i++) {

    const resultPokemonIndex = allPokedexDetails.name.indexOf(teammate[i].pokemonName.trim());
    const resultPokemonImageXOffset = allPokedexDetails.imageXOffset[resultPokemonIndex];
    const resultPokemonImageYOffset = allPokedexDetails.imageYOffset[resultPokemonIndex];
    teammate[i]["pokemonImageXOffset"] = resultPokemonImageXOffset;
    teammate[i]["pokemonImageYOffset"] = resultPokemonImageYOffset;
  }

  // Create the SVG element inside the specified div
  const width = 500;
  const height = 400;

  const numPreviousPoints = teammate.length; // Adjust the number of previous points to consider
  const centerX = 219.8; // Adjust the center of the ellipse based on your requirement
  const centerY = 179.5; // Adjust the center of the ellipse based on your requirement
  const radiusX = 160; // Adjust the radius of the ellipse along the x-axis
  const radiusY = 160; // Adjust the radius of the ellipse along the y-axis
  
  // Function to calculate points on the ellipse with even distribution
  function getPointsOnEllipse(numPoints) {
  
    const points = [];
  
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      points.push({ x, y });
      }
      return points;
    }

  const ellipseCoordinates = getPointsOnEllipse(numPreviousPoints)

  const initializedTeammates = teammate.map((d, i) => ({
    ...d,
    x: ellipseCoordinates[i].x,
    y: ellipseCoordinates[i].y,
  }));

  const SVG = d3
  .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  // Create a foreignObject element for the central node
  const centralForeignObject = SVG
  .append("foreignObject")
  .attr("width", width)
  .attr("height", height)
  .attr("transform", "translate(10.2, 0)");

  // Set up the dimensions and margins for the content inside central foreignObject
  const centralContentWidth = 40 * 3;
  const centralContentHeight = 30 * 3;
  const centralXOffset = (width / 2) - (centralContentWidth / 4);
  const centralYOffset = (height / 2) - (centralContentHeight / 4);

  // create a tooltip
  const nameTooltip = d3.select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("cursor","default")
  .style("position", "absolute")
  .style("z-index", 999); 

  

  const teammateForeignObjects = SVG.selectAll(".teammate-node")
  .data(initializedTeammates)
  .enter()
  .append("foreignObject")
  .attr("class", "teammate-node")
  .style("width", "120px")
  .style("height", "80px")
  .attr("x", d => d.x - 40)
  .attr("y", d => d.y - 25)
  .html(d => {
    const divElement = createPokemonIcon(d.pokemonImageXOffset, d.pokemonImageYOffset);
    divElement.style.transform = `scale(${1.7})`;
    divElement.classList.add("pokemon-teammate-other");
    const transformedHTML = `<div style="transform: translate(${40}px, ${30}px)">${divElement.outerHTML}</div>`;
    
    return transformedHTML;
  })
  .on("mouseover", function(d,i) {
    nameTooltip
        .style("top", (d.pageY - 70) + "px") 
        .style("left", (d.pageX + 20) + "px")
        .style("z-index", 999);
        nameTooltip.style("opacity", 1)
        .html(`${i.pokemonName} <br> ${i.usage}%`);
  })
  .on("mouseout", function() {
    nameTooltip
      .style("opacity", 0)
      .style("z-index", -999);
  })
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i + 1)*30)
  .style("opacity", 1)
  .attr("transform", "translate(10.2, 0)");

  const centralTeammateCoordinates = [{x: centralXOffset + 20, y: centralYOffset + 20}];
  let counter = 0;
  let polygonPoints = "";
  let circleElement;
  const GreateruterCircleRadius = 265;
  const outerCircleRadius = 197;
  const middleCircleRadius = 125;
  const innerCircleRadius = 53;

  SVG.append("circle")
  .attr("cx", 239.8)
  .attr("cy", 200)
  .attr("r", d => {
    return GreateruterCircleRadius;
  })
  .attr("fill", "grey")
  .style("opacity",0.055)
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 2)
  .style("pointer-events", "none")
  .attr("transform", "translate(10.2, 0)");

  SVG.append("circle")
  .attr("cx", 239.8)
  .attr("cy", 200)
  .attr("r", d => {
    return outerCircleRadius;
  })
  .attr("fill", "grey")
  .style("opacity",0.11)
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 2)
  .style("pointer-events", "none")
  .attr("transform", "translate(10.2, 0)");

  SVG.append("circle")
  .attr("cx", 239.8)
  .attr("cy", 200)
  .attr("r", d => {
    return middleCircleRadius;
  })
  .attr("fill", "grey")
  .style("opacity",0.132)
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 2)
  .style("pointer-events", "none")
  .attr("transform", "translate(10.2, 0)");

  SVG.append("circle")
  .attr("cx", 239.8)
  .attr("cy", 200)
  .attr("r", d => {
    return innerCircleRadius;
  })
  .attr("fill", "grey")
  .style("opacity",0.143)
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 2)
  .style("pointer-events", "none")
  .attr("transform", "translate(10.2, 0)");
  
  for (const ellipseCoord of initializedTeammates) {

    ellipseCoord.x += 21;
    ellipseCoord.y += 18;

    // Calculate a new start point that is slightly shorter along the same line
    const shortenStartDistance = 65;
    const deltaXStart = ellipseCoord.x - centralTeammateCoordinates[0].x;
    const deltaYStart = ellipseCoord.y - centralTeammateCoordinates[0].y;
    const distanceStart = Math.sqrt(deltaXStart * deltaXStart + deltaYStart * deltaYStart);

    const newStartPoint = {
      x: centralTeammateCoordinates[0].x + (deltaXStart / distanceStart) * shortenStartDistance,
      y: centralTeammateCoordinates[0].y + (deltaYStart / distanceStart) * shortenStartDistance
    };

    // Calculate a new end point that is slightly shorter along the same line
    const shortenEndDistance = 30;
    const deltaXEnd = ellipseCoord.x - centralTeammateCoordinates[0].x;
    const deltaYEnd = ellipseCoord.y - centralTeammateCoordinates[0].y;
    const distanceEnd = Math.sqrt(deltaXEnd * deltaXEnd + deltaYEnd * deltaYEnd);

    const newEndpoint = {
      x: centralTeammateCoordinates[0].x + (deltaXEnd / distanceEnd) * (distanceEnd - shortenEndDistance),
      y: centralTeammateCoordinates[0].y + (deltaYEnd / distanceEnd) * (distanceEnd - shortenEndDistance)
    };

    // Calculate the angle between newStartPoint and newEndpoint
    const angle = Math.atan2(newEndpoint.y - newStartPoint.y, newEndpoint.x - newStartPoint.x);

    const distanceBetweenCircumferences = middleCircleRadius -innerCircleRadius;
    const distanceAtTeammatePercent = ((initializedTeammates[counter].usage/100)+1)  * distanceBetweenCircumferences * 2 - 88;
    const cx = 239.8 + distanceAtTeammatePercent * Math.cos(angle) + 10.5;
    const cy = 200 + distanceAtTeammatePercent * Math.sin(angle);

    SVG.append("circle")
          .attr("cx", cx )
          .attr("cy", cy)
          .attr("r", 4)
          .attr("fill", "#00FF00")
          .attr("stroke", "whitesmoke")
          .attr("stroke-width", 2)
          .style("pointer-events", "none")
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay((d, i) => (counter + 1)*30)
          .style("opacity", 1);

      polygonPoints += `${cx} ${cy} `;

      counter += 1;
  }

  // Append a polygon element to the SVG to fill the overall area
  SVG.append('polygon')
  .attr('class', 'teammate-polygon') // Add your custom class
  .attr('points', polygonPoints)
  .attr('fill', '#00FF00')
  .style("opacity", 1)
  .style("pointer-events", "none")
  .attr("stroke", "whitesmoke")
  .attr("stroke-width", 3)
  .attr('fill-opacity', 0.1)
  .style("stroke-dasharray", function () {
    const totalLength = this.getTotalLength();
    return `${totalLength} ${totalLength}`;
  })
  .style("stroke-dashoffset", function () {
    const totalLength = this.getTotalLength();
    return totalLength;
  })
  .transition()
  .duration(400)
  .delay((d, i) => (counter) * 15)
  .ease(d3.easeLinear)
  .style("stroke-dashoffset", 0)
  .style("filter", "drop-shadow(0 0 2px rgba(0, 255, 0, 1))");

  // Create the HTML content inside the central foreignObject
  centralForeignObject
    .append("xhtml:body")
    .style("margin", "0px")
    .style("padding", "0px")
    .style("width", "100%")
    .style("height", "100%")
    .style("background-color", "#0d1b2a") // Set background color here
    .append("div")
    .style("width", `${centralContentWidth}px`)
    .style("height", `${centralContentHeight}px`)
    .style("position", "absolute")
    .style("left", `${centralXOffset}px`)
    .style("top", `${centralYOffset}px`)
    .html(d => {
      const divElement = createPokemonIcon(pokemonImageXOffset, pokemonImageYOffset);
      divElement.classList.add("pokemon-teammate-centre");
      return divElement.outerHTML;
    })
    .on("mouseover", function(d,i) {
      nameTooltip
          .style("top", (d.pageY - 70) + "px") 
          .style("left", (d.pageX + 20) + "px")
          .style("z-index", 999);
          nameTooltip.style("opacity", 1)
          .html(`${analysisSlotNameElement.innerText}`);
    })
    .on("mouseout", function() {
      nameTooltip
        .style("opacity", 0)
        .style("z-index", -999);
    })
    .attr("transform", "translate(10.2, 0)");

  SVG.selectAll("circle").raise();
    
return SVG
}

function setCountersGraph(analysisTierDropdown,analysisGraphSlot){

  const analysisSlotNameElement = document.getElementById(`analysis-name-slot${analysisGraphSlot}`);
  const analysisSnapshotElement = document.getElementById(`analysis-pokemon-parameters-snapshot${analysisGraphSlot}`);
  const tierSelected = analysisTierDropdown.value;
  const snapshotSelected = analysisSnapshotElement.value;
  const pokemonIndex = allPokedexDetails.name.indexOf(analysisSlotNameElement.innerText);
  const pokemonImageXOffset = allPokedexDetails.imageXOffset[pokemonIndex];
  const pokemonImageYOffset = allPokedexDetails.imageYOffset[pokemonIndex];

  //Create an error text for the appropriate analysis slot if generation or name doesn't exist
  if (!tierSelected || analysisSlotNameElement.innerText === "Analysis Slot #1" || analysisSlotNameElement.innerText === "Analysis Slot #2") {
    if (analysisGraphSlot === 1) {
      // analysisOneSVG = setErrorGraphText(1);
      return "<svg></svg>"
    } else if (analysisGraphSlot === 2) {
      // analysisTwoSVG = setErrorGraphText(2);
      return "<svg></svg>"
    }
  }

  if (analysisGraphSlot === 1 && analysisOneSVG && analysisOneSVG != "<svg></svg>") {
    analysisOneSVG.remove();
  } else if(analysisGraphSlot === 2 && analysisTwoSVG  && analysisTwoSVG != "<svg></svg>") {
    analysisTwoSVG.remove();
  }


  if (!pokemonCounters[tierSelected]?.[analysisSlotNameElement.innerText]) {
    return setErrorGraphText(analysisGraphSlot);
  }

  const desiredMon = pokemonCounters[tierSelected][analysisSlotNameElement.innerText].counter;
  const desiredSnapshot = desiredMon.snapshots.find(snapshot => snapshot.snapshot === snapshotSelected);

  function createListOfObjects(keys, values, values2, values3, values4) {
    return keys.map((key, index) => {
      return { pokemonName: key, usageErrors: values[index], errors: values2[index], koUsage: values3[index], switchedUsage: values4[index] };
    });
  }

  if(!desiredSnapshot || desiredSnapshot.counters.length === 0){
    return setErrorGraphText(analysisGraphSlot);
  }

  let counter = createListOfObjects(desiredSnapshot.counters, desiredSnapshot.usageErrors, desiredSnapshot.errors, desiredSnapshot.koErrors, desiredSnapshot.switchErrors);

  for (let i = 0; i < counter.length; i++) {

    const resultPokemonIndex = allPokedexDetails.name.indexOf(counter[i].pokemonName.trim());
    const resultPokemonImageXOffset = allPokedexDetails.imageXOffset[resultPokemonIndex];
    const resultPokemonImageYOffset = allPokedexDetails.imageYOffset[resultPokemonIndex];
    counter[i]["pokemonImageXOffset"] = resultPokemonImageXOffset;
    counter[i]["pokemonImageYOffset"] = resultPokemonImageYOffset;
  }

// Set up the dimensions for the graph
const width = 500;
const height = 400;
const barMargin = 20;
const leftRightMargin = 20;

// Adjust these values for the desired top and bottom margins
const topMargin = 80;
const bottomMargin = 10;

// Create the SVG element inside the specified div
const SVG = d3
  .select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create a foreignObject element for the central node
const centralForeignObject = SVG
.append("foreignObject")
.attr("width", width)
.attr("height", height);

// Create the HTML content inside the central foreignObject
centralForeignObject
  .append("xhtml:body")
  .style("margin", "0px")
  .style("padding", "0px")
  .style("width", "100%")
  .style("height", "100%")
  .append("div")
  .style("width", `30px`)
  .style("height", `20px`)
  .style("position", "absolute")
  .style("left", `${width / 2 - 20}px`)
  .style("top", `${5}px`)
  .html(d => {
    const divElement = createPokemonIcon(pokemonImageXOffset, pokemonImageYOffset);
    return divElement.outerHTML;
  })

// Extract move names and usages
const pokemonNames = counter.map((counterInstance)=> counterInstance.pokemonName);
const switchedUsage = counter.map((counterInstance) => counterInstance.switchedUsage);
const koUsage = counter.map((counterInstance) => counterInstance.koUsage);
const errorBars = counter.map((counterInstance) => counterInstance.errors);

// Calculate the bar height with margin
const barHeight = (height - topMargin - bottomMargin - (counter.length - 1) * barMargin) / counter.length;

const barsText = SVG
  .selectAll("text")
  .data(pokemonNames)
  .enter()
  .append("text")
  .attr("x", width / 2)
  .attr("y", (d, i) => topMargin + i * (barHeight + barMargin) - 5)
  .text((d) => d)
  .style("text-anchor", "middle")
  .style("fill", "#DBDBDB")
  .attr("font-weight", "bold")
  .attr("font-size", "10px")
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);


  const xAxisScale = d3.scaleLinear()
  .domain([-100,100])
  .range([0 + leftRightMargin, width - leftRightMargin]);

  const xAxis = d3.axisTop(xAxisScale)
    .tickFormat(d => {
      if (d < 0) {
        return `${d * -1}%`;
      } else {
        return `${d}%`;
      }
    });

SVG.append("g")
  .attr("transform", `translate(0, ${topMargin - barMargin})`)
  .call(xAxis)
  .selectAll("text")
  .attr("dx","3px")
  .style("fill", "white");

  SVG.selectAll(".tick line")
  .style("stroke", "white")
  .attr("y2", height)
  .attr("opacity","0.3");

  // Select only the tick line at zero and set a different opacity
  SVG.selectAll(".tick line")
  .filter(d => d === 0) // Select only the tick line at zero
  .attr("opacity", "0.7"); // Set a different opacity for the tick line at zero

// Create a linear gradient for opacity
const gradient = SVG.append("linearGradient")
  .attr("id", "x-axis-opacity-gradient")
  .attr("x1", "0%")
  .attr("x2", "100%");

// Add opacity stops to the gradient
gradient.append("stop")
  .attr("offset", "0%")
  .style("stop-color", "white")
  .style("stop-opacity", "0");

gradient.append("stop")
  .attr("offset", "0.2%")
  .style("stop-color", "white")
  .style("stop-opacity", "1");

gradient.append("stop")
  .attr("offset", "99.8%")
  .style("stop-color", "white")
  .style("stop-opacity", "1");

gradient.append("stop")
  .attr("offset", "100%")
  .style("stop-color", "white")
  .style("stop-opacity", "0");

// Apply the gradient to the stroke of elements with class "domain"
SVG.selectAll(".domain")
  .style("stroke", "url(#x-axis-opacity-gradient)");

// create a tooltip
const nameTooltip = d3.select(`#specific-detailed-analysis-graph${analysisGraphSlot}`)
.append("div")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "2px")
.style("border-radius", "5px")
.style("padding", "5px")
.style("cursor","default")
.style("position", "absolute")
.style("z-index", 999); 


  const teammateForeignObjects = SVG.selectAll(".teammate-node")
  .data(counter)
  .enter()
  .append("foreignObject")
  .attr("class", "teammate-node")
  .style("width", "100%")
  .style("height", "100%")
  .attr("x", (d,i) => {
    const textWidth = barsText.nodes()[i].getBoundingClientRect().width;
    return (width / 2) + (textWidth / 2) -6;
  })
  .attr("y", (d, i) => topMargin + i * (barHeight + barMargin) - 25)
  .html(d => {
    const divElement = createPokemonIcon(d.pokemonImageXOffset, d.pokemonImageYOffset);
    divElement.style.transform = `scale(${0.65})`;
    return divElement.outerHTML; 
  })
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);

// Create bars for switchedUsage with margin
const switchedUsagebars = SVG
  .selectAll(".switched-rect")
  .data(counter)
  .enter()
  .append("rect")
  .attr("class", "switched-rect")
  .attr("x", width / 2)
  .attr("y", (d, i) => topMargin + i * (barHeight + barMargin))
  .attr("width", (d) => {
    return (d.switchedUsage * (width - (2*leftRightMargin)) / 2) / 100
  })
  .attr("height", barHeight)
  .attr("fill", "#FF8200")
  .style("opacity", 0)
  .on("mouseover", function(d,i) {
    nameTooltip
        .style("top", (d.pageY - 70) + "px") 
        .style("left", (d.pageX + 20) + "px")
        .style("z-index", 999);
        nameTooltip.style("opacity", 1)
        .html(`${d.target.__data__.pokemonName}: ${(d.target.__data__.koUsage + d.target.__data__.switchedUsage).toFixed(2)}% ± ${d.target.__data__.errors.toFixed(2)}% <br>
        KO: ${d.target.__data__.koUsage}% <br>
        Switch: ${d.target.__data__.switchedUsage}%`
        );
  })
  .on("mouseout", function() {
    nameTooltip
      .style("opacity", 0)
      .style("z-index", -999);
  })
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);

// Create bars for koUsage with margin
const koUsagebars = SVG
  .selectAll(".ko-rect")
  .data(counter)
  .enter()
  .append("rect")
  .attr("class", "ko-rect")
  .attr("x", (d) => leftRightMargin + ((100-d.koUsage) * (width - (2 * leftRightMargin)) / 2) / 100)
  .attr("y", (d, i) => topMargin + i * (barHeight + barMargin))
  .attr("width", (d) => (d.koUsage * (width - (2 * leftRightMargin)) / 2) / 100)
  .attr("height", barHeight)
  .attr("fill", "#FC3431")
  .style("opacity", 0)
  .on("mouseover", function(d,i) {
    nameTooltip
        .style("top", (d.pageY - 70) + "px") 
        .style("left", (d.pageX + 20) + "px")
        .style("z-index", 999);
        nameTooltip.style("opacity", 1)
        .html(`${d.target.__data__.pokemonName}: ${(d.target.__data__.koUsage + d.target.__data__.switchedUsage).toFixed(2)}% ± ${d.target.__data__.errors.toFixed(2)}% <br>
        KO: ${d.target.__data__.koUsage}% <br>
        Switch: ${d.target.__data__.switchedUsage}%`
        );
  })
  .on("mouseout", function() {
    nameTooltip
      .style("opacity", 0)
      .style("z-index", -999);
  })
  .transition()
  .duration(400)
  .delay((d, i) => (i) * 35)
  .style("opacity", 1);

  // Add a white line extending right from the center of each bar
  const whiteLines = SVG
  .selectAll(".white-line-ko")
  .data(errorBars)
  .enter()
  .append("line")
  .attr("class", "white-line-ko")
  .attr("x1", (d,i) => {
    const point = (width / 2) - ((koUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
 })
  .attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2)
  .attr("x2", (d,i) => {
    const point =  (width / 2) - ((koUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100
    return point;
 })
  .attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2)
  .attr("stroke", "white")
  .attr("stroke-width", 2)
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 0.7);

const ErrorLinesOne = SVG.selectAll(".new-line-one-ko")
.data(errorBars)
.enter()
.append("line")
.attr("class", "new-line-one-ko")
.attr("x1", (d, i) => {
  const point =  (width / 2) - ((koUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100
  return point;
})
.attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2 + barHeight / 4 )
.attr("x2", (d, i) => {
  const point =  (width / 2) - ((koUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100
  return point;
})
.attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 4)
.attr("stroke", "white")
.attr("stroke-width", 1)
.style("opacity", 0)
.transition()
.duration(400)
.delay((d, i) => (i)*35)
.style("opacity", 1);


const ErrorLinesTwo = SVG.selectAll(".new-line-two-ko")
  .data(errorBars)
  .enter()
  .append("line")
  .attr("class", "new-line-two-ko")
  .attr("x1", (d, i) => {
    const point = (width / 2) - ((koUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2 + barHeight / 4 )
  .attr("x2", (d, i) => {
    const point = (width / 2) - ((koUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 4)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);
  

  const whiteLines2 = SVG
  .selectAll(".white-line-switch")
  .data(errorBars)
  .enter()
  .append("line")
  .attr("class", "white-line-switch")
  .attr("x1", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2)
  .attr("x2", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2)
  .attr("stroke", "white")
  .attr("stroke-width", 2)
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 0.7);

  const ErrorLinesTwo2 = SVG.selectAll(".new-line-two-switch")
  .data(errorBars)
  .enter()
  .append("line")
  .attr("class", "new-line-two-switch")
  .attr("x1", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2 + barHeight / 4 )
  .attr("x2", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] + d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 4)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);

  const ErrorLinesOne1 = SVG.selectAll(".new-line-one-switch")
  .data(errorBars)
  .enter()
  .append("line")
  .attr("class", "new-line-one-switch")
  .attr("x1", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y1", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 2 + barHeight / 4 )
  .attr("x2", (d, i) => {
    const point = (width / 2) + ((switchedUsage[i] - d) * (width - (2*leftRightMargin)) / 2) / 100;
    return point;
  })
  .attr("y2", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 4)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .style("opacity", 0)
  .transition()
  .duration(400)
  .delay((d, i) => (i)*35)
  .style("opacity", 1);

// Add a rect element for each data point in errorBars
// const rects = SVG.selectAll(".error-rect")
//   .data(errorBars)
//   .enter()
//   .append("rect")
//   .attr("class", "error-rect")
//   .attr("x", (d,i) => {
//     const point =  (width / 2) - ((koUsage[i] - d*2) * (width - (2*leftRightMargin)) / 2) / 100
//     return point;
//   })
//   .attr("y", (d, i) => topMargin + i * (barHeight + barMargin) + barHeight / 4)
//   .attr("width", (d, i) => {
//     const errorBarWidth = ((switchedUsage[i]+ koUsage[i] - d*4) * (width - (2*leftRightMargin)) / 2) / 100;
//     return errorBarWidth;
//   })
//   .attr("height", (d, i) => barHeight/2)
//   .attr("fill", "white")
//   .style("opacity", 0)
//   .transition()
//   .duration(400)
//   .delay((d, i) => (i)*35)
//   .style("opacity", 0.55);

  const koedLabel = SVG.append("text")
  .attr("x", width / 4)
  .attr("y", 31)
  .text("Knocked Out %")
  .style("font-size", "26px")
  .style("fill", "#FC3431")
  .style("text-anchor", "middle")
  .attr("font-weight", "bold");

  const switchedLabel = SVG.append("text")
  .attr("x", width * 3 / 4)
  .attr("y", 31)
  .text("Switches Out %")
  .style("text-anchor", "middle")
  .style("font-size", "26px")
  .style("fill", "#FF8200")
  .attr("font-weight", "bold");

  return SVG
}