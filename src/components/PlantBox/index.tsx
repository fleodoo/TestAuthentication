import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import { useTranslation } from "react-i18next";
import { slide as Menu } from "react-burger-menu";
import {
  withAuthorization,
  withEmailVerification,
} from "../Authentication/Session";
import * as ROLES from "../../constants/roles";
import { withFirebase } from "../Firebase";
import MeasureTable from "./PlantBoxTable";
import MeasureGraphHumidity from "./PlantBoxGraphHumidity";
import MeasureGraphTemperature from "./PlantBoxGraphTemperature";
import MeasureGraphOutputs from "./PlantBoxGraphOutputs";

enum Page {
  Graphs,
  Data,
  Current,
  Settings,
}
interface PlantBoxState {
  loading: boolean;
  menuOpen: boolean;
  page: Page;
  data: Data[];
}

export interface Data {
  time: Date;
  airHumidity: number;
  soilHumidity: number;
  temperature: number;
  waterVolume: Boolean;
  bigLamp: Boolean;
  smallLamp: Boolean;
  pompe: Boolean;
  fanWind: Boolean;
  fanChange: Boolean;
}

const initState = (): PlantBoxState => {
  return {
    menuOpen: false,
    loading: false,
    page: Page.Current,
    data: [],
  };
};

const PlantBox = (props: any) => {
  const { t } = useTranslation();
  const [state, setState] = useState<PlantBoxState>(initState());

  useEffect(() => {
    setState((prevState: PlantBoxState) => ({ ...prevState, loading: true }));
    props.firebase.measures().on("value", (snapshot: any) => {
      const measuresObject = snapshot.val();
      const data: Data[] = Object.keys(measuresObject).map((key) => {
        const time = new Date(parseInt(key) * 1000);
        const temperature = parseFloat(measuresObject[key].temp);
        const airHumidity = parseFloat(measuresObject[key].humAir);
        const soilHumidity = parseFloat(measuresObject[key].humGround);
        const waterVolume = Boolean(measuresObject[key].waterVolume);
        const bigLamp = Boolean(measuresObject[key].lamp1);
        const smallLamp = Boolean(measuresObject[key].lamp2);
        const pompe = Boolean(measuresObject[key].pompe);
        const fanWind = Boolean(measuresObject[key].vantilo1);
        const fanChange = Boolean(measuresObject[key].vantilo2);
        return {
          time,
          temperature,
          airHumidity,
          soilHumidity,
          waterVolume,
          bigLamp,
          smallLamp,
          pompe,
          fanWind,
          fanChange,
        };
      });
      setState({
        data,
        menuOpen: false,
        page: Page.Current,
        loading: false,
      });
    });
    return () => {
      props.firebase.measures().off();
    };
  }, [props.firebase]);

  const setPage = (page: Page) => {
    setState((prevState: PlantBoxState) => ({
      ...prevState,
      page,
      menuOpen: false,
    }));
  };

  const handleOnOpen = () => {
    setState((prevState: PlantBoxState) => ({
      ...prevState,
      menuOpen: true,
    }));
  };
  const handleOnClose = () => {
    setState((prevState: PlantBoxState) => ({
      ...prevState,
      menuOpen: false,
    }));
  };
  const { page, loading, data, menuOpen } = state;
  return (
    <div className="plantbox">
      <Menu onOpen={handleOnOpen} isOpen={menuOpen} onClose={handleOnClose}>
        <div
          id="current"
          className="menu-item"
          onClick={() => setPage(Page.Current)}
        >
          {t("Current State")}
        </div>
        <div
          id="graphs"
          className="menu-item"
          onClick={() => setPage(Page.Graphs)}
        >
          Graphs
        </div>
        <div id="data" className="menu-item" onClick={() => setPage(Page.Data)}>
          Data
        </div>
        <div
          id="settings"
          className="menu-item"
          onClick={() => setPage(Page.Settings)}
        >
          Settings
        </div>
      </Menu>
      {page === Page.Current && <div className="center">test</div>}
      {page === Page.Graphs && (
        <>
          <div className="title">Graphs</div>
          <MeasureGraphTemperature loading={loading} data={data} />
          <MeasureGraphHumidity loading={loading} data={data} />
          <MeasureGraphOutputs loading={loading} data={data} />
        </>
      )}
      {page === Page.Data && <MeasureTable loading={loading} data={data} />}
    </div>
  );
};

const condition = (authUser: any) => authUser && !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(PlantBox);
