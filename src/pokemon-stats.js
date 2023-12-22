// Store POkemon Attributes
const pokemonAttributes = {
  names: [],
  ImageNumbers: [],
  formes: [],
  imageOffsetX: [],
  imageOffsetY: []
};

let pokemonNamesPromise = null; // Cache for getPokemonAttributesFromPokedex result

 // This will decide which tiers to fetch data from
const tiers = [ 
                //Remeber to update pokemon types and pokemon abilities functions, if new gen comes out
                ['gen9ubersuu-1630'],
                ['gen9ubers-1630'],
                ['gen9ou-1695'],
                ['gen9uu-1630'],
                ['gen9ru-1630'],
                ['gen9nu-1630'],
                ['gen9pu-1630'],
                ['gen9zu-1630'],
                ['gen9lc-1630'],
                ['gen9monotype-1630'],
                ['gen9nationaldex-1630'],
                ['gen9nationaldexmonotype-1630'],
                ['gen9doublesou-1695'],
                ['gen9doublesuu-1630'],
                ['gen9cap-1630'],
                ['gen8ou-1630','gen8ou-1695'],
                ['gen7ou-1630','gen7ou-1695'],
                ['gen6ou-1630','gen6ou-1695'],
                ['gen5ou-1630','gen5ou-1695'],
                ['gen4ou-1630','gen4ou-1695'],
                ['gen3ou-1630','gen3ou-1695'],
                ['gen2ou-1630','gen2ou-1695'],
                ['gen1ou-1630','gen1ou-1695']
              ];

const snapshots = [
                '2014-11/',
                '2014-12/',
                '2015-01/',
                '2015-02/',
                '2015-03/',
                '2015-04/',
                '2015-05/',
                '2015-06/',
                '2015-07/',
                '2015-08/',
                '2015-09/',
                '2015-10/',
                '2015-11/',
                '2015-12/',
                '2016-01/',
                '2016-02/',
                '2016-03/',
                '2016-04/',
                '2016-05/',
                '2016-06/',
                '2016-07/',
                '2016-08/',
                '2016-09/',
                '2016-10/',
                '2016-11/',
                '2016-12/',
                '2017-01/',
                '2017-02/',
                '2017-03/',
                '2017-04/',
                '2017-05/',
                '2017-06/',
                '2017-07/',
                '2017-08/',
                '2017-09/',
                '2017-10/',
                '2017-11/',
                '2017-12/',
                '2018-01/',
                '2018-02/',
                '2018-03/',
                '2018-04/',
                '2018-05/',
                '2018-06/',
                '2018-07/',
                '2018-08/',
                '2018-09/',
                '2018-10/',
                '2018-11/',
                '2018-12/',
                '2019-01/',
                '2019-02/',
                '2019-03/',
                '2019-04/',
                '2019-05/',
                '2019-06/',
                '2019-07/',
                '2019-08/',
                '2019-09/',
                '2019-10/',
                '2019-11/',
                '2019-12/',
                '2020-01/',
                '2020-02/',
                '2020-03/',
                '2020-04/',
                '2020-05/',
                '2020-06/',
                '2020-07/',
                '2020-08/',
                '2020-09/',
                '2020-10/',
                '2020-11/',
                '2020-12/',
                '2021-01/',
                '2021-02/',
                '2021-03/',
                '2021-04/',
                '2021-05/',
                '2021-06/',
                '2021-07/',
                '2021-08/',
                '2021-09/',
                '2021-10/',
                '2021-11/',
                '2021-12/',
                '2022-01/',
                '2022-02/',
                '2022-03/',
                '2022-04/',
                '2022-05/',
                '2022-06/',
                '2022-07/',
                '2022-08/',
                '2022-09/',
                '2022-10/',
                /* Gen 9 OU starts here */
                '2022-11/', 
                '2022-12/',
                '2023-01/',
                '2023-02/',
                '2023-03/',
                '2023-04/',
                '2023-05/',
                '2023-06/',
                '2023-07/',
                '2023-08/',
                '2023-09/',
                '2023-10/',
                '2023-11/',
]

const fs = require('fs');
const Papa = require('papaparse'); // Import the papaparse library
const request = require('request');
const cheerio = require('cheerio');
const { Console } = require('console');

function outputMetadataFile() {
  const firstTiers = tiers.map((tier) => tier[0]); // Get the first element from each sub-array
  const csvData = [['Sheets'], ...firstTiers.map((tier) => [tier])];

  const csv = Papa.unparse(csvData, { header: true });

  // Specify the CSV file name
  const outputPath = 'ShowdownGraphs/files/metadata.csv';

  // Write the CSV data to the file
  fs.writeFileSync(outputPath, csv);

  console.log(`Metadata has been written to ${outputPath}`);
}

async function getPokemonAttributesFromPokedex() {
  if (!pokemonNamesPromise) {
      pokemonNamesPromise = new Promise((resolve, reject) => {

      // URL of the Pokemon Pokedex JSON data
      const url = 'https://play.pokemonshowdown.com/data/pokedex.json';

      // List of forms that should be discarded
      const specificFormsToDiscard = ["Gmax","Alola-Totem",

      // Pikachu Forms
      "Cosplay","Rock-Star","Belle","Pop-Star","PhD","Libre","Original","Hoenn","Sinnoh","Unova","Kalos",
      "Partner","Starter","World",

      "Spiky-eared",
      //Castform Forms
      "Sunny","Rainy","Snowy",

      // "Primal",
      //Deoxys Forms
      // "Attack","Defense","Speed",

      "Sunshine","Blue-Striped","White-Striped",
      "Zen","Galar-Zen","Resolute","Pirouette",
      //Genesect Forms
      "Douse","Shock","Burn","Chill",

      "Bond","Ash","Fancy","Pokeball","Eternal","Blade","Neutral","Complete","Totem","Meteor",
      "Busted","Busted-Totem","Original","Gulping","Gorging","Low-Key","Low-Key-Gmax","Antique",
      "Noice","Hangry","Eternamax","Rapid-Strike-Gmax","Dada","Four","Blue","Yellow","Hero",
      "Three-Segment","Roaming","Artisan","Masterpiece","Teal-Tera","Wellspring-Tera","Hearthflame-Tera",
      "Cornerstone-Tera"];

      // Make an HTTP GET request to the URL
      fetch(url)
        .then(function (response) {
          // Check if the response status is OK (200)
          if (!response.ok) {
            throw new Error('HTTP error! Status: ' + response.status);
          }
          // Parse the response JSON
          return response.json();
        })
        .then(function (data) {
          for (const key in data) {
            if (
              data.hasOwnProperty(key) &&
              !specificFormsToDiscard.includes(data[key].forme) && 
              data[key].isNonstandard !== "CAP" &&
              data[key].isNonstandard !== "Custom" &&
              data[key].name !== "Pikachu-Alola" &&
              data[key].name !== "Squawkabilly-White"
            ) {
              pokemonAttributes.names.push(data[key].name);
              pokemonAttributes.ImageNumbers.push(data[key].num);
              pokemonAttributes.formes.push(data[key].forme);
            }
            //Add Cap as a custom form:
            if(data[key].isNonstandard === "CAP" ){
              pokemonAttributes.names.push(data[key].name);
              pokemonAttributes.ImageNumbers.push(data[key].num);
              pokemonAttributes.formes.push("CAP")
            }
          }
          resolve(pokemonAttributes); // Resolve the promise with the populated arrays
        })
        .catch(function (error) {
          reject(error); // Reject the promise if there's an error
        });
    });
  }
  return pokemonNamesPromise;
}

function updatePokemonImageXOffset() {
  // Set offset to -40
  const xOffset = -40;

  //Because there are 12 pokemon on a line
  const interval = 12; 

  // Iterate through the 'ImageNumbers' array in pokemonAttributes
  for (let i = 0; i < pokemonAttributes.ImageNumbers.length; i++) {
    pokemonAttributes.imageOffsetX[i] = xOffset * (pokemonAttributes.ImageNumbers[i] % interval);
    }
  }

function updatePokemonImageYOffset() {
  // Set offset to -30
  const yOffset = -30;

  // Because there are 12 pokemon on a line
  const interval = 12; 

  // Iterate through the 'ImageNumbers' array in pokemonAttributes
  for (let i = 0; i < pokemonAttributes.ImageNumbers.length; i++) {
    if (pokemonAttributes.ImageNumbers[i] < 11) {
      // If i is less than 11, set the value to 0
      pokemonAttributes.imageOffsetY[i] = 0;
    } else {
      // Calculate the offset for other iterations
      pokemonAttributes.imageOffsetY[i] = Math.floor(pokemonAttributes.ImageNumbers[i] / interval) * yOffset;
    }
  }
}

