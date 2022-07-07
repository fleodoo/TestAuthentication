import React, { MouseEventHandler, useContext, useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { AuthUserContext, withAuthorization, withEmailVerification } from "../Authentication/Session";
import { withFirebase } from "../Firebase";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { HexColorPicker } from "react-colorful";
import { useTranslation } from "react-i18next";


const GRID_ROW_LENGTH= 12
const GRID_COL_LENGTH = 12


const LedPanel = (props: any) => {
  const { t } = useTranslation();
  const [color, setColor] = useState("#11f011");
  const [colorArray, setColorArray] = useState(Array(12).fill(Array(12).fill("#FF0000")));
  const [roles, setRoles]= useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const authUser = useContext(AuthUserContext)

  useEffect(() => {
    props.firebase.getLeds().on("value", (snapshot: any) => {
      setLoading(true);
      const ledsArray = snapshot.val();
      var size = 12; 
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

  const changeColor = (col :number,row:number)=>{
    var newArray = [];
    for (var i = 0; i < colorArray.length; i++)
        newArray[i] = colorArray[i].slice();
    newArray[col][row] = color;
    setColorArray(newArray)
  }

  const submit = ()=>{
    props.firebase.setLeds(transpose(colorArray).flat());
  }

  console.log(loading)
  return (
    <div className="ledpanel">
      {!loading && (
        <div className="float-container">
          <div className="float-child1">
          <Grid fluid>
            {[...Array(GRID_ROW_LENGTH)].map((i, row) =>
              <Row between="xs" key={row} className="ledpanel-row">
                {[...Array(GRID_COL_LENGTH)].map((j, col) =>
                    <Col key={col}>
                      <Cell col={col} row={row} color={colorArray[col][row]} onClick={()=>changeColor(col,row)}/>
                    </Col>
                )}
              </Row>
            )}
          </Grid>
          </div>
          <div className="float-child2">
            <HexColorPicker color={color} onChange={setColor} />
            <button disabled={!isAdmin} onClick={submit}>
              {t("Submit")}
            </button>
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
}

const Cell = (props: CellProps) => {
  // const { t } = useTranslation();
  return (
    <div onClick={props.onClick}
    style={{
      backgroundColor: props.color,
    }}className="ledpanel_cell">
    </div>
  );
};
const condition = (authUser: any) => authUser; //&& !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(LedPanel);


