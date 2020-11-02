import React from "react";
import gif from "./giphy.gif";

const LandingPage = () => (
  <div className="center">
    <h1>Landing</h1>
    <div>Welcome on this website :)</div>
    <img src={gif} alt="hello" />
  </div>
);

export default LandingPage;
