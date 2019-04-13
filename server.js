const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const Sequelize = require('sequelize');
//const db   = require('./config/db');


// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = new Sequelize(process.env.DATABASE || db.database, process.env.USERNAME || db.username, process.env.PASSWORD || db.password, {
  host: process.env.HOSTURL || db.url,
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
  },

  // SQLite only
  storage: 'path/to/database.sqlite'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.post('/api/addLines', function(req, res){
  console.log(req.body.features);
  var featureLayers = req.body.features;
  var query = "INSERT INTO northKC(line, point, comment, name, date) VALUES ";
  featureLayers.map(function(featureLayer, count){
    var featureCollection = JSON.parse(featureLayer);
    featureCollection.features.map(function(feature){
      console.log(feature);
      if(feature.geometry.type === 'LineString'){
        if(feature.properties != null){
          query = query + "(ST_Transform(ST_GeomFromGeoJSON('"+JSON.stringify(feature.geometry).slice(0,-1)+",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"EPSG:3857\"}}}'), 4326), null, '"+feature.properties.comment+"','"+feature.properties.layerName+"',to_timestamp("+Date.now() / 1000.0+")), ";
        }
        else{
          query = query + "(ST_Transform(ST_GeomFromGeoJSON('"+JSON.stringify(feature.geometry).slice(0,-1)+",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"EPSG:3857\"}}}'), 4326), null, ' ','"+feature.properties.layerName+"',to_timestamp("+Date.now() / 1000.0+")), ";
        }
      }
      else{
        if(feature.properties != null){
          query = query + "(null, ST_Transform(ST_GeomFromGeoJSON('"+JSON.stringify(feature.geometry).slice(0,-1)+",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"EPSG:3857\"}}}'), 4326), '"+feature.properties.comment+"','"+feature.properties.layerName+"',to_timestamp("+Date.now() / 1000.0+")), ";
        }
        else{
          query = query + "(null, ST_Transform(ST_GeomFromGeoJSON('"+JSON.stringify(feature.geometry).slice(0,-1)+",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"EPSG:3857\"}}}'), 4326), ' ','"+feature.properteis.LayerName+"',to_timestamp("+Date.now() / 1000.0+")), ";
        }
      }

    });
  });
  query = query.slice(0,-2);
  query = query +";"
  console.log(query);
  sequelize.query(query).then(results => {
    res.status(200).send({
      message: results,
    })
  })
});

app.get('/api/results', function(req, res){
  console.log('get lines');
  sequelize.query("SELECT * FROM northkc ").then(results => {
    res.status(200).send({
      data: results,
    })
  })
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}




// This will be our application entry. We'll setup our server here.
const http = require('http');

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);


module.exports = app;
