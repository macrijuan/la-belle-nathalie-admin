const { Router } = require( "express" );
const router = Router();

const { Op } = require("sequelize");
const { Sub_service } = require("../../db.js");
const { not_found, unknown } = require("../../errors.js");

router.delete( "/delete_sub_services",
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
      
      const sub_serv = await Sub_service.destroy( { where:{ id:{ [ Op.in ]: req.body } } } );

      if( !sub_serv ) res.status( 404 ).json( not_found( "Sub service" ) );
      else res.sendStatus( 204 );

    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;