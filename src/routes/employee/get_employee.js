const { Router } = require("express")
const router = Router();

const { unknown } = require("../../errors.js");

const { Employee, Appointment } = require("../../db.js");

router.get( "/employee/get_employees", 
  async( req, res, next ) => {
    if( !( /^\d{1,3}$/ ).test( req.query.service ) ) return res.status( 403 ).json( unknown );
    try{
      const emps = await Employee.findAll({
        attributes:{
          exclude:[ "serviceId", "identity" ]
        },
        where:{
          serviceId: parseInt( req.query.service, 10 )
        },
        include:[
          { model: Appointment, as:"appointments", attributes:[ "day", "start_time", "end_time" ] }
        ]
      });
      res.json( emps );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;