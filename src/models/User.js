const { STRING, BIGINT, UUID, UUIDV4 } = require("sequelize");

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
      }
    },
    password_update_expiration: {
      type: BIGINT,
      defaultValue: 0
    }
  },{
    timestamps: false
  });
};