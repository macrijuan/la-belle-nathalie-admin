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
    if( recivedKeys.some( rk => !allowed.has( rk ) ) ) throw new Error( 'Only  "add" and "del" keys are allowed in req.body' );
    
    let appo = req.params.appoId;
    if ( typeof appo !== 'string' || !/^[1-9]\d*$/.test( appo ) ){
      throw new Error( 'params.appoId must be a positive integer' );
    };
    appo = Number( appo );
    if (
      typeof appo !== "number"
    || !Number.isSafeInteger( appo )
    || appo > 99999
    || appo < 1 ){
      throw new Error( 'params.appoId must be an integer between 1 and 99999' );
    };

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

    if( new Set( req.body.add ).size !== req.body.add.length ) throw new Error( "There are duplicated IDs in body.add" );
    if( new Set( req.body.del ).size !== req.body.del.length ) throw new Error( "There are duplicated IDs in body.del" );

    for( const id of req.body.add ){
      if( req.body.del.includes( id ) ) throw new Error( "IDs can't be present in both body.add and body.del" );
    };
    
    next();

  }catch( err ){
    next( err );
  };
};

module.exports = format;