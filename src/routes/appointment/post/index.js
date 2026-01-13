const { Router } = require("express");
const router = Router();

const format = require("./controllers/format.js");

const { conn } = require("../../../db.js");

router.post( "/post_appointment",
  format,
  async ( req, res, next ) => {
  try{
    const t = await conn.query(
`WITH appos AS (
  SELECT start_time, end_time
  FROM appointments
  WHERE "employeeId" = $2
    AND day = $1
  UNION ALL
  SELECT start_time, end_time
  FROM appointments
  WHERE "userId" = 1
    AND day = $1
),
ordered AS (
  SELECT start_time, end_time
  FROM appos
  ORDER BY start_time, end_time
),
expanded AS (
  SELECT start_time, end_time,
    max(end_time) OVER (ORDER BY start_time, end_time ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_max
  FROM ordered
),
flagged AS (
  SELECT start_time, end_time, running_max,
    CASE 
      WHEN start_time > lag(running_max) OVER (ORDER BY start_time, end_time)
      THEN 1 ELSE 0 END AS is_new
  FROM expanded
),
grouped AS (
  SELECT start_time, end_time, running_max,
    sum(is_new) OVER (ORDER BY start_time, end_time) AS grp
  FROM flagged
),
merged AS (
  SELECT min(start_time) AS gap_start, max(end_time) AS gap_end
  FROM grouped
  GROUP BY grp
  ORDER BY min(start_time)
),
gaps AS (
  SELECT *, lead( gap_start ) OVER ( ORDER BY gap_start ) AS next_gap_start
  FROM merged
),
emp AS (
  SELECT id, shift, "serviceId"
  FROM employees
  WHERE id = $2
),
emp_shift AS (
  SELECT
    CASE emp.shift
      WHEN 'am' THEN services.am[ 1 ]
      WHEN 'pm' THEN services.pm[ 1 ]
    END AS _start,
    CASE emp.shift
      WHEN 'am' THEN services.am[ 2 ]
      WHEN 'pm' THEN services.pm[ 2 ]
    END AS _end,
    emp.id AS id,
    date_trunc( 'minute', ( NOW() + INTERVAL '30 minutes' ) )::TIME AS cur_time_plus_30
  FROM emp
  JOIN services ON services.id = emp."serviceId"
),
empty_day AS (
  SELECT
  CASE
    WHEN ( CURRENT_DATE < $1 OR cur_time_plus_30 <= emp_shift._start ) THEN emp_shift._start
    WHEN ( EXTRACT( EPOCH FROM ( emp_shift._end - cur_time_plus_30 ) ) / 60 ) >= ${res.locals.serv_duration} THEN cur_time_plus_30
  END AS gap_start
  FROM emp_shift
  WHERE NOT EXISTS( SELECT 1 FROM appos LIMIT 1 )
),
first_appo AS (
  SELECT gap_start
  FROM gaps
  CROSS JOIN emp_shift
  WHERE NOT EXISTS ( SELECT 1 FROM empty_day )
  LIMIT 1
),
between_shiftstart_and_first_appo AS (
  SELECT emp_shift._start AS gap_start
  FROM emp_shift
  CROSS JOIN first_appo
  WHERE
    NOT EXISTS ( SELECT 1 FROM empty_day )
    AND(
      (
        CURRENT_DATE < $1
        AND ( EXTRACT( EPOCH FROM ( first_appo.gap_start - emp_shift._start ) )  / 60 ) >= ${res.locals.serv_duration}
      ) 
      OR(
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 <= emp_shift._start
        AND ( EXTRACT( EPOCH FROM ( first_appo.gap_start - emp_shift._start ) )  / 60 ) >= ${res.locals.serv_duration}
      )
      OR (
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 > emp_shift._start
        AND emp_shift.cur_time_plus_30 < first_appo.gap_start
        AND ( EXTRACT( EPOCH FROM ( first_appo.gap_start - emp_shift.cur_time_plus_30 ) )  / 60 ) >= ${res.locals.serv_duration}
      )
    )
  LIMIT 1
),
between_appos AS (
  SELECT gaps.gap_end AS gap_start 
  FROM gaps
  CROSS JOIN emp_shift
  WHERE(
    NOT EXISTS ( SELECT 1 FROM empty_day )
    AND
    NOT EXISTS ( SELECT 1 FROM between_shiftstart_and_first_appo )
    AND(
      (
        CURRENT_DATE < $1
        AND ( EXTRACT( EPOCH FROM ( gaps.next_gap_start - gaps.gap_end ) ) / 60 ) >= ${res.locals.serv_duration}                      
      )
      OR
       (
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 <= gaps.gap_end
        AND ( EXTRACT( EPOCH FROM ( gaps.next_gap_start - gaps.gap_end ) ) / 60 ) >= ${res.locals.serv_duration}                      
      )
      OR (
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 > gaps.gap_end
        AND emp_shift.cur_time_plus_30 < gaps.next_gap_start
        AND ( EXTRACT( EPOCH FROM ( gaps.next_gap_start - emp_shift.cur_time_plus_30 ) ) / 60 ) >= ${res.locals.serv_duration}
      )
    )
  )
  LIMIT 1
),
last_gap AS (
  SELECT gap_end
  FROM gaps
  WHERE
    NOT EXISTS ( SELECT 1 FROM empty_day )
    AND NOT EXISTS ( SELECT 1 FROM between_appos )
  ORDER BY gap_start DESC
  LIMIT 1
),
between_last_appo_and_shiftend AS (
  SELECT last_gap.gap_end AS gap_start
  FROM last_gap
  CROSS JOIN emp_shift
  WHERE(
    NOT EXISTS ( SELECT 1 FROM empty_day )
    AND
    NOT EXISTS ( SELECT 1 FROM between_shiftstart_and_first_appo )
    AND
    NOT EXISTS ( SELECT 1 FROM between_appos )
    AND (
      (
        CURRENT_DATE < $1
        AND ( EXTRACT( EPOCH FROM ( emp_shift._end - last_gap.gap_end ) ) / 60 ) >= ${res.locals.serv_duration}
      )
      OR(
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 <= last_gap.gap_end
        AND ( EXTRACT( EPOCH FROM ( emp_shift._end - last_gap.gap_end ) ) / 60 ) >= ${res.locals.serv_duration}
      )
      OR(
        CURRENT_DATE = $1
        AND emp_shift.cur_time_plus_30 > last_gap.gap_end
        AND emp_shift.cur_time_plus_30 < emp_shift._end
        AND ( EXTRACT( EPOCH FROM ( emp_shift._end - emp_shift.cur_time_plus_30 ) ) / 60 ) >= ${res.locals.serv_duration}
      )
    )
  )
),
available_slot AS (
  SELECT gap_start FROM empty_day
  UNION ALL
  SELECT gap_start FROM between_shiftstart_and_first_appo
  UNION ALL
  SELECT gap_start FROM between_appos
  UNION ALL
  SELECT gap_start FROM between_last_appo_and_shiftend
  LIMIT 1
),
appo_insert AS (
  INSERT INTO appointments ( day, start_time, end_time, "userId", "employeeId", "serviceId", expired )
  SELECT 
    $1,
    CASE
      WHEN
        CURRENT_DATE = $1
        AND
        emp_shift.cur_time_plus_30 > available_slot.gap_start
      THEN emp_shift.cur_time_plus_30
      ELSE available_slot.gap_start
    END AS start_time,
    CASE
      WHEN
        CURRENT_DATE = $1
        AND 
        emp_shift.cur_time_plus_30 > available_slot.gap_start
      THEN emp_shift.cur_time_plus_30 + INTERVAL '${res.locals.serv_duration} minutes'
      ELSE available_slot.gap_start + INTERVAL '${res.locals.serv_duration} minutes'
    END AS end_time,
    1,
    $2,
    1,
    NULL
  FROM available_slot
  CROSS JOIN emp_shift
  WHERE available_slot.gap_start IS NOT NULL
  RETURNING id
),
inserted_appo_sub_servs AS (
  INSERT INTO appo_sub_servs ( "appointmentId", "subServiceId" )
  SELECT
    ai.id,
    vs.sub_id
  FROM appo_insert ai
  CROSS JOIN ( VALUES ${ res.locals.sub_servs.map( e => `(${ e })` ) } ) AS vs(sub_id)
  RETURNING 1 AS ok
)
SELECT id
FROM appo_insert;`,
    {
      transaction: res.locals.tran,
      bind:[
        req.body.day,
        req.body.employeeId,
      ],
      type:"SELECT"
    }
  );
  await res.locals.tran.commit();
  res.json( t );
  }catch( err ){
    await res.locals.tran.rollback();
    next( err );
  };
} );

module.exports = router;