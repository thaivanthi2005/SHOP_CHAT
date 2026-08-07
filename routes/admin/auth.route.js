const express = require("express");
const router = express.Router();
const controller = require("../../controller/admin/auth.controller");
const middleware = require("../../middleware/upload.middleware");
const multer = require("multer");
const fileUpload = multer();
const validate = require("../../validate/admin/auth.validate");

router.get("/login", controller.auth_login);
router.post("/login", validate.login_Post, controller.auth_login_post);
router.get("/logout", controller.auth_logout);

module.exports = router;
