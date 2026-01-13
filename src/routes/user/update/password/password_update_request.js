require("dotenv").config();
const { Router } = require("express");
const { rateLimit } = require("express-rate-limit");
const { randomBytes } = require("crypto");
const argon2  = require("argon2");
const router = Router();
const transporter = require("../../../nodemailer/transporter.js");
const { conn } = require("../../../../db.js");
const { custom_error, req_limit } = require("../../../../errors.js");

router.put( "/update_request/signed_in",
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
    const rawToken = randomBytes( 3 ).toString( "hex" );
    //send email with token to user
    try{
      await transporter.sendMail({
        from: process.env.EMAIL_ID,
        to: req.session.user.email,
        subject: 'La Belle Nathalie: password update process.',
        text: 'Hey! Here is the token to update the password of your "La Belle Nathalie" account.',
        html: `
        <html>
        <body>
        <h1>La Belle Nathalie</h1>
        <h4>Enter the code below in the "token" field.</h4>
        <h3>${ rawToken }</h3>
        </body>
        </html>
        `
      });
    }catch( err ){
      console.log( err );
      return res.status( 500 ).json( custom_error( "password", "The email containing the code to update your account's password could not be sent.") );
    };
    //generate token
    try{
      const hashedToken = await argon2.hash( rawToken, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
      } );
      //add token to user's data
      const updateToken = await conn.query(
        `UPDATE users
        SET
          password_update = '${hashedToken.substring( 31, hashedToken.length )}',
          password_update_expiration = ${Date.now() + 600000 }
        WHERE id = ${req.session.user.id} AND password_update IS NULL
        RETURNING password_update_expiration;`,
        { type:"UPDATE" }
      );
      if( !updateToken[ 1 ] ){
        res.status( 403 ).json( custom_error( "not_found", 'User not found or user already has an "update password" token assigned.' ) );
        return;
      };
      res.status( 200 ).send( updateToken[ 0 ][ 0 ].password_update_expiration );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;