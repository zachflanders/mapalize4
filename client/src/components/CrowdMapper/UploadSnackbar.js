import React from 'react';
import ReactDOM from 'react-dom';


//Material-ui imports
import Snackbar from '@material-ui/core/Snackbar';

const UploadSnackbar = (props) =>(

    ReactDOM.createPortal(<Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={props.showUploadMessage}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{props.uploadMessage}</span>}
      autoHideDuration = {2000}
      onClose={()=>props.onClose()}
      />, document.body)
  )




export default UploadSnackbar;