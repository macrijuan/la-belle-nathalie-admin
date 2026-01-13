require("dotenv").config();
const { Router } = require("express");
const { rateLimit } = require("express-rate-limit");
const { randomBytes } = require("crypto");
const argon2  = require("argon2");
const router = Router();
const transporter = require("../../../nodemailer/transporter.js");
const { conn } = require("../../../../db.js");
const { custom_error, unknown_to_fill, req_limit } = require("../../../../errors.js");

router.put( "/put_user_email",
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
    // let sentEmaInfo;
    const rawToken = randomBytes( 3 ).toString( "hex" );
    // const rawToken = "506cc8";
    //send email with token to user
    try{
      sentEmaInfo = await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: req.session.user.email,
        subject: 'La Belle Nathalie: Start the email update process.',
        text: 'Hey! Here is the token to update the email associated to your "La Belle Nathalie" account.',
        html: `
        <html>
        <body>
        <h1>La Belle Nathalie</h1>
        <h4>Enter the code below in the "token" field of the "Update email: Step 1" screen:</h4>
        <h3>${ rawToken }</h3>
        </body>
        </html>
        `
      });
      console.log( sentEmaInfo );
    }catch( err ){
      console.log( err );
      return res.status( 500 ).json( custom_error( "email", "The email with the token to update the email adress associated to your account could not be sent.") );
    };
    //generate token
    try{
      const hashedToken = await argon2.hash( rawToken, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      } );
      //add token to user's data
      const updateToken = await conn.query(
        `UPDATE users
        SET email_update = '${hashedToken.substring( 31, hashedToken.length )}',
        email_update_expiration = ${Date.now() + 600000 }, possible_new_email = NULL
        WHERE id = ${req.session.user.id} AND email_update IS NULL
        RETURNING email_update_expiration;`,
        { type:"UPDATE" }
      );
      if( !updateToken[ 1 ] ){
        res.status( 403 ).json( custom_error( "not_found", 'User not found or user already has an "update email" token assigned.' ) );
        return;
      };
      if( !sentEmaInfo ){ res.status( 500 ).json( custom_error( "email", unknown_to_fill ) ); return; };
      res.status( 200 ).send( updateToken[ 0 ][ 0 ].email_update_expiration );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;