import React from "react";
import { Link } from "react-router-dom";

import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";
import { useTranslation } from "react-i18next";

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

const NavigationAuth = (props: NavigationProps) => {
  const { t } = useTranslation();
  return (
    <div className="NavigationBar">
      <Link className="link" to={ROUTES.LANDING}>
        {t("Home")}
      </Link>
      {/* <Link className="link" to={ROUTES.HOME}>
        Home
      </Link> */}
      {!!props.authUser.roles[ROLES.ADMIN] && (
        <Link className="link" to={ROUTES.ADMIN}>
          {t("Admin")}
        </Link>
      )}
      <Link className="link right" to={ROUTES.ACCOUNT}>
        {props.authUser && props.authUser.username}
      </Link>
      <div>
        <SignOutButton />
      </div>
    </div>
  );
};
const NavigationNonAuth = () => {
  const { t } = useTranslation();
  return (
    <div className="NavigationBar">
      <Link className="link" to={ROUTES.LANDING}>
        {t("Home")}
      </Link>
      <Link className="link right" to={ROUTES.SIGN_UP}>
        {t("Sign Up")}
      </Link>
      <Link className="signin" to={ROUTES.SIGN_IN}>
        {t("Log In")}
      </Link>
    </div>
  );
};

export default Navigation;
