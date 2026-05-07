const { unknown } = require("../../../../errors");
const { subServServIdlVal } = require("../../../input_validations/sub_service.js");
const { idVal } = require("../../../input_validations/appointments.js");



const format = ( req, res, next ) => {
  try{
    if ( !req.body || typeof req.body !== 'object' || Array.isArray( req.body ) ) {
      throw new Error('body must be an object');
    };
    
    const recivedKeys = Object.keys( req.body );
    if( recivedKeys.length > 2 || recivedKeys.length < 1 ) throw new Error( 'Only 1 or 2 keys allowed in req.body' );
    
    const allowed = new Set( [ 'add', 'del' ] );
    if( recivedKeys.some( rk => !allowed.has( rk ) ) ) throw new Error( 'Only "service", "add" and "del" keys are allowed in req.body' );
    
    let appo = req.params.appoId;
    if ( typeof appo !== 'string' || !/^[1-9]\d*$/.test( appo ) ){
      throw new Error( 'params.appoId must be a positive integer' );
    };
    appo = Number( appo );
    if (
      typeof appo !== "number"
    || !Number.isSafeInteger( appo )
    || appo > 99999
    || appo < 0 ){
      throw new Error( 'params.appoId must be a positive integer (case 2)' );
    };

    // const serv = req.body.service;
    // if(
    //   typeof serv !== 'number'
    //   || !Number.isSafeInteger( serv )
    //   || serv < 0
    // ) throw new Error( 'body.service must be a positive integer' );
    
    // if( !( ( "add" in req.body ) || ( "del" in req.body ) ) ){
    //   throw new Error( 'body.add and body.del not found' );
    // };

    if( "add" in req.body ){
      if ( !Array.isArray( req.body.add )  ){
        throw new Error( 'Expected array' );
      };
      if ( req.body.add.length > 15 || req.body.add.length < 1 ){
        throw new Error( 'req.body.add: Max 15 items, min 1 allowed' );
      };
      for ( const subServId of req.body.add ){
        if (
          typeof subServId !== 'number'
          || !Number.isSafeInteger( subServId )
          || subServId < 1
        ) throw new Error( 'Elements to add must be non-zero integers' );
      };
    };
    
    //COPIED validations here to avoid more computing steps and make this route to run faster

    if( "del" in req.body ){
      if ( !Array.isArray( req.body.del )  ){
        throw new Error( 'Expected array' );
      };
      if ( req.body.del.length > 15 || req.body.del.length < 1 ){
        throw new Error( 'req.body.del: Max 15 items, min 1 allowed' );
      };
      for ( const subServId of req.body.del ){
        if (
          typeof subServId !== 'number'
          || !Number.isSafeInteger( subServId )
          || subServId < 1
        ) throw new Error( 'Elements to delete must be non-zero integers' );
      };
    };

    next();

  }catch( err ){
    next( err );
  };
};

module.exports = format;