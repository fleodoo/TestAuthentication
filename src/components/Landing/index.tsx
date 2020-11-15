import React from "react";
import gif from "./giphy.gif";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="center">
      <h1>{t("Home")}</h1>
      <div>{t("Welcome on this website")}</div>
      <div>{t("Currently under construction")}</div>
      <div>{t("More Comming Soon")}</div>
      <img src={gif} alt="hello" />
    </div>
  );
};

export default LandingPage;
