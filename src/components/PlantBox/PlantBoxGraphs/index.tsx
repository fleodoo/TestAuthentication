import moment, { Moment } from "moment";
import React, { useState } from "react";
//@ts-ignore
import DateTimeRangeContainer from "react-advanced-datetimerange-picker";
import { FormControl } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Measure, Output } from "..";
import MeasureGraphHumidity from "./PlantBoxGraphHumidity";
import MeasureGraphOutputs from "./PlantBoxGraphOutputs";
import MeasureGraphTemperature from "./PlantBoxGraphTemperature";

interface PlantBoxGraphsProps {
  loading: boolean;
  measures: Measure[];
  outputs: Output[];
}

interface PlantBoxGraphsState {
  start: Moment;
  end: Moment;
  value: string;
}

const value = (start: Moment, end: Moment) => {
  return `${start.format("DD-MM-YYYY HH:mm")} - ${end.format(
    "DD-MM-YYYY HH:mm"
  )}`;
};
const initState = (start: Moment, end: Moment) => {
  return {
    start: start,
    end: end,
    value: value(start, end),
  };
};
const PlantBoxGraphs = (props: PlantBoxGraphsProps) => {
  const { t } = useTranslation();
  let now = new Date();
  let start = moment(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  );
  let end = moment(start).add(1, "days").subtract(1, "seconds");
  const [state, setState] = useState<PlantBoxGraphsState>(
    initState(start, end)
  );

  const applyCallback = (startDate: Moment, endDate: Moment) => {
    setState({
      start: startDate,
      end: endDate,
      value: value(startDate, endDate),
    });
  };

  let ranges = {
    "Today Only": [moment(start), moment(end)],
    "Yesterday Only": [
      moment(start).subtract(1, "days"),
      moment(end).subtract(1, "days"),
    ],
    "3 Days": [moment(start).subtract(3, "days"), moment(end)],
    "Last Week": [moment(start).subtract(1, "weeks"), moment(end)],
    "Last Month": [moment(start).subtract(1, "months"), moment(end)],
  };
  let local = {
    format: "DD-MM-YYYY HH:mm",
    sundayFirst: false,
  };
  return (
    <>
      <div className="title"> {t("Graphs")}</div>
      <div className="center pb-graph-timestamp">
        <div className="pb-graph-timestamp-label">{t("Timestamp") + ":"}</div>
        <DateTimeRangeContainer
          ranges={ranges}
          start={state.start}
          end={state.end}
          local={local}
          applyCallback={(start: Moment, end: Moment) =>
            applyCallback(start, end)
          }
          smartMode
        >
          <FormControl
            id="formControlsTextB"
            type="text"
            label="Text"
            placeholder="Enter text"
            value={state.value}
            readOnly
            style={{ cursor: "pointer", width: "100%" }}
          />
        </DateTimeRangeContainer>
      </div>
      <MeasureGraphTemperature
        loading={props.loading}
        measure={props.measures}
        start={state.start}
        end={state.end}
      />
      <MeasureGraphHumidity
        loading={props.loading}
        data={props.measures}
        start={state.start}
        end={state.end}
      />
      <MeasureGraphOutputs loading={props.loading} outputs={props.outputs} start={state.start}
        end={state.end}/>
    </>
  );
};
export default PlantBoxGraphs;
