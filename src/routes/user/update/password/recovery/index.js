const { Router } = require("express");
const router = Router();

//not signed in
const recoveryPasswordReq = require("./password_recovery_request.js");
const confirmPasswordRecovery = require("./confirm_password_recovery.js");

router.use( "/user/password_recovery", recoveryPasswordReq, confirmPasswordRecovery );

module.exports = router;