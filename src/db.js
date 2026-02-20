const { Sequelize } = require('sequelize');
require("dotenv").config();
const dbConfig = require("./dbConfig.js");

let sequelize = process.env.ENVIRONMENT !== "development"
 ?new Sequelize( `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, dbConfig )
:new Sequelize( `postgres://${process.env.LOCAL_DB_USER}:${process.env.LOCAL_DB_PASSWORD}@${process.env.LOCAL_DB_HOST}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB_NAME}`,{
  logging:false, native:false, timezone:'-03:00'
})

const modelDefiners = [
  require("./models/Admin.js"),
  require("./models/Appointment.js"),
  require("./models/Employee.js"),
  require("./models/Service.js"),
  require("./models/Sub_service.js"),
  require("./models/User.js")
];

modelDefiners.forEach(model => model(sequelize));

let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => {
  return [ entry[0][0].toUpperCase() + entry[0].slice(1), entry[1] ]
});
sequelize.models = Object.fromEntries( capsEntries );


const { User, Appointment, Employee, Service, Sub_service } = sequelize.models;

User.hasMany( Appointment, { onDelete: 'CASCADE' } );
Appointment.belongsTo( User );

Employee.hasMany( Appointment, { onDelete: 'CASCADE' } );
Appointment.belongsTo( Employee );

Appointment.belongsToMany( Sub_service, { through: "appo_sub_servs", timestamps: false, onDelete: 'CASCADE' } );
Sub_service.belongsToMany( Appointment, { through: "appo_sub_servs", timestamps: false, onDelete: 'CASCADE' } );

Service.hasMany( Sub_service, { onDelete: 'CASCADE' } );
Sub_service.belongsTo( Service );

Service.hasMany( Employee, { onDelete: 'CASCADE' } );
Employee.belongsTo( Service );

Service.hasMany( Appointment, { foreignKey: "serviceId", onDelete: 'CASCADE' } );
Appointment.belongsTo( Service, { foreignKey: "serviceId" } );

module.exports = {
  ...sequelize.models,
  conn: sequelize
};