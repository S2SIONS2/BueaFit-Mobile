"use client";

import React from "react";
import { Text, View } from "react-native";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryPie,
  VictoryTheme,
  VictoryTooltip,
} from "victory";

type ChartType = "bar" | "line" | "pie";

interface ChartsProps {
  title: string;
  data: ({ name: string } & { [key: string]: number | string })[];
  dataKey: string;
  type: ChartType;
}

export default function Charts({ title, data, dataKey, type }: ChartsProps) {
  const COLORS = ["#959dd6", "#c0d695", "#ffc658", "#ff8042", "#d69595", "#aa95d6", "#f1eba1"];
  const xAxisKey = data?.[0]?.name ? "name" : "staff_name";

  if (!data || data.length === 0) {
    return (
      <View className="bg-white rounded-xl p-4 shadow">
        <Text className="text-sm font-semibold text-gray-700 mb-2">{title}</Text>
        <View className="h-72 bg-gray-100 rounded items-center justify-center">
          <Text className="text-gray-500">데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 shadow">
      <Text className="text-sm font-semibold text-gray-700 mb-2">{title}</Text>
      <View className="h-72 bg-gray-100 rounded items-center justify-center">
        {type === "bar" && (
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 30 }}
            width={350}
            height={280}
          >
            <VictoryAxis tickFormat={(t) => String(t)} />
            <VictoryAxis dependentAxis />
            <VictoryBar
              data={data}
              x={xAxisKey}
              y={dataKey}
              style={{ data: { fill: "#d69595" } }}
              labels={({ datum }) => `${datum[dataKey]}`}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        )}

        {type === "line" && (
          <VictoryChart
            theme={VictoryTheme.material}
            width={350}
            height={280}
          >
            <VictoryAxis tickFormat={(t) => String(t)} />
            <VictoryAxis dependentAxis />
            <VictoryLine
              data={data}
              x={xAxisKey}
              y={dataKey}
              style={{ data: { stroke: "#f1eba1", strokeWidth: 2 } }}
              labels={({ datum }) => `${datum[dataKey]}`}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        )}

        {type === "pie" && (
          <VictoryPie
            data={data}
            x={xAxisKey}
            y={dataKey}
            colorScale={COLORS}
            labels={({ datum }) => `${datum[xAxisKey]}: ${datum[dataKey]}`}
            labelComponent={<VictoryTooltip />}
            width={350}
            height={280}
          />
        )}
      </View>
    </View>
  );
}
