const { Router } = require("express");
const router = Router();
const { custom_error } = require("../errors.js");

router.use(( req, res, next ) => {
  try{
    if ( req.session && req.get("X-Csrf-Token") === req.session.csrf_token ){
      next();
    }else{
      res.status( 401 ).json( custom_error( "auth", "Try reloading the page. Request not authorized." ) );
    };
  }catch(err){
    next( err );
  };
});

module.exports=router;