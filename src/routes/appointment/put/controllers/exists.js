const { Op } = require("sequelize");
const { conn, Appointment, Sub_service } = require("../../../../db.js");

const exists = async ( req, res, next ) => {
  try{
    res.locals.tran = await conn.transaction();

    const options = {
      attributes: [ 'id', 'serviceId' ],
      include: [ { model: Sub_service, attributes: [ 'id' ], through: { attributes: [] }, raw: true } ],
      transaction: res.locals.tran
    };

    const appo = await Appointment.findByPk( req.params.appoId, options );
  
    if( !appo ) throw new Error( `Appointment with id=${req.params.appoId} not found` );

    // if( appo.serviceId !== req.body.service ) throw new Error( `Appointment with serviceId=${req.body.service} not found` );

    if( req.body.del ){
      const notJoinedSubServ = req.body.del.find(
        idToDel => !appo.sub_services.some(
          ss => ss.id === idToDel
        )
      );
      if( notJoinedSubServ ) throw new Error( `Sub serv with id=${notJoinedSubServ} not joined to appo id=${req.params.appoId}` );
    };

    if( req.body.add ){
      const subServsToAdd = await Sub_service.findAll({
        where:{
          id:{ [ Op.in ]: req.body.add }
        },
        limit: req.body.add.length,
        transaction: res.locals.tran
      });
      if( subServsToAdd.length !== req.body.add.length ) throw new Error( "Some sub service from body.add not found" );
    };

    res.locals.servId = appo.serviceId;

    next();

  }catch( err ){
    next( err );
  };
};

module.exports = exists;