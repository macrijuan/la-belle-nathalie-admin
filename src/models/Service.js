const { STRING, ARRAY, JSON, TIME } = require("sequelize");

module.exports = sequelize=>{
  sequelize.define( "service", {
    name:{
      type:STRING,
      allowNull:false
    },
    am:{
      type:ARRAY( TIME ),
      allowNull:false
    },
    pm:{
      type:ARRAY( TIME ),
      allowNull:false
    }
  }, {
    timestamps:false
  } );
};