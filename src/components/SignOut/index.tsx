import React from "react";

import { withFirebase } from "../Firebase";

const SignOutButton = ({ firebase }: any) => (
  <button className="signOutButton" type="button" onClick={firebase.doSignOut}>
    Sign Out
  </button>
);

export default withFirebase(SignOutButton);
