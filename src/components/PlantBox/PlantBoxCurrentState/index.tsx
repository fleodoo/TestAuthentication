import { Switch } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { Auto, Measure as MeasureT, Output } from "..";
import { AuthUserContext } from "../../Authentication/Session";
import { withFirebase } from "../../Firebase";

interface CurrentState {
  currentOutput: Output | undefined;
  currentMeasure: MeasureT | undefined;
  automatic: Auto| undefined;
}

const PlantBoxCurrentState = (props: any) => {
  const { t } = useTranslation();
  const [currentState, setCurrentState] = useState<CurrentState>({
    currentOutput: undefined,
    currentMeasure: undefined,
    automatic: undefined,
  });
  const [roles, setRoles]= useState<string[]>([])
  const [image,setImage] = useState('')
  const authUser = useContext(AuthUserContext)
  useEffect(() => {
    if (authUser) {
      const roles: string[] = Object.values(authUser.roles)
      setRoles(roles)
    }
    if (props.currentMeasure && props.currentOutput && props.automatic) {
      setCurrentState({automatic: props.automatic, currentMeasure: props.currentMeasure, currentOutput: props.currentOutput })
    }
    async function fetchMyImage() {
      const lastPicture = await props.firebase.getLastPicture()
      setImage(lastPicture);
    }
    fetchMyImage()
  }, [props.automatic, props.currentMeasure, props.currentOutput, props.firebase, authUser]);

  const isAdmin = () => roles.includes("ADMIN");

  const updateValue = (key: "bigLamp" | "fanWind" | "smallLamp" | "fanChange" | "pump", value: boolean) => {
    if (!currentState.currentOutput) {
      return;
    }
    const newCurrentOutput: Output = {
      ...currentState.currentOutput,
      [key]: value,
      time: new Date(Date.now()),
    };
    props.firebase.changeOutputDebounced(
      {
        currentOutput: newCurrentOutput,
        automatic: currentState.automatic
      }
    );
  };

  const updateAutomatic = (key: "bigLamp" | "fanWind" | "smallLamp" | "fanChange" | "pump", value: boolean) => {
    if (!currentState.automatic || !currentState.currentOutput) {
      return;
    }
    const newAutomatic: Auto= {
      ...currentState.automatic,
      [key+"Auto"]: value,
    };
    const newCurrentOutput: Output = {
      ...currentState.currentOutput,
      time: new Date(Date.now()),
    };
    props.firebase.changeOutputDebounced(
      {
        currentOutput: newCurrentOutput,
        automatic: newAutomatic
      }
    );
  };

  return (
    <div className="center margin-figure height100">
      <div className="title">{t("Current State")}</div>
      {props.currentOutput && props.currentMeasure ? (
        <>
          <div className="pb-measures">
            <Measure
              name={t("Temperature")}
              value={props.currentMeasure.temperature.toString() + "°C"}
            />
            <Measure
              name={t("Air Humidity")}
              value={(props.currentMeasure.airHumidity).toString() + "%"}
            />
            <Measure
              name={t("Soil Humidity")}
              value={(props.currentMeasure.soilHumidity).toString() + "%"}
            />
          </div>

          <img className="pb-last-image" src={ image } alt="Last" />
            
          <div className="pb-motors">
            <Motor
              id="bigLamp"
              isAdmin={isAdmin()}
              name={t("Big Lamp")}
              value={props.currentOutput.bigLamp}
              newValue={updateValue}
              automatic={props.automatic.bigLampAuto}
              changeAutomatic={updateAutomatic}
            />
            <Motor
              id="fanWind"
              isAdmin={isAdmin()}
              name={t("Fan Wind")}
              value={props.currentOutput.fanWind}
              newValue={updateValue}
              automatic={props.automatic.fanWindAuto}
              changeAutomatic={updateAutomatic}
            />
            <Motor
              id="smallLamp"
              isAdmin={isAdmin()}
              name={t("Small Lamp")}
              value={props.currentOutput.smallLamp}
              newValue={updateValue}
              automatic={props.automatic.smallLampAuto}
              changeAutomatic={updateAutomatic}
            />
            <Motor
              id="fanChange"
              isAdmin={isAdmin()}
              name={t("Fan Change")}
              value={props.currentOutput.fanChange}
              newValue={updateValue}
              automatic={props.automatic.fanChangeAuto}
              changeAutomatic={updateAutomatic}
            />
            <Motor
              id="pompe"
              isAdmin={isAdmin()}
              name={t("Pump")}
              value={props.currentOutput.pompe}
              newValue={updateValue}
              automatic={props.automatic.pompeAuto}
              changeAutomatic={updateAutomatic}
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
  isAdmin: boolean;
  value: boolean;
  newValue: Function;
  automatic: boolean;
  changeAutomatic: Function;
  id: string;
}

interface MotorState {
  value: boolean;
  automatic: boolean;
}
const Motor = (props: MotorProps) => {
  const [state, setState] = useState<MotorState>({
    value: props.value,
    automatic: props.automatic
  });
  const { t } = useTranslation();

  const changeValue = () => {
    const value = !state.value;
    setState((prevState: MotorState) => ({
      ...prevState,
      value,
    }));
    props.newValue(props.id, value);
  };

  const changeAutomatic = () => {
    const automatic = !state.automatic;
    setState((prevState: MotorState) => ({
      ...prevState,
      automatic,
    }));
    props.changeAutomatic(props.id, automatic);
  };

  return (
    <div className="pb-motor">
      <div className="pb-motor-name">{props.name}</div>
      <div className="pb-motor-container">
        <div className="pb-motor-container-item" >
          <div>{t("On/Off")}: </div>
          <Switch
            checked={state.value}
            onChange={changeValue}
            color="primary"
            name="checkedB"
            disabled={!props.isAdmin || state.automatic}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </div>
        <div className="pb-motor-container-item" >
          <div>{t("Auto")}: </div>
          <Switch
            checked={state.automatic}
            onChange={changeAutomatic}
            color="primary"
            name="checkedB"
            // disabled={!props.isAdmin}
            inputProps={{ "aria-label": "primary checkbox" }}
          />
        </div>
      </div>
    </div>
  );
};

export default compose(withFirebase)(PlantBoxCurrentState);
