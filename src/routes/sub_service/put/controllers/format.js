const { unknown } = require("../../../../errors.js");
const { subServNameVal, subServMinsVal, subServDetailVal } = require("../../../input_validations/sub_service.js");

const format = ( req, res, next ) => {
  try{
    console.log( "src/routes/sub_service/put/controllers/format.js" );
    console.log( "req.body" );
    console.log( req.body );

    if( !Array.isArray( req.body.ids ) || req.body.ids.length > 15 || req.body.ids.find( id => typeof id !== 'number' ) ){
      console.log( "req.body.ids MUST BE AN ARRAY CONTAINING INTEGERS" );
      return res.status( 400 ).json( unknown );
    };

    if( typeof req.body.update !== 'object' && !Array.isArray( req.body.update ) ){
      console.log( "req.body.update MUST BE AN OBJECT" );
      return res.status( 400 ).json( unknown );
    };

    const recivedKeys = Object.keys( req.body ).length;
    if( recivedKeys > 3 || recivedKeys < 1 ){
      console.log( "INVALID req.body.update KEY QUANTITY" );
      return res.status( 400 ).json( unknown );
    };

    let allowedKeys = 0;

    if( "name" in req.body.update ){
      const name = subServNameVal( req.body.name );
      if( name ) return res.status( 403 ).json( name );
      req.body.name = req.body.name.toLowerCase();
      allowedKeys++;
    };

    if( "mins" in req.body.update ){
      const mins = subServMinsVal( req.body.mins );
      if( mins ) return res.status( 403 ).json( mins );
      allowedKeys++;
    };

    if( "detail" in req.body.update ){
      const detail = subServDetailVal( req.body.detail );
      if( detail ) return res.status( 403 ).json( detail );
      allowedKeys++;
    };

    if( allowedKeys !== recivedKeys ){
      console.log( "req.body.update: INVALID KEY " );
      return res.status( 400 ).json( unknown );
    };
    
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;