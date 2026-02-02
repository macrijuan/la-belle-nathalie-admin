const { Router } = require("express");
const router = Router();

const getSubServs = require("./get_sub_service.js" );
const postSubServs = require("./post/index.js" );
const putSubServs = require("./put/index.js" );
const deleteSubServs = require("./delete_sub_service.js" );

router.use( "/sub_service", getSubServs, postSubServs, putSubServs, deleteSubServs );

module.exports = router;