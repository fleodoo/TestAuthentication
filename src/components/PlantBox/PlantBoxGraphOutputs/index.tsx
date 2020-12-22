import { useTranslation } from "react-i18next";
import React, { ReactElement, useState } from "react";
import Paper from "@material-ui/core/Paper";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  Tooltip,
  Legend,
  Title,
  ZoomAndPan,
} from "@devexpress/dx-react-chart-material-ui";
import { scaleTime } from "d3-scale";
import { EventTracker } from "@devexpress/dx-react-chart";
import { ArgumentScale } from "@devexpress/dx-react-chart";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Data } from "..";
const interval = 1;

interface MeasureGraphProps {
  loading: boolean;
  data: Data[];
}

interface PorcessedData {
  time: Date;
  bigLamp: number;
  smallLamp: number;
  pompe: number;
  fanWind: number;
  fanChange: number;
}
interface GraphState {
  data: Data[];
  targetItem: any;
  zoomValue: boolean;
  zoomArgument: boolean;
  cumulative: boolean;
}

const initState = (): GraphState => {
  return {
    targetItem: undefined,
    data: [],
    zoomArgument: true,
    zoomValue: false,
    cumulative: false,
  };
};

const MeasureGraphOutputs = (props: MeasureGraphProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<GraphState>(initState());
  const { loading, data } = props;

  const processData = (datas: Data[]): PorcessedData[] => {
    const processData: PorcessedData[] = [];
    let bigLamp: number = 0;
    let smallLamp: number = 0;
    let pompe: number = 0;
    let fanWind: number = 0;
    let fanChange: number = 0;
    datas.forEach((data) => {
      if (state.cumulative) {
        bigLamp = data.bigLamp ? bigLamp + interval : bigLamp;
        smallLamp = data.smallLamp ? smallLamp + interval : smallLamp;
        pompe = data.pompe ? pompe + interval : pompe;
        fanWind = data.fanWind ? fanWind + interval : fanWind;
        fanChange = data.fanChange ? fanChange + interval : fanChange;
      } else {
        bigLamp = data.bigLamp ? 1 : 0;
        smallLamp = data.smallLamp ? 1 : 0;
        pompe = data.pompe ? 1 : 0;
        fanWind = data.fanWind ? 1 : 0;
        fanChange = data.fanChange ? 1 : 0;
      }
      processData.push({
        bigLamp,
        smallLamp,
        pompe,
        fanWind,
        fanChange,
        time: data.time,
      });
    });
    return processData;
  };
  const inputsContainerStyle = { justifyContent: "center" };
  const ProcessedData = processData(data);
  const ready = !loading;
  const changeTargetItem = (targetItem: any) =>
    setState({ ...state, targetItem });

  const submit = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.id as "zoomArgument" | "zoomValue" | "cumulative";
    setState({
      ...state,
      [e.target.id]: e.target.checked,
    });
  };

  const getTitle = () => {
    return state.cumulative
      ? t("Time outputs where ON in minutes")
      : t("ON/OFF status of outputs");
  };
  const getMode = (zoom: boolean) => {
    return zoom ? "both" : "pan";
  };

  const getViewPort = (data: PorcessedData[]) => {
    if (!data.length) {
      return {
        argumentStart: 0,
        argumentEnd: 0,
        valueStart: 0,
        valueEnd: 0,
      };
    }
    const lastIndex = data.length - 1;
    const firstIndex = lastIndex - 60 / interval;
    console.log(lastIndex);
    console.log(firstIndex);
    const minValue = Math.min(
      data[firstIndex].bigLamp,
      data[firstIndex].fanChange,
      data[firstIndex].fanWind,
      data[firstIndex].pompe,
      data[firstIndex].smallLamp
    );
    const maxValue = Math.max(
      data[lastIndex].bigLamp,
      data[lastIndex].fanChange,
      data[lastIndex].fanWind,
      data[lastIndex].pompe,
      data[lastIndex].smallLamp
    );
    return {
      argumentStart: data[firstIndex].time,
      argumentEnd: data[lastIndex].time,
      valueStart: minValue,
      valueEnd: maxValue,
    };
  };

  const renderInput = (
    id: "zoomArgument" | "zoomValue" | "cumulative",
    label: string
  ): ReactElement => {
    const { [id]: checked } = state;
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={checked}
            onChange={submit}
            value="checkedB"
            color="primary"
          />
        }
        label={label}
      />
    );
  };
  return (
    <>
      {ready && (
        <div className="center margin-figure padding-bottom">
          {state.cumulative && (
            <Paper>
              <Chart data={ProcessedData}>
                <Title text={getTitle()} />
                <ArgumentScale factory={scaleTime} />
                <ArgumentAxis />
                <ValueAxis />
                <LineSeries
                  name={t("Big Lamp")}
                  valueField="bigLamp"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Small Lamp")}
                  valueField="smallLamp"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Pump")}
                  valueField="pompe"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Fan Wind")}
                  valueField="fanWind"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Fan Change")}
                  valueField="fanChange"
                  argumentField="time"
                />
                <ZoomAndPan
                  interactionWithArguments={getMode(state.zoomArgument)}
                  interactionWithValues={getMode(state.zoomValue)}
                  zoomRegionKey="ctrl"
                  defaultViewport={getViewPort(ProcessedData)}
                />
                <EventTracker />
                <Tooltip
                  targetItem={state.targetItem}
                  onTargetItemChange={changeTargetItem}
                />
                <Legend />
              </Chart>
              <FormGroup style={inputsContainerStyle} row>
                {renderInput("zoomArgument", "Zoom on x-as")}
                {renderInput("zoomValue", "Zoom on y-as")}
                {renderInput("cumulative", "cumulative")}
              </FormGroup>
            </Paper>
          )}
          {!state.cumulative && (
            <Paper>
              <Chart data={ProcessedData}>
                <Title text={getTitle()} />
                <ArgumentScale factory={scaleTime} />
                <ArgumentAxis />
                <ValueAxis />
                <LineSeries
                  name={t("Big Lamp")}
                  valueField="bigLamp"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Small Lamp")}
                  valueField="smallLamp"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Pump")}
                  valueField="pompe"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Fan Wind")}
                  valueField="fanWind"
                  argumentField="time"
                />
                <LineSeries
                  name={t("Fan Change")}
                  valueField="fanChange"
                  argumentField="time"
                />
                <ZoomAndPan
                  interactionWithArguments={getMode(state.zoomArgument)}
                  interactionWithValues={getMode(state.zoomValue)}
                  zoomRegionKey="ctrl"
                  defaultViewport={getViewPort(ProcessedData)}
                />
                <EventTracker />
                <Tooltip
                  targetItem={state.targetItem}
                  onTargetItemChange={changeTargetItem}
                />
                <Legend />
              </Chart>
              <FormGroup style={inputsContainerStyle} row>
                {renderInput("zoomArgument", "Zoom on x-as")}
                {renderInput("zoomValue", "Zoom on y-as")}
                {renderInput("cumulative", "cumulative")}
              </FormGroup>
            </Paper>
          )}
        </div>
      )}
    </>
  );
};

export default MeasureGraphOutputs;
