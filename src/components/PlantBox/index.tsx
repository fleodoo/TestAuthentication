import React, { useEffect, useState } from "react";
import { compose } from "recompose";
import { useTranslation } from "react-i18next";
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

interface PlantBoxState {
  loading: boolean;
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
    loading: false,
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
      console.log(data);
      setState({
        data,
        loading: false,
      });
    });
    return () => {
      props.firebase.measures().off();
    };
  }, [props.firebase]);

  const { loading, data } = state;
  return (
    <div>
      <h1 className="center">{t("PlantBox")}</h1>
      {loading && <div>{t("Loading")}...</div>}
      <MeasureTable loading={loading} data={data} />
      <MeasureGraphTemperature loading={loading} data={data} />
      <MeasureGraphHumidity loading={loading} data={data} />
      <MeasureGraphOutputs loading={loading} data={data} />
    </div>
  );
};

const condition = (authUser: any) => authUser && !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(PlantBox);
