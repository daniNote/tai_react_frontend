import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface FilterBarProps {
  timeFilter: string;
  categoryFilter: string;
  sortFilter: string;
  onTimeFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onSortFilterChange: (value: string) => void;
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  onYearChange: (value: number) => void;
  onMonthChange: (value: number) => void;
  onDayChange: (value: number) => void;
  onResetToNow: () => void;
}

export function FilterBar({
  timeFilter,
  categoryFilter,
  sortFilter,
  onTimeFilterChange,
  onCategoryFilterChange,
  onSortFilterChange,
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  onResetToNow,
}: FilterBarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateChange = (newYear: number, newMonth: number, newDay: number) => {
    onYearChange(newYear);
    onMonthChange(newMonth);
    onDayChange(newDay);
  };
  return (
    <div className="mb-8">
      {/* 모든 필터를 1줄에 배치 */}
      <div className="flex gap-2 sm:gap-3 flex-wrap items-stretch">
        {/* Date Picker */}
        <div className="flex-[2] min-w-[200px]">
          <DatePicker
            year={year}
            month={month}
            day={day}
            onDateChange={handleDateChange}
            onOpenChange={setIsDatePickerOpen}
          />
        </div>
        {/* Hour */}
        <div className="relative flex-shrink-0 w-[90px]">
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full text-sm sm:text-base appearance-none px-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer text-gray-700 transition-colors"
            aria-label="시간 선택"
          >
            {hours.map((h) => (
              <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}시</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        {/* Category */}
        {!isDatePickerOpen && (
        <div className="relative flex-[1.5] min-w-[150px]">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full text-sm sm:text-base appearance-none px-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer text-gray-700 transition-colors"
          >
            <option value="all">전체 카테고리</option>
            <option value="건강">건강</option>
            <option value="게임">게임</option>
            <option value="과학">과학</option>
            <option value="기술">기술</option>
            <option value="기타">기타</option>
            <option value="기후">기후</option>
            <option value="미용 및 패션">미용 및 패션</option>
            <option value="법률 및 정부">법률 및 정부</option>
            <option value="반려동물 및 동물">반려동물 및 동물</option>
            <option value="비즈니스 및 금융">비즈니스 및 금융</option>
            <option value="쇼핑">쇼핑</option>
            <option value="스포츠">스포츠</option>
            <option value="식음료">식음료</option>
            <option value="엔터테이먼트">엔터테이먼트</option>
            <option value="자동차">자동차</option>
            <option value="정치">정치</option>
            <option value="취업 및 교육">취업 및 교육</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        )}
        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetToNow}
          style={{ backgroundColor: '#4285f4' }}
          className="flex-shrink-0 px-4 py-3 text-white font-medium rounded-lg shadow-sm hover:opacity-80 active:opacity-50 transition-opacity text-center whitespace-nowrap min-w-[100px]"
        >
          현재시간
        </button>
      </div>
    </div>
  );
}

