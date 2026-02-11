const { Employee } = require("../../../../db.js");
const { custom_error, existing } = require("../../../../errors.js");

const exists = async ( req, res, next ) => {
  try{
    const emp = await Employee.findOne( { where:{ identity: req.body.identity } } );
    if( emp ){
      res.status( 409 ).json( custom_error( "identity", existing( "identity" ) ) );
    } else next();
  }catch( err ){
    next( err );
  };
};

module.exports = exists;