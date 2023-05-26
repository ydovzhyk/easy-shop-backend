const fs = require("fs");
const path = require("path");

const tempDir = "../temp"; // Вкажіть шлях до тимчасової папки
const tempFiles = fs.readdirSync(tempDir);

const processedFiles = () => {
  console.log("Зайшли обрибити файли");
  const imgURLs = tempFiles.map((file) => {
    const filePath = path.join(tempDir, file);
    const img = fs.readFileSync(filePath, "base64");
    const final_img = {
      contentType: "image/png",
      image: Buffer.from(img, "base64"),
    };
    const imgURL =
      "data:image/png;base64," +
      Buffer.from(final_img.image).toString("base64");

    fs.unlinkSync(filePath);

    return imgURL;
  });

  return imgURLs;
};

module.exports = processedFiles;
