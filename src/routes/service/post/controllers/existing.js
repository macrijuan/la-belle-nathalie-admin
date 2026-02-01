const { existing, custom_error } = require("../../../../errors.js");
const { Employee } = require("../../../../db.js");

const exists = async ( req, res, next ) => {
  try{
    const _exists = await Employee.findOne({
      where:{ identity: req.body.identity }
    });
    if( _exists ){
      res.status( 409 ).json( custom_error( "identity", existing( "identity" ) ) );
    }else{
      next();
    };
  }catch( err ){
    next( err );
  };
};

module.exports = exists;