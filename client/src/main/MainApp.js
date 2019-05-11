import React, { Component } from 'react';
import '../App.css';
import MainDisplay from '../main.js';
import Sidebar from '../components/Sidebar.js';
import Bottombar from '../bottombar.js';
import PlaceSVG from '../assets/place.svg';
import PlacePNG from '../assets/place.png';
import {logout, isAuthenticated} from '../auth';
import NkcLogo from '../assets/nkclogo.png';




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
import TileImage from 'ol/source/TileImage';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import Heatmap from 'ol/layer/Heatmap';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select.js';
import {click, pointerMove} from 'ol/events/condition.js';
import Cluster from 'ol/source/Cluster';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import ConvexHull from 'ol-ext/geom/ConvexHull';
import XYZ from 'ol/source/XYZ';
import Polygon from 'ol/geom/Polygon';

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
import CardsIcon from '@material-ui/icons/ViewModule';
import MapIcon from '@material-ui/icons/Map';
import LeftIcon from '@material-ui/icons/ChevronLeft';
import HelpIcon from '@material-ui/icons/HelpOutline';
import LineIcon from '@material-ui/icons/Timeline';
import PointIcon from '@material-ui/icons/AddLocation';
import PlaceIcon from '@material-ui/icons/Place';
import RightIcon from '@material-ui/icons/ChevronRight';
import UploadIcon from '@material-ui/icons/CloudUpload';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import LayersIcon from '@material-ui/icons/Layers';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';



import turf from 'turf';
import axios from 'axios';
import chroma from 'chroma-js';
import tippy from 'tippy.js';
import * as moment from 'moment';

const pngScale =0.18;
const pngAnchor = [0.5, 200];


const convertToClick = (e) => {
  const evt = new MouseEvent('click', { bubbles: true })
  evt.stopPropagation = () => {}
  e.target.dispatchEvent(evt)
}

const drawerWidth = '280px';

//Defining Globals
var sourceArray = [];
var layerArray = [];
var basemapLayers = [];
var resultsSourceArray = [];
var resultsLayerArray = [];
let hover = [];
var map = {};
var drawInteraction = [];
var modify = [];
let convexVector = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
      stroke: new Stroke({
        color: "#3399CC",
        width: 2
      })
    })
 })
let hull;
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
let addSelectionListener = function(){
  var collection = select.getFeatures();
  collection.forEach(function(feature){
  feature.setStyle(new Style({
      stroke: new Stroke({
        color: '#000',
        width: 8
      })
    }));
  });
}
/*
let removeSelectionListener = function(){
  var collection = vectorLayer.getSource().getFeatures();
  collection.forEach(function(feature){
  feature.setStyle(new Style({
      stroke: new Stroke({
        color: '#fff',
        width: 8
      })
    }));
  });
}
*/

