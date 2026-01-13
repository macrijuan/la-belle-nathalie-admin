require("dotenv").config();
const { Router } = require("express");
const router = Router();
const argon2 = require("argon2");

const format = require("../controllers/format.js");
const exists = require("../controllers/existing.js");

const { randomBytes } = require("crypto");
const { transporter } = require("../../nodemailer/transporter.js");
const { signUpReqs } = require("../../../sign_up_request_store.js");
const { custom_error, existing, multi_errors } = require("../../../errors.js");
const { emailVal } = require("../../input_validations/user_validation.js");

router.post( "/request",
  ( req, res, next ) => {
    const errors = {};
    emailVal( req.body.email, errors );
    if( "email" in errors ) res.status( 403 ).json( multi_errors( errors ) );
    else next();
    
  },
  exists,
  async( req, res, next )=>{
    // const rawToken = randomBytes( 3 ).toString( "hex" );
    const rawToken = "abc123";
    // try{
    //   await transporter.sendMail({
    //     from: process.env.EMAIL_ID,
    //     to: req.body.email,
    //     subject: 'La Belle Nathalie: Create your account',
    //     text: 'Hey! Here is the token to create your "La Belle Nathalie" account.',
    //     html: `
    //     <html>
    //     <body>
    //     <h1>La Belle Nathalie</h1>
    //     <h4>Enter the code below in the "token" field of the "Create account: Step 1" screen:</h4>
    //     <h3>${ rawToken }</h3>
    //     <h4>If you are not trying to create a "La Belle Nathalie" account, ignore this email<h4>
    //     </body>
    //     </html>
    //     `
    //   });
    // }catch( err ){
    //   console.log( err );
    //   return res.status( 500 ).json( custom_error( "email", "The email with the token to create your account could not be sent.") );
    // };

    try{
      const hashedToken = await argon2.hash( rawToken, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      } );
      // const possibleNewAccount = await signUpReqs().set( req.body.email, hashedToken ); //UNCOMMENT THIS LINE FOR PRODUCTION
      if( signUpReqs().get( req.body.email ) ){ res.status( 409 ).json( custom_error( "email", existing( "email" ) ) ); return; };//erase this line for production
      const possibleNewAccount = signUpReqs().set( req.body.email, hashedToken.substring( 31 ) );
      console.log( possibleNewAccount.get( req.body.email ) );
      // if( !possibleNewAccount ) res.status( 409 ).json( custom_error( "email", existing( "email" ) ) ); //UNCOMMENT THIS LINE FOR PRODUCTION
      // else res.sendStatus( 204 ); //UNCOMMENT THIS LINE FOR PRODUCTION
      res.sendStatus( 204 );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;