const { Router }=require("express");
const router = Router();

const { unknown, not_found } = require("../../errors.js");

const { Appointment } = require("../../db.js");


router.delete( "/delete_appointment/:id",
	async( req, res, next ) => {
		try{
			if( !( /^[1-9]\d{0,4}$/ ).test( req.params.id ) ) return res.status( 403 ).json( unknown );
			const appo = await Appointment.destroy( { where:{ id:req.params.id } } );
			console.log( appo );
			if( appo === 0 ){
				res.status( 404 ).json( not_found( "Appointment" ) );
			}else{
				res.sendStatus( 204 );
			};
		}catch( err ){
			next( err );
		};
  }
);

module.exports = router;