async function WritePokedex() {
  return new Promise(async (resolve, reject) => {
    try {
      // Call the function and wait for it to complete
      const pokemonAttributes = await getPokemonAttributesFromPokedex();

      // Create an array of objects with the desired data
      const dataToWrite = pokemonAttributes.names.map((name, index) => ({
        'Pokemon Name': name,
        'Pokemon Number': pokemonAttributes.ImageNumbers[index],
        'Pokemon Formes': pokemonAttributes.formes[index],
        'Pokemon Image Offset X': pokemonAttributes.imageOffsetX[index],
        'Pokemon Image Offset Y': pokemonAttributes.imageOffsetY[index]
      }));
      
      // Convert the array of objects to a CSV-formatted string
      const csvData = Papa.unparse(dataToWrite);

      // Specify the CSV file name
      const outputPath = 'ShowdownGraphs/files/pokedex.csv';

      // Write the CSV data to the file
      fs.writeFileSync(outputPath, csvData);

      console.log(`Pokedex Data has been written to ${outputPath}`);

      resolve(); // Resolve the promise when writing is done
    } catch (error) {
      reject(error); // Reject the promise if there's an error
    }
  });
}


async function writePokemonDataToCSV(data,tier) {
  const csvData = [];

  // Create the header row
  csvData.push(["Pokemon", "Usage", "Snapshot"]);

  data.forEach(item => {
    Object.keys(item).forEach(key => {
      const { usage, snapshot } = item[key];
      csvData.push([key, usage, snapshot]);
    });
  });

  const csv = Papa.unparse(csvData);

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/${tier[0]}.csv`;

  try {
    // Write the CSV data to the file
    fs.writeFileSync(outputPath, csv);
    console.log(`CSV file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV file FAILED for ${tier}`, err);
  }
}

async function writePokemonAbilitiesDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/abilities ${tier[0]}.csv`;

  // Define the maximum number of abilities you want to support
  const maxAbilities = 3;

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxAbilities; i++) {
    csvHeaders.push(`ability${i}`, `usage${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const abilitiesData = entry[entryInstance];

      // Extract snapshot and abilities data
      const { snapshot, usage } = abilitiesData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each ability in the abilities data, up to the maximum defined
      for (let i = 0; i < maxAbilities; i++) {
        const ability = usage[i] ? usage[i].ability : '';
        const percentage = usage[i] ? usage[i].percentage : '';
        csvRow.push(ability, percentage);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV Ability file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV Ability file FAILED for ${tier}`, err);
  }
}

async function writePokemonItemsDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/items ${tier[0]}.csv`;

  // Calculate the maximum number of items dynamically based on the data
  let maxItems = 21;
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const movesData = entry[entryInstance];
      const { usage } = movesData;
      maxItems = Math.min(maxItems, Math.max(maxItems, usage.length));
    }
  }

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxItems; i++) {
    csvHeaders.push(`item${i}`, `usage${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const itemsData = entry[entryInstance];

      // Extract snapshot and items data
      const { snapshot, usage } = itemsData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each item in the items data, up to the dynamically calculated maximum
      for (let i = 0; i < maxItems; i++) {
        const item = usage[i] ? usage[i].item : '';
        const percentage = usage[i] ? usage[i].percentage : '';
        csvRow.push(item, percentage);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV Item file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV Item file FAILED for ${tier}`, err);
  }
}

async function writePokemonMovesDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/moves ${tier[0]}.csv`;

  // Calculate the maximum number of moves dynamically based on the data
  let maxMoves = 18;
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const movesData = entry[entryInstance];
      const { usage } = movesData;
      maxMoves = Math.min(maxMoves, Math.max(maxMoves, usage.length));
    }
  }

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxMoves; i++) {
    csvHeaders.push(`move${i}`, `usage${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const movesData = entry[entryInstance];

      // Extract snapshot and moves data
      const { snapshot, usage } = movesData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each move in the moves data, up to the dynamically calculated maximum
      for (let i = 0; i < maxMoves; i++) {
        const move = usage[i] ? usage[i].move : '';
        const percentage = usage[i] ? usage[i].percentage : '';
        csvRow.push(move, percentage);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV move file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV move file FAILED for ${tier}`, err);
  }
}

async function writePokemonTeammatesDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/teammates ${tier[0]}.csv`;

  // Calculate the maximum number of teammates dynamically based on the data
  let maxteammates = 12;
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const teammatesData = entry[entryInstance];
      const { usage } = teammatesData;
      maxteammates = Math.min(maxteammates, Math.max(maxteammates, usage.length));
    }
  }

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxteammates; i++) {
    csvHeaders.push(`teammate${i}`, `usage${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const teammatesData = entry[entryInstance];

      // Extract snapshot and teammates data
      const { snapshot, usage } = teammatesData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each teammate in the teammates data, up to the dynamically calculated maximum
      for (let i = 0; i < maxteammates; i++) {
        const teammate = usage[i] ? usage[i].teammate : '';
        const percentage = usage[i] ? usage[i].percentage : '';
        csvRow.push(teammate, percentage);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV teammate file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV teammate file FAILED for ${tier}`, err);
  }
}

async function writePokemonSpreadsDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/spreads ${tier[0]}.csv`;

  // Calculate the maximum number of spreads dynamically based on the data
  let maxspreads = 6;
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const spreadsData = entry[entryInstance];
      const { usage } = spreadsData;
      maxspreads = Math.min(maxspreads, Math.max(maxspreads, usage.length));
    }
  }

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxspreads; i++) {
    csvHeaders.push(`nature${i}`, `usage${i}`, `hp${i}`, `attack${i}`, `defense${i}`,`sp attack${i}`, `sp defense${i}`,`speed${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const spreadsData = entry[entryInstance];

      // Extract snapshot and spreads data
      const { snapshot, usage } = spreadsData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each spread in the spreads data, up to the dynamically calculated maximum
      for (let i = 0; i < maxspreads; i++) {
        const nature = usage[i] ? usage[i].nature : '';
        const percentage = usage[i] ? usage[i].percentage : '';
        const hp = usage[i] ? usage[i].hp : '';
        const atk = usage[i] ? usage[i].atk : '';
        const def = usage[i] ? usage[i].def : '';
        const spAtk = usage[i] ? usage[i].spAtk : '';
        const spDef = usage[i] ? usage[i].spDef : '';
        const spe = usage[i] ? usage[i].spe : '';
        csvRow.push(nature, percentage,hp,atk,def,spAtk,spDef,spe);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV spread file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV spread file FAILED for ${tier}`, err);
  }
}

async function writePokemonCountersDataToCSV(data, tier) {
  const csvData = [];

  // Specify the CSV file name
  const outputPath = `ShowdownGraphs/files/counters ${tier[0]}.csv`;

  // Calculate the maximum number of counters dynamically based on the data
  let maxcounters = 12;
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const countersData = entry[entryInstance];
      const { usage } = countersData;
      maxcounters = Math.min(maxcounters, Math.max(maxcounters, usage.length));
    }
  }

  // Create CSV headers dynamically
  const csvHeaders = ['name', 'snapshot'];
  for (let i = 1; i <= maxcounters; i++) {
    csvHeaders.push(`counterName${i}`, `usageErrors${i}`, `errors${i}`, `koUsage${i}`, `switchUsage${i}`);
  }

  // Add headers to the CSV data
  csvData.push(csvHeaders.join(','));

  // Iterate over each Pokemon in the data
  for (const entry of data) {
    for (const entryInstance of Object.keys(entry)) {
      const countersData = entry[entryInstance];

      // Extract snapshot and counters data
      const { snapshot, usage } = countersData;

      // Create an array to store the CSV row for the current Pokemon
      const csvRow = [entryInstance, snapshot];

      // Iterate over each counter in the counters data, up to the dynamically calculated maximum
      for (let i = 0; i < maxcounters; i++) {
        const counterName = usage[i] ? usage[i].counterName : '';
        const usageErrors = usage[i] ? usage[i].usageErrors : '';
        const errors = usage[i] ? usage[i].errors : '';
        const koUsage = usage[i] ? usage[i].koUsage : '';
        const switchUsage = usage[i] ? usage[i].switchUsage : '';
        csvRow.push(counterName,usageErrors, errors,koUsage,switchUsage);
      }

      // Add the CSV row for the current Pokemon to the overall CSV data
      csvData.push(csvRow.join(','));
    }
  }

  // Write the CSV data to the file
  try {
    fs.writeFileSync(outputPath, csvData.join('\n'));
    console.log(`CSV counter file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV counter file FAILED for ${tier}`, err);
  }
}

async function writePokemonDatatypesToCSV(data,tier) {
  const csvData = [];


  // Extracting names and types from the data
  const names = data.names;
  const gens = data.gen;
  const types = data.types;

  // Combining names with corresponding types
  const combinedData = names.map((name, index) => ({
    name,
    gen: gens[index], 
    typeOne: types[index][0] || '', // First type, or an empty string if not present
    typeTwo: types[index][1] || '', // Second type, or an empty string if not present
  }));

  // CSV header
  const csvHeader = 'Name,Gen,TypeOne,TypeTwo\n';

  // CSV content
  const csvContent = combinedData.map(record => `${record.name},${record.gen},${record.typeOne},${record.typeTwo}`).join('\n');

  try {
    // Write the CSV data to the file
    fs.writeFileSync(`ShowdownGraphs/files/types gen${tier[0][3]}.csv`, csvHeader + csvContent);
    console.log(`CSV Types file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV Types file FAILED for ${tier[0]}`, err);
  }
}

