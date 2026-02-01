const { Router } = require("express");
const router = Router();
const { Op } = require("sequelize");

const format = require("./controllers/format.js");
const exists = require("./controllers/exists.js");

const { Employee } = require("../../../db.js");
const { unknown } = require("../../../errors.js");

router.put( "/put_employees",
  format,
  exists,
  async( req, res, next ) => {
    try{
      console.log( req.body.update );
      const emp = await Employee.update( req.body.update, { where:{ id: { [ Op.in ]: req.body.ids } } } );
      if( emp && ( emp [ 0 ] !== 0 ) ) res.sendStatus( 204 );
      else res.status( 500 ).json( unknown );
    }catch( err ){
      next( err );
    };
  }
 );

 module.exports = router;