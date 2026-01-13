const { Router } = require("express");
const router = Router();
const argon2 = require("argon2");

const format = require("../controllers/format.js");

const { signUpReqs } = require("../../../sign_up_request_store.js");
const { User } = require("../../../db.js");
const { not_found, custom_error, not_valid } = require("../../../errors.js");

router.post( "/",
  format,
  async( req, res, next ) => {
    try{
      const storedToken = await signUpReqs().get( req.body.email );
      if( !storedToken ){
        res.status( 404 ).json( not_found( "Sign up request" ) );
        return;
      };
      if( !argon2.verify( "$argon2id$v=19$m=65536,t=3,p=1$" + storedToken, req.body.token ) ){
        res.status( 403 ).json( custom_error( "token", not_valid( "token" ) ) );
        return;
      };
      const hashedPassword = await argon2.hash(
        req.body.password,
        { type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1, hashLength: 32 }
      );
      req.body.first_name = req.body.first_name.toUpperCase();
      req.body.last_name = req.body.last_name.toUpperCase();
      req.body.password = hashedPassword.substring( 31, hashedPassword.length );
      await User.create( req.body );
      res.sendStatus( 204 );
    }catch(err){
      next( err );
    };
  }
);

module.exports = router;