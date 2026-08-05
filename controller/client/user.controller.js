const Product = require("../../models/products.model");
const Category = require("../../models/category.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password");
const generateHelper = require("../../helper/generate");
const sendMailHelper = require("../../helper/sendMail");
const bcrypt = require("bcrypt");

//[GET] /user/register
module.exports.indexRegister = async (req, res) => {
  res.render("client/pages/user/register", {
    pagetitle: "Đăng Ký",
  });
};
// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
  });
  if (existEmail) {
    req.session.error = ["EMAIL ĐÃ TỒN TẠI"];
    res.redirect(req.get("referer"));
    return;
  }
  req.body.password = await bcrypt.hash(req.body.password, 10);
  const user = new User(req.body);
  await user.save();
  res.cookie("tokenUser", user.tokenUser);
  res.redirect(`/`);
};

//[GET] /user/login
module.exports.indexLogin = async (req, res) => {
  res.render("client/pages/user/login", {
    pagetitle: "Đăng Nhập",
  });
};
// [POST] /user/loginpost
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    req.session.error = ["EMAIL KO TỒN TẠI"];
    res.redirect(req.get("referer"));
    return;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.session.error = ["SAI MẬT KHẨU"];
    res.redirect(req.get("referer"));
    return;
  }
  if (user.password === "inactive") {
    req.session.error = ["TÀI KHOẢN ĐÃ BỊ KHÓA "];
    res.redirect(req.get("referer"));
    return;
  }
  // tự thêm
  await Cart.updateOne(
    {
      _id: req.cookies.cartId,
    },
    {
      user_id: user.id,
    },
  );
  const test_user = await Cart.findOne({
    user_id: user.id,
  });

  if (req.cookies.cartId != test_user.id) {
    res.cookie("cartId", test_user.id);
  }
  // end tự thêm
  res.cookie("tokenUser", user.tokenUser);
  await User.updateOne(
    { tokenUser: user.tokenUser },
    { statusOnline: "online" },
  );

  _io.once("connection", (socket) => {
    socket.broadcast.emit("SERVER_RETURN_USER_ONLINE", user.id);
  });
  res.redirect(`/`);
};

//[GET] / user / logout;
module.exports.logout = async (req, res) => {
  await User.updateOne(
    { tokenUser: req.cookies.tokenUser },
    { statusOnline: "offline" },
  );
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");
  res.redirect(req.get("referer"));
};

// [GET] /password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pagetitle: "Quên mật khẩu",
  });
};

// [POST] /password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    req.session.error = ["EMAIL KO TỒN TẠI"];
    res.redirect(req.get("referer"));
    return;
  }
  const otp = generateHelper.generateRandomNumber(8);
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expiresAt: Date.now(),
  };
  // console.log(objectForgotPassword);
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  // Gửi OTP qua email
  const subject = "Mã OTP xác thực đổi mật khẩu";
  const html = `
    <h3>Xin chào ${user.fullName || email},</h3>
    <p>Mã OTP của bạn là: <b style="font-size: 24px;">${otp}</b></p>
    <p>Mã có hiệu lực trong <b>5 phút</b>. Vui lòng không chia sẻ mã này với ai.</p>
    <p>Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
  `;

  await sendMailHelper.sendMail(email, subject, html);
  res.redirect(`/user/password/otp/?email=${email}`);
};

// [GET] /password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;
  res.render("client/pages/user/otp-password", {
    pagetitle: "Nhập mã OTP",
    email: email,
  });
};

// [POST] /password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });
  if (!result) {
    req.session.error = ["OTP KO HỢP LỆ"];
    res.redirect(req.get("referer"));
    return;
  }
  const user = await User.findOne({
    email: email,
  });
  res.cookie("tokenUser", user.tokenUser);
  res.redirect("/user/password/reset");
};

//[GET]  /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pagetitle: "Nhập mật khẩu mới ",
  });
};
//[GET]  /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;
  await User.updateOne(
    { tokenUser: tokenUser },
    {
      password: await bcrypt.hash(password, 10),
    },
  );
  res.redirect("/");
};

//[GET]  /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pagetitle: "THONG TIN TAI KHOAN ",
  });
};
//[POST]  /user/info/update
module.exports.info_update = async (req, res) => {
  const tokenUser = req.cookies.tokenUser;
  await User.updateOne({ tokenUser: tokenUser }, req.body);
  res.redirect("/user/info");
};
