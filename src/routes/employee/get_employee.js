const { Router } = require("express")
const router = Router();
const { unknown } = require("../../errors.js");
const { Employee, Service } = require("../../db.js");

router.get( "/get_employees", 
  async( req, res, next ) => {
    try{
      const emps = await Employee.findAll({
        attributes:{
          exclude:[ "serviceId" ]
        },
        include:{ model: Service, attributes:[ "id", "name" ] }
      });
      res.json( emps );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;