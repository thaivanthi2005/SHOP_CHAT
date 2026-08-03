const mongoose = require("mongoose");
slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const product_schema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  discountPercentage: Number,
  product_category_id: String,
  stock: Number,
  thumbnail: String,
  status: String,
  featured: String,
  rating: Number,
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },

  delete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    account_id: {
      type: String,
    },
    createdAt: {
      type: String,
      default: Date.now,
    },
  },
  deletedBy: {
    account_id: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  updatedBy: [
    {
      account_id: {
        type: String,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  position: Number,
});
const Product = mongoose.model("Product", product_schema, "project1");
module.exports = Product;
