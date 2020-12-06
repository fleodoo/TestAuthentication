import React from "react";
import { useTranslation } from "react-i18next";

import { withFirebase } from "../../Firebase";

const SignOutButton = ({ firebase }: any) => {
  const { t } = useTranslation();
  return (
    <button
      className="signOutButton"
      type="button"
      onClick={firebase.doSignOut}
    >
      {t("Log Out")}
    </button>
  );
};

export default withFirebase(SignOutButton);
