const { unknown } = require("../../../../errors.js");
const { subServNameVal, subServMinsVal, subServDetailVal } = require("../../../input_validations/sub_service.js");

const format = ( req, res, next ) => {
  try{
    console.log( "src/routes/sub_service/post/controllers/format.js" );
    console.log( "req.body" );
    console.log( req.body );
    const recivedKeys = Object.keys( req.body ).length;

    if( recivedKeys !== 3 ){
      console.log( "req.body -> TOO MANY KEYS" );
      return res.status( 400 ).json( unknown );
    };

    const name = subServNameVal( req.body.name );
    if( name ) return res.status( 403 ).json( name );
    req.body.first_name = req.body.first_name.toLowerCase();

    const mins = subServMinsVal( req.body.mins );
    if( mins ) return res.status( 403 ).json( mins );

    const detail = subServDetailVal( req.body.detail );
    if( detail ) return res.status( 403 ).json( detail );
    
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;