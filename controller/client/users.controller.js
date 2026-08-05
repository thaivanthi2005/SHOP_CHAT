const Product = require("../../models/products.model");
const Category = require("../../models/category.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password");
const generateHelper = require("../../helper/generate");
const sendMailHelper = require("../../helper/sendMail");
const usersSocket = require("../../sockets/client/users.socket");

//[GET] /users/not-friend
module.exports.notFriend = async (req, res) => {
  //Socket
  usersSocket(res);
  //END Socket
  const userId = res.locals.user.id;
  const myuser = await User.findOne({
    _id: userId,
  });
  const requestFriends = myuser.requestFriends;
  const acceptFriends = myuser.acceptFriends;
  const friendList = myuser.friendList;
  const friendListId = friendList.map((item) => item.user_id);
  const users = await User.find({
    $and: [
      { _id: { $ne: userId } },
      { _id: { $nin: requestFriends } },
      { _id: { $nin: acceptFriends } },
      { _id: { $nin: friendListId } },
    ],
    status: "active",
    deleted: false,
  }).select("id avatar fullName");
  res.render("client/pages/users/not-friend", {
    pagetitle: "DANH SÁCH NGƯỜI DÙNG",
    users: users,
  });
};

//[GET] /users/requests

module.exports.requests = async (req, res) => {
  //Socket
  usersSocket(res);
  //END Socket
  const userId = res.locals.user.id;
  const myuser = await User.findOne({
    _id: userId,
  });
  const requestFriends = myuser.requestFriends;
  const acceptFriends = myuser.acceptFriends;
  const users = await User.find({
    _id: { $in: requestFriends },
    status: "active",
    deleted: false,
  }).select("id avatar fullName");
  res.render("client/pages/users/requests", {
    pagetitle: "Lời Mời Đã Gửi",
    users: users,
  });
};

//[GET] /users/accept

module.exports.accept = async (req, res) => {
  //Socket
  usersSocket(res);
  //END Socket
  const userId = res.locals.user.id;
  const myuser = await User.findOne({
    _id: userId,
  });
  const requestFriends = myuser.requestFriends;
  const acceptFriends = myuser.acceptFriends;
  const users = await User.find({
    _id: { $in: acceptFriends },
    status: "active",
    deleted: false,
  }).select("id avatar fullName acceptFriends");
  res.render("client/pages/users/accept", {
    pagetitle: "Lời Mời Đã Gửi",
    users: users,
  });
};

//[GET] /users/friends
module.exports.friends = async (req, res) => {
  //Socket
  usersSocket(res);
  //END Socket
  const userId = res.locals.user.id;
  const myuser = await User.findOne({
    _id: userId,
  });
  const friendList = myuser.friendList;
  const friendListId = friendList.map((item) => item.user_id);
  const users = await User.find({
    _id: { $in: friendListId },
    status: "active",
    deleted: false,
  }).select("id avatar fullName statusOnline");
  for (const user of users) {
    const infoFriend = friendList.find((friend) => friend.user_id == user.id);
    user.infoFriend = infoFriend;
  }
  res.render("client/pages/users/friends", {
    pagetitle: "Danh Sách Bạn Bè",
    users: users,
  });
};
