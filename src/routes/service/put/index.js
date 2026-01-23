const { Router } = require( "express" );
const router = Router();
const { Op } = require("sequelize");

const format = require("./controllers/format.js");
const exists = require("./controllers/existing.js")

const { Service, Sub_service } = require("../../../db.js");

router.put( "/put_service",
  format,
  exists,
  async( req, res, next ) => {
    try{
      const serv = await Service.update(
        req.body.update,
        {
          where:{
            id:{ [ Op.in ]: req.body.ids }
          }
        }
      );
      return res.status( 200 ).json( serv );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;