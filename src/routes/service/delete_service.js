const { Router } = require( "express" );
const router = Router();

const { Op } = require("sequelize");
const { Service } = require("../../db.js");
const { not_found, unknown } = require("../../errors.js");

router.delete( "/delete_services", 
  async( req, res, next ) => {
    try{
      
      if(
        !Array.isArray( req.body )
        || !req.body.length
        || req.body.find( id => typeof id !== 'number' )
        || req.body.find( id => id % 1 )
      ){
        console.log( "req.body must be an array containing integers" );
        return res.status( 400 ).json( unknown );
      };

      const serv = await Service.destroy( { where:{ id:{ [ Op.in ]: req.body } } } );

      if( !serv ) res.status( 404 ).json( not_found( "Service" ) );
      else res.status( 200 ).json( serv );

    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;