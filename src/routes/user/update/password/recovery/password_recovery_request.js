const { Router } = require("express");
const router = Router();
require("dotenv").config();
const { rateLimit } = require("express-rate-limit");
const { email_format } = require("../../controllers/format.js");
const email_exists = require("../../controllers/exists.js");
const { randomBytes, hash } = require("crypto");
const argon2  = require("argon2");
const transporter = require("../../../../nodemailer/transporter.js");
const { conn } = require("../../../../../db.js");
const { custom_error, req_limit, not_found } = require("../../../../../errors.js");

router.put( "/recovery_request",
  email_format,
  // email_exists,
  rateLimit({
    windowMs: 300000,
    max: 1,
    keyGenerator: ( req ) => {
      return req.body.email;
    },
    handler: ( req, res ) => {
     res.status( 429 ).json( req_limit );
    }
  }),
  async( req, res, next ) => {
    //generate token
    // const rawToken = randomBytes( 3 ).toString( "hex" );
    const rawToken = "abc123";
    //send email with token to user
    try{
      // await transporter.sendMail({
      //   from: process.env.EMAIL_ID,
      //   to: req.body.emal,
      //   subject: 'La Belle Nathalie: password update process.',
      //   text: 'Hey! Here is the token to update the password of your "La Belle Nathalie" account.',
      //   html: `
      //   <html>
      //   <body>
      //   <h1>La Belle Nathalie</h1>
      //   <h4>Enter the code below in the "token" field.</h4>
      //   <h3>${ rawToken }</h3>
      //   </body>
      //   </html>
      //   `
      // });
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
        `WITH _target AS (
          SELECT id, password_update_expiration
          FROM users
          WHERE email = $1
          ORDER BY id
          LIMIT 1
        ),
        updated AS (
          UPDATE users
            SET
              password_update = '${ hashedToken.substring( 31, hashedToken.length ) }',
              password_update_expiration = ${ Date.now() + 420000 }
          WHERE id IN ( SELECT id FROM _target )
          RETURNING id
        )
        SELECT COALESCE(
          (SELECT id FROM updated),
          (SELECT id FROM _target)
        ) AS result;`,
        { type:"UPDATE", bind:[ req.body.email ], logging:console.log }
      );
      if( !updateToken[ 0 ][ 0 ] ){
        res.status( 404 ).json( not_found( "User" ) );
      }else{
        console.log( "hola" );
        res.sendStatus( 204 );
      };
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;