async function writePokemonDataStatsToCSV(data,tier) {
  const csvData = [];


  // Extracting names and types from the data
  const names = data.names;
  const gens = data.gen;
  const hp = data.hp;
  const attack = data.attack;
  const defense = data.defense;
  const sp_attack = data.sp_attack;
  const sp_defense = data.sp_defense;
  const speed = data.speed;

  // Combining names with corresponding types
  const combinedData = names.map((name, index) => ({
    name,
    gen: gens[index], 
    hp_stat: hp[index], 
    attack_stat: attack[index], 
    defense_stat: defense[index], 
    sp_attack_stat: sp_attack[index], 
    sp_defense_stat: sp_defense[index], 
    speed_stat: speed[index], 

  }));

  // CSV header
  const csvHeader = 'Name,Gen,HP,Attack,Defense,Sp_attack,Sp_defense,Speed\n';

  // CSV content
  const csvContent = combinedData.map(record => `${record.name},${record.gen},${record.hp_stat},${record.attack_stat},${record.defense_stat},${record.sp_attack_stat},${record.sp_defense_stat},${record.speed_stat}`).join('\n');

  try {
    // Write the CSV data to the file
    fs.writeFileSync(`ShowdownGraphs/files/stats gen${tier[0][3]}.csv`, csvHeader + csvContent);
    console.log(`CSV Stats file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV Stats file FAILED for ${tier[0]}`, err);
  }
}



