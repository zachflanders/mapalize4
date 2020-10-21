const Sequelize = require('sequelize');
const dotenv = require("dotenv");
const FeatureModel = require('./feature');
const UserModel = require('./user');


dotenv.config()
//Connect to Database
const sequelize = new Sequelize(
  process.env.DATABASE , process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.HOSTURL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
});

const Feature = FeatureModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);


sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  sequelize.sync()
  .then(() => {
    console.log(`Database & tables created!`)
  })


  module.exports = {Feature, User};
