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
  const authUser = useContext(AuthUserContext)

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
  return (
    <div className="ledpanel">
      <Grid fluid>
        <Row className="ledpanel-row">
        <Col xs={7} sm={7} md={7} lg={7} key={"grid"}>
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
        </Col>
        <Col xs={5} sm={5} md={5} lg={5} key={"color-picker"}>
          <HexColorPicker color={color} onChange={setColor} />
          <button disabled={!isAdmin} onClick={submit}>
          {t("Submit")}
        </button>
        </Col>
        </Row>
      </Grid>
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


