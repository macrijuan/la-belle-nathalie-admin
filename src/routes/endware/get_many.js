const { Router } = require("express");
const router = Router();
const { Op } = require("sequelize");
const { not_found } = require("../../errors.js");
const models = require("../../db.js");

router.use( async( req, res, next )=>{
  try{
    if( !res.locals.data ){
      res.locals.data = {
        limit:( req.query.perPage || 12 ),
        offset:( req.query.index || 0 )
      };
    }else{
      res.locals.data.limit = ( req.query.perPage || 12 );
      res.locals.data.offset = ( req.query.index || 0 );
    };
  
    const queries = Object.keys( req.query ).filter( prop=>( prop!=="perPage" && prop!=="index" && prop !=="order" ) );
    if( queries.length ){
    if(!res.locals.data.where)res.locals.data.where={};
      queries.forEach( prop=>{
        console.log( prop );
        switch( models[ res.locals.model ].rawAttributes[ prop ].type.constructor.key ){
          case "STRING": res.locals.data.where[ prop ]={ ...res.locals.data.where[ prop ], [ Op.substring ]:req.query[ prop ] };
          break;
          case "ARRAY": res.locals.data.where[ prop ]={ ...res.locals.data.where[ prop ], [ Op.contains ]:JSON.parse( req.query.ingredients ).data };
          break;
          default: res.locals.data.where[ prop ]=req.query[ prop ];
        };
      } ); 
    };

    if( res.locals.model === "Routine"){
      console.log( "order:" );
      console.log( res.locals.data.order );
    };
    const _data = await models[ res.locals.model ].findAndCountAll( res.locals.data );
    if( _data.rows.length ){
      res.json( _data ); 
    }else{
      res.status(404).json( not_found( res.locals.notFoundData ) );
    };
  }catch(err){
   next( err );
  };
});

module.exports = router;