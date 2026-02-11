const { Router } = require( "express" );
const router = Router();
const { Op } = require("sequelize");

const format = require("./controllers/format.js");
const exists = require("./controllers/existing.js");

const { Sub_service } = require("../../../db.js");
const { unknown, not_found } = require("../../../errors.js");

router.put( "/put_sub_services",
  format,
  exists,
  async( req, res, next ) => {
    try{
      console.log("reached index.js");
      const sub_serv = await Sub_service.update( req.body.update, { where:{ id:{ [ Op.in ]: req.body.ids } } } );
      console.log( sub_serv );
      if( !sub_serv[ 0 ] ) return res.status( 404 ).json( not_found( "Sub service" ) );
      res.status( 200 ).json( sub_serv.id );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;