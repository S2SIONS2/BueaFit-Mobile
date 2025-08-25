import React from "react";
import { Text, View } from "react-native";
import {
  Bar as CartesianBar,
  CartesianChart,
  Line as CartesianLine,
  Pie,
  PolarChart,
} from "victory-native";

type ChartType = "bar" | "line" | "pie";

interface ChartsProps {
  title: string;
  data: ({ name?: string; staff_name?: string } & { [k: string]: number | string })[];
  dataKey: string;                 // y축/값으로 사용할 키
  type: ChartType;
  height?: number;                 // 차트 높이 (기본 288)
  showLegend?: boolean;            // 범례 표시 여부 (기본 true)
  formatValue?: (n: number) => string; // 값 포맷터 (기본: 1,000 단위)
}

export default function Charts({
  title,
  data,
  dataKey,
  type,
  height = 288,
  showLegend = true,
  formatValue = (n) => n.toLocaleString(),
}: ChartsProps) {
  // 팔레트 (오타 수정: '#aa95d6', '#f1eba1' 포함)
  const COLORS = ["#959dd6", "#c0d695", "#ffc658", "#ff8042", "#d69595", "#aa95d6", "#f1eba1"];

  // 1) 빈 데이터 처리
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
          {title}
        </Text>
        <View
          style={{
            height,
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#6b7280" }}>데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 2) x/y 키 결정 (웹 코드와 동일 로직 유지)
  type Row = (typeof data)[number];
  const xKey = (data?.[0]?.name ? "name" : "staff_name") as keyof Row & string;
  const yKey = dataKey as keyof Row & string;

  // 3) 키 존재 검증 (bar/line만 엄격 체크; pie는 아래에서 안전 변환)
  const keysMissing =
    typeof data[0]?.[xKey] === "undefined" || typeof data[0]?.[yKey] === "undefined";

  // 4) 숫자 보정 (bar/line/pie 공통)
  const normalized = data.map((d) => ({
    ...d,
    [yKey]: Number(d[yKey] ?? 0),
  })) as (Row & { [K in typeof yKey]: number })[];

  // 1) 색상 필드 부여 (normalized 만든 다음)
  const withBarColors = normalized.map((d, i) => ({
    ...d,
    __color: COLORS[i % COLORS.length],
  }));

  // 5) 파이 전용(값/라벨/색상 보장)
  const withColor = normalized.map((d, i) => ({
    ...d,
    __label: String(d[xKey] ?? ""),                 // 라벨 문자열 보장
    __value: Number(d[yKey] ?? 0),                  // 값 숫자 보장
    __color: COLORS[i % COLORS.length],             // 고정 팔레트
  }));

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
        {title}
      </Text>

      {/* 상단 요약 배지 (툴팁 느낌) */}
      <View
        style={{
          alignSelf: "flex-end",
          backgroundColor: "#eef2ff",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          marginBottom: 8,
        }}
      >
      </View>

      <View
        style={{
          height,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          overflow: "hidden",
          paddingHorizontal: 8,
          paddingVertical: 10,
        }}
      >
        {/* Bar */}
        {type === "bar" && !keysMissing && (
          <CartesianChart data={normalized} xKey={xKey} yKeys={[yKey] as const}>
            {({ points, chartBounds }) =>
              points[yKey].map((p, i) => (
                <CartesianBar
                  key={`bar-${i}`}
                  points={[p]}                   // 한 개씩 렌더링
                  chartBounds={chartBounds}
                  color={COLORS[i % COLORS.length]}  // 팔레트에서 색상 선택
                  roundedCorners={{ topLeft: 6, topRight: 6 }}
                />
              ))
            }
          </CartesianChart>
        )}

        {/* Line */}
        {type === "line" && !keysMissing && (
          <CartesianChart data={normalized} xKey={xKey} yKeys={[yKey] as const}>
            {({ points }) => (
              <CartesianLine
                points={points[yKey]}
                color="#f1eba1"
                strokeWidth={2}
              />
            )}
          </CartesianChart>
        )}

        {/* Pie */}
        {type === "pie" && (
          <PolarChart
            data={withColor}
            valueKey="__value"
            labelKey="__label"
            colorKey="__color"
          >
            <Pie.Chart />
          </PolarChart>
        )}
      </View>

      {/* 범례 (Legend) */}
      {showLegend && (
        <View style={{ marginTop: 10, gap: 8 }}>
          {(type === "pie" ? withColor : normalized).map((d, i) => {
            const label = type === "pie" ? d.__label : String(d[xKey] ?? "");
            const value = type === "pie" ? d.__value : Number(d[yKey] ?? 0);
            const color =
              type === "pie" ? d.__color : COLORS[i % COLORS.length];

            return (
              <View
                key={`legend-${i}`}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: color,
                  }}
                />
                <Text style={{ fontSize: 12, color: "#374151", flex: 1 }} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {formatValue(value)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

