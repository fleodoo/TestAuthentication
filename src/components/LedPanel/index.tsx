import React, { useContext, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { AuthUserContext, withAuthorization, withEmailVerification } from "../Authentication/Session";
import { withFirebase } from "../Firebase";
import LedGrid from "./LedGrid";
import LedController from "./LedController";

const GRID_ROW_LENGTH= 12
const GRID_COL_LENGTH = 12

export interface MetaData{
  horizontalSpeed: number
  verticalSpeed: number
  brightness: number
}


const LedPanel = (props: any) => {
  const [color, setColor] = useState("#11f011");
  const [colorArray, setColorArray] = useState(Array.from(new Array(GRID_COL_LENGTH), () => new Array(GRID_ROW_LENGTH).fill("#FF0000")));
  const [roles, setRoles]= useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const authUser = useContext(AuthUserContext);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [copyColor, setCopyColor] = useState<boolean>(false);
  const [horizontalSlideValue, setHorizontalSlideValue] = useState<number>(0);
  const [verticalSlideValue, setVerticalSlideValue] = useState<number>(0);
  const [brightnessValue, setBrightnessValue] = useState<number>(0);

  useEffect(() => {
    props.firebase.getLeds().on("value", (snapshot: any) => {
      setLoading(true);
      const ledsArray = snapshot.val();
      if(ledsArray!==null){
        var size = GRID_ROW_LENGTH; 
        var arrayOfArrays:String[][]= [];
        for (var i=0; i<ledsArray.length; i+=size) {
            arrayOfArrays.push(ledsArray.slice(i,i+size));
        }
      setColorArray(transpose(arrayOfArrays))
      }
      setLoading(false);
    });

    props.firebase.getMetaData().on("value", (snapshot: any) => {
      setLoading(true);
      const metadata = snapshot.val();
      if(metadata!==null){
        setHorizontalSlideValue(metadata.horizontalSpeed)
        setVerticalSlideValue(metadata.verticalSpeed)
        setBrightnessValue(metadata.brightness)
      }
      setLoading(false);
    });
    return () => {
      props.firebase.getLeds().off();
      props.firebase.getMetaData().off();
    };
  }, [props.firebase]);

  useEffect(() => {
    if (authUser) {
      const roles: string[] = Object.values(authUser.roles)
      setRoles(roles)
    }
  }, [authUser]);

  const isAdmin = () => roles.includes("ADMIN");

  function transpose(matrix: any) {
    return matrix.reduce((prev: { [x: string]: any; }, next: any[]) => next.map((item, i) =>
      (prev[i] || []).concat(next[i])
    ), []);
  }

  const submit = ()=>{
    props.firebase.setLeds(transpose(colorArray).flat());
    const metadata: MetaData ={
      horizontalSpeed: horizontalSlideValue,
      verticalSpeed:verticalSlideValue,
      brightness: brightnessValue
    }
    props.firebase.setMetaData(metadata)
  }

  return (
    <div className="ledpanel" onMouseDown={ ()=>{setMouseDown(true)} } onMouseUp={ ()=>{setMouseDown(false)}} onMouseLeave={ ()=>{setMouseDown(false)}}>
      {!loading && (
        <div className="float-container">
          <div className="float-child1">
            <LedGrid 
              nbrCols={GRID_COL_LENGTH}
              nbrRows={GRID_ROW_LENGTH}
              isMouseDown={mouseDown}
              color={color}
              setColor={setColor}
              matrix={colorArray}
              setMatrix={setColorArray}
              copyColor={copyColor}
              setCopyColor={setCopyColor}
              />
          </div>
            <LedController
              nbrCols={GRID_COL_LENGTH}
              nbrRows={GRID_ROW_LENGTH}
              setMatrix={setColorArray}
              color={color}
              setColor={setColor}
              isAdmin={isAdmin()}
              copyColor={copyColor}
              setCopyColor={setCopyColor}
              submit={submit}
              horizontalSlideValue={horizontalSlideValue}
              setHorizontalSlideValue={setHorizontalSlideValue}
              verticalSlideValue={verticalSlideValue}
              setVerticalSlideValue={setVerticalSlideValue}
              brightnessValue={brightnessValue}
              setBrightnessValue={setBrightnessValue}
            />
        </div>
      )}
      {loading && (
        <div>
          Loading...
        </div>
      )}
    </div>
  );
};

const condition = (authUser: any) => authUser; //&& !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(LedPanel);


