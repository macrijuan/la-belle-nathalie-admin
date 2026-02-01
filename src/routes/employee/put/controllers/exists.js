const { Employee } = require("../../../../db.js");
const { custom_error, existing } = require("../../../../errors");

const exists = async ( req, res, next ) => {
  try{
    if( req.body.update.identity ){
      const emp = await Employee.findOne( { where:{ identity: req.body.update.identity } } );
      if( emp ){
        res.status( 409 ).json( custom_error( "identity", existing( "identity" ) ) );
      }else{
        next();
      };
    }else{
      next();
    };
  }catch( err ){
    next( err );
  };
};

module.exports = exists;