import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchHeader } from "./SearchHeader";
import { FilterBar } from "./FilterBar";
import { TrendingItem } from "./TrendingItem";
import api from "../api/axiosConfig";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TrendingData {
  id: number;
  region: string;
  rank: number;
  keyword: string;
  description: string;
  approx_traffic: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export function TrendingList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const now = new Date();
  
  // URL 쿼리 파라미터에서 초기값 가져오기
  const [year, setYear] = useState<number>(
    parseInt(searchParams.get("year") || "") || now.getFullYear()
  );
  const [month, setMonth] = useState<number>(
    parseInt(searchParams.get("month") || "") || now.getMonth() + 1
  );
  const [day, setDay] = useState<number>(
    parseInt(searchParams.get("day") || "") || now.getDate()
  );
  const [timeFilter, setTimeFilter] = useState(
    searchParams.get("time") || String(now.getHours()).padStart(2, "0")
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );
  const [sortFilter, setSortFilter] = useState(
    searchParams.get("sort") || "rank"
  );
  const [trends, setTrends] = useState<TrendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태가 변경될 때마다 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("month", String(month));
    params.set("day", String(day));
    params.set("time", timeFilter);
    params.set("category", categoryFilter);
    params.set("sort", sortFilter);
    setSearchParams(params, { replace: true });
  }, [year, month, day, timeFilter, categoryFilter, sortFilter, setSearchParams]);

  // 선택한 연/월/일과 시간 필터로 타겟 시각 구성
  const getTargetDate = (): Date => {
    const selectedHour = parseInt(timeFilter, 10) || 0;
    return new Date(year, month - 1, day, selectedHour, 0, 0);
  };

  const handleItemClick = (id: number) => {
    // 현재 필터 상태를 쿼리 파라미터로 전달
    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("month", String(month));
    params.set("day", String(day));
    params.set("time", timeFilter);
    params.set("category", categoryFilter);
    params.set("sort", sortFilter);
    navigate(`/trend/${id}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const formatted = format(getTargetDate(), "yyyy-MM-dd'T'HH:mm:ss");
        const response = await api.get(`/trend?targetDate=${encodeURIComponent(formatted)}`);
        setTrends(response.data);
        setError(null);
      } catch (err) {
        console.error("트렌드 데이터를 불러오는 중 오류 발생:", err);
        setError(
          "트렌드 데이터를 불러오는 데 실패했습니다. 나중에 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [year, month, day, timeFilter]);

  const filteredData = trends
    .filter((trend) => {
      // 시간대를 클라이언트에서도 엄격히 검증 (서버가 시간 무시 시 대비)
      if (!trend.createdAt) return false;
      const td = new Date(trend.createdAt);
      const gd = getTargetDate();
      const sameHour =
        td.getFullYear() === gd.getFullYear() &&
        td.getMonth() === gd.getMonth() &&
        td.getDate() === gd.getDate() &&
        td.getHours() === gd.getHours();
      if (!sameHour) return false;

      // 카테고리 필터 적용
      if (categoryFilter === "all") return true;
      return trend.category === categoryFilter;
    })
    .sort((a, b) => {
      if (sortFilter === "rank") {
        return a.rank - b.rank;
      } else if (sortFilter === "volume") {
        const aVolume = parseInt(
          a.approx_traffic.replace(/[^0-9]/g, "") || "0"
        );
        const bVolume = parseInt(
          b.approx_traffic.replace(/[^0-9]/g, "") || "0"
        );
        return bVolume - aVolume;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SearchHeader />
        <FilterBar
          timeFilter={timeFilter}
          categoryFilter={categoryFilter}
          sortFilter={sortFilter}
          onTimeFilterChange={setTimeFilter}
          onCategoryFilterChange={setCategoryFilter}
          onSortFilterChange={setSortFilter}
          year={year}
          month={month}
          day={day}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onDayChange={setDay}
          onResetToNow={() => {
            const n = new Date();
            setYear(n.getFullYear());
            setMonth(n.getMonth() + 1);
            setDay(n.getDate());
            setTimeFilter(String(n.getHours()).padStart(2, "0"));
          }}
        />

        <div className="mb-6">
          <p className="text-gray-600">{format(getTargetDate(), "yyyy년 M월 d일 (E) a h시", { locale: ko })} 기준</p>
          <p className="text-gray-600">
            {filteredData.length}개의 급상승 검색어
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              표시할 트렌드가 없습니다.
            </div>
          ) : (
            filteredData.map((item) => (
              <div key={item.id} onClick={() => handleItemClick(item.id)}>
                <TrendingItem
                  data={{
                    ...item,
                    title: item.keyword,
                    searchVolume: item.approx_traffic,
                    growthRate: Number(
                      item.approx_traffic.replace("+", "").replace(",", "")
                    ),
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
