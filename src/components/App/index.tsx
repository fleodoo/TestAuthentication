import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navigation from "../Navigation";
import LandingPage from "../Landing";
import SignUpPage from "../Authentication/SignUp";
import SignInPage from "../Authentication/SignIn";
import PasswordForgetPage from "../Authentication/PasswordForget";
import HomePage from "../Home";
import AccountPage from "../Authentication/Account";
import AdminPage from "../Admin";
import i18n from "../../i18n";

import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Authentication/Session";
import PlantBox from "../PlantBox";

const App = () => {
  const changeLanguage = (lng: any) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Router>
      <Navigation />
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} />
      <Route path={ROUTES.PLANT} component={PlantBox} />
      <div className="language">
        <button onClick={() => changeLanguage("fr")}>Fr</button>-
        <button onClick={() => changeLanguage("en")}>En</button>
      </div>
    </Router>
  );
};

export default withAuthentication(App);
