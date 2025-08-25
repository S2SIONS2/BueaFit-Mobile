import React, { useCallback, useEffect, useState } from 'react';
import { Button, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import Charts from '@/components/Charts';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiFetch } from '@/src/api/apiClient';

export default function HomeScreen() {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // 차트 강제 리마운트용(옵션)

  const now = new Date();
  const year = now.toLocaleString('en-US', { year: 'numeric', timeZone: 'Asia/Seoul' });
  const month = now.toLocaleString('en-US', { month: '2-digit', timeZone: 'Asia/Seoul' });
  const day = now.toLocaleString('en-US', { day: '2-digit', timeZone: 'Asia/Seoul' });
  const today = `${year}-${month}-${day}`;

  // 대시보드 전체 데이터 로드(버튼/당겨서새로고침/초기마운트 모두 여기로)
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 캐시 우회가 필요하면 아래처럼 타임스탬프를 추가하세요: &t=${Date.now()}
      const res = await apiFetch(`/summary/dashboard?target_date=${today}&force_refresh=true`);
      if (!res.ok) throw new Error('response not ok');
      const data = await res.json();
      setSummaryData(data);
      setRefreshKey(k => k + 1); // 차트가 변화 감지를 못할 때 유용
    } catch (e) {
      console.error('Error fetching summary data:', e);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  // 최초 1회 로드
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <ScrollView
      style={{ padding: 16, backgroundColor: '#fff', paddingBottom: 300 }}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadDashboard} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedView>
          <ThemedText type="title">금일 현황</ThemedText>
          <Button title="새로 고침" onPress={loadDashboard} disabled={isLoading} />
        </ThemedView>
        <ThemedText type="subtitle" style={{ width: 100 }}>{today}</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ThemedText>로딩 중...</ThemedText>
      ) : error ? (
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      ) : summaryData && summaryData.customer_insights ? (
        <>
          <ThemedView style={styles.stepContainer}>
            <ThemedView style={styles.stepToday}>
              <ThemedText style={{ color: '#fff', marginBottom: 7 }}>오늘 예약 수</ThemedText>
              <ThemedText style={styles.fontLarge}>
                {summaryData.customer_insights.length ?? '0'}건
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.stepComplete}>
              <ThemedText style={{ color: '#fff', marginBottom: 7 }}>완료된 시술</ThemedText>
              <ThemedText style={styles.fontLarge}>
                {summaryData.customer_insights.filter((v: { status: string }) => v.status === 'COMPLETED').length ?? '0'}건
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.stepNoshow}>
              <ThemedText style={{ color: '#fff', marginBottom: 7 }}>노쇼 수</ThemedText>
              <ThemedText style={styles.fontLarge}>
                {
                  (summaryData.customer_insights.filter((v: { status: string }) => v.status === 'NO_SHOW').length > 0)
                    ? summaryData.customer_insights.filter((v: { status: string }) => v.status === 'NO_SHOW').length
                    : '0'
                }건
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView>
            <ThemedText type="subtitle">예약 내역</ThemedText>
            {
              summaryData.customer_insights.length > 0 ? (
                summaryData.customer_insights.map((insight: any, index: number) => (
                  <ThemedText key={index}>
                    <ThemedText>{insight.customer_name}</ThemedText>
                    {insight.treatments.map((t: any, idx: number) => (
                      <ThemedText key={idx}>[{idx + 1}]. {t.menu_detail.name}</ThemedText>
                    ))}
                  </ThemedText>
                ))
              ) : <ThemedText>오늘 예약된 고객이 없습니다.</ThemedText>
            }
          </ThemedView>

          <ThemedView>
            <ThemedText type="subtitle">작업 완료 내역</ThemedText>
            {
              summaryData.customer_insights.some((v: any) => v.status === 'COMPLETED') ? (
                summaryData.customer_insights
                  .filter((v: any) => v.status === 'COMPLETED')
                  .map((insight: any, index: number) => (
                    <ThemedText key={index}>
                      <ThemedText>{insight.customer_name}</ThemedText>
                      {insight.treatments.map((t: any, idx: number) => (
                        <ThemedText key={idx}>[{idx + 1}]. {t.menu_detail.name}</ThemedText>
                      ))}
                    </ThemedText>
                  ))
              ) : <ThemedText>오늘 완료된 시술이 없습니다.</ThemedText>
            }
          </ThemedView>
        </>
      ) : (
        <ThemedText>데이터가 없습니다.</ThemedText>
      )}

      <ThemedView>
        {summaryData?.sales?.target_date ? (
          <Charts
            key={`expected-${refreshKey}`}
            title="시술별 예상 매출 [예약 + 외상 포함]"
            data={summaryData.sales.target_date}
            dataKey="expected_price"
            type="bar"
          />
        ) : <ThemedText type="subtitle">매출 데이터가 없습니다.</ThemedText>}
      </ThemedView>

      <ThemedView>
        {summaryData?.sales?.target_date ? (
          <Charts
            key={`actual-${refreshKey}`}
            title="시술별 매출 [결제 완료 건]"
            data={summaryData.sales.target_date}
            dataKey="actual_price"
            type="bar"
          />
        ) : <ThemedText type="subtitle">매출 데이터가 없습니다.</ThemedText>}
      </ThemedView>

      <ThemedView>
        {summaryData?.staff_summary?.target_date ? (
          <Charts
            key={`staff-${refreshKey}`}
            title="직원별 시술 건수"
            data={summaryData.staff_summary.target_date}
            dataKey="count"
            type="pie"
          />
        ) : <ThemedText type="subtitle">직원별 시술 데이터가 없습니다.</ThemedText>}
      </ThemedView>

      <ThemedView>
        {summaryData?.sales?.target_date ? (
          <Charts
            key={`count-${refreshKey}`}
            title="시술별 건수"
            data={summaryData.sales.target_date}
            dataKey="count"
            type="bar"
          />
        ) : <ThemedText type="subtitle">시술별 건수 데이터가 없습니다.</ThemedText>}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  stepToday: {
    backgroundColor: '#b47aea',
    borderRadius: 7,
    padding: 20,
  },
  stepComplete: {
    backgroundColor: '#3bd69dff',
    borderRadius: 7,
    padding: 20,
  },
  stepNoshow: {
    backgroundColor: '#f87171',
    borderRadius: 7,
    padding: 20,
  },
  fontLarge: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#fff',
  },
});
