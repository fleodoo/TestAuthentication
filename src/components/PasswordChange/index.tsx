import React, { ChangeEvent, useState } from "react";

import { withFirebase } from "../Firebase";
import { ERRORS } from "../../constants/errors";
import { useTranslation } from "react-i18next";

interface PasswordChangeState {
  passwordCurrent: string;
  passwordOne: string;
  passwordTwo: string;
}

enum PasswordShownClass {
  Hidden = "fas fa-eye passwordShown",
  Shown = "fas fa-eye-slash passwordShown",
}

enum DropdownClass {
  Visible = "fas fa-angle-up dropdown-icon",
  Invisible = "fas fa-angle-down dropdown-icon",
}

interface PWstate {
  passwordCurrent: {
    type: string;
    className: PasswordShownClass;
  };
  passwordOne: {
    type: string;
    className: PasswordShownClass;
  };
  passwordTwo: {
    type: string;
    className: PasswordShownClass;
  };
}

interface DropdownState {
  shown: boolean;
  className: DropdownClass;
}

const initState = (): PasswordChangeState => {
  return {
    passwordCurrent: "",
    passwordOne: "",
    passwordTwo: "",
  };
};

const PasswordStateInit = (): PWstate => {
  return {
    passwordCurrent: { type: "password", className: PasswordShownClass.Hidden },
    passwordOne: { type: "password", className: PasswordShownClass.Hidden },
    passwordTwo: { type: "password", className: PasswordShownClass.Hidden },
  };
};

const DropdownStateInit = (): DropdownState => {
  return {
    shown: false,
    className: DropdownClass.Invisible,
  };
};

const PasswordChangeForm = (props: any) => {
  const { t } = useTranslation();
  const [state, setState] = useState<PasswordChangeState>(initState());
  const [error, setError] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [passwordVisibility, setPasswordVisibility] = useState<PWstate>(
    PasswordStateInit()
  );
  const [dropdownShown, setDropdownShown] = useState<DropdownState>(
    DropdownStateInit()
  );

  const togglePassword = (
    password: "passwordOne" | "passwordTwo" | "passwordCurrent"
  ) => {
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

  const toggleDropdown = () => {
    if (dropdownShown.shown) {
      setDropdownShown({
        shown: false,
        className: DropdownClass.Invisible,
      });
    } else {
      setDropdownShown({
        shown: true,
        className: DropdownClass.Visible,
      });
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    const { passwordCurrent, passwordOne, passwordTwo } = state;
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
        .doPasswordUpdate(passwordCurrent, passwordOne)
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

  const { passwordCurrent, passwordOne, passwordTwo } = state;
  const isInvalid =
    passwordCurrent === "" ||
    passwordTwo === "" ||
    passwordOne === "" ||
    buttonClicked;

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <div onClick={(ev) => toggleDropdown()} className="dropdown-title">
          <h1 className="dropdown-title-text">{t("Change Password")}</h1>
          <i className={dropdownShown.className}></i>
        </div>
        {dropdownShown.shown && (
          <div className="dropdown-item">
            <div className="relativePosition">
              <input
                className="form-input"
                name="passwordCurrent"
                value={passwordCurrent}
                onChange={onChange}
                type={passwordVisibility.passwordCurrent.type}
                placeholder={t("Current Password")}
              />
              {passwordCurrent.length > 0 && (
                <i
                  className={passwordVisibility.passwordCurrent.className}
                  onClick={(ev) => togglePassword("passwordCurrent")}
                ></i>
              )}
            </div>
            <div className="relativePosition">
              <input
                className="form-input"
                name="passwordOne"
                value={passwordOne}
                onChange={onChange}
                type={passwordVisibility.passwordOne.type}
                placeholder={t("New Password")}
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
                placeholder={t("Confirm New Password")}
              />
              {passwordTwo.length > 0 && (
                <i
                  className={passwordVisibility.passwordTwo.className}
                  onClick={(ev) => togglePassword("passwordTwo")}
                ></i>
              )}
            </div>
            <button className="form-button" disabled={isInvalid} type="submit">
              {t("Change Password")}
            </button>
          </div>
        )}
      </form>
      <div></div>
      {error.length > 0 && (
        <div className="errorbox">
          {error.map((value: string, index: number) => {
            return <li key={index}>{value}</li>;
          })}
        </div>
      )}
      {passwordChanged && (
        <div className="notification">
          <li key="0">{t("Your password has successfully been changed.")}</li>
        </div>
      )}
    </div>
  );
};

export default withFirebase(PasswordChangeForm);
