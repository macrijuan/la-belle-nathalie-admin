const { STRING, BIGINT, BOOLEAN, UUID, UUIDV4, INTEGER } = require("sequelize");

module.exports = ( sequelize ) => {
  sequelize.define( "user", {
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
    password:{
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
    },
    id_ref:{
      type: INTEGER,
      allowNull: false
    },
    email_update: {
      type: STRING,
      validate: {
        len: [ 66, 66 ]
      }
    },
    email_update_expiration: {
      type: BIGINT
    },
    possible_new_email: {
      type: STRING
    },
    password_update: {
      type: STRING,
      validate: {
        len: [ 66, 66 ]
      },
    },
    password_update_expiration: {
      type: BIGINT,
      defaultValue: 0
    },
    self_manager: {
      type: BOOLEAN,
      defaultValue: false
    }
  },{
    timestamps: false
  });
};