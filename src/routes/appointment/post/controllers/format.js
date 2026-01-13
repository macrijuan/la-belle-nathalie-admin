const { Op } = require("sequelize");
const { custom_error, multi_errors, not_found, invalid_format } = require("../../../../errors.js");
const { dayVal, idVal } = require("../../../input_validations/appointments.js");
const { conn, Sub_service, Employee } = require("../../../../db.js");

const format = async( req, res, next ) => {
  try{
    res.locals.tran = await conn.transaction();
    const errs = {};
    //format employee
    idVal( req.body.employeeId, errs, "employeeId" );
    if( errs.employeeId ){
      await res.locals.tran.rollback();
      return res.status( 403 ).json( multi_errors( errs ) );
    };
    //check emp & service existence
    const empWithServ = await Employee.findByPk( req.body.employeeId, { transaction: res.locals.tran, lock: true } );
    if( !empWithServ ){
      await res.locals.tran.rollback();
      return res.status( 404 ).json( not_found( "Employee or service" ) );
    };
    //day
    dayVal( req.body.day, errs );
    if( errs.day ){
      await res.locals.tran.rollback();
      return res.status( 403 ).json( multi_errors( errs ) );
    };
    //sub_services
    let sub_servs = undefined;
    if( Array.isArray( req.body.sub_servs ) ){
      if( !req.body.sub_servs.length ){
        await res.locals.tran.rollback();
        return res.status( 403 ).json( custom_error( "sub service", invalid_format ) );
      };
      for( let a = 0; a < req.body.sub_servs.length; a++ ){
        idVal( req.body.sub_servs[ a ], errs, "sub_servs" );
        if( errs.sub_servs ){
          await res.locals.tran.rollback();
          return res.status( 403 ).json( multi_errors( errs ) );
        };
      };
      sub_servs = await Sub_service.findAndCountAll({
        limit: req.body.sub_servs.length, offset: 0,
        where:{ id:{ [ Op.in ]: req.body.sub_servs }, serviceId: empWithServ.serviceId },
        attributes:[ "id", "mins" ],
        raw: true
      });
      if( sub_servs.rows.length !== req.body.sub_servs.length ){
        await res.locals.tran.rollback();
        return res.status( 403 ).json( not_found( "Sub service/s" ) );
      };
    }else{
      await res.locals.tran.rollback();
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
    await res.locals.tran.rollback();
    next( err );
  };
};

module.exports = format;