var selectDelete = new Select({
  condition: click,
  layers: layerArray,
  style: new Style({
    stroke: null,
    image: null
  })
});
var clusterSelectClick = null;
var drawnFeatures = 0;
let mapTippy = null;
let currentDrawnLine;
var turnLineIntoArrayOfPoints = function(geoJSONLine, count){
  //if statement should check to make sure geoJSON line is valid
  if(true){
    var length = turf.lineDistance(geoJSONLine, 'miles');
    for(var i=(Math.random()*(0.02)); i <= length; i=i+0.02){
      if(length > 0 ){
        var thisPoint = turf.along(geoJSONLine, i, 'miles');
        if(resultsSourceArray[count]){
          resultsSourceArray[count].addFeature(new Feature(new Point(transform([thisPoint.geometry.coordinates[0],thisPoint.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857'))));
        }
      }
    }
    return;
    //refactor so that function returns the array instead of adding it to the map as a side effect.
  }
};

class MainApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'North Kansas City Bike Master Plan',
      lineName: 'Draw Line',
      features:[
        {
          id: 0,
          name:'What Routes do you bike today?',
          prompt:'Draw a route where you bike today.',
          type:'line',
          color: '#2ecc71',
          viewResults: true
        },
        {
          id: 1,
          name:'Where would you like to bike if it were safe and comfortable?',
          prompt:'Draw a route where you would bike if it were safe and comfortable?',
          type:'line',
          color: '#3498db',
          viewResults: true
        },
        {
          id: 2,
          name:'What destinations do you visit on your bike?',
          prompt:'Where would you want bike share?',
          type:'point',
          color: '#27ae60',
          viewResults: true
        },
        {
          id: 3,
          name:'What desinations would you like to visit if you had a safe and comfortable route?',
          prompt:'What locations feel unsafe or uncomfortable for biking?',
          type:'point',
          color: '#2980b9',
          viewResults: true
        },
        {
          id: 4,
          name:'What locations feel unsafe or uncomfortable for biking?',
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
      uploadMessage: '',
      uploadMessageDisplay: false,
      lineDrawMessage: "Click to draw line",
      resultClusterNumber: 0,
      uploadDialog: false,
      cardSortState: 'newest',
      basemapMenuAnchorEl: null,
      showHelp: false
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
    this.openUploadDialog = this.openUploadDialog.bind(this);
    this.sortCards = this.sortCards.bind(this);
    this.setBasemap = this.setBasemap.bind(this);
  }

  openUploadDialog(open){
    this.setState({
      uploadDialog: open
    });
  }
  sortCards(sort){
    this.setState({cardSortState: sort})
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
      this.state.features.map(function(item, count){
        console.log(item);
        if(item.viewResults === true){
          return (
            map.addLayer(resultsLayerArray[count]),
            map.removeLayer(layerArray[count]),
            this.cancelEdit(count)
          )
        }
        else{
          return (
            map.removeLayer(layerArray[count]),
            this.cancelEdit(count)
          )
        }
      }.bind(this));
      map.removeOverlay(overlay);
      map.addOverlay(resultsOverlay);
      map.removeInteraction(select);
      hover.forEach((item)=>{
        map.addInteraction(item);
      })
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
        console.log(item);
        if(item.viewResults === true){
          return(
            map.removeLayer(resultsLayerArray[count]),
            map.addLayer(layerArray[count])
          )
        }
        else{
          return map.addLayer(layerArray[count]);
        }
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
    let features = this.state.features;
    let feature = features[count];
    if(features[count].viewResults === true){
      map.removeLayer(resultsLayerArray[count]);
      feature.viewResults= false;
      this.setState({features:features});
    }
    else{
      map.addLayer(resultsLayerArray[count]);
      feature.viewResults= true;
      this.setState({features:features});
    }
  }

  getInput(){
    map.setTarget('map');
    this.setState({viewMap: true});
  }

  upload(){
    overlay.setPosition(undefined);
    this.openUploadDialog(false)
    var writer = new GeoJSON();
    var drawnFeaturesArray = [];
    layerArray.map(function(item, counter){
      return drawnFeaturesArray.push(writer.writeFeatures(item.getSource().getFeatures()));
    });
    layerArray.map(function(layer, count){
        map.removeLayer(layer);
    });
    axios.post('/api/features/add', {
      features: drawnFeaturesArray
    })
    .then(function(response){
      if(response.status === 200){
        this.setState({uploadMessage: <span><DoneIcon style={{verticalAlign:'middle'}} /> Upload Successful</span>});
        this.setState({uploadMessageDisplay: true});
        sourceArray.map(function(item, count){
          return item.clear();
        });
        drawnFeatures = 0;
        layerArray.map(function(layer, count){
          map.addLayer(layer);
        });
      }
      else{
        this.setState({uploadMessage: <span><CancelIcon style={{verticalAlign:'middle'}} /> Oops. Something went wrong.</span>});
        this.setState({uploadMessageDisplay: true});
        layerArray.map(function(layer, count){
          map.addLayer(layer);
        });
      }
      console.log(response);
    }.bind(this));

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
    axios.get('/api/features')
    .then(function(response){
      console.log(response);
      resultsSourceArray.map(function(item){
        return item.clear();
      });
      let filteredFeatures = [];
      var features = response.data.features;
      features.map(function(feature){
        this.state.features.map(function(featureLayer,count){
          if(feature.name === featureLayer.name){
            filteredFeatures.push(feature);
          }
        })
        if(feature.line){
          this.state.features.map(function(featureLayer,count){
            if(feature.name === featureLayer.name){
              return turnLineIntoArrayOfPoints(feature.line, count);
            }
            else{
              return null;
            }
          })
        }
        else{
          this.state.features.map(function(featureLayer,count){
            if(feature.name === featureLayer.name){
              var resultsFeature = new Feature(new Point(fromLonLat([feature.point.coordinates[0],feature.point.coordinates[1]])));
              resultsFeature.setId(feature.id);
              resultsFeature.setProperties({name: feature.name, date: feature.date, comment: feature.comment, layerColor:featureLayer.color});
              return resultsSourceArray[count].addFeature(resultsFeature);
            }
            else{
              return null;
            }
          })
        }
      }.bind(this));
      this.setState({featureData: filteredFeatures});

    }.bind(this));
  }

  updateComment(event) {
    this.setState({comment: event.target.value});
  }

  toggleEdit(){
    overlay.setPosition(undefined);
    map.removeInteraction(select);
    if(this.state.editing === false){
      this.setState({editing: true});
      modify.map(function(layer){
        return map.addInteraction(layer);
      });
      this.state.features.map(function(item, count){
        console.log(item, count);
        if(item.type === 'line'){
          console.log(layerArray[count]);
          let collection = sourceArray[count].getFeatures();
          collection.forEach(function(feature){
          feature.setStyle(new Style({
              stroke: new Stroke({
                color: item.color,
                lineDash:[12,12,12,12],
                width: 8
              })
            }));
          });

          sourceArray[count].refresh()
        }
        else{

          let collection = sourceArray[count].getFeatures();
          collection.forEach(function(feature){
          feature.setStyle(new Style({
              image: new Icon({
                anchor: pngAnchor,
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                crossOrigin: 'anonymous',
                src: PlacePNG,
                color: item.color,
                scale: pngScale
              })
            }));
            feature.getStyle().getImage().setOpacity(0.5)
          });
          sourceArray[count].refresh()
        }
      });

    }
    else{
      this.setState({editing: false});
      modify.map(function(layer){
        return map.removeInteraction(layer);
      });
      this.state.features.map(function(item, count){
        if(item.type === 'line'){
          let collection = sourceArray[count].getFeatures();
          collection.forEach(function(feature){
          feature.setStyle(new Style({
              stroke: new Stroke({
                color: item.color,
                lineDash:[1],
                width: 8
              })
            }));
          });

          sourceArray[count].refresh()
        }
        else{
          let collection = sourceArray[count].getFeatures();
          collection.forEach(function(feature){
          feature.setStyle(new Style({
              image: new Icon({
                anchor: pngAnchor,
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                crossOrigin: 'anonymous',
                src: PlacePNG,
                color: item.color,
                scale: pngScale
              })
            }));
            feature.getStyle().getImage().setOpacity(1);
          });

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

  openBasemapMenu = event => {
    this.setState({ basemapMenuAnchorEl: event.currentTarget });
  };

  closeBasemapMenu = () => {
    this.setState({ basemapMenuAnchorEl: null });
  };

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
    this.setState({uploadMessageDisplay: false});
  }

  openHelp = () =>{
    this.setState({showHelp: true});
  }
  closeHelp = () =>{
    this.setState({showHelp: false});
  }

  setBasemap(type){
    console.log('change basemap');
    if(type==='aerial'){
      console.log(map.getLayers());
      let basemap=new TileLayer({ source: new XYZ({ url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}' }) });
      console.log(map.getLayers());
      map.getLayers().setAt(0, basemap)
    }
    else if(type==='lightmap'){
      console.log(map.getLayers());
      let basemap=new TileLayer({
        //source: new XYZ({url: 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'})

        source: new TileWMS({
          url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
          params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
          serverType: 'geoserver',
          transition: 0
        })


      });
      map.getLayers().setAt(0, basemap)


    }
    else if(type==='darkmap'){
      console.log(map.getLayers());
      let basemap=new TileLayer({
        source: new XYZ({url: 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'})
        /*
        source: new TileWMS({
          url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
          params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
          serverType: 'geoserver',
          transition: 0
        })
        */

      });
      map.getLayers().setAt(0, basemap)


    }
    this.closeBasemapMenu();
  }

  render() {
    const { basemapMenuAnchorEl } = this.state;
    const { classes, history } = this.props;


    return (
        <div className="App">
          <AppBar position="fixed" style={{zIndex: 1202, flexWrap:'wrap', width:'100%' }}>
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
                mode={this.state.mode}
                cardSortState = {this.state.cardSortState}
                sortCards = {this.sortCards}
                drawing={this.state.drawing}
                editing={this.state.editing}
                deleting = {this.state.deleting}
                features = {this.state.features}
                drawnFeatures = {drawnFeatures}
                finishLine = {this.finishLine}
                deleteLastPoint = {this.deleteLastPoint}
                cancelEdit = {this.cancelEdit}
                addInteraction = {this.addInteraction}
                openUploadDialog = {this.openUploadDialog}
                switchLayer={this.switchLayer}
                changeMode = {this.changeMode}
                toggleEdit =  {this.toggleEdit}
                toggleDelete =  {this.toggleDelete}
              />
              {isAuthenticated() && (
                <>
                <br/>
                <div style={{display:'flex', flexDirection: 'row'}}>
                <Typography variant='caption' color='textSecondary' style={{padding:'8px', flexGrow:1}}>
                  Logged in as:
                  <br /> {isAuthenticated().user.name}
                </Typography>
                  <div style={{paddingTop:'10px'}}>
                    <Button size='small' onClick={()=>logout(()=>{history.push('/')})}>Logout</Button>
                  </div>
                </div>
                </>
              )}
              <Button size='small' style={{marginTop:'10px'}} onClick={this.openHelp}><HelpIcon/>&nbsp;&nbsp;Help</Button>

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
              mode={this.state.mode}
              cardSortState = {this.state.cardSortState}
              sortCards = {this.sortCards}
              drawing={this.state.drawing}
              editing={this.state.editing}
              deleting = {this.state.deleting}
              features = {this.state.features}
              drawnFeatures = {drawnFeatures}
              finishLine = {this.finishLine}
              deleteLastPoint = {this.deleteLastPoint}
              cancelEdit = {this.cancelEdit}
              addInteraction = {this.addInteraction}
              openUploadDialog = {this.openUploadDialog}
              switchLayer={this.switchLayer}
              changeMode = {this.changeMode}
              toggleEdit =  {this.toggleEdit}
              toggleDelete =  {this.toggleDelete}
            />
          </div>
          <Button size='small' onClick={this.openHelp} style={{position:'absolute', left:'15px', bottom:'15px'}}><HelpIcon/>&nbsp;&nbsp;Help</Button>

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
            mode={this.state.mode}
            cardSortState = {this.state.cardSortState}
            sortCards = {this.sortCards}
            drawing={this.state.drawing}
            editing={this.state.editing}
            deleting = {this.state.deleting}
            features = {this.state.features}
            drawnFeatures = {drawnFeatures}
            finishLine = {this.finishLine}
            deleteLastPoint = {this.deleteLastPoint}
            cancelEdit = {this.cancelEdit}
            addInteraction = {this.addInteraction}
            openUploadDialog = {this.openUploadDialog}
            switchLayer={this.switchLayer}
            changeMode = {this.changeMode}
            toggleEdit =  {this.toggleEdit}
            toggleDelete =  {this.toggleDelete}
          />
        </div>
        </div>
      </Drawer>
        <Fab id='basemapsFab'
          size='small'
          style={this.state.mode==='map' ? {display:'flex'} : {display:'none'}}
          onClick={this.openBasemapMenu}
        >
          <LayersIcon />
        </Fab>
        <Menu
          id="simple-menu"
          anchorEl={basemapMenuAnchorEl}
          open={Boolean(basemapMenuAnchorEl)}
          onClose={this.closeBasemapMenu}
        >
          <div style={{paddingTop:'0px',paddingBottom:'0px', paddingLeft:'16px',outline:'none'}}><Typography variant='overline' color='textSecondary'>Basemaps</Typography></div>
          <MenuItem className='compactList' onClick={()=>this.setBasemap('lightmap')}>Light Basemap</MenuItem>
          <MenuItem className='compactList' onClick={()=>this.setBasemap('darkmap')}>Dark Basemap</MenuItem>
          <MenuItem className='compactList' onClick={()=>this.setBasemap('aerial')}>Aerial Photo</MenuItem>
        </Menu>
          {(this.state.view === 0 && this.state.editing === false && this.state.deleting=== false && this.state.drawing===false) ? <Fab onClick={this.toggleBottomDrawer(true)} color="primary" aria-label="Add" id='add-button'><AddIcon /></Fab> : <div /> }
          {(this.state.view === 0 && this.state.editing === false && this.state.deleting=== false && this.state.drawing===false && drawnFeatures > 0) ? <Fab onClick={()=>this.openUploadDialog(true)} color="secondary" aria-label="Add" id='upload-button'><UploadIcon /></Fab> : <div /> }
          {(this.state.view === 1 && this.state.mode === 'map'  ) ? <Fab onClick={()=>this.changeMode('cards')} color="primary" id='cardswitcher'><CardsIcon /></Fab> : <div /> }
          {(this.state.view === 1 && this.state.mode === 'cards'  ) ? <Fab onClick={()=>this.changeMode('map')} color="primary" id='mapswitcher'><MapIcon /></Fab> : <div /> }



          <MainDisplay
            mode={this.state.mode}
            view={this.state.view}
            data={this.state.featureData}
            layers = {this.state.features}
            cardSortState = {this.state.cardSortState}
            />
          <div id='map' style={this.state.viewMap ? {display:'block'} : {display:'none'}}></div>
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
            open={this.state.uploadMessageDisplay}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.uploadMessage}</span>}
            autoHideDuration = {2000}
            onClose = {this.closeSnackbar}
            />
            <Dialog
              open={this.state.uploadDialog}
              onClose={this.handleClose}
            >
              <DialogTitle>{"Upload Features?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Do you want to upload {drawnFeatures} features to the map?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.openUploadDialog(false)}} color="primary">
                  <CancelIcon /> Cancel
                </Button>
                <Button onClick={this.upload} color="primary" autoFocus>
                  <UploadIcon /> &nbsp; Upload
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.showHelp}
              onClose={this.closeHelp}
            >
              <DialogTitle><img src={NkcLogo} width='200'/></DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                <strong>Where would you like to bike in North Kansas City?.</strong><br />
                North Kansas City is undertaking a Bike Master Plan in 2019 to coordinate projects and plan for a network that connects and serves all parts of the community.
                We want to know where you want to bike in North Kansas City.  Draw a line (<LineIcon style={{height:'24px',verticalAlign:'middle' }} />) or drop a pin (<PlaceIcon style={{height:'24px', verticalAlign:'middle'}} />) to share routes and destinations where you might ride a bike.  You can also point out places you would like to ride but don't feel safe or comfortable for biking today.  Thank you for informing North Kansas City's Bike Master Plan!  To get involved and learn more about the Bike Master Plan, visit the <a href='http://www.nkc.org/departments/community_development/current_projects/bike_master_plan'>North Kansas City Bike Master Plan project page.</a>                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.closeHelp} color="primary">
                  <CancelIcon /> Close
                </Button>
              </DialogActions>
            </Dialog>
            <img src={PlacePNG} style={{display:"none"}} />
        </div>
    );
  }
  componentDidMount(){
    this.openHelp();
    basemapLayers = [];
    basemapLayers.push(new TileLayer({
      source: new TileWMS({
        url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
        params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
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
        let scale = chroma.scale([chroma(item.color).darken(1),chroma(item.color).brighten(3)]);
        resultsLayerArray.push(new Heatmap({
          source: resultsSourceArray[count],
          renderMode: 'image',
          shadow: 1000,
          properties:{line: true},
          gradient:[scale(0), scale(0.25), scale(0.5), scale(0.75), scale(1)]
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
      }
      else{
        layerArray.push(new VectorLayer({
          source: sourceArray[count],
          style: new Style({
            image: new Icon(({
              anchor: pngAnchor,
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlacePNG,
              color: item.color,
              scale: pngScale
            }))
          })
        }));

        drawInteraction.push(
          new Draw({
            source: sourceArray[count],
            type: 'Point',
            style: new Style({
              image: new Icon(({
                anchor: pngAnchor,
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                crossOrigin: 'anonymous',
                src: PlacePNG,
                color: item.color,
                scale: pngScale
              }))
            })
          })
        );
        resultsLayerArray.push(
          new AnimatedCluster({
            source: new Cluster({
              source: resultsSourceArray[count],
              distance: 80
            }),
            animationDuration: 500,
            style: function(feature){
              var size = feature.get('features').length;
              var style;
              if(size < 2){
                style = [new Style({
                  image: new Icon(({
                    anchor: pngAnchor,
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    crossOrigin: 'anonymous',
                    src: PlacePNG,
                    color: item.color,
                    scale: pngScale
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
                          color:chroma(item.color).alpha(0.5).rgba(),
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

        hover.push(
          new Select({
            condition:pointerMove,
            layers: [resultsLayerArray[count]],
            style:function(feature){
              var size = feature.get('features').length;
              var style;
              if(size < 2){
                style = [new Style({
                  image: new Icon(({
                    anchor: pngAnchor,
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    crossOrigin: 'anonymous',
                    src: PlacePNG,
                    color: item.color,
                    scale: pngScale
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
                          color:chroma(item.color).alpha(0.5).rgba(),
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
        layers: basemapLayers.concat(layerArray),
        overlays: [overlay, resultsOverlay],
        view: new View({
          center: fromLonLat([-94.573, 39.143]),
          zoom: 14,
          maxZoom: 20,
          minZoom: 12
        }),
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });
	    map.addLayer(convexVector);
      hull = new Feature(new Polygon([[0,0]]));
      convexVector.getSource().addFeature(hull);

      map.on('pointermove', function(e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
      });
      var resolution = map.getView().getResolution(),
      radiusSize = 12,
      blurSize = 64;
      var zoomRadius = radiusSize/resolution;
      var zoomBlur = blurSize/resolution;
      resultsLayerArray.forEach(function(item){
        if(item instanceof Heatmap){
          item.setRadius(zoomRadius)
          item.setBlur(zoomBlur);
        };
      });

      map.getView().on('change:resolution', function(evt){
          resolution = evt.target.get(evt.key);
          zoomRadius =  radiusSize/resolution;
          zoomBlur = blurSize/resolution;
          resultsLayerArray.forEach(function(item){
            if(item instanceof Heatmap){
              item.setRadius(zoomRadius)
              item.setBlur(zoomBlur);
            };
          });
      });
      var collection = select.getFeatures();
      collection.on('add', function(e){
        console.log(e.element.getGeometry().getType());
        if(e.element.getGeometry().getType() === 'LineString'){
          e.element.setStyle(new Style({
              stroke: new Stroke({
                color: e.element.getProperties().layerColor,
                width: 8
              })
            }));
        }
        else if(e.element.getGeometry().getType() === 'Point'){
          e.element.setStyle(new Style({
            image: new Icon(({
              anchor: pngAnchor,
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              crossOrigin: 'anonymous',
              src: PlacePNG,
              color: e.element.getProperties().layerColor,
              scale: pngScale
            }))
          }));
        }
      });
      collection.on('remove', function(e){


      });


      select.on('select', function(e) {
        console.log(e);
        var selectedFeature2 = e.selected[0];
        if(selectedFeature2){
          this.setState({targetFeatureId: e.selected[0].getId()});
          console.log(e.selected[0].getProperties())
          console.log(e.selected[0].getProperties().geometry);
          if(!selectedFeature2.getProperties().comment){
            console.log('no comment');
            this.setState({comment: ''});

          }
          else{
            console.log('comment');
            this.setState({comment: selectedFeature2.getProperties().comment});

          }
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

      hover.map((item, count)=>{
        item.on('select', function(e) {
          console.log(e);
          if(e.selected.length > 0){
            let features = e.selected[0].get('features')
            let coords = []
            features.forEach((feature)=>{
              coords.push(feature.getGeometry().getCoordinates());
            })
            console.log(ConvexHull(coords));
            convexVector.getSource().addFeature( new Feature( new Polygon([ConvexHull(coords)]) ) );
          }
          else if(e.deselected.length > 0){
            convexVector.getSource().clear()
          }

          /*
          var h = e.feature.get("convexHull");
      			if (!h)
      			{	var cluster = e.feature.get("features");
      				// calculate convex hull
      				if (cluster && cluster.length)
      				{	var c = [];
      					for (var i=0, f; f = cluster[i]; i++)
      					{	c.push(f.getGeometry().getCoordinates());
      					}
      					h = ol.coordinate.convexHull(c);
      					e.feature.get("convexHull", h);
      				}
      			}
      			vector.getSource().clear();
      			if (h.length>2) vector.getSource().addFeature ( new ol.Feature( new ol.geom.Polygon([h]) ) );
      		});
      	hover.on("leave", function(e)
      		{	vector.getSource().clear();
              */
      		});

      })


      drawInteraction.map(function(item, counter){
        drawInteraction[counter].on('drawend', function(target){
          if(mapTippy){
            mapTippy.destroy();
          }
          target.feature.setProperties({layerName: this.state.features[counter].name, layerColor: this.state.features[counter].color});
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
        selectDelete.getFeatures().clear();
        if(selectedFeature){
          sourceArray.map(function(layer, count){
            if(layer.hasFeature(selectedFeature)){
              layer.removeFeature(selectedFeature);
              drawnFeatures--;
              document.getElementById('map').style.cursor = 'default';
            }
          })
        }
      });

      var selectableLayers = [];
      resultsLayerArray.map(function(layer){
        if(layer instanceof AnimatedCluster){
          console.log(layer);
          selectableLayers.push(layer);
        }
        console.log(selectableLayers);
      });

      clusterSelectClick = new Select({
        condition: click,
        layers: selectableLayers,
        style: function(feature){
          let color = feature.getProperties().features[0].getProperties().layerColor;
          var size = feature.get('features').length;
          var style;
          if(size < 2){
            style = [new Style({
              image: new Icon(({
                anchor: pngAnchor,
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                crossOrigin: 'anonymous',
                src: PlacePNG,
                color: color,
                scale: pngScale
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
                      color:color,
                      width: 6
                    }),
                    fill: new Fill({
                      color: color
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
      });

      clusterSelectClick.on('select', function(e) {

        var selectedFeatures = e.selected;
        console.log(selectedFeatures);
        if(selectedFeatures[0]){
          this.setState({resultClusterNumber: 0});
          selectedFeatures = e.selected[0].getProperties().features;
          this.setState({selectedResultsFeatures: selectedFeatures});
          var coordinate;
          coordinate = e.selected[0].getGeometry().getCoordinates();
          resultsOverlay.setPosition(coordinate);
          this.setState({popover: true});
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

      drawInteraction[0].on('click', function(test){
        console.log(test);
      })
    }
    componentDidUpdate(){
      map.updateSize();
    }
}
export default MainApp;
