import { Button, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiFetch } from '@/src/api/apiClient';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const [summaryData, setSummaryData] = useState<any>(null); // 전체 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();
  const year = now.toLocaleString('en-US', { year: 'numeric', timeZone: 'Asia/Seoul' });
  const month = now.toLocaleString('en-US', { month: '2-digit', timeZone: 'Asia/Seoul' });
  const day = now.toLocaleString('en-US', { day: '2-digit', timeZone: 'Asia/Seoul' });
  const today = `${year}-${month}-${day}`;

  // 금일 현황 데이터 가져오기
  const fetchSummaryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/summary/dashboard?target_date=${today}&force_refresh=true`);
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
        console.log(data.sales.target_date)
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (e) {
      setError('알 수 없는 오류가 발생했습니다.');
      console.error('Error fetching summary data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  return (
    <ScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">금일 현황</ThemedText>
        <Button title="새로 고침" onPress={fetchSummaryData} disabled={isLoading} />
      </ThemedView>

      {isLoading ? (
        <ThemedText>로딩 중...</ThemedText>
      ) : error ? (
        <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
      ) : summaryData && summaryData.customer_insights ? (
        <>
          <ThemedView style={styles.stepContainer}>
            <ThemedText>오늘 예약 수: {summaryData.customer_insights.length ?? '0'}</ThemedText>
            <ThemedText>완료된 시술: {summaryData.customer_insights.filter((v: { status: string; }) => v.status === "COMPLETED").length ?? '0'}</ThemedText>
            <ThemedText>노쇼 수: {(summaryData.customer_insights.filter((v: { status: string; }) => v.status === "NO_SHOW").length > 0) ? summaryData.customer_insights.filter((v: { status: string; }) => v.status === "NO_SHOW").length : "0"}</ThemedText>
          </ThemedView>

          <ThemedView>
            <ThemedText type="subtitle">예약 내역</ThemedText>
            {
              summaryData.customer_insights.length > 0 ? (
                summaryData.customer_insights.map((insight: any, index: number) => (
                  <ThemedText key={index}>
                    <ThemedText>
                      {insight.customer_name}
                    </ThemedText>
                    {insight.treatments.map((treatment: any, idx: number) => (
                      <ThemedText key={idx}>
                        [{idx +1}]. {treatment.menu_detail.name}
                      </ThemedText>
                    ))}
                  </ThemedText>
                ))
              ): <ThemedText>오늘 예약된 고객이 없습니다.</ThemedText>
            }
          </ThemedView>
          <ThemedView>
            <ThemedText type="subtitle">작업 완료 내역</ThemedText>
            {
              summaryData.customer_insights.filter((v: { status: string; }) => v.status === "COMPLETED").length > 0 ? (
                summaryData.customer_insights.filter((v: { status: string; }) => v.status === "COMPLETED").map((insight: any, index: number) => (
                  <ThemedText key={index}>
                    <ThemedText>
                      {insight.customer_name}
                    </ThemedText>
                    {insight.treatments.map((treatment: any, idx: number) => (
                      <ThemedText key={idx}>
                        [{idx +1}]. {treatment.menu_detail.name}
                      </ThemedText>
                    ))}
                  </ThemedText>
                ))
              ): <ThemedText>오늘 완료된 시술이 없습니다.</ThemedText>
            }
          </ThemedView>
        </>
      ) : (
        <ThemedText>데이터가 없습니다.</ThemedText>
      )}
      {/* <ThemedView>
        {
          summaryData && summaryData.sales.target_date ? (
            <Charts
              title='시술별 예상 매출 [예약 + 외상 포함]'
              data={summaryData.sales.target_date}
              dataKey='expected_price'
              type='bar'
            />
          ) : (
            <ThemedText type="subtitle">매출 데이터가 없습니다.</ThemedText>
          )
        }
      </ThemedView> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
