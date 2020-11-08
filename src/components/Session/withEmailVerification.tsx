import React, { useState } from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";

const needsEmailVerification = (authUser: any) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData
    .map((provider: any) => provider.providerId)
    .includes("password");

const withEmailVerification = (Component: React.ComponentType) => {
  const WithEmailVerification = (props: any) => {
    const [isSent, setIsSent] = useState<boolean>(false);
    const onSendEmailVerification = () => {
      props.firebase.doSendEmailVerification().then(() => setIsSent(true));
    };
    return (
      <AuthUserContext.Consumer>
        {(authUser) =>
          needsEmailVerification(authUser) ? (
            <div className="message">
              {isSent ? (
                <p>
                  New Mail confirmation sent: Check you Mails (Spam folder
                  included) for a confirmation E-Mail.
                </p>
              ) : (
                <p>
                  Check you Mails for a confirmation E-Mail or send a new
                  confirmation E-Mail.
                </p>
              )}

              <button
                className="basic-button"
                type="button"
                onClick={onSendEmailVerification}
                disabled={isSent}
              >
                Send a new confirmation Mail
              </button>
            </div>
          ) : (
            <Component {...props} />
          )
        }
      </AuthUserContext.Consumer>
    );
  };

  return withFirebase(WithEmailVerification);
};
export default withEmailVerification;
