import React, { useEffect, useState } from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";

interface AppState {
  authUser: any;
}
const initAppSate = (): AppState => {
  return {
    authUser: null,
  };
};

const withAuthentication = (Component: React.ComponentType) => {
  const WithAuthentication = (props: any) => {
    const [state, setState] = useState<AppState>(initAppSate());

    useEffect(() => {
      props.firebase.onAuthUserListener(
        (authUser: any) => {
          setState({ authUser });
        },
        () => {
          setState({ authUser: null });
        }
      );
    });

    return (
      <AuthUserContext.Provider value={state.authUser}>
        <Component {...props} />
      </AuthUserContext.Provider>
    );
  };

  return withFirebase(WithAuthentication);
};
export default withAuthentication;
