const { Router } = require("express");
const router = Router();
const { Op } = require("sequelize");

const { Employee } = require("../../db.js");
const { unknown, not_found } = require("../../errors");

router.delete( "/delete_employees",
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

      const deleted = await Employee.destroy( { where:{ id:{ [ Op.in ]: req.body } } } );

      if( !deleted ) res.status( 404 ).json( not_found( "Employee" ) );
      else res.sendStatus( 204 );
      
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;