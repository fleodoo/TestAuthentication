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
import PlantBoxCurrentState from "./PlantBoxCurrentState";
import PlantBoxGraphs from "./PlantBoxGraphs";

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
  current: Data | undefined;
}

export interface Data {
  time: Date;
  airHumidity: number;
  soilHumidity: number;
  temperature: number;
  waterVolume: boolean;
  bigLamp: boolean;
  smallLamp: boolean;
  pompe: boolean;
  fanWind: boolean;
  fanChange: boolean;
}

const PlantBox = (props: any) => {
  const initState = (): PlantBoxState => {
    return {
      menuOpen: false,
      loading: false,
      page: Page.Current,
      data: [],
      current: undefined,
    };
  };

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
      const [lastItem] = data.slice(-1);
      setState((prevState: PlantBoxState) => ({
        ...prevState,
        data,
        current: lastItem,
        loading: false,
      }));
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
  const { current, page, loading, data, menuOpen } = state;
  return (
    <div className="plantbox">
      {!loading && (
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
            {t("Graphs")}
          </div>
          <div
            id="data"
            className="menu-item"
            onClick={() => setPage(Page.Data)}
          >
            {t("Data")}
          </div>
          <div
            id="settings"
            className="menu-item"
            onClick={() => setPage(Page.Settings)}
          >
            {t("Settings")}
          </div>
        </Menu>
      )}
      {
        //@ts-ignore
        page === Page.Current && <PlantBoxCurrentState currentState={current} />
      }
      {page === Page.Graphs && <PlantBoxGraphs loading={loading} data={data} />}
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
