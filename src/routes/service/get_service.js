const { Router } = require( "express" );
const router = Router();

const { Service, Sub_service } = require("../../db.js");

router.get( "/get_services", 
  async( req, res, next ) => {
    try{
      const serv = await Service.findAll({
        attributes: [ "id", "name", "am", "pm" ],
        include:{ model: Sub_service }
      });
      return res.status( 200 ).json( serv );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;