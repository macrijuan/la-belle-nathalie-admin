const { existing, custom_error } = require("../../../../errors.js");
const { Service } = require("../../../../db.js");

const exists = async ( req, res, next ) => {
  if( req.body.update.name ){
    try{
      const _exists = await Service.findOne({
        where:{ name: req.body.update.name }
      });
      if( _exists ){
        res.status( 409 ).json( custom_error( "name", existing( "name" ) ) );
      }else{
        next();
      };
    }catch( err ){
      next( err );
    };
  }else{
    next();
  };
};

module.exports = exists;