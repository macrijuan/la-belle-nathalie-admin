const { Router } = require("express");
const router = Router();

//update user's email
const emailManagment = require("./email/index.js");
//update user's password
const passwordManagment = require("./password/index.js");
//update user's common data
const updateNames = require( "./update_names.js" );



router.use( "/update", passwordManagment, emailManagment, updateNames );

module.exports = router;