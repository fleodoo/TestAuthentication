import React from "react";
import { Table } from "react-fluid-table";
import { useTranslation } from "react-i18next";
import { Measure, Output } from "..";

interface MeasurTableProps {
  loading: boolean;
  measures: any;
  outputs: any;
}

interface DataString {
  time: string;
  temperature: string;
  airHumidity: string;
  soilHumidity: string;
  waterVolume: string;
}
interface OutputString {
  time: string;
  bigLamp: string;
  smallLamp: string;
  pompe: string;
  fanWind: string;
  fanChange: string;
}

const MeasureTable = (props: MeasurTableProps) => {
  const measuresToString = (datas: Measure[]): DataString[] => {
    return datas.map((data) => ({
      time: data.time.toLocaleString(),
      temperature: data.temperature.toString(),
      airHumidity: data.airHumidity.toString(),
      soilHumidity: data.soilHumidity.toString(),
      waterVolume: data.waterVolume ? t("Ok") : t("Not Ok"),
    }));
  };
  const outputsToString = (datas: Output[]): OutputString[] => {
    return datas.map((data) => ({
      time: data.time.toLocaleString(),
      bigLamp: data.bigLamp ? "On" : "Off",
      smallLamp: data.smallLamp ? "On" : "Off",
      pompe: data.pompe ? "On" : "Off",
      fanWind: data.fanWind ? "On" : "Off",
      fanChange: data.fanChange ? "On" : "Off",
    }));
  };
  const { t } = useTranslation();
  const { loading, measures, outputs } = props;
  const columnsData: any = [
    {
      key: "time",
      header: t("Time"),
      width: 200,
    },
    {
      key: "temperature",
      header: t("Temperature"),
      width: 130,
    },
    {
      key: "airHumidity",
      header: t("Air Humidity"),
      width: 150,
    },
    {
      key: "soilHumidity",
      header: t("Soil Humidity"),
      width: 150,
    },
    {
      key: "waterVolume",
      header: t("Has Water"),
      width: 150,
    },
  ];
  const columnsOutputs: any = [
    {
      key: "time",
      header: t("Time"),
      width: 200,
    },
    {
      key: "bigLamp",
      header: t("Big Lamp"),
      width: 150,
    },
    {
      key: "smallLamp",
      header: t("Small Lamp"),
      width: 130,
    },
    {
      key: "pompe",
      header: t("Pump"),
      width: 100,
    },
    {
      key: "fanWind",
      header: t("Fan Wind"),
      width: 110,
    },
    {
      key: "fanChange",
      header: t("Fan Change"),
      width: 140,
    },
  ];
  const ready = !loading;
  return (
    <div className="center margin-figure height100">
      {ready && (
        <div className="flex height100">
          <div className="width50 height100">
            <div className="title">Measures</div>
              <div className="table">
                <Table data={measuresToString(measures)} columns={columnsData} />
              </div>
            </div >
          <div className="width50 height100">
            <div className="title">Motors</div>
              <div className="table">
                <Table data={outputsToString(outputs)} columns={columnsOutputs} />
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MeasureTable;
