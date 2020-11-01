import React, { ChangeEvent, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface SignupFormState {
  username: string;
  email: string;
  passwordOne: string;
  passwordTwo: string;
}

const SignUpPage = () => (
  <div>
    <SignUpForm />
  </div>
);

const SignupFormInit = (): SignupFormState => {
  return {
    username: "",
    email: "",
    passwordOne: "",
    passwordTwo: "",
  };
};

const SignUpFormBase = (props: any) => {
  const [state, setState] = useState<SignupFormState>(SignupFormInit());
  const [error, setError] = useState<any>(null);
  const roles: { [key: string]: string } = {};
  roles[ROLES.USER] = ROLES.USER;

  const onSubmit = (event: React.FormEvent) => {
    const { username, email, passwordOne } = state;
    props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((authUser: FirebaseAuthTypes.UserCredential) => {
        // Create a user in your Firebase realtime database
        return props.firebase.user(authUser.user.uid).set({
          username,
          email,
          roles,
        });
      })
      .then(() => {
        setState(SignupFormInit());
        props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        setError(error);
      });
    event.preventDefault();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState: SignupFormState) => ({ ...prevState, [name]: value }));
  };

  const { username, email, passwordOne, passwordTwo } = state;

  const isInvalid =
    passwordOne !== passwordTwo ||
    passwordOne === "" ||
    email === "" ||
    username === "";

  return (
    <form onSubmit={onSubmit} className="form">
      <h1>SignUp</h1>
      <input
        className="form-input"
        name="username"
        value={username}
        onChange={onChange}
        type="text"
        placeholder="Full Name"
      />
      <input
        className="form-input"
        name="email"
        value={email}
        onChange={onChange}
        type="text"
        placeholder="Email Address"
      />
      <input
        className="form-input"
        name="passwordOne"
        value={passwordOne}
        onChange={onChange}
        type="password"
        placeholder="Password"
      />
      <input
        className="form-input"
        name="passwordTwo"
        value={passwordTwo}
        onChange={onChange}
        type="password"
        placeholder="Confirm Password"
      />
      <button className="form-button" disabled={isInvalid} type="submit">
        Sign Up
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };
