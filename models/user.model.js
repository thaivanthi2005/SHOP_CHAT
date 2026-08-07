const mongoose = require("mongoose");
const generate = require("../helper/generate");

const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
      type: String,
      default: () => generate.generateRandomString(20),
    },
    phone: String,
    avatar: String,
    status: {
      type: String,
      default: "active",
    },
    requestFriends: Array,
    acceptFriends: Array,
    statusOnline: String,
    friendList: [
      {
        user_id: String,
        room_chat_id: String,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", accountSchema, "users");
module.exports = User;
