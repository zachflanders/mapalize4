import React, { Component } from 'react';
import '../../../App.css';
import './sidebar.css';
import chroma from 'chroma-js';

import ResultsLayerList from './ResultsLayerList';


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
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import {logout, isAuthenticated} from '../../../auth';
import HelpIcon from '@material-ui/icons/HelpOutline';



const drawerWidth = '280px';




class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderDrawingMenu = (item) =>{
    if(item.type === 'line'){
      return(
        <Paper >
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

        </Paper>
      )}
      else{
        return (
            <Paper >
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
            </Paper>
        );
      }
  }

  renderEditingMenu = () =>{
    return(
      <Paper>
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
      </Paper>
    )
  }


  renderDeletingMenu = () =>{
    return(
      <Paper>
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
      </Paper>
    )
  }

  renderInputMenu = () =>{
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
              onClick = {((item.type === 'line') ? ()=>this.props.addInteraction(counter) : ()=>this.props.addInteraction(counter))}
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

  render() {
    const { history } = this.props;

      if(this.props.view === 0){
        let item = this.props.features[this.props.drawing];
        return (
          
          <Drawer variant="permanent" className='desktop'>
            <div style={{width: drawerWidth, padding:'15px'}} id='sidebar'>        
              {this.props.drawing !== false && this.renderDrawingMenu(item)}
              {this.props.editing === true && this.renderEditingMenu()}
              {this.props.deleting === true && this.renderDeletingMenu()}
              {this.props.drawing === false && this.props.editing===false && this.props.deleting=== false && this.renderInputMenu()}
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
                <Button size='small' style={{marginTop:'10px'}} onClick={this.props.openHelp}><HelpIcon/>&nbsp;&nbsp;Help</Button>
                <Typography variant='caption' color='textSecondary' style={{paddingTop:'10px'}}>
                  To learn more about the NKC Bike Master Plan process underway and upcoming events, visit:  <a href='http://www.nkc.org/departments/community_development/current_projects/bike_master_plan'>http://www.nkc.org/departments/ community_development/ current_projects/bike_master_plan</a><br /><br />
                  If you have any questions please reach out to the consultant team member Christina Hoxie, <a href='mailto:choxie@hoxiecollective.com'>choxie@hoxiecollective.com</a>.
                </Typography>
            </div>
          </Drawer>)
      }
      else{
        return(
          <Drawer variant="permanent" className='desktop'>
            <div style={{width: drawerWidth, padding:'15px'}} id='sidebar'>
              <Paper>
                <div style={{padding:'8px'}}>
                  <ViewIcon style={{verticalAlign:"middle"}} /> &nbsp;&nbsp; <strong>View Results As</strong>
                </div>
                <Divider />
                <div style={{padding:'8px'}}>
                  <Button
                    onClick = {() => this.props.changeMode('map')}
                    className='full-width-left'
                    size='small'
                  >
                    <MapIcon /> &nbsp;&nbsp; Map
                  </Button>
                  <br />
                  <Button
                    onClick = {() => this.props.changeMode('cards')}
                    className='full-width-left'
                    size='small'  >
                      <CardsIcon /> &nbsp;&nbsp; Cards
                  </Button>
                </div>
              </Paper>
              <br />
              {this.props.mode==='cards' &&
                <>
                  <Paper>
                    <div style={{padding:'8px'}}>
                      <SortIcon style={{verticalAlign:"middle"}} /> &nbsp;&nbsp; <strong>Sort Results</strong>
                    </div>
                    <Divider />
                    <div style={{padding:'8px'}}>
                      <Button
                        onClick = {() => this.props.sortCards('newest')}
                        className='full-width-left'
                        size='small'
                      >
                        Newest First
                      </Button>
                      <br />
                      <Button
                        onClick = {() => this.props.sortCards('oldest')}
                        className='full-width-left'
                        size='small'  >
                          Oldest First
                      </Button>
                    </div>
                  </Paper>
                  <br />
                </>
              }
              <Paper>
                <div style={{padding:'8px'}}>
                  <LayersIcon style={{verticalAlign:"middle"}} /> &nbsp;&nbsp; <strong>View Layers</strong>
                </div>
                <Divider />
                <div style={{padding:'8px 8px 8px 12px'}}>
                  <ResultsLayerList
                    features = {this.props.features}
                    switchLayer = {this.props.switchLayer}
                  />
                </div>
             </Paper>
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
                <Button size='small' style={{marginTop:'10px'}} onClick={this.props.openHelp}><HelpIcon/>&nbsp;&nbsp;Help</Button>
                <Typography variant='caption' color='textSecondary' style={{paddingTop:'10px'}}>
                  To learn more about the NKC Bike Master Plan process underway and upcoming events, visit:  <a href='http://www.nkc.org/departments/community_development/current_projects/bike_master_plan'>http://www.nkc.org/departments/ community_development/ current_projects/bike_master_plan</a><br /><br />
                  If you have any questions please reach out to the consultant team member Christina Hoxie, <a href='mailto:choxie@hoxiecollective.com'>choxie@hoxiecollective.com</a>.
                </Typography>w
           </div>
          </Drawer>
        )
      }
   
  }
  componentDidMount(){
    console.log(this.props.tour);
    this.props.passRefUpward(this.refs);

    }

  componentDidUpdate(){
    console.log(this.props.tour);
  }
}
export default Sidebar;
