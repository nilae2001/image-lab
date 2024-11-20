const fs = require("node:fs/promises");
const { createReadStream, createWriteStream } = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const yauzl = require('yauzl-promise'),
  {pipeline} = require('stream/promises');


  const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    try {
      await fs.stat(pathOut);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.mkdir(pathOut, { recursive: true });
      } 
    }
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.mkdir(`${pathOut}/${entry.filename}`, { recursive: true });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
  }
}

const readDir = async (dir) => {
  let array = [];

  try {

  const items = await fs.readdir(dir)
  
  for (file of items) {
    if (file.endsWith(".png")) {
      const filePath = path.join(dir, file);
      array.push(filePath);
    }
  }

  return array;
} catch (error) {
  console.error(error);
}
};


const grayScale = async (pathIn, pathOut, filterChoice) => {
  try {
  for (const picture of pathIn) {
    await new Promise((resolve, reject) => {
      createReadStream(picture)
        .pipe(
          new PNG({
            filterType: 4,
          })
        )
        .on("parsed", async function () {
          for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
              let idx = (this.width * y + x) << 2;

              const colorChoice = filterChoice.toLowerCase();
              const filter = await filterImage(colorChoice, this, idx);

              this.data[idx] = filter.newR;
              this.data[idx + 1] = filter.newG;
              this.data[idx + 2] = filter.newB;
              
          }
        }

      let image = "in.png";
      let counter = 1;

      try {
        await fs.stat(pathOut);
      } catch (err) {
        if (err.code === "ENOENT") {
          await fs.mkdir(pathOut, { recursive: true });
        } 
      }

      let readGrayscale = await fs.readdir(pathOut);

      while (readGrayscale.includes(image)) {
        image = `in${counter}.png`
        counter++;
      }

      const output = path.join(pathOut, image);


      this.pack().pipe(createWriteStream(output))
        .on('finish', resolve)
        .on('error', reject);  
          })
            .on('error', reject);  
       });
    }
  } catch (error) {
  console.error(error.message)
  }
};

const filterImage = async (colorChoice, info, idx) => {

      let oldR = info.data[idx];
      let oldG = info.data[idx + 1];
      let oldB = info.data[idx + 2];

  try {
    
    if (colorChoice === "grayscale") {
      let newR = (oldR*0.3) + (oldG*0.59) + (oldB*0.11);
      let newG = (oldR*0.3) + (oldG*0.59) + (oldB*0.11);
      let newB = (oldR*0.3) + (oldG*0.59) + (oldB*0.11);
    
      return { newR, newG, newB };
    
    } else if (colorChoice === "inverted") {

      let newR = 255 - oldR;
      let newG = 255 - oldG;
      let newB = 255 - oldB;

      return { newR, newG, newB };

    } else if (colorChoice === "sepia") {

      let newR = Math.min(255, ((0.393*oldR) + (0.769*oldG) + (0.189*oldB)));
      let newG = Math.min(255, ((0.349*oldR) + (0.686*oldG) + (0.168*oldB)));
      let newB = Math.min(255, ((0.272*oldR) + (0.534*oldG) + (0.131*oldB)));

      return { newR, newG, newB };
    }
  } catch (error) {
    console.error(error.message);
  }
}


module.exports = {
  unzip,
  readDir,
  grayScale,
};
