import React, { ChangeEvent, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { ERRORS, MAILREGEX } from "../../constants/errors";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface SignupFormState {
  username: string;
  email: string;
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

const PasswordStateInit = (): PWstate => {
  return {
    passwordOne: { type: "password", className: PasswordShownClass.Hidden },
    passwordTwo: { type: "password", className: PasswordShownClass.Hidden },
  };
};

const SignUpFormBase = (props: any) => {
  const [state, setState] = useState<SignupFormState>(SignupFormInit());
  const [error, setError] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PWstate>(
    PasswordStateInit()
  );
  const roles: { [key: string]: string } = {};
  roles[ROLES.USER] = ROLES.USER;

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
    event.preventDefault();
    setButtonClicked(true);
    setError([]);
    const newErrors: string[] = [];
    const isSubmitting = async () => {
      console.log("isSumbiting");
      if (state.passwordOne !== state.passwordTwo) {
        newErrors.push(ERRORS.DIFFENT_PASS);
      }
      if (!MAILREGEX.test(state.email)) {
        newErrors.push(ERRORS.INVALID_MAIL);
      }
      if (!newErrors.length) {
        const { username, email, passwordOne } = state;
        return await props.firebase
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
            console.log(error);
            newErrors.push(error.message);
          });
      } else {
        return Promise.resolve();
      }
    };
    await isSubmitting();
    setButtonClicked(false);
    setError(newErrors);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setState((prevState: SignupFormState) => ({ ...prevState, [name]: value }));
  };

  const { username, email, passwordOne, passwordTwo } = state;

  const isInvalid =
    passwordTwo === "" ||
    passwordOne === "" ||
    email === "" ||
    username === "" ||
    buttonClicked;

  return (
    <div>
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
          Sign Up
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

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };
