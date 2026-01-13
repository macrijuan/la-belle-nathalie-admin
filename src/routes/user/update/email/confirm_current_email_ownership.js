require("dotenv").config();
const { Router } = require("express");
const router = Router();
const { rateLimit } = require("express-rate-limit");
const { randomBytes } = require("crypto");
const argon2 = require("argon2");
const { existing, not_found, not_valid, custom_error, multi_errors, req_limit } = require("../../../../errors.js");
const { emailVal, tokenVal } = require("../../../input_validations/user_validation.js");
const { User, conn } = require("../../../../db.js");
const transporter = require("../../../nodemailer/transporter.js");

router.put( "/confirm_current_email_ownership",
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
      emailVal( req.body.email, errors );
      if( errors.email || errors.token ){ res.status( 403 ).json( multi_errors( errors ) ); return; };
      const emailExists = await User.findOne({ where:{ email: req.body.email } });
      if( emailExists ) return res.status( 409 ).json( custom_error( "email", existing( "email" ) ) );
      //update if exists
      const user = await User.findByPk( req.session.user.id );
      if( !user ){
        res.status( 404 ).json( not_found( "User" ) );
      }else{
        if( !user.email_update ) return res.status( 404 ).json( not_found( "Update email token" ) );
        if( user.email_update_expiration < Date.now() ){
          await User.update(
            { email_update: null, email_update_expiration: null, possible_new_email: null },
            { where: { id: req.session.user.id } }
          )
          res.status( 410 ).json( custom_error( "token", 'The "email update" token expired.' ) );
          return;
        };
        const isValidToken = await argon2.verify( "$argon2id$v=19$m=65536,t=3,p=1$" + user.email_update, req.body.token );
        if( !isValidToken ) return res.status( 403 ).json( custom_error( "token", not_valid( "token" ) ) );
        const rawToken = randomBytes( 3 ).toString( "hex" );
        // const rawToken = "3d6892";
        const hashedToken = await argon2.hash( rawToken, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1,
        } );
        await transporter.sendMail({
          from: process.env.EMAIL_ID,
          to: req.body.email,
          subject:'La Belle Nathalie: Finish the email update process.',
          html:`
          <html>
          <body>
          <h1>La Belle Nathalie</h1>
          <h4>Enter the code below in the "token" field of the "Update email: Step 2" screen to confirm the email update.</h4>
          <h3>${ rawToken }</h3>
          </body>
          </html>
          `
        });
        const updateToken = await conn.query(
          `UPDATE users
          SET email_update = '${hashedToken.substring( 31, hashedToken.length )}',
          email_update_expiration = ${Date.now() + 600000},
          possible_new_email = $1
          WHERE id = ${req.session.user.id}
          RETURNING email_update_expiration, possible_new_email;`,
          { type:"UPDATE", bind:[ req.body.email ] }
        );
        res.status( 200 ).send( updateToken[ 0 ][ 0 ].email_update_expiration );
      };
    }catch( err ){
      next( err );
    };
  }
);


module.exports = router;