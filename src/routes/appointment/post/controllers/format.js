const { custom_error, multi_errors, invalid_format } = require("../../../../errors.js");
const { dayVal, idVal } = require("../../../input_validations/appointments.js");

const format = async( req, res, next ) => {
  try{
    const errs = {};
    //format employee
    idVal( req.body.employeeId, errs, "employeeId" );
    if( errs.employeeId ) return res.status( 403 ).json( multi_errors( errs ) );
    //day
    dayVal( req.body.day, errs );
    if( errs.day ) return res.status( 403 ).json( multi_errors( errs ) );
    //sub_services
    let sub_servs = undefined;
    if( Array.isArray( req.body.sub_servs ) ){
      if( !req.body.sub_servs.length ) return res.status( 403 ).json( custom_error( "sub service", invalid_format ) );
      for( let a = 0; a < req.body.sub_servs.length; a++ ){
        idVal( req.body.sub_servs[ a ], errs, "sub_servs" );
        if( errs.sub_servs ) return res.status( 403 ).json( multi_errors( errs ) );
      };
    }else{
      return res.status( 403 ).json( custom_error( "sub_service", invalid_format ) ); 
    };
    //end_time
    let totalMinutes = 0;
    res.locals.sub_servs = [];
    sub_servs.rows.forEach(ss => {
      totalMinutes += parseInt( ss.mins );
      res.locals.sub_servs.push( parseInt( ss.id ) );
    });

    res.locals.serv_duration = totalMinutes;
    req.body = {
      day: req.body.day,
      serviceId: parseInt( empWithServ.serviceId ),
      employeeId: req.body.employeeId
    };
    next();
  }catch( err ){
    next( err );
  };
};

module.exports = format;