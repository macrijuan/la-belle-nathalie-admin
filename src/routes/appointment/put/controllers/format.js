const { idVal, dayVal, timeVal } = require("../../../input_validations/appointments.js");


//params example:
//{ appo: '1' }

//body example:
// {
//   emp: 1,
//   ss_add: [3],
//   ss_del: [1,2],
//   _day: '2026-12-24', 
//   start_time: '11:15:00'
// }

const format = ( req, res, next ) => {
  console.log( req.params );
  console.log( req.body );
  try{
    //req.body
    if ( !req.body || typeof req.body !== 'object' || Array.isArray( req.body ) ) {
      throw new Error('req.body: must be an object');
    };
    
    const recivedKeys = Object.keys( req.body );
    if( recivedKeys.length != 5 ) throw new Error( 'req.body: must have 5 keys' );
    
    const allowed = new Set( [ 'emp', 'ss_add', 'ss_del', 'day', 'start_time' ] );
    if( recivedKeys.some( rk => !allowed.has( rk ) ) ) throw new Error( 'req.body: only keys "emp", "ss_add", "ss_del", "day", "start_time" are allowed' );
    
    //appo
    let appo = req.params.appo;
    if ( typeof appo !== 'string' || !/^[1-9]\d*$/.test( appo ) ){
      throw new Error( 'req.params.appo: must be a stringifyed positive integer' );
    };
    appo = Number( appo );
    if (
      typeof appo !== "number"
    || !Number.isSafeInteger( appo )
    || appo > 99999
    || appo < 1 ){
      throw new Error( 'req.params.appo: must be an integer between 1 and 99999' );
    };

    //emp
    let emp = req.body.emp;
    if (
      typeof emp !== "number"
      || !Number.isSafeInteger( emp )
      || emp > 99999
      || emp < 1
    ){
      throw new Error( 'req.body.emp: must be an integer between 1 and 99999' );
    };

    //ss_add
    if( typeof req.body.ss_add != 'object' || !Array.isArray( req.body.ss_add )  ){
      throw new Error( 'req.body.ss_add: must be an array' );
    };
    if( req.body.ss_add.length > 15 || req.body.ss_add.length < 1 ){
      throw new Error( 'req.body.ss_add: must have between 1 and 15 elements' );
    };
    for ( const subServId of req.body.ss_add ){
      if (
        typeof subServId !== 'number'
        || !Number.isSafeInteger( subServId )
        || subServId < 1
      ) throw new Error( 'req.body.ss_add: all elements must be positive' );
    };
    if( new Set( req.body.ss_add ).size !== req.body.ss_add.length ) throw new Error( "req.body.ss_add: each element must be unique" );

    //ss_del
    if ( typeof req.body.ss_del != 'object' || !Array.isArray( req.body.ss_del )  ){
      throw new Error( 'req.body.ss_del: must be an array' );
    };
    if ( req.body.ss_del.length > 15 || req.body.ss_del.length < 1 ){
      throw new Error( 'req.body.ss_del: must have between 1 and 15 elements' );
    };
    for ( const subServId of req.body.ss_del ){
      if (
        typeof subServId !== 'number'
        || !Number.isSafeInteger( subServId )
        || subServId < 1
      ) throw new Error( 'req.body.ss_del: all elements must be positive' );
    };
    if( new Set( req.body.ss_del ).size !== req.body.ss_del.length ) throw new Error( "req.body.ss_del: each element must be unique" );
    
    //ss_add & ss_del
    for( const id of req.body.ss_add ){
      if( req.body.ss_del.includes( id ) ) throw new Error( "req.body.ss_add and req.body.ss_del: musn't contain equal elements" );
    };

    const err = {};
    //day
    dayVal( req.body.day, err );
    if( "day" in err ){
      throw new Error( "req.body.day: must be a YY-MM-DD string" );
    };

    //start_time
    timeVal( req.body.start_time, err, "start time" );
    if( "start time" in err ){
      throw new Error( "req.body.start_time: must be a HH:MM:SS string" );
    };

    next();

  }catch( err ){
    next( err );
  };
};

module.exports = format;