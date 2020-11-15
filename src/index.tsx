import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import "./i18n";
import * as serviceWorker from "./serviceWorker";
import App from "./components/App";
import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <Suspense fallback="loading">
      <App />
    </Suspense>
  </FirebaseContext.Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
