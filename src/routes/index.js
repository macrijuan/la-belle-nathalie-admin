const { Router }=require("express");
const router = Router();


const user = require("./user/index.js");
const appointment = require("./appointment/index.js");
const employee = require("./employee/get_employee.js");
const service = require("./service/index.js");

// router.use( ( req, res, next ) => { console.log("get here"); next(); } );

router.use( appointment, employee, service, user  );

module.exports = router;