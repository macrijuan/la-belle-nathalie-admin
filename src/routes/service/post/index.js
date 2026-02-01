const { Router } = require( "express" );
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/existing.js");

const { Employee } = require("../../../db.js");
const { unknown } = require("../../../errors.js");

router.post( "/post_employee",
  format,
  exists,
  async( req, res, next ) => {
    try{
      const emp = await Employee.create( req.body );
      if( !emp ) return res.status( 500 ).json( unknown );
      res.status( 200 ).json( emp.id );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;