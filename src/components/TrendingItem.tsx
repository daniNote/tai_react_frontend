import { TrendingUp } from "lucide-react";

export interface TrendingData {
  id: number;
  rank: number;
  title: string;
  searchVolume: string;
  category: string;
  growthRate: number;
  description: string;
  tags: string[];
  createdAt: string;
}

interface TrendingItemProps {
  data: TrendingData;
  onClick?: () => void;
}

export function TrendingItem({ data, onClick }: TrendingItemProps) {
  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <span>{data.rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-blue-600 dark:text-blue-300">{data.title}</h3>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 flex-shrink-0">
              <TrendingUp size={16} />
              <span>+{data.growthRate.toLocaleString()}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <span>{data.category}</span>
          </div>

          <p className="text-foreground/80 dark:text-foreground mb-4">
            {data.description}
          </p>

          <div className="flex gap-2 flex-wrap">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-2">
            {formatDate(data.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
