const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/category.controller");
const middleware = require("../../middleware/upload.middleware");
const multer = require("multer");
const fileUpload = multer();
router.get("/", controller.category);
router.get("/create", controller.category_create);
router.post(
  "/create",
  fileUpload.single("thumbnail"),
  controller.category_create_post,
);
router.get("/edit/:id", controller.category_edit);
router.patch(
  "/edit/:id",
  fileUpload.single("thumbnail"),
  middleware.upload_images,
  controller.category_edit_patch,
);
router.get("/delete/:id", controller.category_delete);
module.exports = router;
