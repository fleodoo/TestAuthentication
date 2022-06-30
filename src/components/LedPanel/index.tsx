import React, { MouseEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";
import { compose } from "recompose";
import { withAuthorization, withEmailVerification } from "../Authentication/Session";
import { withFirebase } from "../Firebase";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { HexColorPicker } from "react-colorful";


const GRID_ROW_LENGTH= 12
const GRID_COL_LENGTH = 12

const LedPanel = (props: any) => {
  const { t } = useTranslation();
  const [color, setColor] = useState("#aabbcc");
  const [colorArray, setColorArray] = useState(Array(12).fill(Array(12).fill("#FF0000")));

  const changeColor = (col :number,row:number)=>{
    var newArray = [];
    for (var i = 0; i < colorArray.length; i++)
        newArray[i] = colorArray[i].slice();
    newArray[col][row] = color;
    setColorArray(newArray)
  }
  console.log(colorArray)
  return (
    <div className="ledpanel">
      <Grid fluid>
        <Row className="ledpanel-row">
        <Col xs={10} sm={10} md={10} lg={10} key={"grid"}>
          <Grid fluid>
            {[...Array(GRID_ROW_LENGTH)].map((i, row) =>
              <Row between="xs" key={row} className="ledpanel-row">
                {[...Array(GRID_COL_LENGTH)].map((j, col) =>
                    <Col xs={1} sm={1} md={1} lg={1} key={col}>
                      <Cell col={col} row={row} color={colorArray[col][row]} onClick={()=>changeColor(col,row)}/>
                    </Col>
                )}
              </Row>
            )}
          </Grid>
        </Col>
        <Col xs={2} sm={2} md={2} lg={2} key={"color-picker"}>
          <HexColorPicker color={color} onChange={setColor} />
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
  const { t } = useTranslation();
  return (
    <div onClick={props.onClick}
    style={{
      backgroundColor: props.color,
    }}className="ledpanel_cell">
      {"("+props.col+","+props.row+")"}
    </div>
  );
};
const condition = (authUser: any) => authUser; //&& !!authUser.roles[ROLES.ADMIN];
export default compose(
  withEmailVerification,
  withAuthorization(condition),
  withFirebase
)(LedPanel);
