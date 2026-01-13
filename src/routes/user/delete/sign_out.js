const { Router } = require("express");
const router = Router();
const { cachedSessions, upstashClient } = require("../../../session.js");

router.delete("/sign_out",
  async( req, res, next )=>{
    try{
      cachedSessions().delete( req.cookies.sid );
      // const deletedSession = await upstashClient.del( req.cookies.sid );
      // console.log( "deleted session:", deletedSession );
      res.sendStatus( 204 );
      
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;