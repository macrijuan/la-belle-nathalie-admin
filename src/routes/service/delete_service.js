const { Router } = require( "express" );
const router = Router();

const { Op } = require("sequelize");
const { Service } = require("../../db.js");
const { not_found, unknown } = require("../../errors.js");

router.delete( "/delete_services", 
  async( req, res, next ) => {
    try{
      console.log( "src/routes/service/delete_service.js" );
      console.log( req.body );
      if(
        !Array.isArray( req.body )
        || req.body.find( e => typeof e !== "number" )
      ){
        console.log( "Ids must be integers contained in an array" );
        return res.status( 400 ).json( unknown );
      };
      const serv = await Service.destroy({
        where:{
          id:{ [ Op.in ]: req.body }
        }
      });
      if( !serv ){
        res.status( 404 ).json( not_found( "Service" ) );
      }else{
        res.status( 200 ).json( serv );
      };
    }catch( err ){
      next( err );
    };
  }
);
// router.delete( "/delete_services", 
//   async( req, res, next ) => {
//     try{
//       console.log( "src/routes/service/delete_service.js" );
//       console.log( typeof req.body );
//       if(
//         Array.isArray( req.body )
//         || req.body.find( e => typeof e !== "number" )
//       ){
//         console.log( "Ids must be integers contained in an array" );
//         return res.status( 400 ).json( unknown );
//       };
//       const serv = await Service.destroy({
//         where:{
//           id:{ [ Op.in ]: req.body }
//         }
//       });
//       //dev log
//       console.log( serv );
//       if( !serv ){
//         res.status( 404 ).json( not_found( "Service" ) );
//       }else{
//         res.status( 200 ).json( serv );
//       };
//     }catch( err ){
//       next( err );
//     };
//   }
// );

module.exports = router;