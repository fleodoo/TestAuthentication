import { useTranslation } from "react-i18next";
import { Data } from "..";
import { Table } from "react-fluid-table";
import React from "react";

interface MeasurTableProps {
  loading: boolean;
  data: any;
}

interface DataString {
  time: string;
  temperature: string;
  airHumidity: string;
  soilHumidity: string;
  waterVolume: string;
  bigLamp: string;
  smallLamp: string;
  pompe: string;
  fanWind: string;
  fanChange: string;
}

const MeasureTable = (props: MeasurTableProps) => {
  const dataToString = (datas: Data[]): DataString[] => {
    return datas.map((data) => ({
      time: data.time.toLocaleString(),
      temperature: data.temperature.toString(),
      airHumidity: data.airHumidity.toString(),
      soilHumidity: data.soilHumidity.toString(),
      waterVolume: data.waterVolume ? t("Ok") : t("Not Ok"),
      bigLamp: data.bigLamp ? "On" : "Off",
      smallLamp: data.smallLamp ? "On" : "Off",
      pompe: data.pompe ? "On" : "Off",
      fanWind: data.fanWind ? "On" : "Off",
      fanChange: data.fanChange ? "On" : "Off",
    }));
  };
  const { t } = useTranslation();
  const { loading, data } = props;
  const columns: any = [
    {
      key: "time",
      header: t("Time"),
      width: 200,
    },
    {
      key: "temperature",
      header: t("Temperature"),
      width: 150,
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
    {
      key: "bigLamp",
      header: t("Big Lamp"),
      width: 150,
    },
    {
      key: "smallLamp",
      header: t("Small Lamp"),
      width: 150,
    },
    {
      key: "pompe",
      header: t("Pump"),
      width: 150,
    },
    {
      key: "fanWind",
      header: t("Fan Wind"),
      width: 150,
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
        <>
          <div className="title">Datas</div>
          <Table data={dataToString(data)} columns={columns} />
        </>
      )}
    </div>
  );
};

export default MeasureTable;
