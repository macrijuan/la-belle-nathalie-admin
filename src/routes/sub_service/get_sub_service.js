const { Router } = require("express");
const router = Router();

const { Sub_service } = require("../../db.js");

router.get( "/get_sub_services",
  async ( req, res, next ) => {
    try{
      const sub_servs = await Sub_service.findAll( { attributes:{ exclude: [ "serviceId" ] } } );
      res.status( 200 ).json( sub_servs );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;