import { useState, useEffect, useRef, useCallback } from "react";
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

interface HourSection {
  id: string;
  targetDate: number;
  items: TrendingData[];
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
  const [sections, setSections] = useState<HourSection[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleYearChange = useCallback(
    (value: number) => {
      setYear(value);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleMonthChange = useCallback(
    (value: number) => {
      setMonth(value);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleDayChange = useCallback(
    (value: number) => {
      setDay(value);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleTimeFilterChange = useCallback(
    (value: string) => {
      setTimeFilter(value);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleCategoryFilterChange = useCallback(
    (value: string) => {
      setCategoryFilter(value);
      scrollToTop();
    },
    [scrollToTop],
  );

  const handleResetToNow = useCallback(() => {
    const current = new Date();
    setYear(current.getFullYear());
    setMonth(current.getMonth() + 1);
    setDay(current.getDate());
    setTimeFilter(String(current.getHours()).padStart(2, "0"));
    scrollToTop();
  }, [scrollToTop]);

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
  }, [
    year,
    month,
    day,
    timeFilter,
    categoryFilter,
    sortFilter,
    setSearchParams,
  ]);

  // 선택한 연/월/일과 시간 필터로 타겟 시각 구성
  const getTargetDate = (): Date => {
    const selectedHour = parseInt(timeFilter, 10) || 0;
    return new Date(year, month - 1, day, selectedHour, 0, 0);
  };

  const filterByHour = (data: TrendingData[], target: Date) =>
    data.filter((trend) => {
      if (!trend.createdAt) return false;
      const td = new Date(trend.createdAt);
      return (
        td.getFullYear() === target.getFullYear() &&
        td.getMonth() === target.getMonth() &&
        td.getDate() === target.getDate() &&
        td.getHours() === target.getHours()
      );
    });

  const applyCategoryAndSort = (items: TrendingData[]) => {
    const filtered =
      categoryFilter === "all"
        ? items
        : items.filter((item) => item.category === categoryFilter);

    if (sortFilter === "rank") {
      return [...filtered].sort((a, b) => a.rank - b.rank);
    }

    if (sortFilter === "volume") {
      return [...filtered].sort((a, b) => {
        const aVolume = parseInt(
          a.approx_traffic.replace(/[^0-9]/g, "") || "0"
        );
        const bVolume = parseInt(
          b.approx_traffic.replace(/[^0-9]/g, "") || "0"
        );
        return bVolume - aVolume;
      });
    }

    return filtered;
  };

  const parseGrowthRate = (value: string): number => {
    const normalized = value.replace(/[^0-9.-]/g, "");
    return Number(normalized) || 0;
  };

  const fetchTrendsForDate = useCallback(async (target: Date) => {
    const formatted = format(target, "yyyy-MM-dd'T'HH:mm:ss");
    const response = await api.get(
      `/trend?targetDate=${encodeURIComponent(formatted)}`
    );
    return response.data as TrendingData[];
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadInitial = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        setLoadMoreError(null);
        setHasMore(true);
        const target = getTargetDate();
        const data = await fetchTrendsForDate(target);
        if (ignore) return;
        const filtered = filterByHour(data, target);
        setSections([
          {
            id: `${target.getTime()}`,
            targetDate: target.getTime(),
            items: filtered,
          },
        ]);
      } catch (err) {
        if (ignore) return;
        console.error("트렌드 데이터를 불러오는 중 오류 발생:", err);
        setError(
          "트렌드 데이터를 불러오는 데 실패했습니다. 나중에 다시 시도해주세요."
        );
        setSections([]);
        setHasMore(false);
      } finally {
        if (!ignore) {
          setIsInitialLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [year, month, day, timeFilter, fetchTrendsForDate]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isInitialLoading || !hasMore) return;
    if (sections.length === 0) return;

    const lastSection = sections[sections.length - 1];
    const nextDate = new Date(lastSection.targetDate);
    nextDate.setHours(nextDate.getHours() - 1);

    try {
      setIsLoadingMore(true);
      setLoadMoreError(null);
      const data = await fetchTrendsForDate(nextDate);
      const filtered = filterByHour(data, nextDate);

      setSections((prev) => {
        const exists = prev.some(
          (section) => section.targetDate === nextDate.getTime()
        );
        if (exists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `${nextDate.getTime()}`,
            targetDate: nextDate.getTime(),
            items: filtered,
          },
        ];
      });
    } catch (err) {
      console.error("이전 시간대 데이터를 불러오는 중 오류 발생:", err);
      setLoadMoreError(
        "이전 시간대 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
      );
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [sections, isLoadingMore, isInitialLoading, hasMore, fetchTrendsForDate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    const node = loaderRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
    };
  }, [loadMore]);

  const handleItemClick = (id: number) => {
    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("month", String(month));
    params.set("day", String(day));
    params.set("time", timeFilter);
    params.set("category", categoryFilter);
    params.set("sort", sortFilter);
    navigate(`/trend/${id}?${params.toString()}`);
  };

  const initialDisplayItems =
    sections.length > 0 ? applyCategoryAndSort(sections[0].items) : [];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SearchHeader />
        <div className="pt-4 pb-[0.01%] sticky top-0 z-40 -mx-4 px-4 bg-background shadow-lg">
          <FilterBar
            timeFilter={timeFilter}
            categoryFilter={categoryFilter}
            sortFilter={sortFilter}
            onTimeFilterChange={handleTimeFilterChange}
            onCategoryFilterChange={handleCategoryFilterChange}
            onSortFilterChange={setSortFilter}
            year={year}
            month={month}
            day={day}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onDayChange={handleDayChange}
            onResetToNow={handleResetToNow}
          />
        </div>
        <div className="my-4">
          <p className="text-muted-foreground">
            {format(getTargetDate(), "yyyy년 M월 d일 (E) a h시", {
              locale: ko,
            })}{" "}
            기준
          </p>
          <p className="text-muted-foreground">
            {initialDisplayItems.length}개의 급상승 검색어
          </p>
        </div>

        <div className="space-y-4">
          {isInitialLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <>
              {sections.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  표시할 트렌드가 없습니다.
                </div>
              ) : (
                sections.map((section, index) => {
                  const sectionDate = new Date(section.targetDate);
                  const displayItems = applyCategoryAndSort(section.items);
                  const boundaryLabel = format(
                    sectionDate,
                    "yyyy년 M월 d일 (E) a h시",
                    {
                      locale: ko,
                    }
                  );

                  return (
                    <div key={section.id} className="space-y-4">
                      {index > 0 && (
                        <div className="flex items-center gap-4 py-6">
                          <div className="flex-1 border-t-2 border-primary/50 dark:border-primary/70" />
                          <span className="rounded-full border-2 border-primary/50 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary dark:border-primary/60 dark:bg-primary/15">
                            {boundaryLabel}
                          </span>
                          <div className="flex-1 border-t-2 border-primary/50 dark:border-primary/70" />
                        </div>
                      )}

                      {displayItems.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground/70">
                          이 시간대의 표시할 트렌드가 없습니다.
                        </div>
                      ) : (
                        displayItems.map((item) => (
                          <div
                            key={`${section.id}-${item.id}`}
                            onClick={() => handleItemClick(item.id)}
                          >
                            <TrendingItem
                              data={{
                                ...item,
                                title: item.keyword,
                                searchVolume: item.approx_traffic,
                                growthRate: parseGrowthRate(
                                  item.approx_traffic
                                ),
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  );
                })
              )}
              <div ref={loaderRef} className="h-10" />
              {isLoadingMore && (
                <div className="text-center py-6 text-muted-foreground">
                  이전 시간대 로딩 중...
                </div>
              )}
              {loadMoreError && (
                <div className="text-center py-6 text-red-500">
                  {loadMoreError}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
