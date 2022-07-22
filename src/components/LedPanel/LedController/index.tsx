import React from "react";
// import { useTranslation } from "react-i18next";
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
import Slider from "@material-ui/core/Slider";

library.add(fas)

const eye_dropper: IconLookup = { prefix: 'fas', iconName: 'eye-dropper' }
const eyeDropperDefinition: IconDefinition = findIconDefinition(eye_dropper)

interface LedGridProps {
  nbrCols: number
  nbrRows: number
  setMatrix: any
  color: string
  setColor: any
  isAdmin:boolean
  copyColor: boolean
  setCopyColor: any
  submit: any
  horizontalSlideValue: number
  setHorizontalSlideValue: any
  verticalSlideValue: number
  setVerticalSlideValue: any
}

const LedController = (props: LedGridProps) => {
  const { t } = useTranslation();
  
  const randomize = ()=>{
    const newMatrix:String[][] = Array.from(new Array(props.nbrCols), () => new Array(props.nbrRows).fill("#000000"));
    for (var col = 0; col < props.nbrCols; col++){
      for (var row = 0; row < props.nbrRows; row++){
        const color: string = "#"+Math.floor(Math.random()*16777215).toString(16);
        newMatrix[row][col]= color;
      }
    }
    props.setMatrix(newMatrix)
  }

  const clickCopyColor = () =>{
    props.setCopyColor(!props.copyColor)
  }

  const onChangeSliderH = (ev:any, value:number| number[]) =>{
    props.setHorizontalSlideValue(value)
  }

  const onChangeSliderV = (ev:any, value:number| number[]) =>{
    props.setVerticalSlideValue(value)
  }


  return (
    <div>
    <div className="float-child2">
      <HexColorPicker color={props.color} onChange={props.setColor} />
      <div>
        <button className="random" disabled={!props.isAdmin} onClick={randomize}>
          {t("Randomize")}
        </button>
        <button 
          className="copycolor" 
          style={{borderStyle:props.copyColor ? "inset":"none"  }} 
          disabled={!props.isAdmin} onClick={clickCopyColor}>
          <FontAwesomeIcon icon={eyeDropperDefinition} />
        </button>
      </div>
      <div>
        <button className="submit" disabled={!props.isAdmin} onClick={props.submit}>
          {t("Submit")}
        </button>
      </div>
    </div>
      <div className="float-child3">
        <div>
          {t("Number of Horizontal moves per second")}
        </div>
        <Slider 
          aria-label="Horizontal move"
          defaultValue={0}
          valueLabelDisplay="auto"
          value ={props.horizontalSlideValue}
          step={0.1}
          min={-5}
          max={5}
          track={false}
          onChange={onChangeSliderH}
        />
        <div>
          {t("Number of Vertical moves per second")}
        </div>
        <Slider 
          aria-label="Vertical move"
          defaultValue={0}
          valueLabelDisplay="auto"
          value ={props.verticalSlideValue}
          step={0.1}
          min={-5}
          max={5}
          track={false}
          onChange={onChangeSliderV}
        />
      </div>
    </div>
  );
};

export default LedController



