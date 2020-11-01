import React, { ChangeEvent, useState } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import { PasswordForgetLink } from "../PasswordForget";

interface SignInFormState {
  [key: string]: string | null;
  email: string;
  password: string;
}

const SignInPage = () => (
  <div>
    <SignInForm />
  </div>
);

const SignInFormInit = (): SignInFormState => {
  return {
    email: "",
    password: "",
  };
};

const SignInFormBase = (props: any) => {
  const [state, setState] = useState<SignInFormState>(SignInFormInit());
  const [error, setError] = useState<any>(null);

  const onSubmit = (event: React.FormEvent) => {
    const { email, password } = state;
    props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        setState(SignInFormInit());
        props.history.push(ROUTES.HOME);
      })
      .catch((error: any) => {
        setError(error);
      });
    event.preventDefault();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState: SignInFormState) => ({ ...prevState, [name]: value }));
  };

  const { email, password } = state;

  const isInvalid = password === "" || email === "";
  return (
    <form onSubmit={onSubmit} className="form">
      <h1>SignIn</h1>
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
        name="password"
        value={password}
        onChange={onChange}
        type="password"
        placeholder="Password"
      />
      <button className="form-button" disabled={isInvalid} type="submit">
        Sign In
      </button>
      <PasswordForgetLink />
      <SignUpLink />
      {error && <p>{error.message}</p>}
    </form>
  );
};

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);

export default SignInPage;

export { SignInForm };
