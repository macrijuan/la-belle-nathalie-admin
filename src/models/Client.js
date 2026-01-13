const { STRING, UUID, UUIDV4 } = require("sequelize");

module.exports = ( sequelize ) => {
  sequelize.define( "client", {
    // id:{
    //   type:UUID,
    //   primaryKey:true,
    //   defaultValue:UUIDV4,
    //   allowNull:false
    // },
    email: {
      type: STRING( 254 ),
      allowNull: false
    },
    phone:{
      type: STRING( 128 ),
      allowNull: false
    },
    first_name:{
      type:STRING( 35 ),
      allowNull:false
    },
    last_name: {
      type: STRING( 35 ),
      allowNull: false
    }
  },{
    timestamps: false
  });
};