const { Router } = require("express");
const router = Router();
const { not_found } = require("../../../errors.js");
const { conn, User } = require("../../../db.js");
const { upstashClient, cachedSessions } = require("../../../session.js");

router.delete("/delete_user",
  async( req, res, next ) => {
    try{
      await conn.transaction( async( t ) => {
        const deleted = await User.destroy( { where:{ id: req.session.user.id } }, { transaction: t } );
        console.log( deleted );
        if( deleted ) {
          cachedSessions().delete( req.cookies.sid );
          // await upstashClient.del( req.cookies.sid );
          res.sendStatus( 204 );
        }else res.status( 404 ).json( not_found( "user" ) );
      } );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;