const User = require("../../models/user.model");
const { verifyToken } = require("../../helper/jwt"); // jwt

module.exports.auth_middleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect(`/user/login`);
  }

  // jwt
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    return res.redirect(`/user/logout`);
  }

  const user = await User.findOne({
    _id: decoded.id,
    deleted: false,
  }).select("-password");

  res.locals.user = user;

  if (!user) {
    return res.redirect(`/user/logout`);
  }

  if (user.status === "inactive") {
    return res.redirect(`/user/logout`);
  }

  next();
};
