const { Router } = require("express");
const router = Router();

const getServices = require("./get_service.js");
const postService = require("./post/index.js");
const putServices = require("./put/index.js");
const deleteServices = require("./delete_service.js");

router.use( "/service", getServices, postService, putServices, deleteServices );

module.exports = router;