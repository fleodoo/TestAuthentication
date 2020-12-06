import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { useTranslation } from "react-i18next";

import { SignUpLink } from "../SignUp";
import { withFirebase } from "../../Firebase";
import * as ROUTES from "../../../constants/routes";
import { PasswordForgetLink } from "../PasswordForget";

interface SignInFormState {
  [key: string]: string | null;
  email: string;
  password: string;
}

enum PasswordShownClass {
  Hidden = "fas fa-eye passwordShown",
  Shown = "fas fa-eye-slash passwordShown",
}

interface PWstate {
  type: string;
  className: PasswordShownClass;
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

const PasswordStateInit = (): PWstate => {
  return {
    type: "password",
    className: PasswordShownClass.Hidden,
  };
};

const SignInFormBase = (props: any) => {
  const { t } = useTranslation();
  const [state, setState] = useState<SignInFormState>(SignInFormInit());
  const [error, setError] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PWstate>(
    PasswordStateInit()
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const togglePassword = () => {
    const currentPasswordVisibilty = passwordVisibility;
    if (currentPasswordVisibilty.type === "password") {
      setPasswordVisibility({
        type: "text",
        className: PasswordShownClass.Shown,
      });
    } else {
      setPasswordVisibility({
        type: "password",
        className: PasswordShownClass.Hidden,
      });
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setButtonClicked(true);
    setError([]);
    const { email, password } = state;
    const isSubmitting = async () => {
      return await props.firebase
        .doSignInWithEmailAndPassword(email, password)
        .then(() => {
          setState(SignInFormInit());
          setButtonClicked(false);
          props.history.push(ROUTES.LANDING);
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
    setState((prevState: SignInFormState) => ({ ...prevState, [name]: value }));
  };

  const { email, password } = state;

  const isInvalid = password === "" || email === "" || buttonClicked;

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <h1>{t("Log In")}</h1>
        <input
          className="form-input"
          name="email"
          value={email}
          onChange={onChange}
          type="text"
          placeholder={t("Email address")}
        />
        <div className="relativePosition">
          <input
            className="form-input"
            name="password"
            value={password}
            onChange={onChange}
            type={passwordVisibility.type}
            placeholder={t("Password")}
          />
          {password.length > 0 && (
            <i
              className={passwordVisibility.className}
              onClick={(ev) => togglePassword()}
            ></i>
          )}
        </div>
        <button className="form-button" disabled={isInvalid} type="submit">
          {t("Log In")}
        </button>
        <PasswordForgetLink />
        <SignUpLink />
      </form>
      {error.length > 0 && (
        <div className="errorbox">
          {error.map((value: string, index: number) => {
            return <li key={index}>{value}</li>;
          })}
        </div>
      )}
    </div>
  );
};

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);

export default SignInPage;

export { SignInForm };
