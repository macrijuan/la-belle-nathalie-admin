const { Router } = require("express");
const router = Router();
const { Op } = require("sequelize");

const { Employee } = require("../../db.js");
const { unknown } = require("../../errors");

router.delete( "/delete_employees",
  async( req, res, next ) => {
    try{
      if( !Array.isArray( req.body.ids )
        || req.body.ids.find( id => typeof id !== 'number' )
        || req.body.ids.find( id => id % 1 )
      ) return res.status( 400 ).json( unknown );
      await Employee.destroy( { where:{ [ Op.in ]:{ id: req.body.ids } } } );
    }catch( err ){
      next( err );
    };
  }
);
console.log( 1.75 % 1 );

module.exports = router;