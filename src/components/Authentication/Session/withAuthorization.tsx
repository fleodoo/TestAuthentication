import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "./context";
import { withFirebase } from "../../Firebase";
import * as ROUTES from "../../../constants/routes";

const withAuthorization = (condition: Function) => (
  Component: React.ComponentType
) => {
  const WithAuthorization = (props: any) => {
    useEffect(() => {
      props.firebase.onAuthUserListener(
        (authUser: any) => {
          if (!condition(authUser)) {
            props.history.push(ROUTES.SIGN_IN);
          }
        },
        () => props.history.push(ROUTES.SIGN_IN)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (condition(authUser) ? <Component {...props} /> : null)}
      </AuthUserContext.Consumer>
    );
  };

  return compose(withRouter, withFirebase)(WithAuthorization);
};
export default withAuthorization;
