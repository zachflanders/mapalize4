const {Feature}  = require('../models');
const proj4 = require('proj4');

exports.getFeatures = (req, res) =>{
  const features = Feature.findAll()
    .then(features => {
      res.json({features});
    })
    .catch(err => console.log(err));
};

exports.createFeatures = (req, res) =>{
  console.log('creating features')
  let featureArray = [];
  let featureLayers = req.body.features;
  featureLayers.map(function(featureLayer, count){
    var featureCollection = JSON.parse(featureLayer);
    featureCollection.features.map(function(feature){
        console.log(feature);
        let newCoords = [];
        if(feature.geometry.type === 'LineString'){
          feature.geometry.coordinates.forEach(function(coord){
            newCoords.push(proj4('EPSG:3857','EPSG:4326',coord))
          })
          feature.geometry.coordinates = newCoords;
          feature.geometry.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
          featureArray.push({
            name:feature.properties.layerName,
            comment: feature.properties.comment,
            line: feature.geometry
          })
        }
        else{
          let newCoords= proj4('EPSG:3857','EPSG:4326',feature.geometry.coordinates);
          feature.geometry.coordinates = newCoords;
          feature.geometry.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
          console.log(feature);
          featureArray.push({
            name:feature.properties.layerName,
            comment: feature.properties.comment,
            point: feature.geometry
          });
        }
    });
  });
  Feature.bulkCreate(featureArray).then(results => {
    res.status(200).send({
      message: results
    })});

};
