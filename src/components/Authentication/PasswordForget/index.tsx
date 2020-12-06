import React, { ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { withFirebase } from "../../Firebase";
import * as ROUTES from "../../../constants/routes";
import { ERRORS, MAILREGEX } from "../../../constants/errors";

const PasswordForgetPage = () => (
  <div>
    <PasswordForgetForm />
  </div>
);

interface PasswordForgetState {
  email: string;
}
const initState = (): PasswordForgetState => {
  return {
    email: "",
  };
};

const PasswordForgetFormBase = (props: any) => {
  const { t } = useTranslation();

  const [state, setState] = useState<PasswordForgetState>(initState());
  const [error, setError] = useState<string[]>([]);

  const onSubmit = (event: React.FormEvent) => {
    const { email } = state;
    const newErrors: string[] = [];

    if (!MAILREGEX.test(state.email)) {
      newErrors.push(ERRORS.INVALID_MAIL);
    }
    if (newErrors.length) {
      setError(newErrors);
      event.preventDefault();
      return;
    }
    props.firebase
      .doPasswordReset(email)
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
    setState((prevState: PasswordForgetState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const { email } = state;
  const isInvalid = email === "";

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <h1>{t("Reset Password")}</h1>
        <input
          className="form-input"
          name="email"
          value={state.email}
          onChange={onChange}
          type="text"
          placeholder={t("Email address")}
        />
        <button className="form-button" disabled={isInvalid} type="submit">
          {t("Reset Password")}
        </button>
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

const PasswordForgetLink = () => {
  const { t } = useTranslation();
  return (
    <p>
      <Link to={ROUTES.PASSWORD_FORGET}>{t("Forgot Password?")}</Link>
    </p>
  );
};
export default PasswordForgetPage;
const PasswordForgetForm = withFirebase(PasswordForgetFormBase);
export { PasswordForgetForm, PasswordForgetLink };
