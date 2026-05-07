const { Router } = require("express");
const router = Router();

const postAppo = require("./post/index.js");
const getAppo = require("./get_appointment.js");
const putAppo = require("./put/index.js");
const deleteAppo = require("./delete_appointment.js");

router.use( "/appointment", getAppo, postAppo, putAppo, deleteAppo );

module.exports = router;