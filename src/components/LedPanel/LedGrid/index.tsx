import React, { MouseEventHandler } from "react";
// import { useTranslation } from "react-i18next";
import { Grid, Row, Col } from 'react-flexbox-grid';

interface LedGridProps {
  nbrCols: number
  nbrRows: number
  isMouseDown:boolean
  color: string
  setColor: any
  matrix: any
  setMatrix: any
  copyColor: boolean
  setCopyColor: any
  setArrayChanged: any
}

const LedGrid = (props: LedGridProps) => {
  const changeColor = (col :number,row:number, isClick: boolean)=>{
    if(isClick && props.copyColor){
      const color = props.matrix[col][row]
      props.setColor(color);
      props.setCopyColor(false);
    } else {

    var newArray = [];
    for (var i = 0; i < props.matrix.length; i++)
        newArray[i] = props.matrix[i].slice();
    newArray[col][row] = props.color;
    props.setMatrix(newArray)
    props.setArrayChanged(true)
    }
  }

  const hoverCell = (col:number, row:number)=>{
    if(props.isMouseDown){
      changeColor(col,row, false)
    }
  }

  const getColor = (col:number,row:number) : string=>{
    if(!props.matrix[col] || !props.matrix[col][row]){
      return "#FF0000"
    }
    const color = props.matrix[col][row]
    return color
  }

  return (
    <Grid fluid>
      {[...Array(props.nbrRows)].map((i, row) =>
        <Row key={row} className="ledpanel-row">
          {[...Array(props.nbrCols)].map((j, col) =>
              <Col key={col}>
                <Cell col={col} row={row} color={getColor(col,row)} onClick={()=>changeColor(col,row,true)} onHover={()=>hoverCell(col,row)}/>
              </Col>
          )}
        </Row>
      )}
    </Grid>
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
  return (
    <div onMouseDown={props.onClick} onMouseEnter={props.onHover}
    style={{
      backgroundColor: props.color,
    }}
    className="ledpanel-cell">
    </div>
  );
};
export default LedGrid


