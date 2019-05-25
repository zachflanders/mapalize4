import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import {Link} from 'react-router-dom'
import {signup} from '../../auth';
import ReCAPTCHA from "react-google-recaptcha";
import Nav from '../Nav';




const styles = theme => ({

  textField: {
    width: '100%',
    marginBottom:'16px'
  }
});

class Signup extends Component {
  constructor(){
    super()
    this.state = {
      name: '',
      email: '',
      password:'',
      error: '',
      open: false,
      recaptcha: false,
      accessCode: ''
    }
    this.handleCaptchaResponseChange = this.handleCaptchaResponseChange.bind(this);

  }

  handleChange = (name) => (event) => {
    this.setState({error:''});
    this.setState({[name]: event.target.value})
  };

  clickSubmit = event => {
    event.preventDefault();
    const {name, email, password, recaptcha, accessCode} = this.state;
    const user = {
      name,
      email,
      password,
      recaptcha,
      accessCode
    };
    signup(user)
    .then(data =>{
      if(data.error){
        this.setState({error: data.error})
      }
      else{
        this.setState({
          error: '',
          name: '',
          email: '',
          password: '',
          open: true,
          recaptcha: false,
          accessCode: ''
        })
      }
    });

  };

  handleCaptchaResponseChange(response) {
   this.setState({
     recaptcha: response,
   });
 }


  signupForm = (name, email, password, accessCode, classes) => (
    <form style={{textAlign:'center'}}>
      <TextField
        id="name"
        className={classes.textField}
        label="Name"
        onChange={this.handleChange("name")}
        value={name}
        />
      <TextField
        id="email"
        className={classes.textField}
        label="Email"
        type='email'
        onChange={this.handleChange("email")}
        value={email}
        />
      <TextField
        id="password"
        className={classes.textField}
        label="Password"
        type='password'
        onChange={this.handleChange("password")}
        value={password}
        />
        <TextField
          id="code"
          className={classes.textField}
          label="Access Code"
          onChange={this.handleChange("accessCode")}
          value={accessCode}
          />

    <Button
      onClick={this.clickSubmit}
      variant='contained'
      color='primary'>
        Sign Up
    </Button>
    </form>
  )

  render() {
    const { classes } = this.props;
    const {name, email, password, accessCode, error} = this.state;
    return(
      <div>
        <Nav />
        <div style={{marginTop:'84px'}}>
        <Paper className='centered padded' style={{width:'350px'}}>
          <Typography variant="h5" component="h2" style={{textAlign:'center'}}>Create Account</Typography>
          {this.signupForm(name, email, password, accessCode, classes)}
          <br />
          <Typography variant='caption' color='textSecondary' style={{textAlign:'center'}}>Already have an account? <Link to='/login' style={{color:"rgba(0, 0, 0, 0.54)"}}>Login</Link></Typography>

        </Paper>
        <Snackbar
          open={this.state.error}
          message={this.state.error}
        />
        <Snackbar
          open={this.state.open}
          message={'New account created.  Please login.'}
        />
        </div>
      </div>
    );
  }
}
Signup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Signup);
