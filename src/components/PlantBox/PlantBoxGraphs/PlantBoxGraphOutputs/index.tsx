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
import { line, curveStep } from "d3-shape";
import { EventTracker } from "@devexpress/dx-react-chart";
import { ArgumentScale } from "@devexpress/dx-react-chart";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Data } from "../..";
import moment from "moment";

interface MeasureGraphProps {
  loading: boolean;
  data: Data[];
}

interface ProcessedData {
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

  const processData = (datas: Data[]): ProcessedData[] => {
    const processData: ProcessedData[] = [];
    let bigLamp: number = 0;
    let smallLamp: number = 0;
    let pompe: number = 0;
    let fanWind: number = 0;
    let fanChange: number = 0;
    for (var i = 0; i < datas.length + 1; i += 1) {
      if (!state.cumulative) {
        if (i < datas.length) {
          bigLamp = datas[i].bigLamp ? 1 : 0;
          smallLamp = datas[i].smallLamp ? 1 : 0;
          pompe = datas[i].pompe ? 1 : 0;
          fanWind = datas[i].fanWind ? 1 : 0;
          fanChange = datas[i].fanChange ? 1 : 0;
        }
      } else {
        const currentTime =
          i === datas.length ? moment().unix() : datas[i].time.getTime();
        const previousTime =
          i === 0 ? datas[i].time.getTime() : datas[i - 1].time.getTime();
        const deltaTime = (currentTime - previousTime) / 60000;
        console.log(deltaTime);
        if (i === 0) {
          bigLamp = 0;
          smallLamp = 0;
          pompe = 0;
          fanWind = 0;
          fanChange = 0;
        } else {
          bigLamp = datas[i - 1].bigLamp ? bigLamp + deltaTime : bigLamp;
          smallLamp = datas[i - 1].smallLamp
            ? smallLamp + deltaTime
            : smallLamp;
          pompe = datas[i - 1].pompe ? pompe + deltaTime : pompe;
          fanWind = datas[i - 1].fanWind ? fanWind + deltaTime : fanWind;
          fanChange = datas[i - 1].fanChange
            ? fanChange + deltaTime
            : fanChange;
        }
      }
      if (i < datas.length) {
        processData.push({
          bigLamp,
          smallLamp,
          pompe,
          fanWind,
          fanChange,
          time: data[i].time,
        });
      } else if (i === datas.length && state.cumulative) {
        processData.push({
          bigLamp,
          smallLamp,
          pompe,
          fanWind,
          fanChange,
          time: moment().toDate(),
        });
      }
    }
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

  const Line = (props: any) => (
    <LineSeries.Path
      {...props}
      path={line()
        .x(({ arg }: any) => arg)
        .y(({ val }: any) => val)
        .curve(curveStep)}
    />
  );

  const getViewPort = (data: ProcessedData[], cumulative: boolean) => {
    if (!data.length) {
      return {
        argumentStart: 0,
        argumentEnd: 0,
        valueStart: 0,
        valueEnd: 0,
      };
    }
    const lastIndex = data.length - 1;
    const firstIndex = 0;
    if (cumulative) {
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
    } else {
      return {
        argumentStart: data[firstIndex].time,
        argumentEnd: data[lastIndex].time,
        valueStart: 0,
        valueEnd: 1,
      };
    }
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
                  defaultViewport={getViewPort(ProcessedData, true)}
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
                  seriesComponent={Line}
                />
                <LineSeries
                  name={t("Small Lamp")}
                  valueField="smallLamp"
                  argumentField="time"
                  seriesComponent={Line}
                />
                <LineSeries
                  name={t("Pump")}
                  valueField="pompe"
                  argumentField="time"
                  seriesComponent={Line}
                />
                <LineSeries
                  name={t("Fan Wind")}
                  valueField="fanWind"
                  argumentField="time"
                  seriesComponent={Line}
                />
                <ZoomAndPan
                  interactionWithArguments={getMode(state.zoomArgument)}
                  interactionWithValues={getMode(state.zoomValue)}
                  zoomRegionKey="ctrl"
                  defaultViewport={getViewPort(ProcessedData, false)}
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
