const fs = require("fs");
const { bucket } = require("../firebaseConfig");

const createLink = async (files, mainFileName) => {
  let mainFileURL = "";
  let additionalFilesURLs = [];

  const mainImageFile = files.find(
    (file) => file.originalname === mainFileName
  );

  try {
    if (files.length === 1 && mainFileName) {
      const mainImageStorageFile = bucket.file(
        `shafa-products/images/${Date.now()}_${mainImageFile.originalname}`
      );
      await mainImageStorageFile.save(fs.readFileSync(mainImageFile.path));
      mainFileURL = await mainImageStorageFile.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      mainFileURL = mainFileURL[0];
    } else if (files.length > 0 && !mainFileName) {
      const imageUploadPromises = files.map(async (file) => {
        const storageFile = bucket.file(
          `shafa-products/images/${Date.now()}_${file.originalname}`
        );
        await storageFile.save(fs.readFileSync(file.path));
        const imageUrl = await storageFile.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });
        return imageUrl[0];
      });

      additionalFilesURLs = await Promise.all(imageUploadPromises);
    } else {
      const mainImageStorageFile = bucket.file(
        `shafa-products/images/${Date.now()}_${mainImageFile.originalname}`
      );
      await mainImageStorageFile.save(fs.readFileSync(mainImageFile.path));
      mainFileURL = await mainImageStorageFile.getSignedUrl({
        action: "read",
        expires: "03-01-2500",
      });
      mainFileURL = mainFileURL[0];

      const imageUploadPromises = files
        .filter((file) => file !== mainImageFile)
        .map(async (file) => {
          const storageFile = bucket.file(
            `shafa-products/images/${Date.now()}_${file.originalname}`
          );
          await storageFile.save(fs.readFileSync(file.path));
          const imageUrl = await storageFile.getSignedUrl({
            action: "read",
            expires: "03-01-2500",
          });
          return imageUrl[0];
        });

      additionalFilesURLs = await Promise.all(imageUploadPromises);
    }
  } catch (error) {
    console.error("Error during file processing:", error);
  } finally {
    files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`Error to delete file ${file.path}:`, err);
        }
      });
    });
  }

  console.log(mainFileURL, additionalFilesURLs);
  return { mainFileURL, additionalFilesURLs };
};

module.exports = createLink;
