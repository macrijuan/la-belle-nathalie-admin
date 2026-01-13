require("dotenv").config();
const { Router } = require("express");
const router = Router();
const { rateLimit } = require("express-rate-limit");
const argon2 = require("argon2");
const { not_found, not_valid, custom_error, req_limit } = require("../../../../errors.js");
const { emailVal, tokenVal } = require("../../../input_validations/user_validation.js");
const { User } = require("../../../../db.js");
const transporter = require("../../../nodemailer/transporter.js");


router.put( "/confirm_new_email_ownership",
    rateLimit({
    windowMs: 7200000,
    max: 3,
    keyGenerator: ( req ) => {
      return req.session?.user?.id || req.ip;
    },
    handler: ( req, res ) => {
     res.status( 429 ).json( req_limit );
    }
  }),
  async( req, res, next ) => {
    try{
      //formatting
      const errors = {};
      tokenVal( req.body.token, errors );
      if( errors.token ){ res.status( 403 ).json( errors ); return; };
      //update if exists
      const user = await User.findByPk( req.session.user.id );
      if( !user ){
        res.status( 404 ).json( not_found( "User" ) );
      }else{
        //check if email update process has started and it's in step 1 (confirm current email ownership)
        if( !user.email_update ) return res.status( 404 ).json( not_found( "Update email token" ) );
        if( !user.possible_new_email ) return res.status( 401 ).json( custom_error( "email", "The ownership of the current email address assigned to this La Belle Nathalie account has not been confirmed." ) );
        //check if token has expired
        if( user.email_update_expiration < Date.now() ){
          await User.update(
            { email_update: null, email_update_expiration: null, possible_new_email: null },
            { where: { id: req.session.user.id } }
          )
          res.status( 410 ).json( custom_error( "token", "The update email token expired." ) );
          return;
        };
        //check token validity and update
        const isValidToken = await argon2.verify( "$argon2id$v=19$m=65536,t=3,p=1$" + user.email_update, req.body.token );
        if( !isValidToken ) return res.status( 403 ).json( custom_error( "token", not_valid( "token" ) ) );
        await User.update(
          { email: user.possible_new_email, email_update: null, email_update_expiration: null, possible_new_email: null },
          { where:{ id: req.session.user.id } }
        );
        res.sendStatus( 204 );        
      };
    }catch( err ){
      next( err );
    };
  }
);


module.exports = router;