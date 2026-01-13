const { emailVal, passwordVal, nameVal, identityVal, tokenVal } = require("../../input_validations/user_validation.js");
const { multi_errors, unknown } = require("../../../errors.js");

const format = async ( req, res, next ) => {
  try{
    const bodyKeys = Object.keys( req.body );
    if(
      bodyKeys.length !== 5
      || req.body.email === undefined
      || req.body.password === undefined
      || req.body.first_name === undefined
      || req.body.last_name === undefined
      || req.body.token === undefined
    ){
      console.log( bodyKeys );
      res.status( 403 ).json( unknown );
      return;
    };

    const errors = {};
    emailVal( req.body.email, errors );
    passwordVal( req.body.password, errors );
    nameVal( req.body.first_name, errors, "first_name", "first name" );
    nameVal( req.body.last_name, errors, "last_name", "last name" );
    tokenVal( req.body.token, errors );
  
    if( Object.keys( errors ).length ){
      res.status( 403 ).json( multi_errors( errors ) );
    }else{
      next();
    };
  }catch( err ){
    next( err );
  };
};

module.exports = format;