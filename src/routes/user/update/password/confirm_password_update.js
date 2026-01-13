require("dotenv").config();
const { Router } = require("express");
const router = Router();
const { rateLimit } = require("express-rate-limit");
const { randomBytes } = require("crypto");
const argon2 = require("argon2");
const { existing, not_found, not_valid, custom_error, multi_errors, req_limit } = require("../../../../errors.js");
const { tokenVal, passwordVal } = require("../../../input_validations/user_validation.js");
const { User, conn } = require("../../../../db.js");
const transporter = require("../../../nodemailer/transporter.js");

router.put( "/confirm_update/signed_in",
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
      passwordVal( req.body.password, req.body.password_conf, errors );
      if( errors.password || errors.token ){ return res.status( 403 ).json( multi_errors( errors ) ); };
      //update if exists
      const user = await User.findByPk( req.session.user.id );
      if( !user ){
        res.status( 404 ).json( not_found( "User" ) );
      }else{
        //I could send an email when "no password_update" case informing the owner of the account that someone is trying to sign in their account.
        if( !user.password_update ){ console.log( "hola" ); return res.status( 404 ).json( not_found( "Update password token" ) );}
        if( user.password_update_expiration < Date.now() ){
          await User.update(
            { password_update: null, password_update_expiration: 0 },
            { where: { id: req.session.user.id } }
          )
          res.status( 410 ).json( custom_error( "token", 'The "password update" token expired.' ) );
          return;
        };
        const isValidToken = await argon2.verify( "$argon2id$v=19$m=65536,t=3,p=1$" + user.password_update, req.body.token );
        if( !isValidToken ) return res.status( 403 ).json( custom_error( "token", not_valid( "token" ) ) );
        await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: req.session.user.email,
          subject:'La Belle Nathalie: someone updated your password.',
          html:`
          <html>
          <body>
          <h1>La Belle Nathalie</h1>
          <h4>Someone has updated the password of your La Belle Nathalie account. If it wasn't you, we recommend to update your password immediatly.</h4>
          </body>
          </html>
          `
        });
        const hashedPassword = await argon2.hash(
          req.body.password,
          { type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1, hashLength: 32 }
        );
        await conn.query(
          `UPDATE users
          SET password_update = NULL,
          password_update_expiration = 0,
          password = $1
          WHERE id = ${req.session.user.id};`,
          { type:"UPDATE", bind:[ hashedPassword.substring( 31, hashedPassword.length ) ] }
        );
        res.sendStatus( 204 );
      };
    }catch( err ){
      next( err );
    };
  }
);


module.exports = router;