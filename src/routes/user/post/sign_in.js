const { Router } = require("express");
const router = Router();
const { upstashClient, cachedSessions } = require("../../../session.js");
const { verify } = require("argon2");
const { randomBytes } = require("crypto");
const { sign_in_not_found, not_found, custom_error } = require("../../../errors.js");
const { Admin } = require("../../../db.js");

const createSessionID = () => {
  return randomBytes( 45 ).toString( 'base64' );
};

router.post("/admin/sign_in",
  async( req, res, next )=>{
    try{
      const admin = await Admin.findOne({
        where:{
          email: req.body.email,
        }
      });
      if( admin ){
        const match = await verify( "$argon2id$v=19$m=65536,t=3,p=1$" + admin.password, req.body.password );
        if( match ){
          if( admin.signed_in ) return res.status( 403 ).json( custom_error( "email", "This administrator is currently active." ) );
          let sid = createSessionID();
          const sessionData = {
            expires: ( Date.now() + 72000000 ),// 2hs (in ms) starting from log in time
            admin:{
              id: admin.id,
              email: admin.email,
            },
            csrf_token: 'token'
          };
          let existingSession = await upstashClient.get( sid );
          while( existingSession ){
            sid = createSessionID();
            existingSession = await upstashClient.get( sid );
          };
          await upstashClient.set( sid, JSON.stringify(sessionData), { ex: 900 } );
          cachedSessions().set( sid, sessionData );
          res.cookie(
            "sid", sid,
            {
              httpOnly: true,
              secure: true,
              sameSite: "None",
              path: "/",
              maxAge: 900000
            }
          );
          res.setHeader('X-Csrf-Token', sessionData.csrf_token);
          res.setHeader('Access-Control-Expose-Headers', 'X-Csrf-Token');
          // await admin.update({ signed_in:true });
          res.json( {
            id: admin.id,
            email: admin.email,
            first_name: admin.first_name,
            last_name: admin.last_name,
            email_update_expiration: admin.email_update_expiration,
            password_update_expiration: admin.password_update_expiration,
            possible_new_email: admin.possible_new_email
          } );
        }else{
          res.status(404).json( sign_in_not_found("administrator") );
        };
      }else{
        res.status(404).json( sign_in_not_found("administrator") );
      };
    }catch(err){
      next( err );
    };
  }
);

module.exports = router;