async function extractAllUsageStats(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await extractUsageStats(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonDataToCSV(allPokemonData, tier);
}

async function extractAllAbilitiesStats(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getAbilitiesUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonAbilitiesDataToCSV(allPokemonData, tier);
}

async function extractAllItemsUsage(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getItemsUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonItemsDataToCSV(allPokemonData, tier);
}

async function extractAllMovesUsage(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getMovesUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonMovesDataToCSV(allPokemonData, tier);
}

async function extractAllTeammatesUsage(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getTeammatesUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonTeammatesDataToCSV(allPokemonData, tier);
}

async function extractAllSpreadsUsage(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getSpreadsUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonSpreadsDataToCSV(allPokemonData, tier);
}

async function extractAllCountersUsage(tier) {
  const allPokemonData = []; // Create an array to store the data from all snapshots
  for (const snapshot of snapshots) {
    const pokemonData = await getCountersUsage(snapshot, tier);
    if (pokemonData !== undefined) {
      allPokemonData.push(pokemonData); // Add the data from this snapshot to the array
    }
  }
  await writePokemonCountersDataToCSV(allPokemonData, tier);
}






async function extractUsageStats(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();
          const regex = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([\d.]+%)\s*\|\s*(\d+)\s*\|\s*([\d.]+%)\s*\|\s*(\d+)\s*\|\s*([\d.]+%)\s*\|/g;
          const pokemonData = {};

          let match;
          while ((match = regex.exec(bodyContent)) !== null) {
            const pokemonName = match[2].trim();
            const usageRate = parseFloat(match[3]);
            pokemonData[pokemonName] = {
              usage: usageRate,
              snapshot: `${cleanedSnapshot}`,
            };
          }

          pokemonAttributes.names.forEach((pokemonName) => {
            if (!(pokemonName in pokemonData)) {
              pokemonData[pokemonName] = {
                usage: 0,
                snapshot: `${cleanedSnapshot}`,
              };
            }
          });

          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}

async function updateImageNumberOfFormeMons() {
  return new Promise((resolve, reject) => {
    const url =
      'https://play.pokemonshowdown.com/js/battle-dex-data.js?fbclid=IwAR1hz9CnLOsMcU8s7ZrhfrTn2VOmOtdADUxkwzvWaU3lf3WVqht8h_c2f6M';

    try {
      request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // Get the names and formes attributes
          const { names, formes } = pokemonAttributes;

          // Loop over all the pokemon names
          for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const forme = formes[i];

            // Check only for forme mones in the pokemonAttributes
            if (forme !== undefined) {
              // Format the name to match the format in the battle-dex-data.js
              formattedName = name.toLowerCase().replace(/[’\-\. %']/g, '');
              if (body.includes(formattedName)) {
                // Use regex to extract the value like "1020+140" from the line
                const regex = new RegExp(`${formattedName}:(\\d+\\+\\d+)`);
                const match = body.match(regex);

                if (match) {
                  const expression = match[1]; // Get the matched expression like "1020+140"
                  const result = eval(expression); // Evaluate the expression
                  pokemonAttributes.ImageNumbers[i] = result; // Update the ImageNumbers array;
                } else {
                  console.log(`The form ${formattedName} was found, but the expression couldn't be extracted.`);
                }
              } else {
                console.log(`The form ${formattedName} was not found in the page content.`);
              }
            }
          }
          resolve(); // Resolve the promise when processing is done
        } else {
          console.error('Error fetching the page:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in findWordInPage:', error);
      reject(error);
    }
  });
}


async function getPokemonItemsData() {
  return new Promise((resolve, reject) => {
    const url = 'https://play.pokemonshowdown.com/data/items.js';

    try {
      request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // Remove the 'exports.BattleItems =' from the beginning of the text.
          const trimmedBody = body.replace('exports.BattleItems =', '');

          const itemProperties = {};

          // Define regular expressions for individual properties
          const regexName = /name:"(.*?)"/g;
          const regexSpritenum = /spritenum:(\d+)/g;
          const regexDesc = /(desc:"(.*?)"|strangeball:)/g
          const regexGen = /gen:(\d+)/g; // Regular expression for 'gen'

          // Extract the name, spritenum, desc, and gen using separate regular expressions
          let nameMatch;
          let spritenumMatch;
          let descMatch;
          let genMatch;

          while ((nameMatch = regexName.exec(trimmedBody)) !== null) {
            spritenumMatch = regexSpritenum.exec(trimmedBody);
            descMatch = regexDesc.exec(trimmedBody);
            genMatch = regexGen.exec(trimmedBody);
          
            const name = nameMatch[1];
            const spritenum = parseInt(spritenumMatch[1], 10);
            let desc = descMatch[1]; // Check if descMatch is null
            const gen = parseInt(genMatch[1], 10);
          

            // Remove 'desc:' and ' if they are the first or last characters in the description
            if (desc && desc.startsWith('desc:"')) {
              desc = desc.slice(6);
            }
            if (desc && desc.endsWith('"')) {
              desc = desc.slice(0, -1);
            }
          
          
            itemProperties[name] = {
              name,
              spritenum,
              desc,
              gen,
            };
          }

          // Fetch Other Properties
          const flingBasePowers = await getItemParameter("fling", "basePower", "flingBasePower");
          const naturalGiftBasePowers = await getItemParameter("naturalGift", "basePower", "naturalGiftBasePower");
          const naturalGiftType = await getItemParameter("naturalGift", "type", "naturalGiftType");
          
          // Merge itemProperties with the retrieved data
          for (const itemName in itemProperties) {
            const formattedItemName = itemName.toLowerCase().replace(/ /g, '').replace(/'/g, '').replace(/-/g, '');

            // Merge 'flingBasePower' data
            if (flingBasePowers[formattedItemName]) {
              itemProperties[itemName].flingBasePower = flingBasePowers[formattedItemName].flingBasePower;
            }

            // Merge 'naturalGiftBasePower' data
            if (naturalGiftBasePowers[formattedItemName]) {
              itemProperties[itemName].naturalGiftBasePower = naturalGiftBasePowers[formattedItemName].naturalGiftBasePower;
            }

            // Merge 'naturalGiftType' data
            if (naturalGiftType[formattedItemName]) {
              itemProperties[itemName].naturalGiftType = naturalGiftType[formattedItemName].naturalGiftType;
            }
          }

          updateItemImageXOffset(itemProperties);
          updateItemImageYOffset(itemProperties);

          // You can return or resolve this merged itemProperties object
          resolve(itemProperties);
        } else {
          console.error('Error fetching the page:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in getPokemonItemsData:', error);
      reject(error);
    }
  });
}

function updateItemImageXOffset(items) {

  const xOffset = -24;
  // Because there are 16 items on a line https://play.pokemonshowdown.com/sprites/itemicons-sheet.png
  const interval = 16;

  // Iterate through the object properties
  for (const itemName in items) {
    const item = items[itemName];

      item['itemImageXOffset'] = xOffset * (item.spritenum % interval);

  }

  return items

}

function updateItemImageYOffset(items){

    const yOffset = -24;

    // Because there are 16 items on a line https://play.pokemonshowdown.com/sprites/itemicons-sheet.png
    const interval = 16; 

    // Iterate through the object properties
    for (const itemName in items) {
      const item = items[itemName];

      if(item.spritenum < 15){
        item['itemImageYOffset'] = 0;
      } else{
        item['itemImageYOffset'] = Math.floor(item.spritenum / interval) * yOffset;
      }
    }
  
    return items

}

function getItemParameter(key, parameter,newKeyName) {
  return new Promise((resolve, reject) => {
    const url = 'https://play.pokemonshowdown.com/data/items.js';

    try {
      request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // Find the position of 'exports.BattleItems ='
          const startIndex = body.indexOf('exports.BattleItems =');

          if (startIndex === -1) {
            console.error('Data not found in the page.');
            reject('Data not found in the page.');
            return;
          }

          // Extract the data from the JavaScript object
          const rawData = body.substring(startIndex + 22);
          const endIndex = rawData.lastIndexOf('}') + 1;
          const itemData = eval('(' + rawData.substring(0, endIndex) + ')');

          const itemBasePowers = {};

          for (const itemName in itemData) {
            if (itemData.hasOwnProperty(itemName)) {
              const item = itemData[itemName];
              const itemBasePower = (item[key] && item[key][parameter]) || 0;

              const renamedKey = `${newKeyName}`; // Rename the key
              itemBasePowers[itemName] = {
                name: item.name,
                [renamedKey]: itemBasePower, // Use the renamed key
              };
            }
          }

          resolve(itemBasePowers);
        } else {
          console.error('Error fetching the page:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in getItemFlingBasePower:', error);
      reject(error);
    }
  });
}

async function WriteItems() {
  return new Promise(async (resolve, reject) => {
    try {
      // Call the function and wait for it to complete
      const itemAttributes = await getPokemonItemsData();

      // Create an array to store the data objects
      const dataToWrite = [];

      // Iterate through each item in the itemAttributes object
      for (const itemName in itemAttributes) {
        if (itemAttributes.hasOwnProperty(itemName)) {
          // Extract the item data for the current item
          const itemData = itemAttributes[itemName];
          
          // Push the item data to the array
          dataToWrite.push(itemData);
        }
      }

      // Convert the array of objects to a CSV-formatted string
      const csvData = Papa.unparse(dataToWrite);

      // Specify the CSV file name
      const outputPath = 'ShowdownGraphs/files/items.csv';

      // Write the CSV data to the file
      fs.writeFileSync(outputPath, csvData);

      console.log(`Item data has been written to ${outputPath}`);

      resolve(); // Resolve the promise when writing is done
    } catch (error) {
      reject(error); // Reject the promise if there's an error
    }
  });
}

async function getPokemonTypes(tier) {
  const url = 'https://play.pokemonshowdown.com/data/pokedex.json';
  const tiersToGetTypesFrom = ["gen1ou", "gen2ou", "gen3ou","gen4ou", "gen5ou", "gen6ou","gen7ou", "gen8ou", "gen9ou"];
  // Check if the string starts with any of the allowed prefixes
  const startsWithTiersToGetTypesFrom = tier.some(tierValue => tiersToGetTypesFrom.some(prefix => tierValue.startsWith(prefix)));
  // Store Pokemon Types
  const pokemonTypeAttributes = {
    names: [],
    gen: [],
    types: []
  };

  try {
    const html = await request(url);

    if (startsWithTiersToGetTypesFrom) {
      // Make an HTTP GET request to the URL
      fetch(url)
        .then(function (response) {
          // Check if the response status is OK (200)
          if (!response.ok) {
            throw new Error('HTTP error! Status: ' + response.status);
          }
          // Parse the response JSON
          return response.json();
        })
        .then(async function (data) {
          if (tier.some(element => element.startsWith("gen1ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 151 &&
                !data[key].hasOwnProperty('forme') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if (data[key].name.toLowerCase() === 'clefairy' || data[key].name.toLowerCase() === 'clefable'
              || data[key].name.toLowerCase() === 'jigglypuff'|| data[key].name.toLowerCase() === 'wigglytuff') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(1);
                pokemonTypeAttributes.types.push(['Normal']);
              }
              else if (data[key].name.toLowerCase() === 'mr. mime') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(1);
                pokemonTypeAttributes.types.push(['Psychic']);
              } 
              else if (data[key].name.toLowerCase() === 'magnemite' || data[key].name.toLowerCase() === 'magneton') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(1);
                pokemonTypeAttributes.types.push(['Electric']);
              } 
              else {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(1);
                pokemonTypeAttributes.types.push(data[key].types);
              }


            
            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen2ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 251 &&
                !data[key].hasOwnProperty('forme') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if (data[key].name.toLowerCase() === 'marill' || data[key].name.toLowerCase() === 'azumarill') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(2);
                pokemonTypeAttributes.types.push(['Water']);
              }
              else if (data[key].name.toLowerCase() === 'cleffa' || data[key].name.toLowerCase() === 'igglypuff'
              || data[key].name.toLowerCase() === 'snubbull' || data[key].name.toLowerCase() === 'granbull'
              || data[key].name.toLowerCase() === 'togepi' || data[key].name.toLowerCase() === 'jigglypuff'
              || data[key].name.toLowerCase() === 'wigglytuff' || data[key].name.toLowerCase() === 'clefairy'
              || data[key].name.toLowerCase() === 'clefable'  ) {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(2);
                pokemonTypeAttributes.types.push(['Normal']);
              } 
              else if (data[key].name.toLowerCase() === 'mr. mime') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(2);
                pokemonTypeAttributes.types.push(['Psychic']);
              } 
              else if (data[key].name.toLowerCase() === 'togetic') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(2);
                pokemonTypeAttributes.types.push(['Normal','Flying']);
              } 
              else {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(2);
                pokemonTypeAttributes.types.push(data[key].types);
              }
            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen3ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 386 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if (data[key].name.toLowerCase() === 'marill' || data[key].name.toLowerCase() === 'azumarill') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(['Water']);
              }
              else if (data[key].name.toLowerCase() === 'cleffa' || data[key].name.toLowerCase() === 'igglypuff'
              || data[key].name.toLowerCase() === 'snubbull' || data[key].name.toLowerCase() === 'granbull'
              || data[key].name.toLowerCase() === 'togepi' || data[key].name.toLowerCase() === 'jigglypuff'
              || data[key].name.toLowerCase() === 'wigglytuff' || data[key].name.toLowerCase() === 'clefairy'
              || data[key].name.toLowerCase() === 'clefable' || data[key].name.toLowerCase() ==="azurill") {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(['Normal']);
              } 
              else if (data[key].name.toLowerCase() === 'mr. mime' || data[key].name.toLowerCase() === 'ralts'
              || data[key].name.toLowerCase() === 'kirlia' || data[key].name.toLowerCase() === 'gardevoir') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(['Psychic']);
              } 
              else if (data[key].name.toLowerCase() === 'togetic') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(['Normal','Flying']);
              } 
              else if (data[key].name.toLowerCase() === 'mawile') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(['Steel']);
              } 
              else {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(3);
                pokemonTypeAttributes.types.push(data[key].types);
              }
            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen4ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 493 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus")
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if (data[key].name.toLowerCase() === 'marill' || data[key].name.toLowerCase() === 'azumarill') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Water']);
              }
              else if (data[key].name.toLowerCase() === 'cleffa' || data[key].name.toLowerCase() === 'igglypuff'
              || data[key].name.toLowerCase() === 'snubbull' || data[key].name.toLowerCase() === 'granbull'
              || data[key].name.toLowerCase() === 'togepi' || data[key].name.toLowerCase() === 'jigglypuff'
              || data[key].name.toLowerCase() === 'wigglytuff' || data[key].name.toLowerCase() === 'clefairy'
              || data[key].name.toLowerCase() === 'clefable' || data[key].name.toLowerCase() ==="azurill") {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Normal']);
              } 
              else if (data[key].name.toLowerCase() === 'mr. mime' || data[key].name.toLowerCase() === 'ralts'
              || data[key].name.toLowerCase() === 'kirlia' || data[key].name.toLowerCase() === 'gardevoir' || data[key].name.toLowerCase() === 'mime jr.') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Psychic']);
              } 
              else if (data[key].name.toLowerCase() === 'togetic' || data[key].name.toLowerCase() === 'togekiss') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Normal','Flying']);
              } 
              else if (data[key].name.toLowerCase() === 'mawile') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Steel']);
              } 
              else if (data[key].name.toLowerCase() === 'rotom-heat' || data[key].name.toLowerCase() === 'rotom-wash' 
              || data[key].name.toLowerCase() === 'rotom-frost' || data[key].name.toLowerCase() === 'rotom-fan' || data[key].name.toLowerCase() === 'rotom-mow') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(['Electric','Ghost']);
              } 
              else {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(4);
                pokemonTypeAttributes.types.push(data[key].types);
              }
            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen5ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 649 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if (data[key].name.toLowerCase() === 'marill' || data[key].name.toLowerCase() === 'azumarill') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Water']);
              }
              else if (data[key].name.toLowerCase() === 'cleffa' || data[key].name.toLowerCase() === 'igglypuff'
              || data[key].name.toLowerCase() === 'snubbull' || data[key].name.toLowerCase() === 'granbull'
              || data[key].name.toLowerCase() === 'togepi' || data[key].name.toLowerCase() === 'jigglypuff'
              || data[key].name.toLowerCase() === 'wigglytuff' || data[key].name.toLowerCase() === 'clefairy'
              || data[key].name.toLowerCase() === 'clefable' || data[key].name.toLowerCase() ==="azurill") {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Normal']);
              } 
              else if (data[key].name.toLowerCase() === 'mr. mime' || data[key].name.toLowerCase() === 'ralts'
              || data[key].name.toLowerCase() === 'kirlia' || data[key].name.toLowerCase() === 'gardevoir' || data[key].name.toLowerCase() === 'mime jr.') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Psychic']);
              } 
              else if (data[key].name.toLowerCase() === 'togetic' || data[key].name.toLowerCase() === 'togekiss') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Normal','Flying']);
              } 
              else if (data[key].name.toLowerCase() === 'mawile') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Steel']);
              } 
              else if (data[key].name.toLowerCase() === 'cottonee' || data[key].name.toLowerCase() === 'whimsicott') {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(['Grass']);
              } 
              else {
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(5);
                pokemonTypeAttributes.types.push(data[key].types);
              }
            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen6ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 721 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              ){
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(6);
                pokemonTypeAttributes.types.push(data[key].types);
              }

            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen7ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 809 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              ){
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(7);
                pokemonTypeAttributes.types.push(data[key].types);
              }

            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen8ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 898 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra' || data[key].forme === 'Galar' || data[key].forme === 'Crowned'
                || data[key].forme === 'Rapid-Strike' || data[key].forme === 'Ice' || data[key].forme === 'Shadow'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              ){
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(8);
                pokemonTypeAttributes.types.push(data[key].types);
              }

            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen9ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].forme === "Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra' || data[key].forme === 'Galar' || data[key].forme === 'Crowned'
                || data[key].forme === 'Rapid-Strike' || data[key].forme === 'Ice' || data[key].forme === 'Shadow'
                || data[key].forme === 'Wellspring' || data[key].forme === 'Hearthflame' || data[key].forme === 'Cornerstone' 
                || data[key].forme === 'Hisui' || data[key].forme === 'Paldea-Combat' || data[key].forme === 'Paldea-Blaze' 
                || data[key].forme === 'Paldea-Aqua' || data[key].forme === 'Paldea' || data[key].forme === 'Epilogue' || data[key].forme === 'Bloodmoon'
                || data[key].forme === 'Terastal' || data[key].forme === 'Stellar'
                ) &&
                data[key].isNonstandard !== 'Custom'
              ){
                pokemonTypeAttributes.names.push(data[key].name);
                pokemonTypeAttributes.gen.push(9);
                pokemonTypeAttributes.types.push(data[key].types);
              }

            }
            await writePokemonDatatypesToCSV(pokemonTypeAttributes, tier);
          }



        })
        .catch(function (error) {
          console.error('Error processing data:', error);
        });
    } else {
      console.log('Skipping data processing Types for tier:', tier);
    }
  } catch (error) {
    console.error(`Error extracting data for: ${tier}`, error);
  }
}

