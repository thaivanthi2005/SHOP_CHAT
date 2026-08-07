const accounts = require("../../models/accounts.model");
const system_config = require("../../config/system");
const roles = require("../../models/roles.model");
const bcrypt = require("bcrypt");

module.exports.accounts = async (req, res) => {
  let find = {
    deleted: false,
  };
  const account = await accounts.find(find);
  res.render("admin/pages/accounts/index", {
    pagetitle: "Tài khoản",
    accounts: account,
  });
};

// -------- GET create -------
module.exports.create = async (req, res) => {
  let find = {
    delete: false,
  };
  const role = await roles.find(find);
  res.render("admin/pages/accounts/create", {
    pagetitle: "Tạo tài khoản",
    roles1: role,
  });
};

// -------- POST create -------
module.exports.create_post = async (req, res) => {
  req.body.password = await bcrypt.hash(req.body.password, 10);
  const record = new accounts(req.body);
  await record.save();
  res.redirect(`${system_config.prefixAdmin}/accounts`);
};

// -------- GET create -------
module.exports.detail = async (req, res) => {
  let find = {
    _id: req.params.id,
  };
  const account = await accounts.findOne(find);
  res.render("admin/pages/accounts/detail", {
    account: account,
    pagetitle: "Chi tiết tài khoản",
  });
};

// -------- GET edit -------
module.exports.edit = async (req, res) => {
  let find = {
    _id: req.params.id,
  };
  const account = await accounts.findOne(find);
  const role = await roles.find({
    delete: false,
  });
  res.render("admin/pages/accounts/edit", {
    account: account,
    pagetitle: "Cập nhật tài khoản",
    roles1: role,
  });
};

// -------- PATCH edit -------
module.exports.edit_patch = async (req, res) => {
  let find = {
    _id: req.params.id,
  };
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  } else {
    delete req.body.password;
  }
  await accounts.findOne(find).updateOne(req.body);
  res.redirect(`${system_config.prefixAdmin}/accounts`);
};
