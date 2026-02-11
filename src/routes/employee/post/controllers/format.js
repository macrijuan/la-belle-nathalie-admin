const { unknown } = require("../../../../errors.js");
const { nameVal, idenVal, shiftVal, serviceIdVal } = require("../../../input_validations/employee.js");

const format = ( req, res, next ) => {
  try{
    console.log( "req.body" );
    console.log( req.body );

    const recivedKeys = Object.keys( req.body ).length;
    if( recivedKeys !== 5 ){
      console.log( "req.body: TOO MANY KEYS" );
      return res.status( 403 ).json( unknown );
    };
    let allowedKeys = 0;

    const first_name = nameVal( req.body.first_name, "nombre" );
    if( first_name ){ console.log( "first_name failed" ); return res.status( 403 ).json( first_name ) };
    req.body.first_name = req.body.first_name.toUpperCase();
    allowedKeys++;

    const last_name = nameVal( req.body.last_name, "apellido" );
    if( last_name ){ console.log( "last_name failed" ); return res.status( 403 ).json( last_name ); };
    req.body.last_name = req.body.last_name.toUpperCase();
    allowedKeys++;
    
    const identity = idenVal( req.body.identity );
    if( identity ){ console.log( "identity failed" ); return res.status( 403 ).json( identity ); };
    allowedKeys++;

    const shift = shiftVal( req.body.shift );
    if( shift ){ console.log( "shift failed" ); return res.status( 403 ).json( shift ); };
    allowedKeys++;

    const serviceId = serviceIdVal( req.body.serviceId );
    if( serviceId ){ console.log( "serviceId failed" ); return res.status( 403 ).json( serviceId ); };
    allowedKeys++;

    if( recivedKeys !== allowedKeys ){
      console.log( "req.body: INVALID KEY FOUND" );
      return res.status( 400 ).json( unknown );
    };

    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;