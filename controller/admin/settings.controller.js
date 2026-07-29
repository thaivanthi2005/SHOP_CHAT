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

  if (settingsGeneral) {
    console.log(settingsGeneral.id);
    await settings_general.updateOne(
      {
        _id: settingsGeneral.id,
      },
      req.body,
    );
  } else {
    const settingsGeneralNew = new settings_general(req.body);
    settingsGeneralNew.save();
  }
  res.redirect(`${system_config.prefixAdmin}/settings/general`);
};
