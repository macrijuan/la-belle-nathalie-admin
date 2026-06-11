const { Router } = require("express");
const { Op } = require("sequelize");
const router = Router();

const format = require("./controllers/format.js");
const exists = require("./controllers/exists.js");

const { conn, appo_sub_servs } = require("../../../db.js");

const { retry_failed } = require("../../../errors.js");

// -- REFERENCES & examples:
// -- APPOINTMENT ID: $1 = 1
// -- ADD ARRAY: $2 = ARRAY[8]
// -- DEL ARRAY: $3 = ARRAY[1]
// -- ADD ARRAY LENGTH: $4 = 1
// -- DEL ARRAY LENGTH: $5 = 1

router.put( "/put_appointment/:appoId",
  format,
  exists,
  async( req, res, next ) => {
    try{
      if( "add" in req.body ){

        let bindArgs = undefined;
        let query = undefined;

        if( "del" in req.body ){
          bindArgs = [ Number( req.params.appoId ), req.body.add, req.body.del, req.body.add.length, req.body.del.length ];
          query = `
WITH
  appo AS (
    SELECT id, day, start_time, end_time, "employeeId", "serviceId"
    FROM appointments
    WHERE id = $1
  ),
  sub_servs_add AS (
    SELECT ss.id, ss.mins
    FROM unnest($2::int[]) AS recived_ss(id)
    CROSS JOIN appo
    JOIN sub_services ss
      ON
        ss.id = recived_ss.id
        AND ss."serviceId" = appo."serviceId"
  ),
  sub_servs_del AS (
    SELECT "subServiceId"
    FROM unnest($3::int[]) AS recived_ss(id)
    JOIN appo_sub_servs
      ON
        recived_ss.id = appo_sub_servs."subServiceId"
        AND appo_sub_servs."appointmentId" = $1
  ),
  validations AS (
    SELECT
      EXISTS (SELECT 1 FROM appo)
      AND
      (SELECT COUNT(id) FROM sub_servs_add) = $4
      AND
      (SELECT COUNT("subServiceId") FROM sub_servs_del) = $5
      AND
      NOT EXISTS(
        SELECT 1
        FROM unnest($2::int[]) AS recived_ss(id)
        JOIN appo_sub_servs
          ON
            recived_ss.id = appo_sub_servs."subServiceId"
            AND appo_sub_servs."appointmentId" = $1
      )
      AS ok
  ),
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
  ),
  mins_to_add AS (
  SELECT COALESCE(SUM(mins), 0) AS value
  FROM unnest($2::int[]) AS recived_ss(rid)
  JOIN sub_servs_add
  ON
    (SELECT ok FROM validations)
    AND recived_ss.rid = sub_servs_add.id
  ),
  mins_to_del AS (
    SELECT COALESCE(SUM(mins), 0) AS value
    FROM unnest($3::int[]) AS recived_ss(rid)
    JOIN sub_services ss
    ON
      (SELECT ok FROM validations)
      AND recived_ss.rid = ss.id
  ),
    available_time AS (
    SELECT (
      end_of_available_time.value - appo.start_time
    ) AS value
    FROM appo
    CROSS JOIN end_of_available_time
    WHERE (SELECT ok FROM validations)
  ),
  new_appo_duration AS (
    SELECT ((appo.end_time - appo.start_time) + (mins_to_add.value - mins_to_del.value) * INTERVAL '1 minute') AS value
    FROM appo
    CROSS JOIN mins_to_add
    CROSS JOIN mins_to_del
  ),
  is_possible AS (
    SELECT (available_time.value >= new_appo_duration.value) AS ok
    FROM available_time
    CROSS JOIN new_appo_duration
    WHERE (SELECT ok FROM validations)
  ),
  remove_sub_servs AS (
    DELETE
    FROM appo_sub_servs
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
      AND "appointmentId" = $1
      AND "subServiceId" = ANY($3::int[])
  ),
  join_sub_servs AS (
    INSERT INTO appo_sub_servs("appointmentId", "subServiceId")
    SELECT $1, id FROM sub_servs_add
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
  )
UPDATE appointments
  SET end_time = (
    SELECT (appo.start_time + nad.value)
    FROM new_appo_duration nad
    CROSS JOIN appo
  )
WHERE
  (SELECT ok FROM validations)
  AND (SELECT ok FROM is_possible)
  AND id = (SELECT id FROM appo)
;
`
        }else{
          bindArgs = [ req.body.servId, Number( req.params.appoId ), req.body.add ]
          query = `
WITH
  appo AS (
    SELECT id, day, start_time, end_time, "employeeId", "serviceId"
    FROM appointments
    WHERE id = $1
  ),
  sub_servs_add AS (
    SELECT ss.id, ss.mins
    FROM unnest($2::int[]) AS recived_ss(id)
    CROSS JOIN appo
    JOIN sub_services ss
      ON
        ss.id = recived_ss.id
        AND ss."serviceId" = appo."serviceId"
  ),
  sub_servs_del AS (
    SELECT "subServiceId"
    FROM unnest($3::int[]) AS recived_ss(id)
    JOIN appo_sub_servs
      ON
        recived_ss.id = appo_sub_servs."subServiceId"
        AND appo_sub_servs."appointmentId" = $1
  ),
  validations AS (
    SELECT
      EXISTS (SELECT 1 FROM appo)
      AND
      (SELECT COUNT(id) FROM sub_servs_add) = $4
      AND
      (SELECT COUNT("subServiceId") FROM sub_servs_del) = $5
      AND
      NOT EXISTS(
        SELECT 1
        FROM unnest($2::int[]) AS recived_ss(id)
        JOIN appo_sub_servs
          ON
            recived_ss.id = appo_sub_servs."subServiceId"
            AND appo_sub_servs."appointmentId" = $1
      )
      AS ok
  ),
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
  ),
  mins_to_add AS (
    SELECT COALESCE(SUM(mins), 0) AS value
    FROM unnest($2::int[]) AS recived_ss(rid)
    JOIN sub_servs_add
    ON
      (SELECT ok FROM validations)
      AND recived_ss.rid = sub_servs_add.id
  ),
  mins_to_del AS (
    SELECT COALESCE(SUM(mins), 0) AS value
    FROM unnest($3::int[]) AS recived_ss(rid)
    JOIN sub_services ss
    ON
      (SELECT ok FROM validations)
      AND recived_ss.rid = ss.id
  ),
  available_time AS (
    SELECT (
      end_of_available_time.value - appo.start_time
    ) AS value
    FROM appo
    CROSS JOIN end_of_available_time
    WHERE (SELECT ok FROM validations)
  ),
  new_appo_duration AS (
    SELECT ((appo.end_time - appo.start_time) + (mins_to_add.value - mins_to_del.value) * INTERVAL '1 minute') AS value
    FROM appo
    CROSS JOIN mins_to_add
    CROSS JOIN mins_to_del
  ),
  is_possible AS (
    SELECT (available_time.value >= new_appo_duration.value) AS ok
    FROM available_time
    CROSS JOIN new_appo_duration
    WHERE (SELECT ok FROM validations)
  ),
  remove_sub_servs AS (
    DELETE
    FROM appo_sub_servs
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
      AND "appointmentId" = $1
      AND "subServiceId" = ANY($3::int[])
  ),
  join_sub_servs AS (
    INSERT INTO appo_sub_servs("appointmentId", "subServiceId")
    SELECT $1, id FROM sub_servs_add
    WHERE
      (SELECT ok FROM validations)
      AND (SELECT ok FROM is_possible)
  )
UPDATE appointments
  SET end_time = (
    SELECT (appo.start_time + nad.value)
    FROM new_appo_duration nad
    CROSS JOIN appo
  )
WHERE
  (SELECT ok FROM validations)
  AND (SELECT ok FROM is_possible)
  AND id = (SELECT id FROM appo)
;
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