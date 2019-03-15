import React, { Component } from 'react';
import './App.css';
import MainDisplay from './main.js';
import Sidebar from './sidebar.js';
import Bottombar from './bottombar.js';
import PlaceSVG from './assets/place.svg';

//openlayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import {transform} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import Heatmap from 'ol/layer/Heatmap';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select.js';
import {click, pointerMove} from 'ol/events/condition.js';
import Cluster from 'ol/source/Cluster';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';

//Material-ui imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import FireIcon from '@material-ui/icons/Whatshot';
import BikeIcon from '@material-ui/icons/DirectionsBike';
import MenuIcon from '@material-ui/icons/Menu';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Snackbar from '@material-ui/core/Snackbar';
import DoneIcon from '@material-ui/icons/Done';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import teal from '@material-ui/core/colors/teal';
import CancelIcon from '@material-ui/icons/Close';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import RightIcon from '@material-ui/icons/ChevronRight';


import turf from 'turf';
import axios from 'axios';
import chroma from 'chroma-js';
import tippy from 'tippy.js';
import * as moment from 'moment'

const convertToClick = (e) => {
  const evt = new MouseEvent('click', { bubbles: true })
  evt.stopPropagation = () => {}
  e.target.dispatchEvent(evt)
}

const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: teal
  },
  typography: {
    useNextVariants: true,
  }
});
const drawerWidth = '220px';

//Defining Globals
var sourceArray = [];
var layerArray = [];
var resultsSourceArray = [];
var resultsLayerArray = [];
var map = {};
var drawInteraction = [];
var snap;
var modify = [];
var pointSource = new VectorSource();
var heatmapLayer = new Heatmap({
  source: pointSource,
  renderMode: 'image',
  shadow: 1000
});
var overlay = new Overlay({
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});
var resultsOverlay = new Overlay({
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  },
  positioning: "bottom-center"
});
var select = new Select({
  condition: click,
  layers: layerArray
});
var selectDelete = new Select({
  condition: click,
  layers: layerArray,
  style: new Style({
    stroke: null,
    image: null
  })
});

