const { existing, custom_error } = require("../../../../errors.js");
const { Sub_service } = require("../../../../db.js");

const exists = async ( req, res, next ) => {
  try{
    if( req.body.update.name ){
      const _exists = await Sub_service.findOne( { where:{ name: req.body.name } } );
      if( _exists ){
        res.status( 409 ).json( custom_error( "name", existing( "name" ) ) );
      } else next();
    } else next();
  }catch( err ){
    next( err );
  };
};

module.exports = exists;