import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Data } from "..";
import { Switch } from "@material-ui/core";
import { compose } from "recompose";
import { withFirebase } from "../../Firebase";

interface CurrentState {
  data: Data | undefined;
}

const PlantBoxCurrentState = (props: any) => {
  const { t } = useTranslation();
  const [currentState, setCurrentState] = useState<CurrentState>({
    data: undefined,
  });

  useEffect(() => {
    if (props.currentState) {
      setCurrentState({ data: { ...props.currentState } });
    }
  }, [props.currentState]);

  const updateState = (key: "passbigLamp" | "fanWind", value: boolean) => {
    if (!currentState.data) {
      return;
    }
    const newData: Data = {
      ...currentState.data,
      [key]: value,
      time: new Date(Date.now()),
    };
    setCurrentState((prevState: CurrentState) => ({
      ...prevState,
      data: newData,
    }));
    props.firebase.addMeasureDebounced(newData);
  };

  return (
    <div className="center margin-figure height100">
      <div className="title">{t("Current State")}</div>
      {props.currentState ? (
        <>
          <div className="pb-measures">
            <Measure
              name={t("Temperature")}
              value={props.currentState.temperature.toString() + "°C"}
            />
            <Measure
              name={t("Air Humidity")}
              value={(props.currentState.airHumidity * 100).toString() + "%"}
            />
            <Measure
              name={t("Soil Humidity")}
              value={(props.currentState.soilHumidity * 100).toString() + "%"}
            />
            <Measure
              name={t("Water Volume")}
              value={props.currentState.waterVolume ? t("Ok") : t("Not Ok")}
            />
          </div>
          <div className="pb-motors">
            <Motor
              id="bigLamp"
              name={t("Big Lamp")}
              value={props.currentState.bigLamp}
              newValue={updateState}
            />
            <Motor
              id="fanWind"
              name={t("Fan Wind")}
              value={props.currentState.fanWind}
              newValue={updateState}
            />
            <Motor
              id="smallLamp"
              name={t("Small Lamp")}
              value={props.currentState.smallLamp}
              newValue={updateState}
            />
            <Motor
              id="fanChange"
              name={t("Fan Change")}
              value={props.currentState.fanChange}
              newValue={updateState}
            />
            <Motor
              id="pompe"
              name={t("Pump")}
              value={props.currentState.pompe}
              newValue={updateState}
            />
          </div>
        </>
      ) : (
        t("Loading") + "..."
      )}
    </div>
  );
};

interface MeasureProps {
  name: string;
  value: string;
}
const Measure = (props: MeasureProps) => {
  return (
    <div className="pb-measure">
      <span>{props.name}</span>: <span>{props.value}</span>
    </div>
  );
};

interface MotorProps {
  name: string;
  value: boolean;
  newValue: Function;
  id: string;
}

interface MotorState {
  value: boolean;
}
const Motor = (props: MotorProps) => {
  const [state, setState] = useState<MotorState>({
    value: props.value,
  });
  const { t } = useTranslation();
  const changeValue = () => {
    const value = !state.value;
    setState({
      value,
    });
    props.newValue(props.id, value);
  };
  return (
    <div className="pb-motor">
      <div className="pb-motor-name">{props.name}</div>
      <div>{t("On/Off")}: </div>
      <Switch
        checked={state.value}
        onChange={changeValue}
        color="primary"
        name="checkedB"
        inputProps={{ "aria-label": "primary checkbox" }}
      />
    </div>
  );
};

export default compose(withFirebase)(PlantBoxCurrentState);
