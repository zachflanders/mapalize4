import React, { Component } from 'react';
import './App.css';
import ol from 'openlayers';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import turf from 'turf';
import axios from 'axios';

const drawerWidth = '200px';
var map = {};
var draw, snap; // global so we can remove them later
var lines = new ol.geom.LineString();
var results = new ol.geom.LineString();
var points = new ol.geom.Point();

var source = new ol.source.Vector({
  features: lines
});
var resultsSource = new ol.source.Vector({
  features: results
});
var pointSource = new ol.source.Vector({
  features: points
})

var vector = new ol.layer.Vector({
  source: source
});
var resultsLayer = new ol.layer.Vector({
  source: resultsSource
});

var pointsLayer = new ol.layer.Vector({
  source: pointSource
});



var turnLineIntoArrayOfPoints = function(geoJSONLine){
  //if statement should check to make sure geoJSON line is valid
  if(true){
    var points = [];
    var length = turf.lineDistance(geoJSONLine, 'miles');
    for(var i=0; i <= length; i=i+0.01){
      if(length > 0 ){
        var thisPoint = turf.along(geoJSONLine, i, 'miles');
        points.push({lat:thisPoint.geometry.coordinates[1], lng:thisPoint.geometry.coordinates[0], value:1});
        pointSource.addFeature(new ol.Feature(new ol.geom.Point(ol.proj.transform([thisPoint.geometry.coordinates[0],thisPoint.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857'))));
      }
    }
    return points;
  }
};


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: 'NorthKC Bike Plan',
      lineName: 'Draw Line'
    };
    this.addInteraction = this.addInteraction.bind(this);
    this.upload = this.upload.bind(this);
    this.getResults = this.getResults.bind(this);



  }

  addInteraction(){
    console.log('add interaction');
    draw = new ol.interaction.Draw({
          source: source,
          type: 'LineString',
          style: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'blue',
                width: 8
              }),
              image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                  color: 'blue'
                })
              })
            })
        });
        map.addInteraction(draw);
  }

  upload(){
    console.log('upload');
    var writer = new ol.format.GeoJSON()
    var drawnFeatures = writer.writeFeatures(vector.getSource().getFeatures());
    var drawnFeaturesJSON = JSON.parse(drawnFeatures);
    console.log(drawnFeaturesJSON.features);
    for (var feature in drawnFeaturesJSON.features){
      if(!drawnFeaturesJSON.features.hasOwnProperty(feature)) continue;
      var geoJSONLine = drawnFeaturesJSON.features[feature];
      console.log(geoJSONLine);
      var geoJSONLineReproject = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [],
        },
        properties: null
      }
      geoJSONLine.geometry.coordinates.forEach(function(coord){
        console.log(coord);
        console.log(ol.proj.toLonLat(coord, 'EPSG:3857'));
        geoJSONLineReproject.geometry.coordinates.push(ol.proj.toLonLat(coord, 'EPSG:3857'))
      });
      console.log(geoJSONLineReproject)
      var points = turnLineIntoArrayOfPoints(geoJSONLineReproject);
      console.log(points);
    }
    source.clear();

    /*
    axios.post('/api/addLines', {
      features: drawnFeatures
    })
    .then(function(response){
      console.log(response);
    });
    */

  }

  getResults(){
    console.log('get results');

    axios.get('/api/results')
    .then(function(response){

      console.log(response.data.data[0]);
      var lines = response.data.data[0];
      lines.forEach(function(line){
        var resulsStuff = (new ol.format.GeoJSON()).readFeatures(line.geom, {dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"});
        console.log(resulsStuff);
        var layerLines = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: resulsStuff
          }),
        });
        map.addLayer(layerLines);
      })

    });

  }

  render() {
    return (
      <div className="App">
        <AppBar position="static" style={{position:'relative', zIndex: 1201}}>
          <Toolbar>
            <Typography variant="h6" color="inherit" >
              {this.state.title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
        >
          <div style={{width: drawerWidth, marginTop: '64px', padding: '15px'}}>
            <Button
              variant='contained'
              onClick = {this.addInteraction}
            >
              {this.state.lineName}
            </Button>
            <br />
            <br />
            <Button
              variant='contained'
              onClick = {this.upload}
            >
              Upload
            </Button>
            <br />
            <br />
            <Button
              variant='contained'
              onClick = {this.getResults}
            >
              Get Results
            </Button>
          </div>
        </Drawer>
        <div id='map'>
        </div><div id='popup'>hello.</div>
      </div>
    );
  }
  componentDidMount(){
    var self =this;
    var layers = [
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
          params: {'LAYERS': 'Mapalize:OSM-KC-ROADS', 'TILED': true},
          serverType: 'geoserver',
          transition: 0
        })
      }),
      vector,
      resultsLayer
      //pointsLayer,
    ];

    map = new ol.Map({
        target: 'map',
        layers: layers,
        view: new ol.View({
          center: ol.proj.fromLonLat([-94.6, 39.1]),
          zoom: 18,
          maxZoom: 20,
          minZoom: 9
        }),
        controls: [
          new ol.control.Zoom()
        ]
      });


      var heatmaplayer = new ol.layer.Heatmap({
              source: pointSource,
              blur: 48,
              radius: 10
            });
      map.addLayer(heatmaplayer);
      map.getCurrentScale = function () {
        //var map = this.getMap();
        var map = this;
        var view = map.getView();
        var zoom = map.getView().getZoom();
        var resolution = view.getResolution();
        var units = map.getView().getProjection().getUnits();
        console.log('zoom: ', zoom, 'resolution: ', resolution, ' ',units, '/pixel');
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var scale = resolution * mpu * 39.37 * dpi;
        return scale;

    };


      map.getView().on('change:resolution', function(evt){
          var resolution = evt.target.get(evt.key),
               resolution_constant = 40075016.68557849,
               tile_pixel = 256;

          var result_resol_const_tile_px = resolution_constant / tile_pixel / resolution;
          map.getCurrentScale();
          var zoomRadius = result_resol_const_tile_px/25675;
          var zoomBlur = result_resol_const_tile_px/5359;

         console.info("radius: ", (zoomRadius), "blur: ",(zoomBlur));
         if(zoomRadius > 48){
           zoomRadius = 48;
         }
         if(zoomBlur > 128){
           zoomBlur = 128
         }

         heatmaplayer.setRadius(zoomRadius);
         heatmaplayer.setBlur(zoomBlur);

      });




      var popup = new ol.Overlay({element:document.getElementById('popup')});

      map.addOverlay(popup);



      // Add an event handler for the map "singleclick" event
      map.on('singleclick', function(evt) {

          // Hide existing popup and reset it's offset
          //popup.hide();
          popup.setOffset([0, 0]);

          // Attempt to find a feature in one of the visible vector layers
          var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
              return feature;
          });

          if (feature) {

              var coord = feature.getGeometry().getCoordinates();
              var props = feature.getProperties();
              //var info = "<h2>"+props+"</h2>";
              // Offset the popup so it points at the middle of the marker not the tip
              popup.setOffset([0, -22]);
              //popup.show(coord);

          }

      });

    }
}

export default App;
