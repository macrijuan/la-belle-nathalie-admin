const { Router } = require("express");
const router = Router();

const format = require("./controllers/format.js");

const { conn } = require("../../../db.js");

const { retry_failed } = require("../../../errors.js");

// -- REFERENCES & examples:
// SELECT appo_upd(
//   1, -------------> req
//   1, ------------->
//   ARRAY[], ------->
//   ARRAY[], ------->
//   0, ------------->
//   0, ------------->
//   '2025-12-11', -->
//   '16:15:00'
// );

router.put( "/put_appointment/:appo",
  format,
  async( req, res, next ) => {
    try{
      const sql = `SELECT appo_upd($1, $2, $3, $4, $5, $6, $7, $8)`;
      const bindArgs = [
        req.params.appo,
        req.body.emp,
        req.body.ss_add, req.body.ss_del,
        req.body.ss_add.length, req.body.ss_del.length,
        req.body.day, req.body.start_time
      ];
      let upd = await conn.query(
        sql, 
        {
          bind: bindArgs,
          type: "UPDATE"
        }
      );
        
      if( upd.error && upd.error.code === 40001 ){//CockroachDB asking for retry
        console.log( "ENTERS RETRY CASE" );
        let _try = 1;
        retryLoop: while( _try < 5 ){
        upd = await conn.query( sql, { bind: bindArgs, type: "UPDATE" } );
        if(
          !upd.error
          || ( upd.error && upd.error.code !== 40001 )
        ) break retryLoop;
        _try++;
      };
        if( _try === 5 ) return res.status( 500 ).json( retry_failed );
      };

      console.log( upd );

      if( !upd[ 1 ] ) res.sendStatus( 403 );
      else res.sendStatus( 204 );

    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;