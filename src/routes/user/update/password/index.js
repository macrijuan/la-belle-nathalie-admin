const { Router } = require("express");
const router = Router();

//signed in
const reqPasswordUpdate = require("./password_update_request.js");
const confirmPasswordUpdate = require("./confirm_password_update.js");


router.use( "/password", reqPasswordUpdate, confirmPasswordUpdate );

module.exports = router;