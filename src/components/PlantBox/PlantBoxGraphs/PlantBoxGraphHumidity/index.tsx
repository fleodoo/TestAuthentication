import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
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
import { Data } from "../..";
import { Moment } from "moment";

interface MeasureGraphProps {
  loading: boolean;
  data: Data[];
  start: Moment;
  end: Moment;
}
interface GraphState {
  targetItem: any;
  viewport: {};
}

const initState = (): GraphState => {
  return {
    targetItem: undefined,
    viewport: {},
  };
};

const MeasureGraphHumidity = (props: MeasureGraphProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<GraphState>(initState());

  useEffect(() => {
    const filtered = props.data.filter(
      (d) =>
        d.time.getTime() >= props.start.unix() * 1000 &&
        d.time.getTime() <= props.end.unix() * 1000
    );

    let viewport: any;
    if (!filtered.length) {
      viewport = {
        argumentStart: 0,
        argumentEnd: 10,
        valueStart: 0,
        valueEnd: 10,
      };
    } else {
      let minimum = 100;
      let maximum = -100;
      filtered.forEach((d) => {
        minimum = Math.min(d.airHumidity, d.soilHumidity, minimum);
        maximum = Math.max(d.airHumidity, d.soilHumidity, maximum);
      });
      viewport = {
        argumentStart: filtered[0].time,
        argumentEnd: filtered.slice(-1)[0].time,
        valueStart: minimum - 0.1,
        valueEnd: maximum + 0.1,
      };
    }

    setState((prevState: any) => ({
      ...prevState,
      viewport,
    }));
  }, [props.data, props.start, props.end]);

  const { loading } = props;
  const ready = !loading;
  const changeTargetItem = (targetItem: any) => setState({ ...targetItem });

  return (
    <>
      {ready && (
        <div className="center margin-figure">
          <Paper>
            <Chart data={props.data}>
              <Title text={t("Air & Soil Humidity")} />
              <ArgumentScale factory={scaleTime} />
              <ArgumentAxis />
              <ValueAxis />
              <LineSeries
                name={t("Air Humidity")}
                valueField="airHumidity"
                argumentField="time"
              />
              <LineSeries
                name={t("Soil Humidity")}
                valueField="soilHumidity"
                argumentField="time"
              />
              <ZoomAndPan zoomRegionKey="ctrl" viewport={state.viewport} />
              <EventTracker />
              <Tooltip
                targetItem={state.targetItem}
                onTargetItemChange={changeTargetItem}
              />
              <Legend />
            </Chart>
          </Paper>
        </div>
      )}
    </>
  );
};

export default MeasureGraphHumidity;
