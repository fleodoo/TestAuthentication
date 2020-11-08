import React, { ChangeEvent, useState } from "react";

import { withFirebase } from "../Firebase";
import { ERRORS } from "../../constants/errors";

interface PasswordChangeState {
  passwordOne: string;
  passwordTwo: string;
}

enum PasswordShownClass {
  Hidden = "fas fa-eye passwordShown",
  Shown = "fas fa-eye-slash passwordShown",
}

interface PWstate {
  passwordOne: {
    type: string;
    className: PasswordShownClass;
  };
  passwordTwo: {
    type: string;
    className: PasswordShownClass;
  };
}

const initState = (): PasswordChangeState => {
  return {
    passwordOne: "",
    passwordTwo: "",
  };
};

const PasswordStateInit = (): PWstate => {
  return {
    passwordOne: { type: "password", className: PasswordShownClass.Hidden },
    passwordTwo: { type: "password", className: PasswordShownClass.Hidden },
  };
};

const PasswordChangeForm = (props: any) => {
  const [state, setState] = useState<PasswordChangeState>(initState());
  const [error, setError] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PWstate>(
    PasswordStateInit()
  );
  const togglePassword = (password: "passwordOne" | "passwordTwo") => {
    const currentPasswordVisibilty = passwordVisibility[password];
    if (currentPasswordVisibilty.type === "password") {
      const value = { type: "text", className: PasswordShownClass.Shown };
      setPasswordVisibility((prevState: PWstate) => ({
        ...prevState,
        [password]: value,
      }));
    } else {
      const value = { type: "password", className: PasswordShownClass.Hidden };
      setPasswordVisibility((prevState: PWstate) => ({
        ...prevState,
        [password]: value,
      }));
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    const { passwordOne, passwordTwo } = state;
    event.preventDefault();
    setButtonClicked(true);
    setPasswordChanged(false);
    setError([]);
    const isSubmitting = async () => {
      if (passwordOne !== passwordTwo) {
        setButtonClicked(false);
        setError([ERRORS.DIFFENT_PASS]);
        return Promise.resolve();
      }
      return await props.firebase
        .doPasswordUpdate(passwordOne)
        .then(() => {
          setPasswordChanged(true);
          setState(initState());
          setButtonClicked(false);
        })
        .catch((error: any) => {
          setButtonClicked(false);
          setError([error.message]);
        });
    };
    await isSubmitting();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState: PasswordChangeState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { passwordOne, passwordTwo } = state;
  const isInvalid = passwordTwo === "" || passwordOne === "" || buttonClicked;

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <h1>Change Password</h1>
        <div className="relativePosition">
          <input
            className="form-input"
            name="passwordOne"
            value={passwordOne}
            onChange={onChange}
            type={passwordVisibility.passwordOne.type}
            placeholder="Password"
          />
          {passwordOne.length > 0 && (
            <i
              className={passwordVisibility.passwordOne.className}
              onClick={(ev) => togglePassword("passwordOne")}
            ></i>
          )}
        </div>
        <div className="relativePosition">
          <input
            className="form-input"
            name="passwordTwo"
            value={passwordTwo}
            onChange={onChange}
            type={passwordVisibility.passwordTwo.type}
            placeholder="Confirm Password"
          />
          {passwordTwo.length > 0 && (
            <i
              className={passwordVisibility.passwordTwo.className}
              onClick={(ev) => togglePassword("passwordTwo")}
            ></i>
          )}
        </div>
        <button className="form-button" disabled={isInvalid} type="submit">
          Reset My Password
        </button>
      </form>
      {error.length > 0 && (
        <div className="errorbox">
          {error.map((value: string, index: number) => {
            return <li key={index}>{value}</li>;
          })}
        </div>
      )}
      {passwordChanged && (
        <div className="notification">
          <li key="0">Your password has successfully been changed.</li>
        </div>
      )}
    </div>
  );
};

export default withFirebase(PasswordChangeForm);
