const User = require("../../models/user.model");
const { verifyToken } = require("../../helper/jwt");

module.exports.infoUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      // jwt
      const decoded = verifyToken(token);
      const user = await User.findOne({
        _id: decoded.id,
        deleted: false,
        status: "active",
      }).select("-password");

      if (user) {
        res.locals.user = user;
      }
    } catch (error) {}
  }

  next();
};