async function getPokemonStats(tier) {
  const url = 'https://play.pokemonshowdown.com/data/pokedex.json';
  const tiersToGetStatsFrom = ["gen1ou", "gen2ou", "gen3ou","gen4ou", "gen5ou", "gen6ou","gen7ou", "gen8ou", "gen9ou"];
  // Check if the string starts with any of the allowed prefixes
  const startsWithTiersToGetStatsFrom = tier.some(tierValue => tiersToGetStatsFrom.some(prefix => tierValue.startsWith(prefix)));
  // Store Pokemon Types
  const pokemonStatsAttributes = {
    names: [],
    gen: [],
    hp: [],
    attack: [],
    defense: [],
    sp_attack: [],
    sp_defense: [],
    speed: [],
  };

  try {
    const html = await request(url);

    if (startsWithTiersToGetStatsFrom) {
      // Make an HTTP GET request to the URL
      fetch(url)
        .then(function (response) {
          // Check if the response status is OK (200)
          if (!response.ok) {
            throw new Error('HTTP error! Status: ' + response.status);
          }
          // Parse the response JSON
          return response.json();
        })
        .then(async function (data) {
          if (tier.some(element => element.startsWith("gen1ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 151 &&
                !data[key].hasOwnProperty('forme') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(135);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(125);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "beedrill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(40);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(45);
                pokemonStatsAttributes.speed.push(75);
              }
              else if(data[key].name.toLowerCase() === "butterfree"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "clefable"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(73);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "golem"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "nidoking"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(81);
                pokemonStatsAttributes.attack.push(92);
                pokemonStatsAttributes.defense.push(77);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "nidoqueen"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(82);
                pokemonStatsAttributes.defense.push(87);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(76);
              }
              else if(data[key].name.toLowerCase() === "pidgeot"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(83);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(91);
              }
              else if(data[key].name.toLowerCase() === "pikachu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "poliwrath"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(95);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "raichu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "victreebel"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "vileplume"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "wigglytuff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(140);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(58);
                pokemonStatsAttributes.speed.push(60);
              }
              //Keep the special Attack
              else if(data[key].name.toLowerCase() === "mewtwo" || data[key].name.toLowerCase() === "squirtle" || data[key].name.toLowerCase() === "wartortle"
              || data[key].name.toLowerCase() === "blastoise" || data[key].name.toLowerCase() === "rattata" || data[key].name.toLowerCase() === "raticate"
              || data[key].name.toLowerCase() === "ekans" || data[key].name.toLowerCase() === "clefairy" || data[key].name.toLowerCase() === "oddish"
              || data[key].name.toLowerCase() === "gloom" || data[key].name.toLowerCase() === "venonat" || data[key].name.toLowerCase() === "venomoth"
              || data[key].name.toLowerCase() === "mankey" || data[key].name.toLowerCase() === "primeape" || data[key].name.toLowerCase() === "abra"
              || data[key].name.toLowerCase() === "kadabra" || data[key].name.toLowerCase() === "machoke" || data[key].name.toLowerCase() === "machamp"
              || data[key].name.toLowerCase() === "bellsprout" || data[key].name.toLowerCase() === "weepinbell" || data[key].name.toLowerCase() === "magnemite"
              || data[key].name.toLowerCase() === "magneton" || data[key].name.toLowerCase() === "grimer" || data[key].name.toLowerCase() === "muk"
              || data[key].name.toLowerCase() === "shellder" || data[key].name.toLowerCase() === "cloyster" || data[key].name.toLowerCase() === "gastly"
              || data[key].name.toLowerCase() === "haunter" || data[key].name.toLowerCase() === "gengar" || data[key].name.toLowerCase() === "onix"
              || data[key].name.toLowerCase() === "exeggcute" || data[key].name.toLowerCase() === "cubone" || data[key].name.toLowerCase() === "marowak"
              || data[key].name.toLowerCase() === "hitmonlee" || data[key].name.toLowerCase() === "hitmonchan" || data[key].name.toLowerCase() === "lickitung"
              || data[key].name.toLowerCase() === "koffing" || data[key].name.toLowerCase() === "weezing" || data[key].name.toLowerCase() === "tangela"
              || data[key].name.toLowerCase() === "kangaskhan" || data[key].name.toLowerCase() === "horsea" || data[key].name.toLowerCase() === "seadra"
              || data[key].name.toLowerCase() === "staryu" || data[key].name.toLowerCase() === "starmie" || data[key].name.toLowerCase() === "mr. mime"
              || data[key].name.toLowerCase() === "scyther" || data[key].name.toLowerCase() === "pinsir" || data[key].name.toLowerCase() === "vaporeon"
              || data[key].name.toLowerCase() === "jolteon" || data[key].name.toLowerCase() === "omanyte" || data[key].name.toLowerCase() === "omastar"
              || data[key].name.toLowerCase() === "aerodactyl" || data[key].name.toLowerCase() === "snorlax" || data[key].name.toLowerCase() === "zapdos"
              || data[key].name.toLowerCase() === "moltres"
              ){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spa);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
              else {
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(1);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spd);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen2ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 251 &&
                !data[key].hasOwnProperty('forme') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(79);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "beedrill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(40);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(75);
              }
              else if(data[key].name.toLowerCase() === "butterfree"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "clefable"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(73);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "golem"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "nidoking"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(81);
                pokemonStatsAttributes.attack.push(92);
                pokemonStatsAttributes.defense.push(77);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "nidoqueen"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(82);
                pokemonStatsAttributes.defense.push(87);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(76);
              }
              else if(data[key].name.toLowerCase() === "pidgeot"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(83);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(91);
              }
              else if(data[key].name.toLowerCase() === "pikachu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(40);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "poliwrath"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(95);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "raichu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "victreebel"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "vileplume"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "wigglytuff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(140);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(62);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "ampharos"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(75);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(115);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "azumarill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "bellossom"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "jumpluff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(110);
              }
              else if(data[key].name.toLowerCase() === "ariados"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(40);
              }
              else if(data[key].name.toLowerCase() === "corsola"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(35);
              }
              else if(data[key].name.toLowerCase() === "magcargo"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(50);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(30);
              }
              else if(data[key].name.toLowerCase() === "mantine"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(40);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(140);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "noctowl"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(76);
                pokemonStatsAttributes.sp_defense.push(96);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "qwilfish"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(85);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(2);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen3ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 386 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed') &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(79);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "beedrill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(40);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(75);
              }
              else if(data[key].name.toLowerCase() === "butterfree"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "clefable"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(73);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "golem"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "nidoking"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(81);
                pokemonStatsAttributes.attack.push(92);
                pokemonStatsAttributes.defense.push(77);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "nidoqueen"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(82);
                pokemonStatsAttributes.defense.push(87);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(76);
              }
              else if(data[key].name.toLowerCase() === "pidgeot"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(83);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(91);
              }
              else if(data[key].name.toLowerCase() === "pikachu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(40);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "poliwrath"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(95);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "raichu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "victreebel"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "vileplume"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "wigglytuff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(140);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(62);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "ampharos"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(75);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(115);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "azumarill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "bellossom"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "jumpluff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(110);
              }
              else if(data[key].name.toLowerCase() === "ariados"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(40);
              }
              else if(data[key].name.toLowerCase() === "corsola"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(35);
              }
              else if(data[key].name.toLowerCase() === "magcargo"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(50);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(30);
              }
              else if(data[key].name.toLowerCase() === "mantine"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(40);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(140);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "noctowl"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(76);
                pokemonStatsAttributes.sp_defense.push(96);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "qwilfish"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "beautifly"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "exploud"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(104);
                pokemonStatsAttributes.attack.push(91);
                pokemonStatsAttributes.defense.push(63);
                pokemonStatsAttributes.sp_attack.push(91);
                pokemonStatsAttributes.sp_defense.push(63);
                pokemonStatsAttributes.speed.push(68);
              }
              else if(data[key].name.toLowerCase() === "chimecho"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "delcatty"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "illumise"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(47);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(73);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "lunatone"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "masquerain"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(60);
                pokemonStatsAttributes.defense.push(62);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(82);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "pelipper"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(100);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "solrock"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "swellow"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(60);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(125);
              }
              else if(data[key].name.toLowerCase() === "volbeat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(73);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(47);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(3);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen4ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 493 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus")
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(79);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "beedrill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(40);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(75);
              }
              else if(data[key].name.toLowerCase() === "butterfree"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "clefable"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(73);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "golem"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "nidoking"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(81);
                pokemonStatsAttributes.attack.push(92);
                pokemonStatsAttributes.defense.push(77);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "nidoqueen"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(82);
                pokemonStatsAttributes.defense.push(87);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(76);
              }
              else if(data[key].name.toLowerCase() === "pidgeot"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(83);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(91);
              }
              else if(data[key].name.toLowerCase() === "pikachu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(40);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "poliwrath"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(95);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "raichu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "victreebel"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "vileplume"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "wigglytuff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(140);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(62);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "ampharos"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(75);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(115);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "azumarill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "bellossom"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "jumpluff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(110);
              }
              else if(data[key].name.toLowerCase() === "ariados"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(40);
              }
              else if(data[key].name.toLowerCase() === "corsola"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(35);
              }
              else if(data[key].name.toLowerCase() === "magcargo"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(50);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(30);
              }
              else if(data[key].name.toLowerCase() === "mantine"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(40);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(140);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "noctowl"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(76);
                pokemonStatsAttributes.sp_defense.push(96);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "qwilfish"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "beautifly"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "exploud"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(104);
                pokemonStatsAttributes.attack.push(91);
                pokemonStatsAttributes.defense.push(63);
                pokemonStatsAttributes.sp_attack.push(91);
                pokemonStatsAttributes.sp_defense.push(63);
                pokemonStatsAttributes.speed.push(68);
              }
              else if(data[key].name.toLowerCase() === "chimecho"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "delcatty"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "illumise"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(47);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(73);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "lunatone"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "masquerain"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(60);
                pokemonStatsAttributes.defense.push(62);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(82);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "pelipper"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(100);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "solrock"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "swellow"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(60);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(125);
              }
              else if(data[key].name.toLowerCase() === "volbeat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(73);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(47);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "roserade"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(105);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "staraptor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(85);
                pokemonStatsAttributes.attack.push(120);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "cresselia"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(120);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(130);
                pokemonStatsAttributes.speed.push(85);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(4);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen5ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 649 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(79);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "beedrill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(40);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(75);
              }
              else if(data[key].name.toLowerCase() === "butterfree"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "clefable"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(73);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "golem"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "nidoking"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(81);
                pokemonStatsAttributes.attack.push(92);
                pokemonStatsAttributes.defense.push(77);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "nidoqueen"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(82);
                pokemonStatsAttributes.defense.push(87);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(76);
              }
              else if(data[key].name.toLowerCase() === "pidgeot"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(83);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(91);
              }
              else if(data[key].name.toLowerCase() === "pikachu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(40);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "poliwrath"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(95);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "raichu"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "victreebel"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "vileplume"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(100);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "wigglytuff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(140);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(62);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "ampharos"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(90);
                pokemonStatsAttributes.attack.push(75);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(115);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase() === "azumarill"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "bellossom"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(100);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "jumpluff"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(110);
              }
              else if(data[key].name.toLowerCase() === "ariados"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(40);
              }
              else if(data[key].name.toLowerCase() === "corsola"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(35);
              }
              else if(data[key].name.toLowerCase() === "magcargo"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(50);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(30);
              }
              else if(data[key].name.toLowerCase() === "mantine"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(40);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(140);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "noctowl"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(76);
                pokemonStatsAttributes.sp_defense.push(96);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "qwilfish"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "beautifly"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(90);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "exploud"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(104);
                pokemonStatsAttributes.attack.push(91);
                pokemonStatsAttributes.defense.push(63);
                pokemonStatsAttributes.sp_attack.push(91);
                pokemonStatsAttributes.sp_defense.push(63);
                pokemonStatsAttributes.speed.push(68);
              }
              else if(data[key].name.toLowerCase() === "chimecho"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "delcatty"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "illumise"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(47);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(73);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "lunatone"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "masquerain"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(60);
                pokemonStatsAttributes.defense.push(62);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(82);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "pelipper"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(100);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "solrock"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "swellow"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(60);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(125);
              }
              else if(data[key].name.toLowerCase() === "volbeat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(73);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(47);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "roserade"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(105);
                pokemonStatsAttributes.speed.push(90);
              }
              else if(data[key].name.toLowerCase() === "staraptor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(85);
                pokemonStatsAttributes.attack.push(120);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "cresselia"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(120);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(130);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "gigalith"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(85);
                pokemonStatsAttributes.attack.push(135);
                pokemonStatsAttributes.defense.push(130);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(25);
              }
              else if(data[key].name.toLowerCase() === "krookodile"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(117);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(92);
              }
              else if(data[key].name.toLowerCase() === "leavanny"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(75);
                pokemonStatsAttributes.attack.push(103);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(92);
              }
              else if(data[key].name.toLowerCase() === "scolipede"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(89);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(69);
                pokemonStatsAttributes.speed.push(112);
              }
              else if(data[key].name.toLowerCase() === "seismitoad"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(105);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(74);
              }
              else if(data[key].name.toLowerCase() === "stoutland"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(85);
                pokemonStatsAttributes.attack.push(100);
                pokemonStatsAttributes.defense.push(90);
                pokemonStatsAttributes.sp_attack.push(45);
                pokemonStatsAttributes.sp_defense.push(90);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "unfezant"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(80);
                pokemonStatsAttributes.attack.push(105);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(93);
              }
              else if(data[key].name.toLowerCase() === "beartic"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "crustle"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(125);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "cryogonal"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(135);
                pokemonStatsAttributes.speed.push(105);
              }
              else if(data[key].name.toLowerCase() === "woobat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(43);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(43);
                pokemonStatsAttributes.speed.push(72);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(5);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen6ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 721 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "alakazam"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(45);
                pokemonStatsAttributes.sp_attack.push(135);
                pokemonStatsAttributes.sp_defense.push(95);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "arbok"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(69);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(79);
                pokemonStatsAttributes.speed.push(80);
              }
              else if(data[key].name.toLowerCase() === "alakazam-mega"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(175);
                pokemonStatsAttributes.sp_defense.push(95);
                pokemonStatsAttributes.speed.push(150);
              }
              else if(data[key].name.toLowerCase() === "dodrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(100);
              }
              else if(data[key].name.toLowerCase() === "dugtrio"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(35);
                pokemonStatsAttributes.attack.push(80);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(120);
              }
              else if(data[key].name.toLowerCase() === "electrode"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(140);
              }
              else if(data[key].name.toLowerCase() === "exeggutor"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(125);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(55);
              }
              else if(data[key].name.toLowerCase().startsWith("farfetch") && !data[key].hasOwnProperty('forme')){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(52);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(58);
                pokemonStatsAttributes.sp_defense.push(62);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "ariados"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(90);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(60);
                pokemonStatsAttributes.sp_defense.push(60);
                pokemonStatsAttributes.speed.push(40);
              }
              else if(data[key].name.toLowerCase() === "corsola"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(35);
              }
              else if(data[key].name.toLowerCase() === "magcargo"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(50);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(30);
              }
              else if(data[key].name.toLowerCase() === "mantine"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(40);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(140);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "noctowl"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(100);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(50);
                pokemonStatsAttributes.sp_attack.push(76);
                pokemonStatsAttributes.sp_defense.push(96);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "qwilfish"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(75);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "chimecho"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(70);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "delcatty"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(65);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(55);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "illumise"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(47);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(73);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "lunatone"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(55);
                pokemonStatsAttributes.defense.push(65);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(85);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "masquerain"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(60);
                pokemonStatsAttributes.defense.push(62);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(82);
                pokemonStatsAttributes.speed.push(60);
              }
              else if(data[key].name.toLowerCase() === "pelipper"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(100);
                pokemonStatsAttributes.sp_attack.push(85);
                pokemonStatsAttributes.sp_defense.push(70);
                pokemonStatsAttributes.speed.push(65);
              }
              else if(data[key].name.toLowerCase() === "solrock"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(85);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(65);
                pokemonStatsAttributes.speed.push(70);
              }
              else if(data[key].name.toLowerCase() === "swellow"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(85);
                pokemonStatsAttributes.defense.push(60);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(50);
                pokemonStatsAttributes.speed.push(125);
              }
              else if(data[key].name.toLowerCase() === "volbeat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(65);
                pokemonStatsAttributes.attack.push(73);
                pokemonStatsAttributes.defense.push(55);
                pokemonStatsAttributes.sp_attack.push(47);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "cresselia"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(120);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(130);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "beartic"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(95);
                pokemonStatsAttributes.attack.push(110);
                pokemonStatsAttributes.defense.push(80);
                pokemonStatsAttributes.sp_attack.push(70);
                pokemonStatsAttributes.sp_defense.push(80);
                pokemonStatsAttributes.speed.push(50);
              }
              else if(data[key].name.toLowerCase() === "crustle"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(95);
                pokemonStatsAttributes.defense.push(125);
                pokemonStatsAttributes.sp_attack.push(65);
                pokemonStatsAttributes.sp_defense.push(75);
                pokemonStatsAttributes.speed.push(45);
              }
              else if(data[key].name.toLowerCase() === "cryogonal"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(70);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(30);
                pokemonStatsAttributes.sp_attack.push(95);
                pokemonStatsAttributes.sp_defense.push(135);
                pokemonStatsAttributes.speed.push(105);
              }
              else if(data[key].name.toLowerCase() === "woobat"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(55);
                pokemonStatsAttributes.attack.push(45);
                pokemonStatsAttributes.defense.push(43);
                pokemonStatsAttributes.sp_attack.push(55);
                pokemonStatsAttributes.sp_defense.push(43);
                pokemonStatsAttributes.speed.push(72);
              }
              else if(data[key].name.toLowerCase() === "aegislash"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(150);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(150);
                pokemonStatsAttributes.speed.push(60);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(6);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen7ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 809 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "cresselia"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(7);
                pokemonStatsAttributes.hp.push(120);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(130);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "aegislash"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(7);
                pokemonStatsAttributes.hp.push(60);
                pokemonStatsAttributes.attack.push(50);
                pokemonStatsAttributes.defense.push(150);
                pokemonStatsAttributes.sp_attack.push(50);
                pokemonStatsAttributes.sp_defense.push(150);
                pokemonStatsAttributes.speed.push(60);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(7);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
          else if (tier.some(element => element.startsWith("gen8ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                data[key].num <= 898 &&
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].name === "Giratina-Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra' || data[key].forme === 'Galar' || data[key].forme === 'Crowned'
                || data[key].forme === 'Rapid-Strike' || data[key].forme === 'Ice' || data[key].forme === 'Shadow'
                ) &&
                data[key].isNonstandard !== 'CAP' &&
                data[key].isNonstandard !== 'Custom'
              )
              if(data[key].name.toLowerCase() === "cresselia"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(120);
                pokemonStatsAttributes.attack.push(70);
                pokemonStatsAttributes.defense.push(120);
                pokemonStatsAttributes.sp_attack.push(75);
                pokemonStatsAttributes.sp_defense.push(130);
                pokemonStatsAttributes.speed.push(85);
              }
              else if(data[key].name.toLowerCase() === "zacian"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(92);
                pokemonStatsAttributes.attack.push(130);
                pokemonStatsAttributes.defense.push(115);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(115);
                pokemonStatsAttributes.speed.push(138);
              }
              else if(data[key].name.toLowerCase() === "zacian-crowned"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(92);
                pokemonStatsAttributes.attack.push(170);
                pokemonStatsAttributes.defense.push(115);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(115);
                pokemonStatsAttributes.speed.push(148);
              }
              else if(data[key].name.toLowerCase() === "zamazenta"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(92);
                pokemonStatsAttributes.attack.push(130);
                pokemonStatsAttributes.defense.push(115);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(115);
                pokemonStatsAttributes.speed.push(138);
              }
              else if(data[key].name.toLowerCase() === "zamazenta-crowned"){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(92);
                pokemonStatsAttributes.attack.push(130);
                pokemonStatsAttributes.defense.push(145);
                pokemonStatsAttributes.sp_attack.push(80);
                pokemonStatsAttributes.sp_defense.push(145);
                pokemonStatsAttributes.speed.push(128);
              }
              else{
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(8);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              } 
            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }
       
          else if (tier.some(element => element.startsWith("gen9ou"))) {
            for (const key in data) {
              if (
                data.hasOwnProperty(key) && 
                (!data[key].hasOwnProperty('forme') || data[key].forme === 'Attack' || data[key].forme === 'Defense' || data[key].forme === 'Speed'
                || data[key].forme === 'Sandy' || data[key].forme === 'Trash' || data[key].forme === 'Heat' || data[key].forme === 'Wash'
                || data[key].forme === 'Frost' || data[key].forme === 'Fan' || data[key].forme === 'Mow' || data[key].forme === 'Sky'
                || data[key].forme === "Origin" || data[key].name.startsWith("Arceus") || data[key].forme === 'Therian'
                || data[key].forme === 'White' || data[key].forme === 'Black' || data[key].forme === 'Primal' || data[key].forme === 'Mega'
                || data[key].forme === 'Mega-X' || data[key].forme === 'Mega-Y' || data[key].forme === 'F' || data[key].forme === 'Small'
                || data[key].forme === 'Large'  || data[key].forme === 'Super' || data[key].forme === '10%' 
                || data[key].forme === 'Complete' || data[key].forme === 'Unbound' || data[key].forme === 'Alola' || data[key].forme === 'Pom-Pom'
                || data[key].forme === "Pa'u" || data[key].forme === 'Sensu' || data[key].forme === 'Midnight' || data[key].forme === 'Dusk'
                || data[key].forme === 'School' || data[key].name.startsWith("Silvally") || data[key].forme === 'Dusk-Mane'
                || data[key].forme === 'Dawn-Wings' || data[key].forme === 'Ultra' || data[key].forme === 'Galar' || data[key].forme === 'Crowned'
                || data[key].forme === 'Rapid-Strike' || data[key].forme === 'Ice' || data[key].forme === 'Shadow'
                || data[key].forme === 'Wellspring' || data[key].forme === 'Hearthflame' || data[key].forme === 'Cornerstone' 
                || data[key].forme === 'Hisui' || data[key].forme === 'Paldea-Combat' || data[key].forme === 'Paldea-Blaze' 
                || data[key].forme === 'Paldea-Aqua' || data[key].forme === 'Paldea' || data[key].forme === 'Epilogue' || data[key].forme === 'Bloodmoon'
                || data[key].forme === 'Terastal' || data[key].forme === 'Stellar'
                ) &&
                data[key].isNonstandard !== 'Custom'
              ){
                pokemonStatsAttributes.names.push(data[key].name);
                pokemonStatsAttributes.gen.push(9);
                pokemonStatsAttributes.hp.push(data[key].baseStats.hp);
                pokemonStatsAttributes.attack.push(data[key].baseStats.atk);
                pokemonStatsAttributes.defense.push(data[key].baseStats.def);
                pokemonStatsAttributes.sp_attack.push(data[key].baseStats.spa);
                pokemonStatsAttributes.sp_defense.push(data[key].baseStats.spd);
                pokemonStatsAttributes.speed.push(data[key].baseStats.spe);
              }

            }
            await writePokemonDataStatsToCSV(pokemonStatsAttributes, tier);
          }



        })
        .catch(function (error) {
          console.error('Error processing data:', error);
        });
    } else {
      console.log('Skipping data processing Types for tier:', tier);
    }
  } catch (error) {
    console.error(`Error extracting data for: ${tier}`, error);
  }
}

