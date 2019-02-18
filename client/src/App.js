import React, { Component } from 'react';
import './App.css';
import MainDisplay from './main.js';

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
import {METERS_PER_UNIT} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate.js';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import Heatmap from 'ol/layer/Heatmap';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select.js';
import {click, pointerMove, altKeyOnly} from 'ol/events/condition.js';

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
import PointIcon from '@material-ui/icons/AddLocation';
import UploadIcon from '@material-ui/icons/CloudUpload';
import MapIcon from '@material-ui/icons/Map';
import PlaceIcon from '@material-ui/icons/Place';
import ViewIcon from '@material-ui/icons/ViewModule';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';

import indigo from '@material-ui/core/colors/indigo';
import pink from '@material-ui/core/colors/pink';
import cyan from '@material-ui/core/colors/cyan';
import teal from '@material-ui/core/colors/teal';
import amber from '@material-ui/core/colors/amber';
import lightGreen from '@material-ui/core/colors/lightGreen';
import blue from '@material-ui/core/colors/blue';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import turf from 'turf';
import axios from 'axios';

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: teal
  },
});

const drawerWidth = '220px';
var map = {};
var drawInteraction = []
var snap;
var drawLineStyle = new Style({
    stroke: new Stroke({
      color: '#00c853',
      width: 8
    })
  })
var linesSource = new VectorSource();
var resultsSource = new VectorSource();
var pointSource = new VectorSource();
var linesLayer = new VectorLayer({
  source: linesSource,
  style: drawLineStyle
});
var resultsLayer = new VectorLayer({
  source: resultsSource
});

var pointsLayer = new VectorLayer({
  source: pointSource
});

