import React, { Component } from 'react';
import './App.css';

//openlayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import GeoJSON from 'ol/format/GeoJSON';
import {toLonLat} from 'ol/proj';
import {fromLonLat} from 'ol/proj';
import {transform} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate.js';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import Heatmap from 'ol/layer/Heatmap';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';

//Material-ui imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import FireIcon from '@material-ui/icons/Whatshot';
import LineIcon from '@material-ui/icons/Timeline';
import PointIcon from '@material-ui/icons/Place';
import DeleteIcon from '@material-ui/icons/Delete';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';



import turf from 'turf';
import axios from 'axios';

const drawerWidth = '200px';
var map = {};
var drawInteraction, snap; // global so we can remove them later

var linesSource = new VectorSource();
var resultsSource = new VectorSource();
var pointSource = new VectorSource();
var linesLayer = new VectorLayer({
  source: linesSource,
  style: new Style({
      stroke: new Stroke({
        color: '#2ecc71',
        width: 8
      })
    })
});
var resultsLayer = new VectorLayer({
  source: resultsSource
});

var pointsLayer = new VectorLayer({
  source: pointSource
});

var heatmapLayer = new Heatmap({
  source: pointSource
});
var overlay = new Overlay({
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

var drawnFeatures = 0;

var turnLineIntoArrayOfPoints = function(geoJSONLine){
  //if statement should check to make sure geoJSON line is valid
  if(true){
    var points = [];
    var length = turf.lineDistance(geoJSONLine, 'miles');
    for(var i=0; i <= length; i=i+0.01){
      if(length > 0 ){
        var thisPoint = turf.along(geoJSONLine, i, 'miles');
        points.push({lat:thisPoint.geometry.coordinates[1], lng:thisPoint.geometry.coordinates[0], value:1});
        pointSource.addFeature(new Feature(new Point(transform([thisPoint.geometry.coordinates[0],thisPoint.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857'))));
      }
    }
    return points;
  }
};

function EditButton(props) {
  const drawing = props.drawing;
  if (drawing == 'line') {
    return (
      <div>
        <strong>Create Features</strong><br /><br />
        <Paper style={{padding:'10px'}}>
          <Typography variant='h6'><LineIcon /> &nbsp;Add Line</Typography>
          <Button  size='small' color='primary' onClick={props.onClick4}>Finish Line</Button>
          <br />
          <Button size='small' color='primary' onClick={props.onClick2}>Delete Last Point</Button>
          <br />
          <Button  size='small' color='primary' onClick={props.onClick}>Stop Drawing</Button>
        </Paper>
      </div>
    );
  }
  else if(drawing == 'point') {
    return (
      <div>
        <strong>Create Features</strong><br /><br />
        <Paper style={{padding:'10px'}}>
          <Typography variant='h6'><PointIcon /> &nbsp;Add Point</Typography>
          <br />
          <Button  size='small' color='primary' onClick={props.onClick}>Stop Drawing</Button>
        </Paper>
      </div>
    );
  }
  else {
    return (
      <div>
          <strong>Create Features</strong><br /><br />
        <Button
          onClick = {props.onClick3}
          style = {{textAlign:'left'}}
        >
          <LineIcon color='#2ecc71' />  <span style ={{paddingLeft:'10px'}}>Add Bike Infrastructure</span>
        </Button>
        <br />
        <Button
          onClick = {props.onClick3}
        >
          <PointIcon /> &nbsp;&nbsp; Add Point
        </Button>
        <br />
        <Button>
          <EditIcon /> &nbsp;&nbsp; Edit Features
        </Button>
        <Button>
          <DeleteIcon /> &nbsp;&nbsp; Delete Features
        </Button>
      </div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'NorthKC Bike Plan',
      lineName: 'Draw Line',
      drawing: 'none',
      view: 0,
      popover: false,
      targetFeatureId: null
    };
    this.addInteraction = this.addInteraction.bind(this);
    this.upload = this.upload.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishLine = this.finishLine.bind(this);
    this.getResults = this.getResults.bind(this);
    this.getInput = this.getInput.bind(this);
    this.switchView = this.switchView.bind(this);
  }

  addInteraction(){
    var self = this;

        map.addInteraction(drawInteraction);
        this.setState({
          drawing: 'line'
        });


  }

  switchView(){
    if(this.state.view == 0){
      this.setState({
        view: 1
      });
      map.addLayer(heatmapLayer);
      map.removeLayer(linesLayer);
      this.getResults();
    }
    else{
      this.setState({
        view: 0
      })
      map.removeLayer(heatmapLayer);
      map.addLayer(linesLayer);

      this.getInput();
    }
  }

  getInput(){
    console.log('get input');
    console.log(map.getLayers());
    map.removeLayer(resultsLayer);
  }

  upload(){
    console.log('upload');
    var writer = new GeoJSON();
    var drawnFeatures = writer.writeFeatures(linesLayer.getSource().getFeatures());
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
        console.log(toLonLat(coord, 'EPSG:3857'));
        geoJSONLineReproject.geometry.coordinates.push(toLonLat(coord, 'EPSG:3857'))
      });
      console.log(geoJSONLineReproject)
      //var points = turnLineIntoArrayOfPoints(geoJSONLineReproject);
      //console.log(points);
    }
    linesSource.clear();


    axios.post('/api/addLines', {
      features: drawnFeatures
    })
    .then(function(response){
      console.log(response);
    });


  }

  cancelEdit(){
    console.log('remove interaction');
    map.removeInteraction(drawInteraction);
    this.setState({
      drawing: 'none'
    });
  }

  finishLine(){
    console.log('finish line');
    if(drawInteraction){
      drawInteraction.finishDrawing();
    }
  }

  deleteLastPoint(){
    console.log('delete last point');
    drawInteraction.removeLastPoint();
  }

  getResults(){
    axios.get('/api/results')
    .then(function(response){
      pointSource.clear();
      var lines = response.data.data[0];
      lines.forEach(function(line){
        var resultGeoJSONFeature = (new GeoJSON()).readFeature(line.geom, {dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"});
        var resultGeoJSON = (new GeoJSON()).writeFeature(resultGeoJSONFeature)
        turnLineIntoArrayOfPoints(line.geom);
      });
    });
  }

  render() {
    return (
      <div className="App">
        <AppBar position="static" style={{position:'relative', zIndex: 1201, }}>
          <Toolbar style={{height:'64px'}} >
            <Typography variant="h6" color="inherit" style={{flexGrow:1}}>
              {this.state.title}
            </Typography>

            <Tabs value={this.state.view} style={{height:'64px'}} onChange = {this.switchView}>
              <Tab label={<span><EditIcon style={{verticalAlign:'middle',top:'0px'}}/>&nbsp;&nbsp; Input</span>} style={{height:'64px'}} />
              <Tab label={<span><FireIcon style={{verticalAlign:'middle'}}/>&nbsp;&nbsp; Results</span>} />
            </Tabs>

          </Toolbar>

        </AppBar>
        <Drawer
          variant="permanent"
        >
          <div style={{width: drawerWidth, marginTop: '64px', padding: '15px'}}>
            <EditButton
              drawing={this.state.drawing}
              onClick={this.cancelEdit}
              onClick2={this.deleteLastPoint}
              onClick3 = {this.addInteraction}
              onClick4 = {this.finishLine}
            />
            <br />
            <Divider />
            <br />
            <Button
              variant='contained'
              color='primary'
              onClick = {this.upload}
            >
              Upload
            </Button>

          </div>
        </Drawer>
        <div id='map'></div>
        <Paper id='popover' style={{width:'250px', padding: '15px', position: 'absolute', left:'-140px', top:'-203px'}}>
         <form>
          <TextField
            label="Add Comment:"
            multiline
            rows="4"
            margin="normal"
            variant = 'outlined'
            style = {{width:'100%'}}
          />
          <br />
          <Button variant='contained' color='primary'>Save</Button>
          </form>
        </Paper>
      </div>
    );
  }
  componentDidMount(){
    this.getResults();
    var self =this;
    var layers = [
      new TileLayer({
        source: new TileWMS({
          url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
          params: {'LAYERS': 'Mapalize:OSM-KC-ROADS', 'TILED': true},
          serverType: 'geoserver',
          transition: 0
        })
      }),
      linesLayer,
      //resultsLayer
      //pointsLayer,
    ];

    var container = document.getElementById('popover');
    console.log(container);
    overlay.setElement(container);

    map = new Map({
        target: 'map',
        layers: layers,
        overlays: [overlay],
        view: new View({
          center: fromLonLat([-94.573, 39.143]),
          zoom: 14,
          maxZoom: 20,
          minZoom: 9
        }),
        controls: [
          new Zoom()
        ]
      });

      var resolution = map.getView().getResolution(),
           resolution_constant = 40075016.68557849,
           tile_pixel = 256;

      var result_resol_const_tile_px = resolution_constant / tile_pixel / resolution;
      var zoomRadius = result_resol_const_tile_px/25675;
      var zoomBlur = result_resol_const_tile_px/5359;
      heatmapLayer.setRadius(zoomRadius);
      heatmapLayer.setBlur(zoomBlur);

      map.getView().on('change:resolution', function(evt){
          resolution = evt.target.get(evt.key);
          result_resol_const_tile_px = resolution_constant / tile_pixel / resolution;
          zoomRadius = result_resol_const_tile_px/25675;
          zoomBlur = result_resol_const_tile_px/5359;

         console.info("radius: ", (zoomRadius), "blur: ",(zoomBlur));
         if(zoomRadius > 48){
           zoomRadius = 48;
         }
         if(zoomBlur > 128){
           zoomBlur = 128
         }

         heatmapLayer.setRadius(zoomRadius);
         heatmapLayer.setBlur(zoomBlur);
      });

      drawInteraction = new Draw({
            source: linesSource,
            type: 'LineString',
            style: new Style({
                stroke: new Stroke({
                  color: '#2ecc71',
                  width: 8
                }),
                image: new CircleStyle({
                  radius: 6,
                  fill: new Fill({
                    color: '#2ecc71'
                  })
                })
              })
          });

          drawInteraction.on('drawend', function(target){
            var coordinate = target.feature.getGeometry().getCoordinateAt(0.5);
            target.feature.setId(drawnFeatures);
            drawnFeatures++;
            overlay.setPosition(coordinate);
            self.setState({popover: true});
            self.setState({targetFeatureId: target.feature.getId()});
            console.log(target.feature.getId());
            self.cancelEdit();

          });

      /*
      map.on('singleclick', function(evt) {
        var coordinate = evt.coordinate;
        var hdms = toStringHDMS(toLonLat(coordinate));

        container.innerHTML = '<p>You clicked here:</p><code>' + hdms +
            '</code>';
        overlay.setPosition(coordinate);
      });
      */






    }
}

export default App;
