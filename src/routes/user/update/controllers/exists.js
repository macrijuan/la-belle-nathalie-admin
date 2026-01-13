const { User } = require("../../../../db.js");
const { not_found } = require("../../../../errors.js");

const email_exists = async ( req, res, next ) => {
  try{
    const user = await User.findOne({ where:{ email: req.body.email } });
    if( !user ) return res.status( 404 ).json( not_found( "Email" ) );
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = email_exists;