const { Router } = require("express")
const router = Router();
const { unknown } = require("../../errors.js");
const { Employee } = require("../../db.js");

router.get( "/employee/get_employees", 
  async( req, res, next ) => {
    try{
      const emps = await Employee.findAll({
        attributes:{
          exclude:[ "serviceId" ]
        }
      });
      res.json( emps );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;