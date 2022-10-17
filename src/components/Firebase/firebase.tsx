import app from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import * as ROLES from "../../constants/roles";
import { Output,Auto } from "../PlantBox";
import {MetaData} from "../LedPanel";
interface ChangeOutput {
  currentOutput: Output,
  automatic: Auto
}

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
  storage: app.storage.Storage;
  constructor() {
    app.initializeApp(config);
    this.storage = app.storage();
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

  // *** Measures API ***
  measures = () => this.db.ref("measures");
  outputs = () => this.db.ref("outputs");
  changeOutput = (  change: ChangeOutput ) => {
    const time = (change.currentOutput.time.getTime() / 1000).toFixed(0);
    const formatedData = {
      vantilo1: change.currentOutput.fanWind,
      vantilo2: change.currentOutput.fanChange,
      lamp1: change.currentOutput.bigLamp,
      lamp2: change.currentOutput.smallLamp,
      pompe: change.currentOutput.pompe,
      vantilo1Auto: change.automatic.fanWindAuto,
      vantilo2Auto: change.automatic.fanChangeAuto,
      lamp1Auto: change.automatic.bigLampAuto,
      lamp2Auto: change.automatic.smallLampAuto,
      pompeAuto: change.automatic.pompeAuto,
    };
    this.db.ref("outputs/" + time).set(formatedData);
  };
  // changeOutputDebounced = AwesomeDebouncePromise(this.changeOutput, 2000);

  // *** storage API ***
  getLastPicture = () => {
    return this.storage.ref().child('images/lastPicture.jpg').getDownloadURL();
  }
  
  setLeds = (leds: string[][]) => {
    var newArray = leds.map(function(arr) {
      return arr.slice();
    });
    for (var s of newArray) {
      s.reverse()
    }
    newArray.reverse()
    for (var i = 0; i < leds.length; i++) {

      this.db.ref("ledpanel/leds/"+i).set(newArray[i]); 
    }
    
  }
  getLeds= () => this.db.ref("ledpanel/leds")

  setMetaData = (metadata: MetaData) => {
    this.db.ref("ledpanel/metadata").set(metadata);
  }

  getMetaData = () => this.db.ref("ledpanel/metadata")


}

export default Firebase;
