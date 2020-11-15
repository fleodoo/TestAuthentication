import React from "react";
import PasswordChangeForm from "../PasswordChange";
import DeleteAccountForm from "../DeleteAccount";
import { useTranslation } from "react-i18next";

import {
  AuthUserContext,
  withAuthorization,
  withEmailVerification,
} from "../Session";
import { compose } from "recompose";

const AccountPage = () => {
  const { t } = useTranslation();
  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <div className="center">
          <h1>{t("Account Information")}:</h1>
          {authUser && (
            <h1>
              {t("Username")}: {authUser.username}
            </h1>
          )}
          {authUser && (
            <h1>
              {t("Email address")}: {authUser.email}
            </h1>
          )}
          <PasswordChangeForm />
          <DeleteAccountForm />
        </div>
      )}
    </AuthUserContext.Consumer>
  );
};

const condition = (authUser: any) => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(AccountPage);
