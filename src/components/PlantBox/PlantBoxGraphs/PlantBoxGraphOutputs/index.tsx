import { ArgumentScale, EventTracker } from "@devexpress/dx-react-chart";
import {
  ArgumentAxis, Chart,
  Legend, LineSeries,
  Title, Tooltip, ValueAxis,
  ZoomAndPan
} from "@devexpress/dx-react-chart-material-ui";
import { FormGroup } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import { scaleTime } from "d3-scale";
import { curveStep, line } from "d3-shape";
import moment, { Moment } from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Output } from "../..";

interface MeasureGraphProps {
  loading: boolean;
  outputs: Output[];
  start: Moment;
  end: Moment;
}

interface ProcessedData {
  time: Date;
  bigLamp: number;
  smallLamp: number;
  pompe: number;
  fanWind: number;
  fanChange: number;
}
interface GraphContainerState {
  cumulative: boolean;
}

const initState = (): GraphContainerState => {
  return {
    cumulative: false,
  };
};

const MeasureGraphOutputs = (props: MeasureGraphProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<GraphContainerState>(initState());
  const { loading } = props;
  const toggleCumulative = () => {
    setState({
      cumulative: !state.cumulative
    })
  };
  const processData = (datas: Output[]): ProcessedData[] => {
    const processData: ProcessedData[] = [];
    let bigLamp: number = 0;
    let smallLamp: number = 0;
    let pompe: number = 0;
    let fanWind: number = 0;
    let fanChange: number = 0;
    for (var i = 0; i < datas.length + 1; i += 1) {
      if (!state.cumulative) {
        if (i < datas.length) {
          bigLamp = datas[i].bigLamp ? 0.1 : 0;
          smallLamp = datas[i].smallLamp ? 0.3 : 0.2;
          pompe = datas[i].pompe ? 0.5 : 0.4;
          fanWind = datas[i].fanWind ? 0.7 : 0.6;
          fanChange = datas[i].fanChange ? 0.9 : 0.8;
        }
        if (i === datas.length) {
          const lastElement = datas.slice(-1)[0] 
          bigLamp = lastElement.bigLamp ? 0.1 : 0;
          smallLamp = lastElement.smallLamp ? 0.3 : 0.2;
          pompe = lastElement.pompe ? 0.5 : 0.4;
          fanWind = lastElement.fanWind ? 0.7 : 0.6;
          fanChange = lastElement.fanChange ? 0.9 : 0.8;
        }
      } else {
        const currentTime =
          i === datas.length ? (moment().unix()*1000) : datas[i].time.getTime();
        const previousTime =
          i === 0 ? datas[i].time.getTime() : datas[i - 1].time.getTime();
        const deltaTime = (currentTime - previousTime) / 60000;
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
          time: datas[i].time,
        });
      } else if (i === datas.length) {
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
  const processedData = processData(props.outputs);
  const getViewPort = (data: ProcessedData[]) => {
    const filtered = data.filter(
      (m:ProcessedData) =>
      m.time.getTime() >= props.start.unix() * 1000 &&
      m.time.getTime() <= props.end.unix() * 1000
    );
    if (!filtered.length) {
      return {
        argumentStart: props.start.toDate(),
        argumentEnd: props.end.toDate(),
        valueStart: 0,
        valueEnd: 1,
      };
    }
    const lastIndex = filtered.length - 1;
    let minValue = 0
    let maxValue = 1
    if (state.cumulative) {
      minValue = Infinity
      maxValue = -Infinity
      filtered.forEach(el => {
        minValue = Math.min(
          el.bigLamp,
          el.fanChange,
          el.fanWind,
          el.pompe,
          el.smallLamp
        );
        maxValue = Math.max(
          el.bigLamp,
          el.fanChange,
          el.fanWind,
          el.pompe,
          el.smallLamp
        );
      });
    }
    return {
      argumentStart: props.start.toDate(),
      argumentEnd: filtered[lastIndex].time,
      valueStart: minValue,
      valueEnd: maxValue,
    };
  };

  const ready = !loading;

  const getTitle = () => {
    return state.cumulative
      ? t("Time outputs where ON in minutes")
      : t("ON/OFF status of outputs");
  };

  return (
    <>
      {ready && (
        <div className="center margin-figure padding-bottom">
          <GraphComponent title={getTitle()} data={processedData} viewport={getViewPort(processedData)} isCumulative={state.cumulative} callBackFunction={toggleCumulative}/>
        </div>
      )}
    </>
  );
};

interface GraphComponentProps{
  isCumulative: boolean
  title: string;
  data: ProcessedData[];
  viewport: {};
  callBackFunction: () => void;
}

interface GraphState{
  targetItem: any;
}

interface ViewportState{
  viewport:{}|undefined
}

const GraphComponent = (props: GraphComponentProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<GraphState>({targetItem:undefined});
  const [viewPortState, setviewPortState] = useState<ViewportState>({ viewport: undefined });
  const { title, data,isCumulative } = props;
  const changeTargetItem = (targetItem: any) =>
    setState({ ...state, targetItem });
  const inputsContainerStyle = { justifyContent: "center" };
  const submit = () => {
    props.callBackFunction()
  };
  useEffect(() => {
    setviewPortState({
      viewport:props.viewport
    });
  }, [props.viewport]);

  const viewportChange = (viewport:any) => {
    setviewPortState({
      viewport
    });
  };

  const renderInput = (
    id:"cumulative",
    label: string
  ): ReactElement => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={props.isCumulative}
            onChange={submit}
            value="checkedB"
            color="primary"
          />
        }
        label={label}
      />
    );
  };

  const CurveStep = (props: any) => {
    return (<LineSeries.Path
      {...props}
      path={line()
        .x(({ arg }: any) => arg)
        .y(({ val }: any) => val)
        .curve(curveStep)}
    />)
  };
  const Curve = (props: any) => {
    return (<LineSeries.Path
      {...props}
      path={line()
        .x(({ arg }: any) => arg)
        .y(({ val }: any) => val)}
    />)
  };

  return (
          <Paper>
            <Chart data={data} key={data.length}>
              <Title text={title} />
              <ArgumentScale factory={scaleTime} />
              <ArgumentAxis />
        <ValueAxis />
              <LineSeries
                name={t("Big Lamp")}
                key="bigLamp"
                valueField="bigLamp"
                argumentField="time"
                seriesComponent={isCumulative ? Curve:CurveStep}
              />
              <LineSeries
                name={t("Small Lamp")}
                key="smallLamp"
                valueField="smallLamp"
                argumentField="time"
                seriesComponent={isCumulative ? Curve:CurveStep}
              />
              <LineSeries
                name={t("Pump")}
                key="pompe"
                valueField="pompe"
                argumentField="time"
                seriesComponent={isCumulative ? Curve:CurveStep}
              />
              <LineSeries
                name={t("Fan Wind")}
                key="fanWind"
                valueField="fanWind"
                argumentField="time"
                seriesComponent={isCumulative ? Curve:CurveStep}
              />
              <LineSeries
                name={t("Fan Change")}
                key="fanChange"
                valueField="fanChange"
                argumentField="time"
                seriesComponent={isCumulative ? Curve:CurveStep}
        />
              <ZoomAndPan
                viewport={viewPortState.viewport}
                onViewportChange={viewportChange}
              />
              <EventTracker />
              <Tooltip
                targetItem={state.targetItem}
                onTargetItemChange={changeTargetItem}
              />
              <Legend />
            </Chart>
            <FormGroup style={inputsContainerStyle} row>
              {renderInput("cumulative", "Cumulative")}
            </FormGroup>
          </Paper>
  );
}

export default MeasureGraphOutputs;
