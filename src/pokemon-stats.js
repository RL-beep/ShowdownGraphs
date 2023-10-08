// Store POkemon Attributes
const pokemonAttributes = {
  names: [],
  ImageNumbers: [],
  formes: [],
  imageOffsetX: [],
  imageOffsetY: []
};


//Define an array to store the pokemon image y offset
let AllPokemonImageY = [];

// Define the output file path
const outputPath = './smogon-stats.xls';
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
                'gen9nationaldexmonotype-1630'
              ];

const fs = require('fs');
const XLSX = require('xlsx');
const request = require('request');
const cheerio = require('cheerio');

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

      // Create a new XLSX workbook
      const workbook = XLSX.utils.book_new();

      // Create a worksheet with the desired name
      const sheetName = 'Pokedex';
      
      // Create an array of objects with 'Pokemon Name' and 'Pokemon Number' properties
      const dataToWrite = pokemonAttributes.names.map((name, index) => ({
        'Pokemon Name': name,
        'Pokemon Number': pokemonAttributes.ImageNumbers[index],
        'Pokemon Formes': pokemonAttributes.formes[index],
        'Pokemon Image Offset X': pokemonAttributes.imageOffsetX[index],
        'Pokemon Image Offset Y': pokemonAttributes.imageOffsetY[index]
      }));

      // Convert the array of objects to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToWrite);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Write the workbook to the XLSX file
      XLSX.writeFile(workbook, outputPath);

      console.log(`Pokedex Data has been written to ${outputPath}`);

      resolve(); // Resolve the promise when writing is done
    } catch (error) {
      reject(error); // Reject the promise if there's an error
    }
  });
}


function addPokemonDataToXLS(pokemonData, tier, snapshot) {
  try {
    // Load the existing XLSX workbook
    const workbook = XLSX.readFile(outputPath);

    // Check if the worksheet with the desired name (the tier) exists
    if (workbook.Sheets[tier]) {
      // If the worksheet exists, append all data at once
      const worksheet = workbook.Sheets[tier];
      const newRows = Object.entries(pokemonData).map(([pokemonName, data]) => ({
        'Pokemon Name': pokemonName,
        'Usage': data.usage,
        'Snapshot': data.snapshot,
        'Tier': data.tier,
      }));
      const header = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      const existingRows = XLSX.utils.sheet_to_json(worksheet, { header: header });
      const combinedRows = existingRows.concat(newRows);
      worksheet['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: header.length - 1, r: combinedRows.length } });
      XLSX.utils.sheet_add_json(worksheet, combinedRows, { skipHeader: true });
    } else {
      // If the worksheet doesn't exist, create a new worksheet
      const worksheet = XLSX.utils.json_to_sheet(
        Object.entries(pokemonData).map(([pokemonName, data]) => ({
          'Pokemon Name': pokemonName,
          'Usage': data.usage,
          'Snapshot': data.snapshot,
          'Tier': data.tier,
        }))
      );

      // Add the new worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, tier);
    }

    // Write the updated workbook back to the XLSX file
    XLSX.writeFile(workbook, outputPath);

    console.log(`Data for ${tier} ${snapshot} has been added to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing data for: ${tier} ${snapshot}`, error);
  }
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
              snapshot: `${cleanedSnapshot}`,
              tier: `${tier}`,
            };
          }

          // Check if each Pokémon in pokemonAttributes exists in pokemonData, and if not, add it with a usage of 0
          pokemonAttributes.names.forEach((pokemonName) => {
            if (!(pokemonName in pokemonData)) {
              pokemonData[pokemonName] = {
                usage: 0,
                snapshot: `${cleanedSnapshot}`,
                tier: `${tier}`,
              };
            }
          });

          addPokemonDataToXLS(pokemonData, tier, snapshot); // Add the data to the XLSX file
          resolve(); // Resolve the promise when processing is done
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

    //Order is important here, because the data is ordered
    await extractUsageStats('2022-11/', tier);
    await extractUsageStats('2022-12/', tier);
    await extractUsageStats('2023-01/', tier);
    await extractUsageStats('2023-02/', tier);
    await extractUsageStats('2023-03/', tier);
    await extractUsageStats('2023-04/', tier);
    await extractUsageStats('2023-05/', tier);
    await extractUsageStats('2023-06/', tier);
    await extractUsageStats('2023-07/', tier);
    await extractUsageStats('2023-08/', tier);
    await extractUsageStats('2023-09/', tier);
  }
}

processAllData();