var heatmapLayer = new Heatmap({
  source: pointSource,
  renderMode: 'image'
});
var overlay = new Overlay({
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
var select = new Select({
  condition: click,
  style: drawLineStyle,
  layers: [linesLayer]
});
var selectHover = new Select({
  condition: pointerMove,
  style: drawLineStyle,
  layers: [linesLayer]
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'NorthKC Bike Plan',
      lineName: 'Draw Line',
      features:[
        {
          name:'Add Bike Infrastructure',
          prompt:'Where would you bike if it was comfortable?',
          type:'line',
          color: '#00c853'
        },
        {
          name:'Add Bike Share',
          prompt:'Where would you want bike share?',
          type:'point',
          color: '#2196f3'
        },
        {
          name:'Unsafe Location',
          prompt:'What locations feel unsafe or uncomfortable for biking?',
          type:'point',
          color: '#f44336'
        }
      ],
      drawing: false,
      view: 0,
      popover: false,
      targetFeatureId: null,
      comment: undefined,
      mode: 'map',
      viewMap: true,
      lineData: null
    };
    this.addInteraction = this.addInteraction.bind(this);
    this.upload = this.upload.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.finishLine = this.finishLine.bind(this);
    this.getResults = this.getResults.bind(this);
    this.getInput = this.getInput.bind(this);
    this.switchView = this.switchView.bind(this);
    this.updateComment = this.updateComment.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.renderSidebar = this.renderSidebar.bind(this);
  }

  addInteraction(counter){
    map.removeInteraction(select);
    map.addInteraction(drawInteraction[counter]);
    this.setState({
      drawing: counter
    });
    document.getElementById('map').style.cursor = 'crosshair';

  }

  switchView(event, value){
    if(value == 1){
      this.setState({
        view: 1
      });
      map.addLayer(heatmapLayer);
      map.removeLayer(linesLayer);
      map.removeOverlay(overlay);
      map.removeInteraction(select);
      this.getResults();
    }
    else{
      this.setState({
        view: 0
      })
      map.removeLayer(heatmapLayer);
      map.addLayer(linesLayer);
      map.addOverlay(overlay);
      map.addInteraction(select);
      this.getInput();
    }
  }

  getInput(){
    map.removeLayer(resultsLayer);
    this.changeMode('map');
  }

  upload(){
    console.log('upload');
    overlay.setPosition(undefined);
    var writer = new GeoJSON();
    var drawnFeatures = writer.writeFeatures(linesLayer.getSource().getFeatures());
    linesSource.clear();
    axios.post('/api/addLines', {
      features: drawnFeatures
    })
    .then(function(response){
      console.log(response);
    });


  }

  cancelEdit(counter){
    console.log('remove interaction');
    map.removeInteraction(drawInteraction[counter]);
    map.addInteraction(select);
    document.getElementById('map').style.cursor = 'default';
    this.setState({
      drawing: false
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
    var self = this;
    console.log('get results');
    axios.get('/api/results')
    .then(function(response){
      pointSource.clear();
      console.log(response.data.data[0]);
      self.setState({lineData: response.data.data[0]});
      var lines = response.data.data[0];
      lines.forEach(function(line){
        var resultGeoJSONFeature = (new GeoJSON()).readFeature(line.geom, {dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"});
        var resultGeoJSON = (new GeoJSON()).writeFeature(resultGeoJSONFeature)
        turnLineIntoArrayOfPoints(line.geom);
      });
    });
  }

  updateComment(event) {
    this.setState({comment: event.target.value});
  }

  saveComment(event, target){
    console.log(event.target, target);
    event.preventDefault();
    var selectedFeature = linesSource.getFeatureById(this.state.targetFeatureId);
    selectedFeature.setProperties({comment:this.state.comment});
    console.log(selectedFeature);
    overlay.setPosition(undefined);
    this.setState({comment:''});
    console.log(this.state.comment);
    select.getFeatures().clear();
  }

  changeMode(mode){
    if(mode == 'map'){
      map.setTarget('map');
      this.setState({viewMap: true});
      this.setState({mode:'map'});
    }
    else{
      map.setTarget(null);
      this.setState({viewMap: false});
      this.setState({mode: 'cards'});
    }
  }

  renderSidebar(){
    if(this.state.view == 0){
      if (this.state.drawing !== false) {
        return (
          <div>
          <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><LineIcon style={{color:'#00c853', verticalAlign:'middle'}} /> &nbsp;Add Bike Infrastructure</strong></div>
            <br />
            <Paper style={{padding:'10px'}}>
              <Button
                onClick = {this.finishLine}
                className='full-width-left'
                size='small'
              >
                <DoneIcon /> &nbsp;&nbsp; Finish Line
              </Button>
              <br />
              <Button
                onClick = {this.deleteLastPoint}
                className='full-width-left'
                size='small'  >
                  <RemoveIcon /> &nbsp;&nbsp; Delete Last Point
              </Button>
              <br />
              <Button
                onClick = {()=>this.cancelEdit(this.state.drawing)}
                className='full-width-left'
                size='small' >
                  <CancelIcon /> &nbsp;&nbsp; Cancel
                </Button>
            </Paper>
            </div>
        );
      }
      else {
        return (
            <div>
              <div ><strong><AddIcon style={{verticalAlign:'middle'}} /> &nbsp; Create Features</strong></div>
              <br />
            <Paper style={{padding:'8px'}}>
              {this.state.features.map(function(item, counter){
                return(
                  <Tooltip title={item.prompt} placement='right'>
                    <Button
                      onClick = {((item.type === 'line') ? ()=>this.addInteraction(counter) : ()=>this.addInteraction(counter))}
                      className='full-width-left'
                    >
                      {((item.type === 'line') ? <LineIcon style={{color:item.color}} /> : <PointIcon style={{color:item.color}}/>)} <span style ={{paddingLeft:'10px'}}>{item.name}</span>
                    </Button>
                  </Tooltip>
                )
              }.bind(this))}
            </Paper>
            <br />
            <Paper style={{padding:'8px'}}>
            <Button
              className='full-width-left'        >
              <EditIcon /> &nbsp;&nbsp; Edit Features
            </Button>
            <Button
              className='full-width-left'        >
              <DeleteIcon /> &nbsp;&nbsp; Delete Features
            </Button>
            </Paper>
            <br />
            <Button
              variant='contained'
              color='primary'
              onClick = {this.upload}
              className = 'full-width'
            >
              <UploadIcon /> &nbsp;&nbsp; Upload
            </Button>
            </div>
        )
      }
    }
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <AppBar position="fixed" style={{zIndex: 1201, }}>
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
          <Drawer variant="permanent">
            <div style={{width: drawerWidth, marginTop: '64px', padding: '15px'}}>
              {this.renderSidebar()}
            </div>
          </Drawer>
          <MainDisplay mode={this.state.mode} data={this.state.lineData} />
          <div id='map' className={this.state.viewMap ? '' : 'hidden'}></div>
          <Paper id='popover' style={{width:'250px', padding: '15px', position: 'absolute', left:'-138px', top:'-218px'}}>
            <form onSubmit={this.saveComment}>
              <TextField
                label="Add Comment:"
                multiline
                rows="4"
                margin="normal"
                variant = 'outlined'
                style = {{width:'100%'}}
                value = {this.state.comment}
                onChange = {this.updateComment}
              />
              <br />
              <Button type='submit' variant='contained' color='primary' >Save</Button>
            </form>
            <div className='arrow'></div>
          </Paper>
        </div>
      </MuiThemeProvider>
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
      radiusSize = 4,
      blurSize = 36;
      var zoomRadius = radiusSize/resolution;
      var zoomBlur = blurSize/resolution;
      heatmapLayer.setRadius(zoomRadius);
      heatmapLayer.setBlur(zoomBlur);

      map.getView().on('change:resolution', function(evt){
          resolution = evt.target.get(evt.key);

          zoomRadius =  radiusSize/resolution;
          zoomBlur = blurSize/resolution;
         heatmapLayer.setRadius(zoomRadius);
         heatmapLayer.setBlur(zoomBlur);
      });

      this.state.features.map(function(item){
        drawInteraction.push(
          new Draw({
            source: linesSource,
            type: ((item.type === 'line')?'LineString':'Point'),
            style: new Style({
              stroke: new Stroke({
                color: item.color,
                width: 8
              }),
              image: new CircleStyle({
                radius: 6,
                fill: new Fill({
                  color: item.color
                })
              })
            })
          })
        )
      });
      drawInteraction.map(function(item, counter){
        console.log(this.state.features[counter]);
        drawInteraction[counter].on('drawend', function(target){
          self.setState({comment: ''});
          var coordinate;
          if(this.state.features[counter].type === 'line'){
            coordinate = target.feature.getGeometry().getCoordinateAt(0.5);
          }
          else{
            coordinate = target.feature.getGeometry().getCoordinates();
          }
          target.feature.setId(drawnFeatures);
          drawnFeatures++;
          overlay.setPosition(coordinate);
          self.setState({popover: true});
          self.setState({targetFeatureId: target.feature.getId()});
          console.log(target.feature.getId());
          self.cancelEdit(counter);
        }.bind(this));
      }.bind(this));

      map.on('pointermove', function(evt) {
        var coordinate = evt.coordinate;
        var hdms = toStringHDMS(toLonLat(coordinate));
        //console.log(hdms);
      });

      select.on('select', function(e) {

        var selectedFeature2 = e.selected[0];
        if(selectedFeature2){
          self.setState({targetFeatureId: e.selected[0].getId()});

          console.log(e.selected[0].getId())
          console.log(e.selected[0].getProperties().comment);
          self.setState({comment: selectedFeature2.getProperties().comment});
          var coordinate = selectedFeature2.getGeometry().getCoordinateAt(0.5);
          overlay.setPosition(coordinate);
          self.setState({popover: true});
        }
      });
      map.addInteraction(selectHover);

      selectHover.on('select', function(e) {
        if(e.selected.length > 0){
          document.getElementById('map').style.cursor = 'pointer';
        }
        else{
          document.getElementById('map').style.cursor = 'default';
        }
      });
    }
    componentDidUpdate(){
      map.updateSize();
    }
}

export default App;
