const { Router } = require("express");
const router = Router();

const signUpRequest = require("./sign_up_request.js");
const signUp = require("./sign_up.js");

router.use( "/admin/post_admin", signUpRequest, signUp );

module.exports = router;