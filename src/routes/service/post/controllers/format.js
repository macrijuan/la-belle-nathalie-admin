const { unknown } = require("../../../../errors.js");
const { nameVal, idenVal, shiftVal } = require("../../../input_validations/employee.js");

const format = ( req, res, next ) => {
  try{
    console.log( "req.body" );
    console.log( req.body );
    const recivedKeys = Object.keys( req.body ).length;

    if( recivedKeys !== 4 ){
      console.log( "req.body -> TOO MANY KEYS" );
      return res.status( 400 ).json( unknown );
    }

    let allowedKeys = 0;

    const first_name = nameVal( req.body.first_name, "nombre" );
    if( first_name ) return res.status( 403 ).json( first_name );
    allowedKeys ++;
    req.body.first_name = req.body.first_name.toUpperCase();

    const last_name = nameVal( req.body.last_name, "apellido" );
    if( last_name ) return res.status( 403 ).json( last_name );
    allowedKeys ++;
    req.body.last_name = req.body.last_name.toUpperCase();

    const identity = idenVal( req.body.identity );
    if( identity ) return res.status( 403 ).json( identity );
    allowedKeys ++;

    const shift = shiftVal( req.body.shift );
    if( shift ) return res.status( 403 ).json( shift );
    allowedKeys ++;

    if( allowedKeys < 1 || allowedKeys > 4 || Object.keys( req.body ).length !== allowedKeys ) return res.status( 400 ).json( unknown );
    
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;