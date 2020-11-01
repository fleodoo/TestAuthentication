import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import React from "react";

import PasswordChangeForm from "../PasswordChange";
import { AuthUserContext, withAuthorization } from "../Session";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (
      <div>
        {authUser && <h1>Account: {authUser.email}</h1>}
        <PasswordChangeForm />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser: FirebaseAuthTypes.User | null) => !!authUser;

export default withAuthorization(condition)(AccountPage);