async function getAbilitiesUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let abilityData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const abilitiesRegex = /\|\s*Abilities\s*\|([\s\S]+?)\s*\+\-+/g;
          let abilitiesMatch;
          
          while ((abilitiesMatch = abilitiesRegex.exec(bodyContent)) !== null) {
            const abilitiesText = abilitiesMatch[1].trim();
            const lines = abilitiesText.split(/\n/);
            let abilitiesArray = [];
          
            // Process each line
            lines.forEach(line => {
              // Check if the line contains a percentage
              if (/\d+\.\d+%/.test(line)) {
                const cleanedLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
          
                // Use a regular expression to separate ability name and percentage
                const match = cleanedLine.match(/^(.*?)\s*([\d.]+)%$/);
          
                if (match) {
                  const abilityName = match[1].trim();
                  const percentage = match[2].trim();
          
                  // Push the ability data to the array
                  abilitiesArray.push({
                    ability: abilityName,
                    percentage: percentage
                  });
                }
              }
            });
          
            // Push the abilities array to the main array
            abilityData.push(abilitiesArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: abilityData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});

          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting ablities data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}


async function getItemsUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let itemData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const itemsRegex = /\|\s*Items\s*\|([\s\S]+?)\s*\+\-+/g;
          let itemsMatch;
          
          while ((itemsMatch = itemsRegex.exec(bodyContent)) !== null) {
            const itemsText = itemsMatch[1].trim();
            const lines = itemsText.split(/\n/);
            let itemsArray = [];
          
            // Process each line
            lines.forEach(line => {
              // Check if the line contains a percentage
              if (/\d+\.\d+%/.test(line)) {
                const cleanedLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
          
                // Use a regular expression to separate item name and percentage
                const match = cleanedLine.match(/^(.*?)\s*([\d.]+)%$/);
          
                if (match) {
                  const itemName = match[1].trim();
                  const percentage = match[2].trim();
          
                  // Push the item data to the array
                  itemsArray.push({
                    item: itemName,
                    percentage: percentage
                  });
                }
              }
            });
          
            // Push the items array to the main array
            itemData.push(itemsArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: itemData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});

          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting items data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}

