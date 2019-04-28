const Sequelize = require('sequelize');
const dotenv = require("dotenv");
const FeatureModel = require('./feature');

dotenv.config()
//Connect to Database
const sequelize = new Sequelize(process.env.DATABASE , process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.HOSTURL,
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const Feature = FeatureModel(sequelize, Sequelize);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


  module.exports = {Feature};
