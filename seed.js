const mongoose = require("mongoose");
const axios = require("axios");
const Product = require("./models/productModel.js"); // adjust the path if needed

const insertDummyProducts = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://venky4u2005:venkatesh@ecommercewebsite.q6dmfzm.mongodb.net/?retryWrites=true&w=majority&appName=ecommercewebsite",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");

    const res = await axios.get("https://dummyjson.com/products");
    const dummyProducts = res.data.products;

    const productsToInsert = dummyProducts.map((p) => ({
      product_id: `dummy-${p.id}`,
      product_title: p.title,
      price: p.price,
      description: p.description,
      content: `More about ${p.title}`,
      images: { url: p.images[0] }, // assuming 1 image as per your schema
      category: p.category,
      checked: false,
      sold: 0,
    }));

    await Product.insertMany(productsToInsert);
    console.log("Dummy products inserted successfully!");

    process.exit();
  } catch (err) {
    console.error("❌ Error inserting products:", err);
    process.exit(1);
  }
};

insertDummyProducts();
