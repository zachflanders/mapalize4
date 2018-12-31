import React, { Component } from 'react';
import './App.css';
import ol from 'openlayers';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import axios from 'axios';


var map = {};
var draw, snap; // global so we can remove them later
const drawerWidth = '200px';
var lines = new ol.geom.LineString();
var results = new ol.geom.LineString();
var source = new ol.source.Vector({
  features: lines
});
var resultsSource = new ol.source.Vector({
  features: results
});
var vector = new ol.layer.Vector({
  source: source
});
var resultsLayer = new ol.layer.Vector({
  source: resultsSource
});

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
    console.log(writer.writeFeatures(vector.getSource().getFeatures()));
    var drawnFeatures = writer.writeFeatures(vector.getSource().getFeatures());
    axios.post('/api/addLines', {
      features: drawnFeatures
    })
    .then(function(response){
      console.log(response);
    });

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
        </div>
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
    ];
    map = new ol.Map({
        target: 'map',
        layers: layers,
        view: new ol.View({
          center: ol.proj.fromLonLat([-94.6, 39.1]),
          zoom: 12,
          maxZoom: 20
        }),
        controls: [
          new ol.control.Zoom()
        ]
      });
    }
}

export default App;
