const { Router } = require("express");
const router = Router();

const postEmps = require("./post/index.js");
const getEmps = require("./get_employee.js");
const putEmps = require("./put/index.js");
const deleteEmps = require("./delete_employee.js");

router.use( postEmps, getEmps, putEmps, deleteEmps );

module.exports = router;