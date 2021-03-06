import { Switch } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { Output } from "..";
import { AuthUserContext } from "../../Authentication/Session";
import { withFirebase } from "../../Firebase";

interface CurrentState {
  currentOutput: any;
  currentMeasure: any;
}

const PlantBoxCurrentState = (props: any) => {
  const { t } = useTranslation();
  const [currentState, setCurrentState] = useState<CurrentState>({
    currentOutput: undefined,
    currentMeasure: undefined,
  });
  const [roles, setRoles]= useState<string[]>([])
  const [image,setImage] = useState('')
  const authUser = useContext(AuthUserContext)
  useEffect(() => {
    console.log(authUser)
    if (authUser) {
      const roles: string[] = Object.values(authUser.roles)
      setRoles(roles)
    }
    if (props.currentMeasure && props.currentOutput) {
      setCurrentState({currentMeasure: props.currentMeasure, currentOutput: props.currentOutput })
    }
    async function fetchMyImage() {
      const lastPicture = await props.firebase.getLastPicture()
      setImage(lastPicture);
    }
    fetchMyImage()
  }, [props.currentMeasure, props.currentOutput, props.firebase, authUser]);

  const isAdmin = () => roles.includes("ADMIN");

  const updateState = (key: "bigLamp" | "fanWind" | "smallLamp" | "fanChange" | "pump", value: boolean) => {
    if (!currentState.currentOutput) {
      return;
    }
    const newData: Output = {
      ...currentState.currentOutput,
      [key]: value,
      time: new Date(Date.now()),
    };
    setCurrentState((prevState: CurrentState) => ({
      ...prevState,
      currentOutput: newData,
    }));
    props.firebase.changeOutputDebounced(newData);
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
              newValue={updateState}
            />
            <Motor
              id="fanWind"
              isAdmin={isAdmin()}
              name={t("Fan Wind")}
              value={props.currentOutput.fanWind}
              newValue={updateState}
            />
            <Motor
              id="smallLamp"
              isAdmin={isAdmin()}
              name={t("Small Lamp")}
              value={props.currentOutput.smallLamp}
              newValue={updateState}
            />
            <Motor
              id="fanChange"
              isAdmin={isAdmin()}
              name={t("Fan Change")}
              value={props.currentOutput.fanChange}
              newValue={updateState}
            />
            <Motor
              id="pompe"
              isAdmin={isAdmin()}
              name={t("Pump")}
              value={props.currentOutput.pompe}
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
  isAdmin: boolean;
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
        disabled={!props.isAdmin}
        inputProps={{ "aria-label": "primary checkbox" }}
      />
    </div>
  );
};

export default compose(withFirebase)(PlantBoxCurrentState);
