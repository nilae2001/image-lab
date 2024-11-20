const path = require("path");
const readline = require('readline-sync');


const { unzip, readDir, grayScale }  = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "filtered");

async function main() {
   await unzip(zipFilePath, pathUnzipped);
   console.log(`Extraction operation complete`);
   
   const pictureArray = await readDir(pathUnzipped);
   console.log("Array created");
   
   const colorChoice = readline.question("Choose a filter (grayscale, sepia, inverted): ");
   await grayScale(pictureArray, pathProcessed, colorChoice);
   console.log("Filter applied");
}

main();