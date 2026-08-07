const accounts = require("../models/accounts.model");
const system_config = require("../config/system");
const roles = require("../models/roles.model");

module.exports.auth_middleware = async (req, res, next) => {
  if (!req.cookies.token) {
    res.redirect(`${system_config.prefixAdmin}/auth/login`);
  } else {
    const user = await accounts
      .findOne({
        token: req.cookies.token,
        deleted: false,
      })
      .select("-password");
    const roles1 = await roles.findOne({
      _id: user.role_id,
      delete: false,
    });
    res.locals.user = user;
    res.locals.roles = roles1;
    if (!user) {
      res.redirect(`${system_config.prefixAdmin}/auth/logout`);
    } else {
      if (user.status == "inactive") {
        res.redirect(`${system_config.prefixAdmin}/auth/logout`);
      } else {
        next();
      }
    }
  }
};
