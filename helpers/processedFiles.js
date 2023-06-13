const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL_HEROKU, BASE_URL } =
  process.env;

// Функція для завантаження файлу на Google Диск
const uploadFileToDrive = async (auth, file) => {
  const drive = google.drive({ version: "v3", auth });

  const folderId = "easy-shoop"; // Замініть на свій ідентифікатор папки на Google Диск

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [folderId],
    },
    media: {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    },
  });

  // Повертаємо посилання на завантажений файл
  return response.data.webViewLink;
};

const processFile = async (auth, file) => {
  try {
    const fileURL = await uploadFileToDrive(auth, file);

    // Видаляємо локальний файл
    fs.unlinkSync(file.path);

    return fileURL;
  } catch (err) {
    throw err;
  }
};

const processedFiles = async (files, mainFileName) => {
  const auth = await google.auth.getClient({
    keyFile: GOOGLE_CLIENT_SECRET, // Замініть на шлях до вашого ключового файлу облікового запису служби
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  let mainFileURL = null;
  let additionalFilesUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (mainFileName && file.originalname === mainFileName) {
      mainFileURL = await processFile(auth, file);
    } else if (!mainFileName || (i === 0 && mainFileName)) {
      mainFileURL = await processFile(auth, file);
    } else {
      additionalFilesUrls.push(await processFile(auth, file));
    }
  }

  const result = {
    mainFileURL: mainFileURL,
    additionalFilesURL: additionalFilesUrls,
  };
  return result;
};

module.exports = processedFiles;

// const fs = require("fs");
// const { promisify } = require("util");

// const readFileAsync = promisify(fs.readFile);
// const unlinkAsync = promisify(fs.unlink);

// const processFile = async (file) => {
//   try {
//     const data = await readFileAsync(file.path, "base64");
//     const imgURL = `data:${file.mimetype};base64,${data}`;
//     await unlinkAsync(file.path);
//     return imgURL;
//   } catch (err) {
//     throw err;
//   }
// };

// const processedFiles = async (files, mainFileName) => {
//   let mainFileURL = null;
//   let additionalFilesUrls = [];

//   for (let i = 0; i < files.length; i++) {
//     const file = files[i];

//     if (mainFileName && file.originalname === mainFileName) {
//       mainFileURL = await processFile(file);
//     } else if (!mainFileName || (i === 0 && mainFileName)) {
//       mainFileURL = await processFile(file);
//     } else {
//       additionalFilesUrls.push(await processFile(file));
//     }
//   }

//   const result = {
//     mainFileURL: mainFileURL,
//     additionalFilesURL: additionalFilesUrls,
//   };
//   return result;
// };

// module.exports = processedFiles;
