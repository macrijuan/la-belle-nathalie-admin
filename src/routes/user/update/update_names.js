const { Router } = require("express" );
const router = Router();
const { format } = require("./controllers/format.js");
const { not_found } = require("../../../errors.js");
const { conn } = require("../../../db.js");

router.put( "/update_names",
  format,
  async( req, res, next ) => {
    try{
      const bodyToSETClause = res.locals.bodyKeys.map( ( key, i ) => `${key} = $${i+1}`);
      const nameUpdate = await conn.query(
        `UPDATE users SET ${bodyToSETClause} WHERE id = ${ req.session.user.id };`,
        { type:"UPDATE", bind: Object.values( req.body ) }
      );
      if( !nameUpdate[ 1 ] ) res.status( 404 ).json( not_found( "User" ) );
      res.sendStatus( 204 );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;