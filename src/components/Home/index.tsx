import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import React from "react";
import { withAuthorization } from "../Session";

const HomePage = () => (
  <div className="center">
    <h1>HomePage</h1>
    <p>The Home Page is accessible by every signed in user.</p>
  </div>
);

const condition = (authUser: FirebaseAuthTypes.User | null) => !!authUser;

export default withAuthorization(condition)(HomePage);
