const { google } = require("googleapis");
const stream = require("stream");
const fs = require("fs");
// const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  GOOGLE_DRIVE_REDIRECT_URI,
  GOOGLE_DRIVE_CLIENT_SECRET,
  GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_REFRESH_TOKEN,
} = process.env;

const credentials = {
  client_id: GOOGLE_DRIVE_CLIENT_ID,
  client_secret: GOOGLE_DRIVE_CLIENT_SECRET,
  redirect_uri: GOOGLE_DRIVE_REDIRECT_URI,
  refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN,
};

const authenticate = async () => {
  const auth = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uri
  );
  auth.setCredentials({ refresh_token: credentials.refresh_token });
  return auth;
};

const uploadFileToDrive = async (file, auth) => {
  // get folderId on Google Drive
  // const folderId = "1e5T56uSL0YCl-6dkqTKkBUj1MdpXJKnY";
  let folderId = null;
  const folderName = "easy-shoop";
  const drive = google.drive({ version: "v3", auth });
  const response = await drive.files.list({
    q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder'`,
    fields: "files(id, name)",
  });
  if (response.data.files.length > 0) {
    folderId = response.data.files[0].id;
  } else {
    folderId = null;
  }

  console.log("folderId", folderId);

  // upload file to Google Drive
  try {
    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = file.path;
    const fileMimeType = file.mimetype;
    const drive = google.drive({ version: "v3", auth });
    const { data } = await drive.files.create({
      media: {
        mimeType: fileMimeType,
        body: fs.createReadStream(filePath),
      },
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      fields: "id,name",
    });

    // create direct Link to image
    const fileId = data.id;
    // const imageLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
    // const imageLink = `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;
    const imageLink = `https://drive.google.com/uc?id=${fileId}`;
    return imageLink;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const processFile = async (file) => {
  try {
    const auth = await authenticate();
    const fileURL = await uploadFileToDrive(file, auth);
    fs.unlinkSync(file.path);
    return fileURL;
  } catch (err) {
    throw err;
  }
};

const processedFiles = async (files, mainFileName) => {
  let mainFileURL = null;
  let additionalFilesURLs = [];

  if (files.length === 1 && mainFileName) {
    mainFileURL = await processFile(files[0]);
  } else if (files.length > 0 && !mainFileName) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      additionalFilesURLs.push(await processFile(file));
    }
  } else {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (mainFileName && file.originalname === mainFileName) {
        mainFileURL = await processFile(file);
      } else if (!mainFileName && i === 0) {
        mainFileURL = await processFile(file);
      } else {
        additionalFilesURLs.push(await processFile(file));
      }
    }
  }
  return { mainFileURL, additionalFilesURLs };
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
