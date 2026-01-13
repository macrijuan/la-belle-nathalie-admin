const { STRING, TIME, INTEGER } = require("sequelize");

module.exports = ( sequelize ) => {
  sequelize.define( "sub_service", {
    name:{
      type: STRING( 45 ),
      allowNull: false,
    },
    mins:{
      type: INTEGER,
      allowNull: false
    },
    detail:{
      type: STRING( 500 ),
      allowNull: false
    }
  }, {
    timestamps: false
  } )
};
