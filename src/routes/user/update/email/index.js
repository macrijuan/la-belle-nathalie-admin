const { Router } = require("express");
const router = Router();

const reqEmailUpdate = require("./email_update_request.js");
const confirmCurrentEmailOwnerShip = require("./confirm_current_email_ownership.js");
const confirmNewEmailOwnerShip = require("./confirm_new_email_ownership.js");


router.use( "/email", reqEmailUpdate, confirmCurrentEmailOwnerShip, confirmNewEmailOwnerShip );

module.exports = router;