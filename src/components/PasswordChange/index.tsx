import React, { ChangeEvent, useState } from "react";

import { withFirebase } from "../Firebase";
import { ERRORS } from "../../constants/errors";

interface PasswordChangeState {
  passwordOne: string;
  passwordTwo: string;
}

const initState = (): PasswordChangeState => {
  return {
    passwordOne: "",
    passwordTwo: "",
  };
};

const PasswordChangeForm = (props: any) => {
  const [state, setState] = useState<PasswordChangeState>(initState());
  const [error, setError] = useState<string[]>([]);

  const onSubmit = (event: React.FormEvent) => {
    const { passwordOne, passwordTwo } = state;
    const newErrors: string[] = [];
    if (passwordOne !== passwordTwo) {
      newErrors.push(ERRORS.DIFFENT_PASS);
    }
    if (newErrors.length) {
      setError(newErrors);
      event.preventDefault();
      return;
    }
    props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        setState(initState());
      })
      .catch((error: any) => {
        setError([error.message]);
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

  const { passwordOne, passwordTwo } = state;
  const isInvalid = passwordTwo === "" || passwordOne === "";

  return (
    <div>
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
      </form>
      {error.length > 0 && (
        <div className="form-errorbox">
          {error.map((value: string, index: number) => {
            return <li key={index}>{value}</li>;
          })}
        </div>
      )}
    </div>
  );
};

export default withFirebase(PasswordChangeForm);
