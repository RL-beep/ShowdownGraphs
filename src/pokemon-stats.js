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
                'gen9ubers-1630',
                'gen9ou-1695',
                'gen9uu-1630',
                'gen9ru-1630',
                'gen9nu-1630',
                'gen9pu-1630',
                'gen9zu-1630',
                'gen9lc-1630',
                'gen9monotype-1630',
                'gen9nationaldex-1630',
                'gen9nationaldexmonotype-1630',
                'gen9doublesou-1695',
                'gen9doublesuu-1630'
              ];

const snapshots = [
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
                '2023-09/'
]

const fs = require('fs');
const Papa = require('papaparse'); // Import the papaparse library
const request = require('request');
const cheerio = require('cheerio');

function outputMetadataFile() {

  const csvData = [['Sheets'], ...tiers.map((tier) => [tier])];

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

      "Primal",
      //Deoxys Forms
      "Attack","Defense","Speed",

      "Sunshine","Origin","Blue-Striped","White-Striped",
      "Zen","Galar-Zen","Resolute","Pirouette",
      //Genesect Forms
      "Douse","Shock","Burn","Chill",

      "Bond","Ash","Fancy","Pokeball","Eternal","Blade","Neutral","Complete","Totem","School","Meteor",
      "Busted","Busted-Totem","Original","Gulping","Gorging","Low-Key","Low-Key-Gmax","Antique",
      "Noice","Hangry","Eternamax","Rapid-Strike-Gmax","Dada","Four","Blue","Yellow","Hero",
      "Three-Segment","Roaming","Artisan","Masterpiece","Teal-Tera","Wellspring-Tera","Hearthflame-Tera",
      "Cornerstone-Tera","CAP"];

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
  const outputPath = `ShowdownGraphs/files/${tier}.csv`;

  try {
    // Write the CSV data to the file
    fs.writeFileSync(outputPath, csv);
    console.log(`CSV file written successfully for ${tier}`);
  } catch (err) {
    console.error(`CSV file FAILED for ${tier}`, err);
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


async function extractUsageStats(snapshot, tier) {
  return new Promise(async (resolve, reject) => {
    const url = `https://www.smogon.com/stats/${snapshot}/${tier}.txt`;
    try {
    
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          // Parse the HTML content of the page using Cheerio
          const $ = cheerio.load(html);
          // Remove the dash character from the snapshot
          const cleanedSnapshot = snapshot.replace('/', '');

          // Find the body content of the page
          const bodyContent = $.text();
          // Use regular expressions to extract Pokémon names and their usage rates
          const regex = /\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([\d.]+%)\s*\|\s*(\d+)\s*\|\s*([\d.]+%)\s*\|\s*(\d+)\s*\|\s*([\d.]+%)\s*\|/g;
          const pokemonData = {};

          let match;
          while ((match = regex.exec(bodyContent)) !== null) {
            const pokemonName = match[2].trim();
            const usageRate = parseFloat(match[3]);

            // Store the data in an object
            pokemonData[pokemonName] = {
              usage: usageRate,
              snapshot: `${cleanedSnapshot}`
            };
          }

          // Check if each Pokémon in pokemonAttributes exists in pokemonData, and if not, add it with a usage of 0
          pokemonAttributes.names.forEach((pokemonName) => {
            if (!(pokemonName in pokemonData)) {
              pokemonData[pokemonName] = {
                usage: 0,
                snapshot: `${cleanedSnapshot}`
              };
            }
          });

          resolve(pokemonData); // Resolve the promise when processing is done
        } else {
          console.error(`Error extracting data for: ${tier} ${snapshot}`, error);
          resolve(); // Resolve the promise to continue processing other promises
        }
      });
    } catch (error) {
      console.error(`Error in extractUsageStats for: ${tier} ${snapshot}`, error);
      resolve(); // Resolve the promise to continue processing other promises
    }
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


async function processAllData() {
  await getPokemonAttributesFromPokedex(); // Fetch Pokemon attributes first
  await updateImageNumberOfFormeMons()  // Update the image numbers of forme mons
  updatePokemonImageXOffset(); // Update the image X offset
  updatePokemonImageYOffset(); // Update the image Y offset

  await WritePokedex(); // Then write the Pokedex

  for (const tier of tiers) {
    await extractAllUsageStats(tier);
  }
  outputMetadataFile();
}
processAllData();