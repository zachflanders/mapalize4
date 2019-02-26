import React, { Component } from 'react';
import './App.css';
import MainDisplay from './main.js';
import Sidebar from './sidebar.js';

import PlaceSVG from './assets/place.svg';

//openlayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
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

//Material-ui imports
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import FireIcon from '@material-ui/icons/Whatshot';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import teal from '@material-ui/core/colors/teal';

import turf from 'turf';
import axios from 'axios';
import chroma from 'chroma-js';

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
var clusterLayerArray = [];
var map = {};
var drawInteraction = [];
var snap;
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
var select = new Select({
  condition: click,
  layers: layerArray
});
var clusterSelect = new Select({
  condition: pointerMove,
  layers: clusterLayerArray,
  style: new Style({
    stroke: "none",
    fill: "none"
  })
});
var selectHover = [];
var drawnFeatures = 0;
var turnLineIntoArrayOfPoints = function(geoJSONLine){
  //if statement should check to make sure geoJSON line is valid
  if(true){
    var length = turf.lineDistance(geoJSONLine, 'miles');
    for(var i=0; i <= length; i=i+0.02){
      if(length > 0 ){
        var thisPoint = turf.along(geoJSONLine, i, 'miles');
        pointSource.addFeature(new Feature(new Point(transform([thisPoint.geometry.coordinates[0],thisPoint.geometry.coordinates[1]], 'EPSG:4326', 'EPSG:3857'))));
      }
    }
    return;
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
      featureData: null
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
    if(value === 1){
      this.setState({
        view: 1
      });
      map.addLayer(heatmapLayer);
      this.state.features.map(function(item, count){
         return map.removeLayer(layerArray[count+1]);
      });
      resultsLayerArray.map(function(item){
        return map.addLayer(item);
      })
      clusterLayerArray.map(function(item){
        return map.addLayer(item);
      })
      map.removeOverlay(overlay);
      map.removeInteraction(select);
      this.getResults();
    }
    else{
      this.setState({
        view: 0
      })
      map.removeLayer(heatmapLayer);
      this.state.features.map(function(item, count){
        return map.addLayer(layerArray[count+1]);
      });
      resultsLayerArray.map(function(item){
        return map.removeLayer(item);
      })
      clusterLayerArray.map(function(item){
        return map.removeLayer(item);
      })
      map.addOverlay(overlay);
      map.addInteraction(select);
      this.getInput();
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
      console.log(response);
    });
  }

  cancelEdit(counter){
    map.removeInteraction(drawInteraction[counter]);
    map.addInteraction(select);
    document.getElementById('map').style.cursor = 'default';
    this.setState({
      drawing: false
    });
  }

  finishLine(counter){
    if(drawInteraction[counter]){
      drawInteraction[counter].finishDrawing();
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
              return resultsSourceArray[count].addFeature(new Feature(new Point(fromLonLat([feature.point.coordinates[0],feature.point.coordinates[1]]))));
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
              <Sidebar
                view={this.state.view}
                drawing={this.state.drawing}
                features = {this.state.features}
                finishLine = {this.finishLine}
                deleteLastPoint = {this.deleteLastPoint}
                cancelEdit = {this.cancelEdit}
                addInteraction = {this.addInteraction}
                upload = {this.upload}
              />
            </div>
          </Drawer>
          <MainDisplay mode={this.state.mode} data={this.state.featureData} />
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
        resultsLayerArray.push(new VectorLayer({
          source: resultsSourceArray[count],
          style: new Style({
              stroke: new Stroke({
                color: item.color,
                width: 8
              })
            })
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
            })
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
        clusterLayerArray.push(
          new VectorLayer({
            source: new Cluster({
              source: resultsSourceArray[count],
              distance: 40
            }),
            style: function(feature){
              var size = feature.get('features').length;
              var style;
              if(size < 2){
                style = new Style({
                  image: new Icon(({
                    anchor: [0.5, 60],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    crossOrigin: 'anonymous',
                    src: PlaceSVG,
                    color: item.color,
                    scale: 0.5
                  }))
                });
              }
              else{
                style = [
                  new Style({
                    image:
                      new CircleStyle({
                        radius: 22,
                        fill: new Fill({
                          color: chroma(item.color).alpha(0.6).rgba()
                        })
                      }),

                    text: new Text({
                      text: size.toString(),
                      fill: new Fill({
                        color: '#fff'
                      })
                    })
                  }),
                    new Style({
                      image:
                        new CircleStyle({
                          radius: 16,
                          fill: new Fill({
                            color: item.color
                          })
                        })
                    })]

              }
              return style;
            }
          })
        );
      }

    });
    this.getResults();

    var container = document.getElementById('popover');
    overlay.setElement(container);
    map = new Map({
        target: 'map',
        layers: layerArray,
        overlays: [overlay],
        interactions: defaultInteractions().extend([clusterSelect]),
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
      heatmapLayer.setRadius(zoomRadius);
      heatmapLayer.setBlur(zoomBlur);

      map.getView().on('change:resolution', function(evt){
          resolution = evt.target.get(evt.key);
          zoomRadius =  radiusSize/resolution;
          zoomBlur = blurSize/resolution;
         heatmapLayer.setRadius(zoomRadius);
         heatmapLayer.setBlur(zoomBlur);
      });
      drawInteraction.map(function(item, counter){
        drawInteraction[counter].on('drawend', function(target){
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
          this.setState({popover: true});
          this.setState({targetFeatureId: target.feature.getId()});
          console.log(target.feature);
          this.cancelEdit(counter);
        }.bind(this));
      }.bind(this));

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

      clusterSelect.on('select', function(e) {
        if(e.selected.length > 0){
          e.selected[0].getProperties().features.map(function(feature){
            return console.log(feature.getProperties());
          });
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
