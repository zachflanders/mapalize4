const {Feature}  = require('../models');
const proj4 = require('proj4');
const _ = require('lodash');


exports.getFeatureById = (req, res) =>{
  console.log('getting feature: ', req.params.featureId);
  let id=req.params.featureId;
  Feature.find({where:{id:id}})
  .then(feature =>{
    res.json({feature});
  })
  .catch(err => console.log(err));
}

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

exports.updateFeature = (req, res) =>{
  let feature = req.body.feature;
  let id=req.params.featureId;
  let putFeature = {};
  console.log('feature: ',feature);
  let newCoords = [];
  if(feature.geometry.type === 'LineString'){
    feature.geometry.coordinates.forEach(function(coord){
      newCoords.push(proj4('EPSG:3857','EPSG:4326',coord))
    });
    feature.geometry.coordinates = newCoords;
    feature.geometry.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
    feature.name = feature.properties.layerName;
    feature.comment = feature.properties.comment;
    feature.line = feature.geometry;
    console.log(feature);
    Feature.update({
      name: feature.name,
      comment: feature.comment,
      line: feature.line

    },
    {where: {id:id}})
    .then((response, error) =>{
      if(error){
        return res.json({error: error})
      }
      return res.json({message: 'Feature successfully saved.'});

    })
  }
  else{
    let newCoords= proj4('EPSG:3857','EPSG:4326',feature.geometry.coordinates);
    feature.geometry.coordinates = newCoords;
    feature.geometry.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
    feature.name = feature.properties.layerName;
    feature.comment= feature.properties.comment;
    feature.point= feature.geometry;
    Feature.update({
      name: feature.name,
      comment: feature.comment,
      point: feature.point
    },
    {where: {id:id}})
    .then((response, error) =>{
      if(error){
        return res.json({error: error})
      }
      return res.json({message: 'Feature successfully saved.'});

    })
  }
};

exports.deleteFeature = (req, res) => {
  console.log('delete feature');
  let id=req.params.featureId;
  Feature.destroy({where: {id:id}})
  .then((response, error)=>{
    if(error){
      return res.json({error: error})
    }
    return res.json({message: 'Feature deleted.'});
  })

}
