const { Router } = require( "express" );
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/existing.js");

const { Sub_service } = require("../../../db.js");
const { unknown } = require("../../../errors.js");

router.post( "/post_sub_service",
  format,
  exists,
  async( req, res, next ) => {
    try{
      const sub_serv = await Sub_service.create( req.body );
      if( !sub_serv ) return res.status( 500 ).json( unknown );
      res.status( 200 ).json( sub_serv.id );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;