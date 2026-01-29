const { Router } = require("express");
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/exists.js");

const { Employee } = require("../../../db.js");
const { unknown } = require("../../../errors.js");

router.post( "/employee/post_employee",
  format,
  exists,
  async( req, res, next ) => {
    try{
      const emp = await Employee.create( req.body );
      if( emp ) return res.status( 200 ).json( emp.id );
      else res.status( 500 ).json( unknown );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;