var clusterSelectHover =[];
var clusterSelectClick = null;
var selectHover = [];
var drawnFeatures = 0;
let mapTippy = null;
let currentDrawnLine;
var turnLineIntoArrayOfPoints = function(geoJSONLine){
  //if statement should check to make sure geoJSON line is valid
  if(true){
    var length = turf.lineDistance(geoJSONLine, 'miles');
    for(var i=(Math.random()*(0.02)); i <= length; i=i+0.02){
      if(length > 0 ){
        var thisPoint = turf.along(geoJSONLine, i, 'miles');
        if(resultsSourceArray[0]){
          resultsSourceArray[0].addFeature(new Feature(new Point(transform([thisPoint.geometry.coordinates[0],thisPoint.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857'))));
        }
      }
    }
    return;
    //refactor so that function returns the array instead of adding it to the map as a side effect.
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
          color: '#00c853',
          viewResults: true
        },
        {
          name:'Add Bike Share',
          prompt:'Where would you want bike share?',
          type:'point',
          color: '#2196f3',
          viewResults: true
        },
        {
          name:'Unsafe Location',
          prompt:'What locations feel unsafe or uncomfortable for biking?',
          type:'point',
          color: '#f44336',
          viewResults: true
        }
      ],
      drawing: false,
      editing: false,
      deleting: false,
      view: 0,
      popover: false,
      targetFeatureId: null,
      comment: undefined,
      mode: 'map',
      viewMap: true,
      featureData: null,
      selectedResultsFeatures: null,
      drawerOpen: false,
      bottomDrawerOpen: false,
      uploadMessage: false,
      lineDrawMessage: "Click to draw line",
      resultClusterNumber: 0
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
    this.switchLayer = this.switchLayer.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.renderResultsPopover = this.renderResultsPopover.bind(this);
    this.renderResultsPopoverContent = this.renderResultsPopoverContent.bind(this);

    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.toggleBottomDrawer = this.toggleBottomDrawer.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
  }

  addInteraction(counter){
    console.log('add interaction');
    overlay.setPosition(undefined);
    map.removeInteraction(select);
    map.addInteraction(drawInteraction[counter]);
    this.setState({
      drawing: counter
    });
    document.getElementById('map').style.cursor = 'crosshair';
    const mapDiv = document.querySelector('#map')
    mapTippy = tippy(mapDiv);
    if(this.state.features[counter].type === 'line'){
      mapTippy.set({
        content: "Click to start drawing line",
        followCursor: true,
        placement: 'right',
        arrow: true,
        distance: 20,
        hideOnClick: false,
        touch: false
      });
    }
    else{
      mapTippy.set({
        content: "Click to place feature",
        followCursor: true,
        placement: 'right',
        arrow: true,
        distance: 20,
        hideOnClick: false,
        touch: false
      });
    }
    mapTippy.enable();
  }

  toggleDrawer = (open) => () => {
    this.setState({drawerOpen: open});
  }

  toggleBottomDrawer = (open) => () => {
    this.setState({bottomDrawerOpen: open});
  }

  switchView(event, value){
    if(value === 1){
      this.setState({
        view: 1
      });
      //map.addLayer(heatmapLayer);
      this.state.features.map(function(item, count){
         return (
           map.removeLayer(layerArray[count+1]),
           this.cancelEdit(count)
         )
      }.bind(this));
      resultsLayerArray.map(function(item){
        return map.addLayer(item);
      });
      map.removeOverlay(overlay);
      map.addOverlay(resultsOverlay);

      map.removeInteraction(select);
      this.getResults();
      if(clusterSelectClick !== null){
        map.addInteraction(clusterSelectClick);
      }
    }
    else{
      this.setState({
        view: 0
      })
      //map.removeLayer(heatmapLayer);
      this.state.features.map(function(item, count){
        return map.addLayer(layerArray[count+1]);
      });
      resultsLayerArray.map(function(item){
        return map.removeLayer(item);
      });
      map.addOverlay(overlay);
      map.removeOverlay(resultsOverlay);
      map.addInteraction(select);
      if(clusterSelectClick !== null){
        map.removeInteraction(clusterSelectClick);
      }
      this.getInput();
    }
  }

  switchLayer(count){
    if(this.state.features[count].viewResults === true){
      map.removeLayer(resultsLayerArray[count]);
      var features = this.state.features;
      var feature = features[count];
      feature.viewResults= false;
      this.setState({features:features});
    }
    else{
      map.addLayer(resultsLayerArray[count]);
      var features = this.state.features;
      var feature = features[count];
      feature.viewResults= true;
      this.setState({features:features});
    }
  }

  getInput(){
    this.changeMode('map');
  }

  upload(){
    overlay.setPosition(undefined);
    var writer = new GeoJSON();
    var drawnFeatures = [];
    layerArray.map(function(item, counter){
      if(counter > 0){
        return drawnFeatures.push(writer.writeFeatures(item.getSource().getFeatures()));
      }
      else{
        return null;
      }
    });
    sourceArray.map(function(item, count){
      return item.clear();
    });
    axios.post('/api/addLines', {
      features: drawnFeatures
    })
    .then(function(response){
      if(response.status === 200){
        this.setState({uploadMessage: true});
      }
      console.log(response);
    }.bind(this));
    this.setState({drawnFeatures: 0});
  }

  cancelEdit(counter){
    map.removeInteraction(drawInteraction[counter]);
    map.addInteraction(select);
    document.getElementById('map').style.cursor = 'default';
    this.setState({
      drawing: false
    });
    if(mapTippy){
      mapTippy.destroy();
    }
  }

  finishLine(counter){
    if(drawInteraction[counter]){
      drawInteraction[counter].finishDrawing();
    }
    if(mapTippy){
      mapTippy.destroy();
    }
  }

  deleteLastPoint(counter){
    drawInteraction[counter].removeLastPoint();
  }

  getResults(){
    axios.get('/api/results')
    .then(function(response){
      pointSource.clear();
      resultsSourceArray.map(function(item){
        return item.clear();
      });
      this.setState({featureData: response.data.data[0]});
      var features = response.data.data[0];
      features.map(function(feature, count){
        if(feature.line){
          return turnLineIntoArrayOfPoints(feature.line);
        }
        else{
          this.state.features.map(function(featureLayer,count){
            if(feature.name === featureLayer.name){
              var resultsFeature = new Feature(new Point(fromLonLat([feature.point.coordinates[0],feature.point.coordinates[1]])));
              resultsFeature.setId(feature.id);
              resultsFeature.setProperties({name: feature.name, date: feature.date, comment: feature.comment});
              return resultsSourceArray[count].addFeature(resultsFeature);
            }
            else{
              return null;
            }
          })
        }
      }.bind(this));
    }.bind(this));
  }

  updateComment(event) {
    this.setState({comment: event.target.value});
  }

  toggleEdit(){
    overlay.setPosition(undefined);
    if(this.state.editing === false){
      this.setState({editing: true});
      modify.map(function(layer){
        return map.addInteraction(layer);
      });
      this.state.features.map(function(item, count){
        console.log(item, count);
        map.removeInteraction(selectHover[count]);
        if(item.type === 'line'){
          console.log(layerArray[count+1].getStyle());
          layerArray[count+1].getStyle().getStroke().setColor(chroma(item.color).alpha(0.6).rgba());
          layerArray[count+1].getStyle().getStroke().setLineDash([12,12,12,12]);
          sourceArray[count].refresh()
        }
        else{
          layerArray[count+1].getStyle().setImage(
            new Icon(({
              anchor: [0.5, 60],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlaceSVG,
              color: chroma(item.color).alpha(0.6).rgba(),
              scale: 0.5
            })),
            new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: item.color
              })
            })
          );
          layerArray[count+1].getStyle().getImage().setOpacity(0.5);
          sourceArray[count].refresh()
          /*
          layerArray[count+1].getStyle().getImage().setImage(
            new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: item.color
              })
            })
          );
          */
        }
      });
      map.removeInteraction(select);
    }
    else{
      this.setState({editing: false});
      modify.map(function(layer){
        return map.removeInteraction(layer);
      });
      this.state.features.map(function(item, count){
        map.addInteraction(selectHover[count]);
        if(item.type === 'line'){
          layerArray[count+1].getStyle().getStroke().setColor(chroma(item.color).alpha(1).rgba());
          layerArray[count+1].getStyle().getStroke().setLineDash([1]);
          sourceArray[count].refresh()
        }
        else{
          layerArray[count+1].getStyle().setImage(
            new Icon(({
              anchor: [0.5, 60],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlaceSVG,
              color: chroma(item.color).alpha(1).rgba(),
              scale: 0.5
            }))
          );
          layerArray[count+1].getStyle().getImage().setOpacity(1);
          sourceArray[count].refresh()
        }
      });
      map.addInteraction(select);
    }
  }

  toggleDelete(){
    overlay.setPosition(undefined);
    if(this.state.deleting === false){
      this.setState({deleting: true});
      map.removeInteraction(select);
      map.addInteraction(selectDelete);

    }
    else{
      this.setState({deleting: false});
      map.addInteraction(select);
      map.removeInteraction(selectDelete);
    }
  }

  saveComment(event, target){
    event.preventDefault();
    var selectedFeature;
    this.state.features.map(function(item, count){
      if(sourceArray[count].getFeatureById(this.state.targetFeatureId)){
        return selectedFeature = sourceArray[count].getFeatureById(this.state.targetFeatureId);
      }
    }.bind(this));
    selectedFeature.setProperties({comment:this.state.comment});
    overlay.setPosition(undefined);
    this.setState({comment:''});
    select.getFeatures().clear();
  }

  changeMode(mode){
    if(mode === 'map'){
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

  renderResultsPopoverContent(features, number, total){
    let feature = features[number].getProperties();
    if(total>1){
      if(number+1 <= total && number == 0){
        return(
          <div>
            <strong>{feature.name}</strong>
            <Typography color="textSecondary">{moment(feature.date).subtract(5,'hours').format('MMMM Do YYYY, h:mm a')}</Typography>
            {feature.comment}
            <br />
            <div style={{textAlign:"center", marginBottom:'6px'}}>
              <Button disabled><LeftIcon /></Button> {number+1} of {total} <Button onClick={()=>{this.setState({resultClusterNumber:number+1});console.log(this.state.resultClusterNumber);}}><RightIcon /></Button>
            </div>
          </div>
        )
      }
      else if(number+1 < total && number > 0){
        return(
          <div>
            <strong>{feature.name}</strong>
            <Typography color="textSecondary">{moment(feature.date).subtract(5,'hours').format('MMMM Do YYYY, h:mm a')}</Typography>
            {feature.comment}
            <br />
            <div style={{textAlign:"center", marginBottom:'6px'}}>
              <Button onClick={()=>{this.setState({resultClusterNumber:number-1});console.log(this.state.resultClusterNumber);}}><LeftIcon /></Button> {number+1} of {total} <Button onClick={()=>{this.setState({resultClusterNumber:number+1});console.log(this.state.resultClusterNumber);}}><RightIcon /></Button>
            </div>
          </div>
        )
      }
      else if(number+1 == total){
        return(
          <div>
            <strong>{feature.name}</strong>
            <Typography color="textSecondary">{moment(feature.date).subtract(5,'hours').format('MMMM Do YYYY, h:mm a')}</Typography>
            {feature.comment}
            <br />
            <div style={{textAlign:"center", marginBottom:'6px'}}>
              <Button onClick={()=>{this.setState({resultClusterNumber:number-1});console.log(this.state.resultClusterNumber);}}><LeftIcon /></Button> {number+1} of {total} <Button disabled><RightIcon /></Button>
            </div>
          </div>
        )
      }
    }
    else{
      return(
        <div>
          <strong>{feature.name}</strong>
          <Typography color="textSecondary">{moment(feature.date).subtract(5,'hours').format('MMMM Do YYYY, h:mm a')}</Typography>
          {feature.comment}
        </div>
      )
    }

  }

  renderResultsPopover(){
    var features = this.state.selectedResultsFeatures;
    let total;
    if(features !== null){
      total = features.length;
      let currentFeature = this.state.resultClusterNumber;
      console.log(currentFeature);
      var feature = features[currentFeature].getProperties()
      return(
        this.renderResultsPopoverContent(features, this.state.resultClusterNumber, total)
      )
    }
    else{
      return (<div></div>)
    }

  }

  closeSnackbar(){
    this.setState({uploadMessage: false});
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <AppBar position="fixed" style={{zIndex: 1201, flexWrap:'wrap', width:'100%' }}>
            <Toolbar style={{flexWrap:'wrap'}} id='toolbar'>
              <IconButton
                onClick = {this.toggleDrawer(true)}
                id='menuButton'
                color="inherit"
                aria-label="Menu"
                style={{marginLeft: -12, marginRight: 20}}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" style={{flexGrow:2}} >
                <BikeIcon style={{verticalAlign:'middle', marginBottom:'5px', height:'32px'}} />
                &nbsp;&nbsp;{this.state.title}
              </Typography>
              <Tabs value={this.state.view} className='tabContainer' onChange = {this.switchView} variant='fullWidth' id='menuTabs'>
                <Tab label={<span><EditIcon style={{verticalAlign:'middle',top:'0px'}}/>&nbsp;&nbsp; Input</span>} style={{flexGrow: 1}} className='tab' />
                <Tab label={<span><FireIcon style={{verticalAlign:'middle'}}/>&nbsp;&nbsp; Results</span>} style={{flexGrow: 1}} />
              </Tabs>
            </Toolbar>
          </AppBar>
          <Drawer variant="permanent" className='desktop'>
            <div style={{width: drawerWidth, padding:'15px'}} id='sidebar'>
              <Sidebar
                view={this.state.view}
                drawing={this.state.drawing}
                editing={this.state.editing}
                deleting = {this.state.deleting}
                features = {this.state.features}
                drawnFeatures = {drawnFeatures}
                finishLine = {this.finishLine}
                deleteLastPoint = {this.deleteLastPoint}
                cancelEdit = {this.cancelEdit}
                addInteraction = {this.addInteraction}
                upload = {this.upload}
                switchLayer={this.switchLayer}
                changeMode = {this.changeMode}
                toggleEdit =  {this.toggleEdit}
                toggleDelete =  {this.toggleDelete}
              />
              <Button onClick={()=>{console.log('hello')}}><RightIcon /></Button>
            </div>
          </Drawer>
          <Drawer open={this.state.drawerOpen} onClose={this.toggleDrawer(false)}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.toggleDrawer(false)}
            onKeyDown={this.toggleDrawer(false)}
          >
          <div style={{width: drawerWidth, padding:'15px'}} id='sidebarMobile'>
            <Sidebar
              view={this.state.view}
              drawing={this.state.drawing}
              editing={this.state.editing}
              deleting = {this.state.deleting}
              features = {this.state.features}
              drawnFeatures = {drawnFeatures}
              finishLine = {this.finishLine}
              deleteLastPoint = {this.deleteLastPoint}
              cancelEdit = {this.cancelEdit}
              addInteraction = {this.addInteraction}
              upload = {this.upload}
              switchLayer={this.switchLayer}
              changeMode = {this.changeMode}
              toggleEdit =  {this.toggleEdit}
              toggleDelete =  {this.toggleDelete}
            />
          </div>
          </div>
        </Drawer>
        <Drawer anchor='bottom' open={this.state.bottomDrawerOpen} onClose={this.toggleBottomDrawer(false)}>
        <div
          tabIndex={0}
          role="button"
          onClick={this.toggleBottomDrawer(false)}
          onKeyDown={this.toggleBottomDrawer(false)}
        >
        <div style={{padding:'15px'}} id='bottombarMobile'>
          <Bottombar
            view={this.state.view}
            drawing={this.state.drawing}
            editing={this.state.editing}
            deleting = {this.state.deleting}
            features = {this.state.features}
            drawnFeatures = {drawnFeatures}
            finishLine = {this.finishLine}
            deleteLastPoint = {this.deleteLastPoint}
            cancelEdit = {this.cancelEdit}
            addInteraction = {this.addInteraction}
            upload = {this.upload}
            switchLayer={this.switchLayer}
            changeMode = {this.changeMode}
            toggleEdit =  {this.toggleEdit}
            toggleDelete =  {this.toggleDelete}
          />
        </div>
        </div>
      </Drawer>
          {(this.state.view === 0) ? <Fab onClick={this.toggleBottomDrawer(true)} color="secondary" aria-label="Add" id='fab-button'><AddIcon /></Fab> : '' }

          <MainDisplay mode={this.state.mode} data={this.state.featureData} layers = {this.state.features} />
          <div id='map' className={this.state.viewMap ? '' : 'hidden'}></div>
          <Paper id='popover' style={{width:'250px', padding: '15px', position: 'absolute', left:'-138px', top:'-218px'}}>
            <form onSubmit={this.saveComment}>
              <TextField
                id='commentArea'
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
              <Button type='submit' color='primary' style={{zIndex:1200}} >Save and close</Button>
            </form>
            <div className='arrow'></div>
          </Paper>
          <Paper id='resultsPopover' style={{width:'250px', padding: '15px', position: 'absolute', left:'-138px', top:'-75px'}} onMouseUp={convertToClick}>
            {this.renderResultsPopover()}
            <div className='arrow'></div>
          </Paper>
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={this.state.uploadMessage}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id"><DoneIcon style={{verticalAlign:'middle'}} /> &nbsp;&nbsp;Upload Successful</span>}
            autoHideDuration = {2000}
            onClose = {this.closeSnackbar}
            />
        </div>
      </MuiThemeProvider>
    );
  }
  componentDidMount(){


    layerArray.push(new TileLayer({
      source: new TileWMS({
        url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
        params: {'LAYERS': 'Mapalize:OSM-KC-ROADS', 'TILED': true},
        serverType: 'geoserver',
        transition: 0
      })
    }));
    this.state.features.map(function(item, count){
      sourceArray.push(new VectorSource());
      resultsSourceArray.push(new VectorSource());
      if(item.type === 'line'){
        layerArray.push(new VectorLayer({
          source: sourceArray[count],
          style: new Style({
              stroke: new Stroke({
                color: item.color,
                width: 8
              })
            })
        }));
        resultsLayerArray.push(new Heatmap({
          source: resultsSourceArray[count],
          renderMode: 'image',
          shadow: 1000,
          properties:{line: true}
        }));
        drawInteraction.push(
          new Draw({
            source: sourceArray[count],
            type: 'LineString',
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
            }),
            stopClick: true,
          })
        );
        selectHover.push(new Select({
          condition: pointerMove,
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
          }),
          layers: [layerArray[count+1]]
        }));
        clusterSelectHover.push('line');
      }
      else{
        layerArray.push(new VectorLayer({
          source: sourceArray[count],
          style: new Style({
            image: new Icon(({
              anchor: [0.5, 60],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlaceSVG,
              color: item.color,
              scale: 0.5
            }))
          })
        }));

        drawInteraction.push(
          new Draw({
            source: sourceArray[count],
            type: 'Point',
            style: new Style({
              image: new Icon(({
                anchor: [0.5, 60],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                crossOrigin: 'anonymous',
                src: PlaceSVG,
                color: item.color,
                scale: 0.5
              }))
            })
          })
        );
        selectHover.push(new Select({
          condition: pointerMove,
          style: new Style({
            image: new Icon(({
              anchor: [0.5, 60],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlaceSVG,
              color: item.color,
              scale: 0.5
            }))
          }),
          layers: [layerArray[count+1]]
        }));
        resultsLayerArray.push(
          new AnimatedCluster({
            source: new Cluster({
              source: resultsSourceArray[count],
              distance: 40
            }),
            animationDuration: 500,
            style: function(feature){
              var size = feature.get('features').length;
              var style;
              if(size < 2){
                style = [new Style({
                  image: new Icon(({
                    anchor: [0.5, 60],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    crossOrigin: 'anonymous',
                    src: PlaceSVG,
                    color: item.color,
                    scale: 0.5
                  }))
                })]
              }
              else{
                style =
                  [new Style({
                    image:
                      new CircleStyle({
                        radius: 16,
                        stroke: new Stroke({
                          color:chroma(item.color).alpha(0.6).rgba(),
                          width: 6
                        }),
                        fill: new Fill({
                          color: item.color
                        })
                      }),
                    text: new Text({
                      text: size.toString(),
                      fill: new Fill({
                        color: '#fff'
                      })
                    })
                  })]
              }
              return style;
            }
          })
        );
        clusterSelectHover.push(new Select({
          condition: pointerMove,
          layers: [resultsLayerArray[count]],
          style: function(feature){
            var size = feature.get('features').length;
            var style;
            if(size < 2){
              style = [new Style({
                image: new Icon(({
                  anchor: [0.5, 60],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  crossOrigin: 'anonymous',
                  src: PlaceSVG,
                  color: item.color,
                  scale: 0.5
                }))
              })]
            }
            else{
              style =
                [new Style({
                  image:
                    new CircleStyle({
                      radius: 16,
                      stroke: new Stroke({
                        color:chroma(item.color).alpha(0.6).rgba(),
                        width: 6
                      }),
                      fill: new Fill({
                        color: item.color
                      })
                    }),

                  text: new Text({
                    text: size.toString(),
                    fill: new Fill({
                      color: '#fff'
                    })
                  })
                })]

            }
            return style;
          }
        }));
      };
      modify.push(new Modify({
        source: sourceArray[count],
        style: new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#fff'
            }),
            stroke: new Stroke({
              width: 1,
              color: '#000'
            })
          })
        })
      }));
    });
    this.getResults();
    var container = document.getElementById('popover');
    overlay.setElement(container);
    var container2 = document.getElementById('resultsPopover');
    resultsOverlay.setElement(container2);
    map = new Map({
        target: 'map',
        layers: layerArray,
        overlays: [overlay, resultsOverlay],
        //interactions: defaultInteractions().extend(clusterSelectHover),
        view: new View({
          center: fromLonLat([-94.573, 39.143]),
          zoom: 14,
          maxZoom: 20,
          minZoom: 12
        }),
        controls: [
          new Zoom()
        ]
      });
      var resolution = map.getView().getResolution(),
      radiusSize = 12,
      blurSize = 64;
      var zoomRadius = radiusSize/resolution;
      var zoomBlur = blurSize/resolution;
      resultsLayerArray[0].setRadius(zoomRadius);
      resultsLayerArray[0].setBlur(zoomBlur);
      map.getView().on('change:resolution', function(evt){
          resolution = evt.target.get(evt.key);
          zoomRadius =  radiusSize/resolution;
          zoomBlur = blurSize/resolution;
         resultsLayerArray[0].setRadius(zoomRadius);
         resultsLayerArray[0].setBlur(zoomBlur);
      });
      select.on('select', function(e) {
        var selectedFeature2 = e.selected[0];
        if(selectedFeature2){
          this.setState({targetFeatureId: e.selected[0].getId()});
          console.log(e.selected[0].getProperties())
          console.log(e.selected[0].getProperties().geometry);
          this.setState({comment: selectedFeature2.getProperties().comment});
          var coordinate;
          if(e.selected[0].getGeometry().getType() === 'LineString'){
            console.log('linestring')
            coordinate = selectedFeature2.getGeometry().getCoordinateAt(0.5);
          }
          else{
            coordinate = selectedFeature2.getGeometry().getCoordinates();
          }
          overlay.setPosition(coordinate);
          this.setState({popover: true});
        }
        else{
          console.log(e, 'nothing selected');
          overlay.setPosition(undefined);
          this.setState({popover: false});
        }
      }.bind(this));

      drawInteraction.map(function(item, counter){
        drawInteraction[counter].on('drawend', function(target){
          if(mapTippy){
            mapTippy.destroy();
          }
          target.feature.setProperties({layerName: this.state.features[counter].name});
          this.setState({comment: ''});
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
          document.getElementById("commentArea").focus();
          this.setState({popover: true});
          this.setState({targetFeatureId: target.feature.getId()});
          console.log(target.feature);
          this.cancelEdit(counter);
        }.bind(this));
        drawInteraction[counter].on('drawstart', function(e){
          currentDrawnLine = e.feature;
          currentDrawnLine.getGeometry().on('change', function(evt) {
              var geom = evt.target.getCoordinates();
              if(geom.length > 1 && geom.length < 3){
                this.setState({lineDrawMessage: "Click to contine drawing line"});
                mapTippy.setContent('Click to continue drawing line');
              }
              else if(geom.length > 2){
                mapTippy.setContent('Click last point to finish line');

                this.setState({lineDrawMessage: "Click last point to finish line"});
              }
              console.log(geom.length, this.state.lineDrawMessage);
            }.bind(this));
        }.bind(this));
      }.bind(this));
      selectDelete.on('select', function(e) {
        var selectedFeature = e.selected[0];
        console.log(selectDelete.getFeatures());
        if(selectedFeature){
          sourceArray.map(function(layer, count){
            if(layer.hasFeature(selectedFeature)){
              layer.removeFeature(selectedFeature);
              drawnFeatures--;
              selectHover[count].getFeatures().clear();
              document.getElementById('map').style.cursor = 'default';
            }
          })
        }
      }.bind(this));

      var selectableLayers = [];
      resultsLayerArray.map(function(layer){
        if(layer.hasOwnProperty('clusters')){
          selectableLayers.push(layer);
        }
      });

      clusterSelectClick = new Select({
        condition: click,
        layers: selectableLayers,
        style: new Style({
          stroke: null
        })
      });

      clusterSelectClick.on('select', function(e) {

        var selectedFeatures = e.selected;
        console.log(selectedFeatures);
        if(selectedFeatures[0]){
          selectedFeatures = e.selected[0].getProperties().features;
          this.setState({selectedResultsFeatures: selectedFeatures});
          var coordinate;
          coordinate = selectedFeatures[0].getGeometry().getCoordinates();
          resultsOverlay.setPosition(coordinate);
          this.setState({popover: true});
          this.setState({resultClusterNumber: 0});
          console.log(document.getElementById('resultsPopover').offsetHeight);
          let height = document.getElementById('resultsPopover').offsetHeight
          resultsOverlay.setOffset([0,-(height)/2]);
        }
        else{
          console.log(e, 'nothing selected');
          resultsOverlay.setPosition(undefined);
          this.setState({popover: false});
        }

      }.bind(this));

      selectHover.map(function(item, count){
        return(
          map.addInteraction(item),
          item.on('select', function(e) {
            if(e.selected.length > 0){
              document.getElementById('map').style.cursor = 'pointer';
            }
            else{
              document.getElementById('map').style.cursor = 'default';
            }
          })
        )
      });
      clusterSelectHover.map(function(item, count){
        if(item != 'line'){
          return(
            map.addInteraction(item),
            item.on('select', function(e) {
              if(e.selected.length > 0){
                document.getElementById('map').style.cursor = 'pointer';
              }
              else{
                document.getElementById('map').style.cursor = 'default';
              }
            })
          )
        }
      });
      drawInteraction[0].on('click', function(test){
        console.log(test);
      })
    }
    componentDidUpdate(){
      map.updateSize();
    }
}
export default App;
