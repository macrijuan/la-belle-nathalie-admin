const { unknown } = require("../../../../errors.js");
const { servNameVal, shiftVal } = require("../../../input_validations/service.js");

const format = ( req, res, next ) => {
  try{
    const allowedKeys = [ "name", "am", "pm" ];
    const recivedKeys = Object.keys( req.body );
    if( recivedKeys.length !== 3 ){
      console.log( "req.body -> A RECIVED KEY IS NOT ALLOWED" );
      return res.status( 400 ).json( unknown );
    };
    let keysLeftToRead = 0;
    if( req.body.name !== undefined ) keysLeftToRead++;
    if( req.body.am !== undefined ) keysLeftToRead++;
    if( req.body.pm !== undefined ) keysLeftToRead++;
    if( keysLeftToRead !== 3 ){
      console.log( "req.body -> A RECIVED KEY IS NOT ALLOWED" );
      return res.status( 400 ).json( unknown );
    };
    const name = servNameVal( req.body.name );
    if( name ) return res.status( 403 ).json( name );
    const am = shiftVal( req.body.am );
    if( am ) return res.status( 403 ).json( am );
    const pm = shiftVal( req.body.pm );
    if( pm ) return res.status( 403 ).json( pm );
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;