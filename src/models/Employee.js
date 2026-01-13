const { STRING, INTEGER, ENUM, UUID, UUIDV4  } = require("sequelize");

module.exports = ( sequelize ) => {
  sequelize.define( "employee", {
   // id:{
    //   type:UUID,
    //   primaryKey:true,
    //   defaultValue:UUIDV4,
    //   allowNull:false
    // },
    first_name:{
      type:STRING,
      allowNull:false
    },
    last_name:{
      type:STRING,
      allowNull:false
    },
    shift:{
      type:ENUM( "am", "pm" ),
      allowNull:false
    },
    identity:{
      type:INTEGER,
      allowNull:false,
      unique:true
    }
  },{
    timestamps:false
  });
};