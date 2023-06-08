const fs = require("fs");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

const processFile = async (file) => {
  try {
    const data = await readFileAsync(file.path, "base64");
    const imgURL = `data:${file.mimetype};base64,${data}`;
    await unlinkAsync(file.path);
    return imgURL;
  } catch (err) {
    throw err;
  }
};

const processedFiles = async (files, mainFileName) => {
  let mainFileURL = null;
  let additionalFilesUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (mainFileName && file.originalname === mainFileName) {
      mainFileURL = await processFile(file);
    } else if (!mainFileName || (i === 0 && mainFileName)) {
      mainFileURL = await processFile(file);
    } else {
      additionalFilesUrls.push(await processFile(file));
    }
  }

  const result = {
    mainFileURL: mainFileURL,
    additionalFilesURL: additionalFilesUrls,
  };
  return result;
};

module.exports = processedFiles;
