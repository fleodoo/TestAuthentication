import { useTranslation } from "react-i18next";
import React, { useState } from "react";
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
import { Data } from "..";

interface MeasureGraphProps {
  loading: boolean;
  data: any;
}
interface GraphState {
  data: Data[];
  targetItem: any;
}

const initState = (): GraphState => {
  return {
    targetItem: undefined,
    data: [],
  };
};

const MeasureGraphTemperature = (props: MeasureGraphProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<GraphState>(initState());

  const { loading, data } = props;
  const ready = !loading;
  const changeTargetItem = (targetItem: any) => setState({ ...targetItem });
  return (
    <>
      {ready && (
        <div className="center margin-figure">
          <Paper>
            <Chart data={data}>
              <Title text={t("Temperature")} />
              <ArgumentScale factory={scaleTime} />
              <ArgumentAxis />
              <ValueAxis />
              <LineSeries
                name={t("Temperature")}
                valueField="temperature"
                argumentField="time"
              />
              <ZoomAndPan zoomRegionKey="ctrl" />
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

export default MeasureGraphTemperature;
