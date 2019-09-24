import React, { Component } from 'react';
import '../../../App.css';
import './sidebar.css';
import chroma from 'chroma-js';

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

const ResultsLayerList = (props) => {
    let features = props.features.map(function(item, count){
      if(item.type === 'point'){
        return (
          <FormControlLabel
            key = {count}
            control={
              <Checkbox
                onChange={()=>props.switchLayer(count)}
                checked={item.viewResults}
                style={{paddingTop: '0px'}}
              />
            }
            label= {<span className='sidebar-results-label-point'><PlaceIcon style={{color:item.color, verticalAlign:'middle', paddingRight:'6px'}} />{item.name}</span>}
          />
        );
      }
      else{
        let scale = chroma.scale([chroma(item.color).brighten(3), chroma(item.color).darken(1)]);
        return (
          <FormControlLabel
            key = {count}
            control={
              <Checkbox
                onChange={()=>props.switchLayer(count)}
                checked={item.viewResults}
                style={{paddingTop: '0px'}}
              />
            }
            label= {
              <div style={{display: 'flex'}}>
                <div>
                  <svg width="18" height="30" style={{verticalAlign:"middle", paddingRight:'6px'}} >
                    <defs>
                      <linearGradient id={item.id} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" style={{stopColor:scale(0),stopOpacity:"1"}} />
                        <stop offset="25%" style={{stopColor:scale(0.25),stopOpacity:"1"}} />
                        <stop offset="50%" style={{stopColor:scale(0.5),stopOpacity:"1"}} />
                        <stop offset="75%" style={{stopColor:scale(0.75),stopOpacity:"1"}} />
                        <stop offset="100%" style={{stopColor:scale(1),stopOpacity:"1"}} />
                      </linearGradient>
                    </defs>
                    <rect width="5" height="30px" style={{fill:`url(#${item.id})`}} />
                  </svg>
                </div>
                <div>
                  {item.name}
                </div>
              </div>
            }
          />
        );
      }
    }.bind(this))
    return (
      <FormGroup>
        {features}
      </FormGroup>
    )
  }

  export default ResultsLayerList