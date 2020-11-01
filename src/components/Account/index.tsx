import React from "react";

import PasswordChangeForm from "../PasswordChange";
import { AuthUserContext, withAuthorization } from "../Session";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (
      <div className="center">
        <h1>Account Information:</h1>
        {authUser && <h1>Username: {authUser.username}</h1>}
        {authUser && <h1>Account: {authUser.email}</h1>}
        <PasswordChangeForm />
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = (authUser: any) => !!authUser;

export default withAuthorization(condition)(AccountPage);
