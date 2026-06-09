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
          query = `
WITH
  appo AS (
    SELECT id, day, start_time, end_time, "employeeId", "serviceId"
    FROM appointments
    WHERE
      id = 2/* $1 */
  ),
  sub_servs_add AS (
    SELECT ss.id, ss.mins
    FROM unnest(ARRAY[2, 8]/* $2 */::int[]) AS recived_ss(id)
    CROSS JOIN appo
    JOIN sub_services ss
      ON
        ss.id = recived_ss.id
        AND ss."serviceId" = appo."serviceId"
  ),
  sub_servs_del AS (
    SELECT "subServiceId"
    FROM unnest(ARRAY[1]/* $3 */::int[]) AS recived_ss(id)
    JOIN appo_sub_servs
      ON
        recived_ss.id = appo_sub_servs."subServiceId"
        AND appo_sub_servs."appointmentId" = 2/* $1 */
  ),
  validations AS (
    SELECT
      EXISTS (SELECT 1 FROM appo) --check appo exists
      AND
      (SELECT COUNT(id) FROM sub_servs_add) = 2/* $4 */ --check all sub_servs_add exist
      AND
      (SELECT COUNT("subServiceId") FROM sub_servs_del) = 1/* $5 */ --check all sub_servs_del exist 
      AND
      NOT EXISTS( --check any sub_servs_add don't exist already
        SELECT 1
        FROM unnest( ARRAY[2, 8]/* $2 */::int[]) AS recived_ss(id)
        JOIN appo_sub_servs
          ON
            recived_ss.id = appo_sub_servs."subServiceId"
            AND appo_sub_servs."appointmentId" = 2/* $1 */
      )
      AS ok
  )
  -- SELECT * FROM validations;
  ,
  ---------------------------------------------------------------------------------
  ---------------------------------------------------------------------------------
  ---------------------------------------------------------------------------------
  end_of_available_time AS (
    SELECT
      COALESCE(
        (
          SELECT MIN(a.start_time) AS value
          FROM appointments a
          CROSS JOIN appo
          WHERE a.day = appo.day
            AND a."employeeId" = appo."employeeId"
            AND a.start_time > appo.start_time
        ),
        (
        SELECT 
          CASE
            WHEN e.shift = 'am' THEN s.am[2] ELSE s.pm[2]
          END AS value
        FROM appo a
        INNER JOIN services s
          ON a."serviceId" = s.id
        INNER JOIN  employees e
          ON a."employeeId" = e.id
        )
      )
    AS value
    WHERE (SELECT ok FROM validations)
  )
  -- SELECT * FROM end_of_available_time;
  ,
  mins_to_add AS (
  SELECT COALESCE(SUM(mins), 0) AS value
  FROM unnest(ARRAY[ 2, 8 ]/* $2 */::int[]) AS recived_ss(rid)
  JOIN sub_servs_add
  ON
    (SELECT ok FROM validations)
    AND recived_ss.rid = sub_servs_add.id
  )
  -- SELECT * FROM mins_to_add;
  ,
  mins_to_del AS (
    SELECT COALESCE(SUM(mins), 0) AS value
    FROM unnest(ARRAY[1]/* $3 */::int[]) AS recived_ss(rid)
    JOIN sub_services ss
    ON
      (SELECT ok FROM validations)
      AND recived_ss.rid = ss.id
  )
  -- SELECT * FROM mins_to_del;
  ,
    available_time AS (
    SELECT (
      end_of_available_time.value - appo.start_time
    ) AS value
    FROM appo
    CROSS JOIN end_of_available_time
    WHERE ( SELECT ok FROM validations )
  )
  -- SELECT * FROM available_time;
  ,
  is_possible AS (
    SELECT (
      available_time.value >= (
        (appo.end_time - appo.start_time)
        + (mins_to_add.value - mins_to_del.value) * INTERVAL '1 minute'
      )
    ) AS ok
    FROM available_time
    CROSS JOIN mins_to_add
    CROSS JOIN mins_to_del
    CROSS JOIN appo
    WHERE ( SELECT ok FROM validations )
  )
  -- SELECT * FROM is_possible;
  ,
  remove_sub_servs AS (
    DELETE
    FROM appo_sub_servs
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
      AND "appointmentId" = 2/* $1 */
      AND "subServiceId" = ANY(ARRAY[1]/* $3 */::int[])
    -- RETURNING *
  )
  -- SELECT * FROM remove_sub_servs;
  ,
  join_sub_servs AS (
    INSERT INTO appo_sub_servs ( "appointmentId", "subServiceId" )
    SELECT 2, unnest(ARRAY[ 2, 8 ]/* $2 */::int[])
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
    RETURNING *
  )
  -- SELECT * FROM join_sub_servs;
  ,
UPDATE appointments
  SET end_time = (SELECT value FROM new_appo_duration) CREATE A CTE WITH TO FINALLY FINISH THIS QUERY, CHAMP! FUCK YEAH! CONGRATS. YOU ARE MOVING FORWARD
WHERE
  ( SELECT ok FROM validations )
  AND (SELECT ok FROM is_possible)
;
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