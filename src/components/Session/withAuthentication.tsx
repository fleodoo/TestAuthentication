import React, { useEffect, useState } from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";

interface AppState {
  authUser: any;
}
const initAppSate = (): AppState => {
  const localUser = localStorage.getItem("authUser");
  const authUser = localUser ? JSON.parse(localUser) : null;
  return {
    authUser,
  };
};

const withAuthentication = (Component: React.ComponentType) => {
  const WithAuthentication = (props: any) => {
    const [state, setState] = useState<AppState>(initAppSate());

    useEffect(() => {
      props.firebase.onAuthUserListener(
        (authUser: any) => {
          localStorage.setItem("authUser", JSON.stringify(authUser));
          setState({ authUser });
        },
        () => {
          localStorage.removeItem("authUser");
          setState({ authUser: null });
        }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <AuthUserContext.Provider value={state.authUser}>
        <Component {...props} />
      </AuthUserContext.Provider>
    );
  };

  return withFirebase(WithAuthentication);
};
export default withAuthentication;
