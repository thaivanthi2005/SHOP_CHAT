const Product = require("../../models/roles.model");
const system_config = require("../../config/system");
const settings_general = require("../../models/settings_general");
//[GET] /admin/settings/general
module.exports.index = async (req, res) => {
  const settingsGeneral = await settings_general.findOne({});
  res.render("admin/pages/settings/general", {
    pagetitle: "Cài Đặt Chung",
    settings: settingsGeneral,
  });
};

module.exports.settingGeneralPOST = async (req, res) => {
  const settingsGeneral = await settings_general.findOne({});
  console.log(settingsGeneral);
  console.log(req.body);

  if (settingsGeneral) {
    await settingsGeneral.updateOne(
      {
        _id: settingsGeneral._id,
      },
      req.body,
    );
    console.log(kkkk);
  } else {
    const settingsGeneralNew = new settings_general(req.body);
    settingsGeneralNew.save();
  }

  res.redirect(`${system_config.prefixAdmin}/settings/general`);
};
