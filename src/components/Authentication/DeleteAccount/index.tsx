import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { withFirebase } from "../../Firebase";

enum PasswordShownClass {
  Hidden = "fas fa-eye passwordShown",
  Shown = "fas fa-eye-slash passwordShown",
}

enum DropdownClass {
  Visible = "fas fa-angle-up dropdown-icon",
  Invisible = "fas fa-angle-down dropdown-icon",
}

interface DeleteState {
  password: {
    value: string;
    type: string;
    className: PasswordShownClass;
  };
}

interface DropdownState {
  shown: boolean;
  className: DropdownClass;
}

const initState = (): DeleteState => {
  return {
    password: {
      value: "",
      type: "password",
      className: PasswordShownClass.Hidden,
    },
  };
};

const DropdownStateInit = (): DropdownState => {
  return {
    shown: false,
    className: DropdownClass.Invisible,
  };
};

const DeleteAccountForm = (props: any) => {
  const { t } = useTranslation();

  const [state, setState] = useState<DeleteState>(initState());
  const [error, setError] = useState<string[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [dropdownShown, setDropdownShown] = useState<DropdownState>(
    DropdownStateInit()
  );

  const togglePassword = () => {
    const PasswordVisibilty = state.password;
    if (PasswordVisibilty.type === "password") {
      setState((prevState: DeleteState) => ({
        ...prevState,
        password: {
          ...prevState.password,
          type: "text",
          className: PasswordShownClass.Shown,
        },
      }));
    } else {
      setState((prevState: DeleteState) => ({
        ...prevState,
        password: {
          ...prevState.password,
          type: "password",
          className: PasswordShownClass.Hidden,
        },
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
    const { password } = state;
    event.preventDefault();
    setButtonClicked(true);
    setError([]);
    const isSubmitting = async () => {
      return await props.firebase
        .doDeleteUser(password.value)
        .then(() => {
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
    const { value } = event.target;
    setState((prevState: DeleteState) => ({
      ...prevState,
      password: {
        ...prevState.password,
        value,
      },
    }));
  };

  const { password } = state;
  const isInvalid = password.value === "" || buttonClicked;

  return (
    <div>
      <form onSubmit={onSubmit} className="form">
        <div onClick={(ev) => toggleDropdown()} className="dropdown-title">
          <h1 className="dropdown-title-text">{t("Delete Account")}</h1>
          <i className={dropdownShown.className}></i>
        </div>
        {dropdownShown.shown && (
          <div className="dropdown-item">
            <div className="relativePosition">
              <input
                className="form-input"
                name="passwordCurrent"
                value={password.value}
                onChange={onChange}
                type={password.type}
                placeholder={t("Password")}
              />
              {password.value.length > 0 && (
                <i className={password.className} onClick={togglePassword}></i>
              )}
            </div>
            <button className="form-button" disabled={isInvalid} type="submit">
              {t("Delete Account")}
            </button>
            <div className="warning">
              {t("Warning")}
              {t("! ")}
              {t("By deleting your account your credentials will be lost.")}
              <li key="0">{t("You wont be able to login anymore")}</li>
              <li key="1">
                {t("Everything you have done will be lost, forever.")}
              </li>
            </div>
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
    </div>
  );
};

export default withFirebase(DeleteAccountForm);
