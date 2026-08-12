const accounts = require("../../models/accounts.model");
const system_config = require("../../config/system");
const roles = require("../../models/roles.model");
const bcrypt = require("bcrypt");
const generate = require("../../helper/generate");
const { generateToken, verifyToken } = require("../../helper/jwt");

const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
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
    const bcrypt_pass = await bcrypt.compare(password, user.password);
    console.log(bcrypt_pass);
    if (!bcrypt_pass) {
      req.session.error = ["Mật Khẩu Không Đúng!"];
      res.redirect(req.get("referer"));
    } else {
      if (user.status == "inactive") {
        req.session.error = ["Tài Khoản Không còn hoạt động !"];
        res.redirect(req.get("referer"));
      } else {
        // jwt
        const token = generateToken({ id: user.id, email: user.email });
        res.cookie("token", token, COOKIE_OPTIONS);
        res.redirect(`${system_config.prefixAdmin}/dashboard`);
      }
    }
  }
};

module.exports.auth_logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`${system_config.prefixAdmin}/auth/login`);
};
