import React, { Component } from 'react';
import '../../../App.css';
import './sidebar.css';
import chroma from 'chroma-js';
import tippy from 'tippy.js';

//Material-ui imports
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import EditIcon from '@material-ui/icons/Edit';
import LineIcon from '@material-ui/icons/Timeline';
import PointIcon from '@material-ui/icons/AddLocation';
import PlaceIcon from '@material-ui/icons/Place';
import UploadIcon from '@material-ui/icons/CloudUpload';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Close';
import RemoveIcon from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import LayersIcon from '@material-ui/icons/Layers';
import MapIcon from '@material-ui/icons/Map';
import CardsIcon from '@material-ui/icons/ViewModule';
import ViewIcon from '@material-ui/icons/Visibility';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import SortIcon from '@material-ui/icons/Sort';

let mapTippy;
let w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth;

class CreateFeaturesPanel extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  

  addInteraction(counter){
    console.log('add interaction');
    //overlay.setPosition(undefined);
    this.props.map.removeInteraction(this.props.select);
    this.props.map.addInteraction(this.props.drawInteraction[counter]);
    this.props.updateDrawingLayer(counter)
    document.getElementById('map').style.cursor = 'crosshair';
    console.log(x);
    if(x>600){
      let mapDiv = document.querySelector('#map');
      mapTippy = tippy(mapDiv);
      if(this.props.features[counter].type === 'line'){
        mapTippy.set({
          content: "Click to start drawing line",
          followCursor: true,
          placement: 'right',
          arrow: true,
          distance: 20,
          hideOnClick: false,
          touch: true
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
    else{
      console.log('mobile')
      let mapDiv = document.querySelector('#tooltipAnchor');
      mapTippy = tippy(mapDiv);
      if(this.props.features[counter].type === 'line'){
        mapTippy.set({
          content: "Click to start drawing line",
          placement: 'top',
          hideOnClick: false,
        });
      }
      else{
        mapTippy.set({
          content: "Click to place feature",
          placement: 'top',
          hideOnClick: false,
        });
      }
      mapTippy.enable();
      mapTippy.show()
    }


  }
  render(){

    return(<div>
      <Paper id='createFeaturesPanel' ref='createFeaturesPanel'>
        <div style={{padding:'8px'}}>
          <strong><AddIcon style={{verticalAlign:'middle'}} /> &nbsp; Create Features</strong>
        </div>
        <Divider />
        <div style={{padding:'8px'}}>

        {this.props.features.map(function(item, counter){
          return(
              <Button
                key={item.name}
                onClick = {((item.type === 'line') ? ()=>this.addInteraction(counter) : ()=>this.addInteraction(counter))}
                className='full-width-left featureButton'
                data-tippy-content={item.prompt}
                data-tippy-placement='right'
                data-tippy-boundary='window'
                data-tippy-arrow='true'
              >
                {((item.type === 'line') ? <LineIcon style={{color:item.color}} /> : <PointIcon style={{color:item.color}}/>)} <span style ={{paddingLeft:'10px'}}>{item.name}</span>
              </Button>

          )
        }.bind(this))}
        </div>
      </Paper>
      <br />
      <Paper style={{padding:'8px'}} id='editPanel' ref='editPanel'>
      <Button
        disabled = {(this.props.tour === true || this.props.drawnFeatures > 0)? false: true}
        onClick = {this.props.toggleEdit}
        className='full-width-left'        >
        <EditIcon /> &nbsp;&nbsp; Edit Features
      </Button>
      <Button
        disabled = {(this.props.tour === true || this.props.drawnFeatures > 0)? false: true}
        onClick = {this.props.toggleDelete}
        className='full-width-left'        >
        <DeleteIcon /> &nbsp;&nbsp; Delete Features
      </Button>
      </Paper>
      <br />
      <Button
        ref='uploadButton'
        disabled = {(this.props.tour === true || this.props.drawnFeatures > 0)? false: true}
        variant='contained'
        color='primary'
        onClick = {()=>{if(this.props.drawnFeatures > 0){this.props.openUploadDialog(true)}}}
        className = 'full-width'
        id='uploadButton'
      >
        <UploadIcon /> &nbsp;&nbsp; Upload {this.props.tour}
      </Button>
      </div>
  )
      }

      componentDidMount(){
        this.props.drawInteraction.forEach((item)=>{
          item.on('drawstart', function(e){
            let currentDrawnLine = e.feature;
            currentDrawnLine.getGeometry().on('change', function(evt) {
                var geom = evt.target.getCoordinates();
                if(geom.length > 1 && geom.length < 3){
                  //this.setState({lineDrawMessage: "Click to contine drawing line"});
                  mapTippy.setContent('Click to continue drawing line');
                }
                else if(geom.length > 2){
                  mapTippy.setContent('Click last point to finish line');
  
                  //this.setState({lineDrawMessage: "Click last point to finish line"});
                }
              });
          });
        })
      }
  }

  export default CreateFeaturesPanel