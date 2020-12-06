import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

import * as ROLES from "../../constants/roles";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

class Firebase {
  auth: app.auth.Auth;
  db: app.database.Database;
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    this.db = app.database();
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email: string, password: string) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email: string, password: string) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => {
    this.auth.signOut();
  };

  doDeleteUser = (currentPassword: string) => {
    const user = this.auth.currentUser;
    if (user && user.email) {
      const credential = app.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      return user
        .reauthenticateWithCredential(credential)
        .then(() => {
          this.user(user.uid).remove();
        })
        .then(() => {
          user.delete();
        });
    }
    return Promise.resolve();
  };
  doSendEmailVerification = () => {
    if (this.auth.currentUser) {
      return this.auth.currentUser.sendEmailVerification({
        url: "https://react-firebase-authentic-b7af0.web.app/signin",
      });
    }
    return Promise.resolve();
  };
  doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (currentPassword: string, newPassword: string) => {
    const user = this.auth.currentUser;
    if (user && user.email) {
      const credential = app.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      return user.reauthenticateWithCredential(credential).then(() => {
        user.updatePassword(newPassword);
      });
    }
    return Promise.resolve();
  };

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next: Function, fallback: Function) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then((snapshot) => {
            const dbUser = snapshot.val();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = { [ROLES.USER]: ROLES.USER };
            }

            // merge auth and db user
            authUser = {
              uid: authUser!.uid,
              email: authUser!.email,
              emailVerified: authUser!.emailVerified,
              providerData: authUser!.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });
  // *** User API ***

  user = (uid: string) => this.db.ref(`users/${uid}`);
  users = () => this.db.ref("users");
  measures = () => this.db.ref("measures");
}

export default Firebase;
