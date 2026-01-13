const { unknown, multi_errors } = require("../../../../errors.js");
const { nameVal, emailVal } = require("../../../input_validations/user_validation.js");

const format = ( req, res, next ) => {
  try{
    res.locals.bodyKeys = Object.keys( req.body );
    if(
      res.locals.bodyKeys.length > 2
      || res.locals.bodyKeys.length === 0
      || res.locals.bodyKeys.find( key => ![ "first_name", "last_name" ].includes( key ) )
    ) return res.status( 403 ).json( unknown );
    const errors = {};
    res.locals.bodyKeys.forEach( key => { nameVal( req.body[ key ], errors, key, key.replace( "_", " " ) ); } );
    if( Object.keys( errors ).length ) res.status( 403 ).json( multi_errors( errors ) );
    else{
      Object.keys( req.body ).forEach( key => { req.body[ key ] = req.body[ key ].toUpperCase(); } );
      next(); 
    };
  }catch( err ){
    next( err );
  };
};

const email_format = ( req, res, next ) => {
  try{
    const errors = {}
    emailVal( req.body.email, errors );
    if( "email" in errors ) return res.status( 403 ).json( multi_errors( errors ) );
    next();
  }catch( err ){
    next( err );
  }
};

module.exports = { format, email_format };