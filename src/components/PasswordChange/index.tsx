import React, { ChangeEvent, useState } from "react";

import { withFirebase } from "../Firebase";

interface PasswordChangeState {
  passwordOne: string;
  passwordTwo: string;
  error: any;
}
const initState = (): PasswordChangeState => {
  return {
    passwordOne: "",
    passwordTwo: "",
    error: null,
  };
};

const PasswordChangeForm = (props: any) => {
  const [state, setState] = useState<PasswordChangeState>(initState());

  const onSubmit = (event: React.FormEvent) => {
    const { passwordOne } = state;
    props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        setState(initState());
      })
      .catch((error: any) => {
        setState((prevState: PasswordChangeState) => ({ ...prevState, error }));
      });
    event.preventDefault();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState: PasswordChangeState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { passwordOne, passwordTwo, error } = state;
  const isInvalid = passwordOne !== passwordTwo || passwordOne === "";

  return (
    <form onSubmit={onSubmit} className="form">
      <h1>Change Password</h1>
      <input
        className="form-input"
        name="passwordOne"
        value={passwordOne}
        onChange={onChange}
        type="password"
        placeholder="New Password"
      />
      <input
        className="form-input"
        name="passwordTwo"
        value={passwordTwo}
        onChange={onChange}
        type="password"
        placeholder="Confirm New Password"
      />
      <button className="form-button" disabled={isInvalid} type="submit">
        Reset My Password
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
};

export default withFirebase(PasswordChangeForm);
