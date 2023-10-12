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
                '2023-09/'
]

const fs = require('fs');
const Papa = require('papaparse'); // Import the papaparse library
const request = require('request');
const cheerio = require('cheerio');

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