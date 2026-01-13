const { upstashClient, cachedSessions } = require("../session.js");
const { no_session, custom_error } = require("../errors.js");
const { Admin } = require("../db.js");

const sessionGetter = async( req, res, next ) => {
  try{
    if( req.cookies.sid ){
      const cachedSession = cachedSessions().get( req.cookies.sid );
      if( cachedSession ){
        req.session = cachedSession;
      }else{
        const upstashSession = await upstashClient.get( req.cookies.sid );
        if( !upstashSession ) return res.status( 401 ).json( no_session );
        try{
          req.session = JSON.parse( upstashSession );
        }catch( err ){
          return next( err );
        };
      };
      if( req.session.expires > Date.now() ){
        cachedSessions().set( req.cookies.sid, req.session );
        next();
      }else if( !req.session.expires ){
        console.log( "NO SESSION EXPIRATION" );
        res.status( 500 ).json( custom_error( "session", "There was an error with the session data. In case the error persists, we'd appreciate you contact the software team." ) );
      }else{
        console.log( "SESSION HAS EXPIRED" );
        await upstashClient.del( req.cookies.sid );
        cachedSessions().delete( req.cookies.sid );
        // const admin = await Admin.findByPk( req.session.admin.id );
        // await admin.update({ signed_in:false });
        res.status( 401 ).json( no_session );
      };
    }else{
      console.log( "NO SESSION COOKIE" );
      res.status( 500 ).json( custom_error( "session", "There was an error with the session data. In case the error persists, we'd appreciate you contact the software team." ) );
    };
  }catch(err){
    next( err );
  };
};

module.exports = sessionGetter;