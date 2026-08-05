const accounts = require("../../models/accounts.model");
const system_config = require("../../config/system");
const roles = require("../../models/roles.model");
const bcrypt = require("bcrypt");

// -------------- GET login -----------------
module.exports.auth_login = async (req, res) => {
  res.render("admin/pages/auth/login", {
    pagetitle: "Đăng nhập",
  });
};

// -------------- POST login -----------------
module.exports.auth_login_post = async (req, res) => {
  console.log(req.body);
  const password = req.body.password;
  const email = req.body.email;
  const user = await accounts.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    req.session.error = ["Tài Khoản Không Tồn Tại"];
    res.redirect(req.get("referer"));
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.error = ["Mật Khẩu Không Đúng!"];
      res.redirect(req.get("referer"));
    } else {
      if (user.status == "inactive") {
        req.session.error = ["Tài Khoản Không còn hoạt động !"];
        res.redirect(req.get("referer"));
      } else {
        res.cookie("token", user.token);
        res.redirect(`${system_config.prefixAdmin}/dashboard`);
      }
    }
  }
};

module.exports.auth_logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`${system_config.prefixAdmin}/auth/login`);
};
