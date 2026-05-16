const { Router } = require("express");
const { Op } = require("sequelize");
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/exists.js");

const { conn, appo_sub_servs } = require("../../../db.js");

const { retry_failed } = require("../../../errors.js");

//NOTE:
// SERVICE ID: $1
// APPOINTMENT ID: $2
// ADD ARRAY: $3
// DEL ARRAY: $4

router.put( "/put_appointment/:appoId",
  format,
  exists,
  async( req, res, next ) => {
    try{
      if( "add" in req.body ){

        let bindArgs = undefined;
        let query = undefined;


        if( "del" in req.body ){
          bindArgs = [ res.locals.servId, Number( req.params.appoId ), req.body.add, req.body.del ];
          query =  `WITH mins_to_add AS (
            SELECT COALESCE(SUM(mins), 0) AS result
            FROM sub_services
            WHERE "serviceId" = $1 AND id = ANY($3::int[])
          ),
          mins_to_del AS (
            SELECT COALESCE(SUM(mins), 0) AS result
            FROM sub_services
            WHERE "serviceId" = $1 AND id = ANY($4::int[])
          ),
          modifing_time AS (
            SELECT (a.result - d.result) AS total
            FROM mins_to_add a, mins_to_del d
          ),
          appo_duration AS (
            SELECT COALESCE(SUM(mins), 0) AS total
            FROM appo_sub_servs
            JOIN sub_services ON appo_sub_servs."subServiceId" = sub_services.id
            WHERE appo_sub_servs."appointmentId" = $2
          ),
          new_appo_duration AS (
            SELECT (appo_duration.total + modifing_time.total) AS "value"
            FROM appo_duration, modifing_time
          ),
          free_time_gap AS (
            SELECT
              cur.start_time,
              COALESCE(
                (
                  SELECT next.start_time
                  FROM appointments next
                  WHERE day = cur.day AND next.start_time > cur.start_time
                  ORDER BY next.start_time
                  LIMIT 1
                ),
                (
                  SELECT am[ 2 ]
                  FROM services
                  WHERE id = $1
                )
              ) AS next_start_time
            FROM appointments cur
            WHERE cur.id = $2
          ),
          approved AS (
            SELECT ((free_time_gap.next_start_time - free_time_gap.start_time) >= (new_appo_duration.value * INTERVAL '1 minute')) AS value
            FROM free_time_gap, new_appo_duration
          ),
          execute_del AS (
            DELETE FROM appo_sub_servs
            USING approved
            WHERE
              approved.value IS NOT FALSE
              AND 
              "appointmentId" = $2
              AND
              "subServiceId" = ANY($4::int[])
          )
          INSERT INTO appo_sub_servs ("appointmentId", "subServiceId")
          SELECT $2, ids.id
          FROM unnest($3::int[]) AS ids(id), approved
          WHERE approved.value;
          `
        }else{
          bindArgs = [ req.body.servId, Number( req.params.appoId ), req.body.add ]
          query = `WITH mins_to_add AS (
            SELECT COALESCE(SUM(mins), 0) AS result
            FROM sub_services
            WHERE "serviceId" = $1 AND id = ANY($3::int[])
          ),
          modifing_time AS (
            SELECT result AS total
            FROM mins_to_add 
          ),
          appo_duration AS (
            SELECT COALESCE(SUM(mins), 0) AS total
            FROM appo_sub_servs
            JOIN sub_services ON appo_sub_servs."subServiceId" = sub_services.id
            WHERE appo_sub_servs."appointmentId" = $2
          ),
          new_appo_duration AS (
            SELECT (appo_duration.total + modifing_time.total) AS "value"
            FROM appo_duration, modifing_time
          ),
          free_time_gap AS (
            SELECT
              cur.start_time,
              COALESCE(
                (
                  SELECT next.start_time
                  FROM appointments next
                  WHERE day = cur.day AND next.start_time > cur.start_time
                  ORDER BY next.start_time
                  LIMIT 1
                ),
                (
                  SELECT am[ 2 ]
                  FROM services
                  WHERE id = $1
                )
              ) AS next_start_time
            FROM appointments cur
            WHERE cur.id = $2
          ),
          approved AS (
            SELECT ((free_time_gap.next_start_time - free_time_gap.start_time) >= (new_appo_duration.value * INTERVAL '1 minute')) AS value
            FROM free_time_gap, new_appo_duration
          )
          INSERT INTO appo_sub_servs ("appointmentId", "subServiceId")
          SELECT $2, ids.id
          FROM unnest($3::int[]) AS ids(id), approved
          WHERE approved.value;
          `;
        };

        const queryRes = await conn.query(
          query,
          {
            bind: bindArgs,
            type:"UPDATE",
            transaction: res.locals.tran
          }
        );
      }else{
        const queryRes = await appo_sub_servs.destroy( {
          where:{
            appointmentId: req.params.appoId,
            subServiceId:{ [ Op.in ]: req.body.del } 
          },
          transaction: res.locals.tran
        } );
      };
      const transaction = await res.locals.tran.commit();
      if( transaction?.error.code === 40001 ){//CockroachDB asking for retry
        let _try = 1;
        retryLoop: while( _try<5 ){
          const retryTran = await res.locals.tran.commit();
          if( !transaction?.error.code === 40001 ) break retryLoop;
          _try++;
        };
        if( _try === 5 ) return res.status( 403 ).json( retry_failed );
      };
      res.sendStatus( 204 );
    }catch( err ){
      await res.locals.tran.rollback();
      next( err );
    };
  }
);

module.exports = router;