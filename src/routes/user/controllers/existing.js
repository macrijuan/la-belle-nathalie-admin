const { User } = require("../../../db.js");
const argon2 = require("argon2");
const { custom_error, existing } = require("../../../errors.js");

const exists = async ( req, res, next ) => {
  try{
    const existingUser = await User.findOne( {
      where:{ email: req.body.email }
    } );
    if( existingUser ){
      res.status( 409 ).json( custom_error( "email", existing( "email" ) ) );
    }else{
      next();
    };
  }catch( err ){
    next( err );
  };
};

module.exports = exists;