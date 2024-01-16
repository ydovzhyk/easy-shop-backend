const updateLink = async (id) => {
  async function extractUniqueIdFromLink(link) {
    const match = link.match(/id=([^&]+)/);
    const match2 = link.match(/\/d\/([^/]+)/);
    return match ? match[1] : match2[1];
  }

  const changeProduct = await Product.findOne({
    _id: id,
  });

  const newMainPhotoUrl = `https://lh3.googleusercontent.com/d/${await extractUniqueIdFromLink(
    changeProduct.mainPhotoUrl
  )}`;

  const oldAdditionalPhotoUrl = changeProduct.additionalPhotoUrl;
  const newAdditionalPhotoUrl = await Promise.all(
    oldAdditionalPhotoUrl.map(
      async (link) =>
        `https://lh3.googleusercontent.com/d/${await extractUniqueIdFromLink(
          link
        )}`
    )
  );

  changeProduct.mainPhotoUrl = newMainPhotoUrl;
  changeProduct.additionalPhotoUrl = newAdditionalPhotoUrl;

  await changeProduct.save();
};

async function updateAllProducts() {
  try {
    const allProducts = await Product.find();

    await Promise.all(
      allProducts.map(async (product) => {
        await updateLink(product._id);
      })
    );

    console.log("All products updated successfully.");
  } catch (error) {
    console.error("Error updating products:", error);
  }
}

updateAllProducts();
