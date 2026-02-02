const { servNameVal, shiftVal } = require("../../../input_validations/service.js");
const { unknown } = require("../../../../errors.js");

const format = ( req, res, next ) =>{
  try{

    if( !Array.isArray( req.body.ids ) || req.body.ids.length > 15 || req.body.ids.find( id => typeof id !== 'number' ) ){
      console.log( "req.body.ids MUST BE AN ARRAY CONTAINING INTEGERS" );
      return res.status( 400 ).json( unknown );
    };

    if( typeof req.body.update !== 'object' && !Array.isArray( req.body.update ) ){
      console.log( "req.body.update MUST BE AN OBJECT" );
      return res.status( 400 ).json( unknown );
    };

    const updateKeys = Object.keys( req.body.update );
    if( updateKeys.length > 3 || updateKeys.length < 1 ){
      console.log( "INVALID req.body.update KEY QUANTITY" );
      return res.status( 400 ).json( unknown );
    };

    let allowedKeysCheck = 0;
    
    if( req.body.update.name ){
      if( req.body.ids.length !== 1 ){
        console.log( "WHEN NAME IS PRESENT IN req.body.update, A SINGLE ID MUST BE RECIVED INSIDE 'req.body.ids' ARRAY." );
        return res.status( 400 ).json( unknown );
      };
      const nameErr = servNameVal( req.body.update.name );
      if( nameErr ) return res.status( 400 ).json( nameErr );
      allowedKeysCheck++
    };

    if( req.body.update.am ){
      const amErr = shiftVal( req.body.update.am );
      if( amErr ) return res.status( 400 ).json( amErr );
      allowedKeysCheck++
    };

    if( req.body.update.pm ){
      const pmErr = shiftVal( req.body.update.pm );
      if( pmErr ) return res.status( 400 ).json( pmErr );
      allowedKeysCheck++;
    };

    if( allowedKeysCheck !== updateKeys.length ){
      console.log( "NOT ALLOWED KEY PRESENT IN req.body.update" );
      return res.status( 400 ).json( unknown );
    };

    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;