const { unknown } = require("../../../../errors.js");
const { nameVal, idenVal, shiftVal } = require("../../../input_validations/employee.js");

const format = ( req, res, next ) => {
  try{
    if( !Array.isArray( req.body.ids ) || req.body.ids.length > 15 || req.body.ids.find( id => typeof id !== 'number' ) ){
      console.log( "req.body.ids MUST BE AN ARRAY CONTAINING INTEGERS" );
      return res.status( 400 ).json( unknown );
    };

    if( !('update' in req.body) || typeof req.body.update !== 'object' || Array.isArray( req.body.update ) ){
      console.log( "req.body.update MUST BE AN OBJECT" );
      return res.status( 400 ).json( unknown );
    };

    const recivedKeys = Object.keys( req.body.update ).length;
    if( recivedKeys > 4 ){
      console.log( "req.body.update -> TOO MANY KEYS" );
      return res.status( 400 ).json( unknown );
    }

    let allowedKeys = 0;
    if( 'first_name' in req.body.update ){
      const first_name = nameVal( req.body.update.first_name, "nombre" );
      if( first_name ) return res.status( 403 ).json( first_name );
      allowedKeys ++;
      req.body.update.first_name = req.body.update.first_name.toUpperCase();
    };

    if( 'last_name' in req.body.update ){
      const last_name = nameVal( req.body.update.last_name, "apellido" );
      if( last_name ) return res.status( 403 ).json( last_name );
      allowedKeys ++;
      req.body.update.last_name = req.body.update.last_name.toUpperCase();
    };

    if( 'identity' in req.body.update ){
      const identity = idenVal( req.body.update.identity );
      if( identity ) return res.status( 403 ).json( identity );
      allowedKeys ++;
    };

    if( 'shift' in req.body.update ){
      const shift = shiftVal( req.body.update.shift );
      if( shift ) return res.status( 403 ).json( shift );
      allowedKeys ++;
    };
    
    if( allowedKeys < 1 || allowedKeys > 4 || Object.keys( req.body.update ).length !== allowedKeys ) return res.status( 400 ).json( unknown );
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;