async function getMovesUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let moveData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const movesRegex = /\|\s*Moves\s*\|([\s\S]+?)\s*\+\-+/g;
          let movesMatch;
          
          while ((movesMatch = movesRegex.exec(bodyContent)) !== null) {
            const movesText = movesMatch[1].trim();
            const lines = movesText.split(/\n/);
            let movesArray = [];
          
            // Process each line
            lines.forEach(line => {
              // Check if the line contains a percentage
              if (/\d+\.\d+%/.test(line)) {
                const cleanedLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
          
                // Use a regular expression to separate move name and percentage
                const match = cleanedLine.match(/^(.*?)\s*([\d.]+)%$/);
          
                if (match) {
                  const moveName = match[1].trim();
                  const percentage = match[2].trim();
          
                  // Push the move data to the array
                  movesArray.push({
                    move: moveName,
                    percentage: percentage
                  });
                }
              }
            });
            // Push the moves array to the main array
            moveData.push(movesArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: moveData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});
          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting moves data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}

async function getTeammatesUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let teammateData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const teammatesRegex = /\|\s*Teammates\s*\|([\s\S]+?)\s*\+\-+/g;
          let teammatesMatch;
          
          while ((teammatesMatch = teammatesRegex.exec(bodyContent)) !== null) {
            const teammatesText = teammatesMatch[1].trim();
            const lines = teammatesText.split(/\n/);
            let teammatesArray = [];
          
            // Process each line
            lines.forEach(line => {
              // Check if the line contains a percentage
              if (/\d+\.\d+%/.test(line)) {
                const cleanedLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
          
                // Use a regular expression to separate teammate name and percentage
                const match = cleanedLine.match(/^(.*?)\s*([\d.]+)%$/);
          
                if (match) {
                  const teammateName = match[1].trim();
                  const percentage = match[2].trim();
          
                  // Push the teammate data to the array
                  teammatesArray.push({
                    teammate: teammateName,
                    percentage: percentage
                  });
                }
              }
            });
            // Push the teammates array to the main array
            teammateData.push(teammatesArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: teammateData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});
          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting teammates data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}

