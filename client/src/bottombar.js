import React, { Component } from 'react';
import './App.css';

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

class Bottombar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.renderResultsLayerList = this.renderResultsLayerList.bind(this);
  }

  renderResultsLayerList(){
    var features = this.props.features.map(function(item, count){
      if(item.type === 'point'){
        return (
          <FormControlLabel
            key = {count}
            control={
              <Checkbox
                onChange={()=>this.props.switchLayer(count)}
                checked={item.viewResults}
              />
            }
            label= {<span><PlaceIcon style={{color:item.color, verticalAlign:'middle'}} />{item.name}</span>}
          />
        );
      }
      else{
        return (
          <FormControlLabel
            key = {count}
            control={
              <Checkbox
                onChange={()=>this.props.switchLayer(count)}
                checked={item.viewResults}
              />
            }
            label= {
              <span>
                <svg width="10" height="20" style={{verticalAlign:"middle"}} >
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" style={{stopColor:"blue",stopOpacity:".2"}} />
                      <stop offset="25%" style={{stopColor:"cyan",stopOpacity:".4"}} />
                      <stop offset="50%" style={{stopColor:"lime",stopOpacity:".6"}} />
                      <stop offset="75%" style={{stopColor:"yellow",stopOpacity:".8"}} />
                      <stop offset="100%" style={{stopColor:"red",stopOpacity:"1"}} />
                    </linearGradient>
                  </defs>
                  <rect width="10" height="20" style={{fill:"url(#grad1)"}} />
                </svg>
                &nbsp;&nbsp;{item.name}
              </span>}
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

  render() {
      if(this.props.view === 0){
        if (this.props.drawing !== false) {
          var item = this.props.features[this.props.drawing];
          console.log(item);
          if(item.type === 'line'){
            return (
                <div>
                <div style={{padding:'8px'}}>
                  <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><LineIcon style={{color:item.color, verticalAlign:'middle'}} /> &nbsp;{item.name}</strong></div>
                </div>
                <Divider />
                <div style={{padding:'8px'}}>
                  <Button
                    onClick = {()=>this.props.finishLine(this.props.drawing)}
                    className='full-width-left'
                    size='small'
                  >
                    <DoneIcon /> &nbsp;&nbsp; Finish Line
                  </Button>
                  <br />
                  <Button
                    onClick = {() => this.props.deleteLastPoint(this.props.drawing)}
                    className='full-width-left'
                    size='small'  >
                      <RemoveIcon /> &nbsp;&nbsp; Delete Last Point
                  </Button>
                  <br />
                  <Button
                    onClick = {()=>this.props.cancelEdit(this.props.drawing)}
                    className='full-width-left'
                    size='small' >
                      <CancelIcon /> &nbsp;&nbsp; Cancel
                    </Button>
                    </div>

                </div>
            );
          }
          else{
            console.log('edit point');
            return (
                <div >
                <div style={{padding:'8px'}}>
                  <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><PointIcon style={{color:item.color, verticalAlign:'middle'}} /> &nbsp;{item.name}</strong></div>
                </div>
                <Divider />
                <div style={{padding:'8px'}}>
                  <Button
                    onClick = {()=>this.props.cancelEdit(this.props.drawing)}
                    className='full-width-left'
                    size='small' >
                      <CancelIcon /> &nbsp;&nbsp; Cancel
                    </Button>
                    </div>
                </div>
            );
          }

        }
        else if(this.props.editing === true){
          return(
            <div>
              <div style={{padding:'8px'}}>
                <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><EditIcon style={{verticalAlign:'middle'}} /> &nbsp;&nbsp;Edit Features</strong></div>
              </div>
              <Divider />
              <div style={{padding:'8px'}}>
                <Button
                  onClick = {this.props.toggleEdit}
                  className='full-width-left'        >
                  <DoneIcon /> &nbsp;&nbsp; Finish Editing
                </Button>
                </div>
            </div>
          )
        }
        else if(this.props.deleting === true){
          return(
            <div>
              <div style={{padding:'8px'}}>
                <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><DeleteIcon style={{verticalAlign:'middle'}} /> &nbsp;&nbsp;Delete Features</strong></div>
              </div>
              <Divider />
              <div style={{padding:'8px'}}>
                <Button
                  onClick = {this.props.toggleDelete}
                  className='full-width-left'        >
                  <DoneIcon /> &nbsp;&nbsp; Finish Deleting
                </Button>
                </div>
            </div>
          )
        }
        else {
          return (
              <div>

                <div style={{padding:'8px'}}>
                  <strong><AddIcon style={{verticalAlign:'middle'}} /> &nbsp; Create Features</strong>
                </div>
                <Divider />
                <div style={{padding:'8px'}}>

                {this.props.features.map(function(item, counter){
                  return(
                    <Tooltip title={item.prompt} placement='right' key={item.name}>
                      <Button
                        onClick = {((item.type === 'line') ? ()=>this.props.addInteraction(counter) : ()=>this.props.addInteraction(counter))}
                        className='full-width-left'
                      >
                        {((item.type === 'line') ? <LineIcon style={{color:item.color}} /> : <PointIcon style={{color:item.color}}/>)} <span style ={{paddingLeft:'10px'}}>{item.name}</span>
                      </Button>
                    </Tooltip>
                  )
                }.bind(this))}
                </div>
                </div>

          )
        }
      }

  }
}
export default Bottombar;
