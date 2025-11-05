import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Share2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { ThemeToggle } from "./ThemeToggle";

interface LLMResult {
  keyword: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  refered: string[];
}

interface TrendingDetailData {
  id: number;
  region: string;
  rank: number;
  approx_traffic: string;
  createdAt: string | null;
  llmResult: LLMResult;
}

export function TrendingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TrendingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL에서 쿼리 파라미터 가져오기
  const queryParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const fetchTrendingDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trend/${id}`);
        console.log("API Response:", response.data); // Add this line to debug
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("트렌드 상세 정보를 불러오는 중 오류 발생:", err);
        setError("트렌드 상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrendingDetail();
    }
  }, [id]);

  const handleBack = () => {
    // 쿼리 파라미터를 유지하면서 목록으로 돌아가기
    const queryString = queryParams.toString();
    navigate(queryString ? `/?${queryString}` : '/');
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "데이터 없음";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center transition-colors duration-300">
        <div className="text-center text-red-500">
          {error || "데이터를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  // AI 요약 정보
  const aiSummary = {
    summary: data.llmResult.content || "AI 분석 내용이 없습니다.",
    sources: data.llmResult.refered?.length || 0,
    keyPoints: data.llmResult.tags?.slice(0, 3) || [],
  };

  // 관련 기사 목록
  const relatedArticles =
    data.llmResult.refered?.map((source, index) => ({
      title: `관련 기사 ${index + 1}: ${data.llmResult.keyword} 관련 기사`,
      source: source || "뉴스 출처",
      time: "최근",
    })) || [];

  // 트렌드 차트 데이터 (API에 따라 수정 필요)
  const chartData = [
    { time: "00:00", value: 20 },
    { time: "04:00", value: 35 },
    { time: "08:00", value: 55 },
    { time: "12:00", value: 80 },
    { time: "16:00", value: 100 },
    { time: "20:00", value: 75 },
    { time: "24:00", value: 60 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>목록으로 돌아가기</span>
          </button>
          <ThemeToggle />
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-8 mb-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 rounded-full text-sm">
                  #{data.rank}
                </span>
                <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                  {data.llmResult.category}
                </span>
              </div>
              <h1 className="text-blue-600 dark:text-blue-300 mb-4">
                {data.llmResult.keyword}
              </h1>
            </div>

            <div className="flex gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Share2 size={20} className="text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Bookmark size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 mb-6">
            <div className="flex-1 p-4 bg-muted rounded-lg transition-colors">
              <p className="text-muted-foreground text-sm mb-1">검색량</p>
              <p className="text-foreground">{data.approx_traffic || "N/A"}</p>
            </div>
            <div className="flex-1 p-4 bg-muted rounded-lg transition-colors">
              <p className="text-muted-foreground text-sm mb-1">데이터 시간</p>
              <p className="text-foreground text-sm">
                {formatDate(data.createdAt)}
              </p>
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="flex iteddms-center gap-3 mb-4">
            <h2 className="text-purple-700 dark:text-purple-300">AI 한줄 요약</h2>
          </div>
          <p className="text-foreground/80">
            {data.llmResult.description || "상세 설명이 없습니다."}
          </p>
          <br></br>
          <div className="flex iteddms-center gap-3 mb-4">
            <h2 className="text-purple-700 dark:text-purple-300">AI 원문 요약</h2>
          </div>
          <p className="text-foreground leading-relaxed">{aiSummary.summary}</p>
          <br></br>
          <div className="mb-6">
            <h3 className="mb-3">관련 태그</h3>
            <div className="flex gap-2 flex-wrap">
              {data.llmResult.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Trend Chart
          <div>
            <h3 className="mb-4">검색량 추이 (24시간)</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-end justify-between h-48 gap-2">
                {chartData.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-40">
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                        style={{ height: `${(point.value / maxValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{point.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        {/* Related Articles */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm transition-colors">
          <h2 className="mb-4">관련 뉴스</h2>
          <div className="space-y-4">
            {relatedArticles.map((article, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => window.open(`${article.source}`, "_blank")}
              >
                <h4 className="mb-2">{article.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {/* 뉴스 URL */}
                  <span className="overflow-hidden">{article.source}</span>
                  {/* 뉴스 시간 */}
                  {/* <span>{article.time}</span> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
