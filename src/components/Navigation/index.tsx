import React from "react";
import { Link } from "react-router-dom";

import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";

interface NavigationProps {
  authUser: any;
}
const renderNagationbar: any = (authUser: any) => {
  return authUser ? (
    <NavigationAuth authUser={authUser} />
  ) : (
    <NavigationNonAuth />
  );
};

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {(authUser) => renderNagationbar(authUser)}
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = (props: NavigationProps) => (
  <div className="NavigationBar">
    <Link className="link" to={ROUTES.LANDING}>
      Landing
    </Link>
    <Link className="link" to={ROUTES.HOME}>
      Home
    </Link>
    <Link className="link" to={ROUTES.ACCOUNT}>
      Account
    </Link>
    {!!props.authUser.roles[ROLES.ADMIN] && (
      <Link className="link" to={ROUTES.ADMIN}>
        Admin
      </Link>
    )}
    <div style={{ float: "right" }}>
      <SignOutButton />
    </div>
  </div>
);

const NavigationNonAuth = () => (
  <div className="NavigationBar">
    <Link className="link" to={ROUTES.LANDING}>
      Landing
    </Link>
    <Link className="signin" to={ROUTES.SIGN_IN}>
      Sign In
    </Link>
  </div>
);

export default Navigation;
