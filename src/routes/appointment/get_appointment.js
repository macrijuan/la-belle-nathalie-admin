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
        { model: Sub_service, attributes:[ "id", "name" ], through:{ attributes:[] } },
        { model: Employee, attributes:[ "id", "first_name", "last_name" ] }
      ]
    });
    res.json( appointments );
  }catch( err ){
    next( err );
  }
} );

module.exports = router;