const { Router } = require( "express" );
const router = Router();

const { Appointment, Service, Sub_service, Employee } = require("../../db.js");

router.get( "/get_appointments", async ( req, res, next ) => {
  try{
    const utcDate = new Date();
    const utcYear = utcDate.getUTCFullYear();
    const utcMonth = utcDate.getUTCMonth() + 1;
    const utcDay = utcDate.getUTCDate();
    const utcHH = utcDate.getUTCHours();
    const utcMM = utcDate.getUTCMinutes();
    const utcSS = utcDate.getUTCSeconds();
    const utcMilS = utcDate.getUTCMilliseconds();
    const BsAsDate = new Date(
      `${utcYear}-${utcMonth<10 ?`0${utcMonth}` :utcMonth}-${utcDay<10 ?`0${utcDay}` :utcDay}T${utcHH<10 ?`0${utcHH}` :utcHH}:${utcMM<10 ?`0${utcMM}` :utcMM}:${utcSS<10 ?`0${utcSS}` :utcSS}.${utcMilS}+03:00`
    );

    let where = req.query.filters ?req.query.filters :{ day: `${BsAsDate.getUTCFullYear()}-${BsAsDate.getUTCMonth()+1}-${BsAsDate.getUTCDate()}` };

    
    const appointments = await Appointment.findAll({
      where,
      order:[ [ "day", "ASC" ], [ "start_time", "ASC" ] ],
      attributes:{
        exclude:[ "userId", "serviceId", "employeeId" ]
      },
      include:[
        { model: Service, attributes:[ "id", "name" ] },
        { model: Sub_service, attributes:[ "id", "name", "mins" ], through:{ attributes:[] } },
        { model: Employee, attributes:[ "id", "first_name", "last_name" ] }
      ]
    });
    res.json( appointments );
  }catch( err ){
    next( err );
  }
} );


router.get( "/get_all_appos/:empId",
  ( req, res, next ) => {
    console.log( req.params );
    if( !( typeof req.params.empId === 'string' && ( /^-?[1-9]\d{0,8}$/ ).test( req.params.empId ) ) ) return next( new Error( 'req.params.empId -> empId must be an integer (number)' ) );
    next();
  },
  async ( req, res, next ) => {
    try{
      const appointments = await Appointment.findAll({
        attributes:[ "day", "start_time", "end_time", "employeeId" ],
        where:{ employeeId: Number( req.params.empId ) }
      });
      res.json( appointments );
    }catch( err ){
      next( err );
    }
  }
);


module.exports = router;