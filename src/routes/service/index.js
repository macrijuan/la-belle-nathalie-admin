const { Router } = require("express");
const router = Router();

const getServices = require("./get_service.js");
const putServices = require("./put/index.js");
const deleteServices = require("./delete_service.js");

router.use( "/service", getServices, putServices, deleteServices );

module.exports = router;