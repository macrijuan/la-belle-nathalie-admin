const { DATEONLY, TIME, BOOLEAN } = require("sequelize");

module.exports = sequelize=>{
  sequelize.define( "appointment", {
    day:{
      type:DATEONLY,
      allowNull:false
    },
    start_time:{
      type:TIME,
      allowNull:false
    },
    end_time:{
      type:TIME,
      allowNull:false
    },
    expired:{
      type:BOOLEAN
    }
  },{
    timestamps:false,
    indexes:[
      {
        fields: [ 'clientId', 'day', 'start_time', 'serviceId', 'employeeId'  ]
      },
      {
        fields: [ 'day', 'start_time', 'clientId', 'employeeId'  ]
      },
      {
        fields: [ 'clientId' ]
      },
      {
        fields: [ 'employeeId'  ]
      },
      {
        fields: [ 'day', 'clientId', 'start_time'  ]
      },
      {
        fields: [ 'day', 'employeeId', 'start_time'  ]
      }
    ]
  });
};