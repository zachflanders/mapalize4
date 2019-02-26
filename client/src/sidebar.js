import React, { Component } from 'react';
import './App.css';

//Material-ui imports
import Button from '@material-ui/core/Button';
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


import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

class Sidebar extends Component {
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
    })
    return (
      <FormGroup>
        {features}
      </FormGroup>
    )
  }

  render() {
      if(this.props.view === 0){
        if (this.props.drawing !== false) {
          return (
            <div>
            <div style={{paddingLeft: '32px', textIndent:'-32px'}}><strong><LineIcon style={{color:'#00c853', verticalAlign:'middle'}} /> &nbsp;Add Bike Infrastructure</strong></div>
              <br />
              <Paper style={{padding:'10px'}}>
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
                onClick = {this.props.upload}
                className = 'full-width'
              >
                <UploadIcon /> &nbsp;&nbsp; Upload
              </Button>
              </div>
          )
        }
      }
      else{
        return(
          <div>
            <LayersIcon style={{verticalAlign:"middle"}} /> &nbsp;&nbsp; <strong>View Layers</strong>
            {this.renderResultsLayerList()}
          </div>
        )
      }
  }
}
export default Sidebar;
