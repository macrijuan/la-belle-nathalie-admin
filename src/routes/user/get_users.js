const { Router } = require("express");
const router = Router();
const locals_setter = require("../endware/get_many_setter.js");
const getMany = require("../endware/get_many.js");
const { User, Routine, followed_user } = require("../../db.js");
const { not_found } = require("../../errors.js");

router.get("/get_users",
  ( req, res, next )=>{
    res.locals.data = {
      attributes:{ exclude:[  'password', 'reset_token' ] },
      through:{
        attributes:[]
      }
    };
    locals_setter( res, "User", "Users" ); next();
  },
  getMany
);

router.get("/get_followed/:user",
  async ( req, res, next ) => {
    try{
      const user = await User.findByPk( req.params.user, {
        attributes: [],
        include: {
          model: User,
          as: "followed_users",
          attributes: ["id", "nickname", "isTrainer"],
          through: { attributes: [] },
          include: {
            model: Routine,
            attributes: [ "name" ]
          }
        }
      } );
      if( user ){
        if( !user.followed_users) throw new Error( '"followed_users" property is not present in the result.' );
        res.json( user.followed_users );
      }else{
        res.status( 404 ).json( not_found( "User" ) );
      };
    }catch(err){
      next( err );
    };
  },
  // getMany
);

// router.get("/test", (req,res)=>{
//   res.json({value:key()});
// })

module.exports = router;