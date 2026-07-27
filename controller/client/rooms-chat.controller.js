const system_config = require("../../config/system");
const User = require("../../models/user.model");
const RoomChat = require("../../models/rooms-chat.model");
//[GET] /
module.exports.index = async (req, res) => {
  const userId = res.locals.user.id;
  const listRoomChat = await RoomChat.find({
    "users.user_id": userId,
    typeRoom: "group",
    deleted: false,
  });
  res.render("client/pages//rooms-chat/index", {
    pagetitle: "Phòng Chat",
    listRoomChat: listRoomChat,
  });
};

//[GET] /create
module.exports.create = async (req, res) => {
  const friendList = res.locals.user.friendList;
  for (const friend of friendList) {
    const infoFriend = await User.findOne({
      _id: friend.user_id,
      deleted: false,
    }).select("fullName avatar");
    friend.infoFriend = infoFriend;
  }
  res.render("client/pages//rooms-chat/create", {
    pagetitle: "Tạo Phòng",
    friendList: friendList,
  });
};

//[POST] /create
module.exports.create_post = async (req, res) => {
  const title = req.body.title;
  const usersId = req.body.usersId;
  const dataRoom = {
    title: title,
    typeRoom: "group",
    users: [],
  };
  for (const userId of usersId) {
    dataRoom.users.push({
      user_id: userId,
      role: "user",
    });
  }
  dataRoom.users.push({
    user_id: res.locals.user.id,
    role: "superAdmin",
  });
  const roomChat = new RoomChat(dataRoom);
  await roomChat.save();
  res.redirect(`/chat/${roomChat.id}`);
};
