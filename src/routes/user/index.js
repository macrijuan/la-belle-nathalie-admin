const { Router } = require("express");
const router = Router();
const getUsers = require("./get_users.js");
const updateUser = require("./update/index.js");
const deleteUser = require("./delete/delete_user.js");
const signOut = require("./delete/sign_out.js");

router.use( "/user", getUsers, updateUser, deleteUser, signOut );

module.exports = router;