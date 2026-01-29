const { Router } = require( "express" );
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/existing.js");

const { Service } = require("../../../db.js");
const { unknown } = require("../../../errors.js");

router.post( "/post_service",
  format,
  exists,
  async( req, res, next ) => {
    try{
      const serv = await Service.create( req.body );
      if( !serv ) return res.status( 500 ).json( unknown );
      res.status( 200 ).json( serv.id );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;