async function getSpreadsUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let spreadData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const spreadsRegex = /\|\s*Spreads\s*\|([\s\S]+?)\s*\+\-+/g;
          let spreadsMatch;
          
          while ((spreadsMatch = spreadsRegex.exec(bodyContent)) !== null) {
            const spreadsText = spreadsMatch[1].trim();
            const lines = spreadsText.split(/\n/);
            let spreadsArray = [];
          
            // Process each line
            lines.forEach(line => {
              // Check if the line contains a percentage
              if (/\d+\.\d+%/.test(line)) {
                const cleanedLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '').trim();
          
                // Use a regular expression to separate spread name and percentage
                const match = cleanedLine.match(/^([^:]+):\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)\s*([\d.]+)%$/);

                if (match) {
                  const natureName = match[1].trim();
                  const hp = parseFloat(match[2])
                  const atk = parseFloat(match[3])
                  const def = parseFloat(match[4])
                  const spAtk = parseFloat(match[5])
                  const spDef = parseFloat(match[6])
                  const spe = parseFloat(match[7])

                  const percentage = parseFloat(match[8].trim());
                
                  // Push the spread data to the array
                  spreadsArray.push({
                    nature: natureName,
                    hp: hp,
                    atk: atk,
                    def: def,
                    spAtk: spAtk,
                    spDef: spDef,
                    spe: spe,
                    percentage: percentage
                  });
                }
              }
            });
            // Push the spreads array to the main array
            spreadData.push(spreadsArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: spreadData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});
          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting spreads data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}

async function getCountersUsage(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const promises = tier.map((tierThreshold) => new Promise((resolveTier, rejectTier) => {
      const url = `https://www.smogon.com/stats/${snapshot}/moveset/${tierThreshold}.txt`;

      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const cleanedSnapshot = snapshot.replace('/', '');
          const bodyContent = $.text();

          let regex = /(?<=\+----------------------------------------\+\s*\n\s*\|\s*)([^|\n]+)(?=\s*\|\s*\n\s*\+----------------------------------------\+)/g;
          let match;
          let pokemonNames = []
          let counterData = [];

          while ((match = regex.exec(bodyContent)) !== null) {
            const extractedText = match[1].trim();
            const excludedValues = ["Abilities", "Items", "Spreads", "Moves", "Teammates", "Checks and Counters"];
          
            if (!excludedValues.includes(extractedText)) {
              pokemonNames.push(extractedText);
            }
          }
 

          const countersRegex = /\|\s*Checks and Counters\s*\|([\s\S]+?)\s*\+\-+/g;
          let countersMatch;
          
          while ((countersMatch = countersRegex.exec(bodyContent)) !== null) {
            const countersText = countersMatch[1].trim();
            const lines = countersText.split(/\n/);
            let countersArray = [];

          
            // Process each line
            for (let i = 0; i < lines.length; i += 2) {
              const line1 = lines[i];
              const line2 = lines[i + 1];
            
              // Combine the two lines and process the text
              const combinedText = line1 + '\n' + line2;

              const match = combinedText.trim().match(/[0-9]+(?:\.[0-9]+)?/g);
              const match2 = combinedText.match(/\|\s*([^|]+)\s+\d+\.\d+/);
              let counterName;
              let usageErrors;
              let errors;
              let koUsage;
              let switchUsage;

              if (match) {
                if(match2[1] === "Porygon2" || match2[1] === "Zygarde-10%"){ //Pokemon with NUMBERS!
                  counterName = match2[1].trim();
                  usageErrors = parseFloat(match[2]);
                  errors = parseFloat(match[3]);
                  koUsage = parseFloat(match[4]);
                  switchUsage = parseFloat(match[5]);
                }
                else {
                  counterName = match2[1].trim();
                  usageErrors = parseFloat(match[1]);
                  errors = parseFloat(match[2]);
                  koUsage = parseFloat(match[3]);
                  switchUsage = parseFloat(match[4]);
                }


                // Push the spread data to the array
                countersArray.push({
                  counterName:counterName,
                  usageErrors: usageErrors,
                  errors: errors,
                  koUsage: koUsage,
                  switchUsage: switchUsage,
              });
            }
          }
          counterData.push(countersArray);
          }

          const pokemonData = pokemonNames.reduce((result, key, index) => {
            result[key] = {
              usage: counterData[index],
              snapshot: snapshot.replace(/\//g, "") // Remove '/' characters
            };
            return result;
          }, {});
          resolveTier(pokemonData);
        } else {
          console.error(`Error extracting counters data for: ${tierThreshold} ${snapshot}`, error);
          resolveTier();
        }
      });
    }));

    Promise.all(promises)
      .then((results) => {
        // Concatenate the results from all tiers
        const concatenatedData = results.reduce((concatenated, tierData) => {
          for (const pokemonName in tierData) {
            if (concatenated[pokemonName]) {
              concatenated[pokemonName].usage += tierData[pokemonName].usage;
            } else {
              concatenated[pokemonName] = tierData[pokemonName];
            }
          }
          return concatenated;
        }, {});

        resolve(concatenatedData);
      })
      .catch((error) => {
        console.error('Error processing tier data', error);
        resolve();
      });
  });
}


async function processAllData() {
  // Fetch Pokemon attributes first
  await getPokemonAttributesFromPokedex();
  // Update the image numbers of forme mons
  await updateImageNumberOfFormeMons() 
  // Update the image X offset
  updatePokemonImageXOffset(); 
  // Update the image Y offset
  updatePokemonImageYOffset(); 
  // Then write the Pokedex
  await WritePokedex(); 

  for (const tier of tiers) {
    await extractAllUsageStats(tier);
    await extractAllAbilitiesStats(tier);
    await extractAllItemsUsage(tier);
    await extractAllMovesUsage(tier);
    await extractAllTeammatesUsage(tier);
    await extractAllSpreadsUsage(tier);
    await extractAllCountersUsage(tier);
    await getPokemonTypes(tier);
    await getPokemonStats(tier);
  }
  outputMetadataFile();
  getPokemonItemsData();
  await WriteItems();


}
processAllData();