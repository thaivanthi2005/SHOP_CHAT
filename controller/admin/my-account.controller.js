const roles = require("../../models/roles.model");
const system_config = require("../../config/system");
const accounts = require("../../models/accounts.model");
var md5 = require("md5");

module.exports.index = async (req, res) => {
  res.render("admin/pages/my-account/index.pug", {
    role: roles,
    pagetitle: "MY ACCOUNT",
  });
};

// --------------------- GET edit----------------------
module.exports.edit = async (req, res) => {
  res.render("admin/pages/my-account/edit.pug", {
    pagetitle: "Chỉnh Sửa Tài Khoản",
  });
};

// --------------------- PATCH edit----------------------

module.exports.edit_path = async (req, res) => {
  let find = {
    _id: res.locals.user.id,
  };
  req.body.password = md5(req.body.password);
  await accounts.findOne(find).updateOne(req.body);
  res.redirect(`${system_config.prefixAdmin}/my-account/edit`);
};
