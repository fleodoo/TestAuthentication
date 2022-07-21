import React, { MouseEventHandler, useContext, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { AuthUserContext, withAuthorization, withEmailVerification } from "../Authentication/Session";
import { withFirebase } from "../Firebase";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { HexColorPicker } from "react-colorful";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

import {
  IconLookup,
  IconDefinition,
  findIconDefinition
} from '@fortawesome/fontawesome-svg-core'

library.add(fas)

const eye_dropper: IconLookup = { prefix: 'fas', iconName: 'eye-dropper' }
const eyeDropperDefinition: IconDefinition = findIconDefinition(eye_dropper)

const GRID_ROW_LENGTH= 12
const GRID_COL_LENGTH = 12


const LedPanel = (props: any) => {
  const { t } = useTranslation();
  const [color, setColor] = useState("#11f011");
  const [colorArray, setColorArray] = useState(Array.from(new Array(GRID_COL_LENGTH), () => new Array(GRID_ROW_LENGTH).fill("#FF0000")));
  const [roles, setRoles]= useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const authUser = useContext(AuthUserContext);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [copyColor, setCopyColor] = useState<boolean>(false);

  useEffect(() => {
    props.firebase.getLeds().on("value", (snapshot: any) => {
      setLoading(true);
      const ledsArray = snapshot.val();
      var size = GRID_ROW_LENGTH; 
      var arrayOfArrays:String[][]= [];
      for (var i=0; i<ledsArray.length; i+=size) {
          arrayOfArrays.push(ledsArray.slice(i,i+size));
      }
      setColorArray(transpose(arrayOfArrays))
      setLoading(false);
    });
    return () => {
      props.firebase.getLeds().off();
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

  const changeColor = (col :number,row:number, isClick: boolean)=>{
    if(isClick && copyColor){
      const color = colorArray[col][row]
      setColor(color);
      setCopyColor(false);
    } else {

    var newArray = [];
    for (var i = 0; i < colorArray.length; i++)
        newArray[i] = colorArray[i].slice();
    newArray[col][row] = color;
    setColorArray(newArray)
    }
  }

  const submit = ()=>{
    props.firebase.setLeds(transpose(colorArray).flat());
  }

  const clickCopyColor = () =>{
    setCopyColor(!copyColor)
  }

  const randomize = ()=>{
    const newMatrix:String[][] = Array.from(new Array(GRID_COL_LENGTH), () => new Array(GRID_ROW_LENGTH).fill("#000000"));
    for (var col = 0; col < GRID_COL_LENGTH; col++){
      for (var row = 0; row < GRID_ROW_LENGTH; row++){
        const color: string = "#"+Math.floor(Math.random()*16777215).toString(16);
        newMatrix[row][col]= color;
      }
    }
    setColorArray(newMatrix)
  }

  const hoverCell = (col:number, row:number)=>{
    if(mouseDown){
      changeColor(col,row, false)
    }
  }

  return (
    <div className="ledpanel" onMouseDown={ ()=>{setMouseDown(true)} } onMouseUp={ ()=>{setMouseDown(false)}} onMouseLeave={ ()=>{setMouseDown(false)}}>
      {!loading && (
        <div className="float-container">
          <div className="float-child1">
          <Grid fluid>
            {[...Array(GRID_ROW_LENGTH)].map((i, row) =>
              <Row between="xs" key={row} className="ledpanel-row">
                {[...Array(GRID_COL_LENGTH)].map((j, col) =>
                    <Col key={col}>
                      <Cell col={col} row={row} color={colorArray[col][row]} onClick={()=>changeColor(col,row,true)} onHover={()=>hoverCell(col,row)}/>
                    </Col>
                )}
              </Row>
            )}
          </Grid>
          </div>
          <div className="float-child2">
            <HexColorPicker color={color} onChange={setColor} />
            <div>
              <button className="copycolor" style={{borderStyle:copyColor ? "inset":"none"  }} disabled={!isAdmin} onClick={clickCopyColor}>
                <FontAwesomeIcon icon={eyeDropperDefinition} />
              </button>
            </div>
            <div>
              <button className="random" disabled={!isAdmin} onClick={randomize}>
                {t("Randomize")}
              </button>
            </div>
            <div>
              <button className="submit" disabled={!isAdmin} onClick={submit}>
                {t("Submit")}
              </button>
            </div>
          </div>
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


interface CellProps {
  col: number;
  row: number;
  color: string;
  onClick: MouseEventHandler;
  onHover:any
}


const Cell = (props: CellProps) => {
  // const { t } = useTranslation();
  return (
    <div onMouseDown={props.onClick} onMouseEnter={props.onHover}
    style={{
      backgroundColor: props.color,
    }}
    className="ledpanel_cell">
    </div>
  );
};
const condition = (authUser: any) => authUser; //&& !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(LedPanel);


