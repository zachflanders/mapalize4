import React from 'react';
import {Route, Switch} from 'react-router-dom';
import MainApp from './main/MainApp.js';
import Signup from './user/Signup';
import Signin from './user/Signin';
import Moderate from './feature/Moderate';


const MainRouter = () => (
  <div className="App">
    <Switch>
      <Route exact path='/signup' component={Signup}></Route>
      <Route exact path='/login' component={Signin}></Route>
      <Route exact path='/moderate/:featureId' component={Moderate}></Route>

      <Route path='/' component={MainApp}></Route>
    </Switch>
  </div>
)

export default MainRouter;
