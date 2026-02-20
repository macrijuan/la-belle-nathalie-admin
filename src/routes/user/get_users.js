const { Router } = require("express");
const router = Router();
const locals_setter = require("../endware/get_many_setter.js");
const getMany = require("../endware/get_many.js");
const { User } = require("../../db.js");
const { not_found } = require("../../errors.js");

router.get("/get_users",
  async ( req, res, next ) => {
    try{
      const users = await User.findAll({
        attributes: [  "id", "email", "first_name", "last_name", "id_ref" ]
      });
      res.status( 200 ).json( users );
    }catch( err ){
      next( err );
    };
  }
);

module.exports = router;