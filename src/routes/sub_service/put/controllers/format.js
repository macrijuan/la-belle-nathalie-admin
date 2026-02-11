const { unknown } = require("../../../../errors.js");
const { subServNameVal, subServMinsVal, subServDetailVal, subServServIdlVal } = require("../../../input_validations/sub_service.js");

const format = ( req, res, next ) => {
  try{
    console.log( "src/routes/sub_service/put/controllers/format.js" );
    console.log( "req.body" );
    console.log( req.body );

    if( !Array.isArray( req.body.ids ) || req.body.ids.length > 15 || req.body.ids.find( id => typeof id !== 'number' ) ){
      console.log( "req.body.ids MUST BE AN ARRAY CONTAINING INTEGERS" );
      return res.status( 400 ).json( unknown );
    };

    if( !('update' in req.body) || typeof req.body.update !== 'object' || Array.isArray( req.body.update ) ){
      console.log( "req.body.update MUST BE AN OBJECT" );
      return res.status( 400 ).json( unknown );
    };

    const recivedKeys = Object.keys( req.body.update ).length;
    if( recivedKeys > 4 || recivedKeys < 1 ){
      console.log( "INVALID req.body.update KEY QUANTITY" );
      return res.status( 400 ).json( unknown );
    };

    let allowedKeys = 0;

    if( "name" in req.body.update ){
      if( req.body.ids.length !== 1 ){
        console.log( "req.body.ids MUST HAVE A SINGLE ID WHEN KEY NAME IS INCLUDED" );
        return res.status( 400 ).json( unknown );
      };
      const name = subServNameVal( req.body.update.name );
      if( name ) return res.status( 403 ).json( name );
      req.body.update.name = req.body.update.name.toLowerCase();
      allowedKeys++;
    };

    if( "mins" in req.body.update ){
      const mins = subServMinsVal( req.body.update.mins );
      if( mins ) return res.status( 403 ).json( mins );
      allowedKeys++;
    };

    if( "detail" in req.body.update ){
      const detail = subServDetailVal( req.body.update.detail );
      if( detail ) return res.status( 403 ).json( detail );
      allowedKeys++;
    };

    if( "serviceId" in req.body.update ){
      const serviceId = subServServIdlVal( req.body.update.serviceId );
      if( serviceId ) return res.status( 403 ).json( serviceId );
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