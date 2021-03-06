import React from 'react';
import {BrowserRouter} from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MainRouter from './MainRouter';
import './App.css';
import indigo from '@material-ui/core/colors/indigo';
import teal from '@material-ui/core/colors/teal';

const theme = createMuiTheme({
  palette: {
    primary: {main:'#478D97' },
    secondary: {main: '#E36C2F'}
  },
  typography: {
    useNextVariants: true,
  }
});

const App = () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <MainRouter />
    </BrowserRouter>
  </MuiThemeProvider>

);

export default App;
