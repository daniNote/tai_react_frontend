import { useState, useRef, useEffect, useMemo } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  year: number;
  month: number;
  day: number;
  onDateChange: (year: number, month: number, day: number) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function DatePicker({
  year,
  month,
  day,
  onDateChange,
  onOpenChange,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => new Date(year, month - 1, day), [year, month, day]);
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDate);

  // Create Date object from year, month, day
  useEffect(() => {
    setVisibleMonth(selectedDate);
  }, [selectedDate]);

  // Notify parent when open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysToRender = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 });
    const days: Date[] = [];
    let current = start;

    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  }, [visibleMonth]);

  const handleDayClick = (value: Date) => {
    onDateChange(value.getFullYear(), value.getMonth() + 1, value.getDate());
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm sm:text-base px-4 py-3 bg-card border border-border rounded-lg shadow-sm transition-colors hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 cursor-pointer text-foreground flex items-center justify-between"
        aria-label="날짜 선택"
      >
        <span>{format(selectedDate, "yyyy년 M월 d일", { locale: ko })}</span>
        <CalendarIcon size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-[9999] w-72 rounded-lg border border-border bg-card p-4 shadow-xl">
          <div className="flex items-center justify-between text-foreground">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => subMonths(current, 1))}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="이전 달"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="text-sm font-semibold">
              {format(visibleMonth, "yyyy년 M월", { locale: ko })}
            </div>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="다음 달"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {["일", "월", "화", "수", "목", "금", "토"].map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {daysToRender.map((date) => {
              const inMonth = isSameMonth(date, visibleMonth);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    inMonth ? "text-foreground" : "text-muted-foreground",
                    isSelected
                      ? "bg-blue-500 text-white hover:bg-blue-500"
                      : "hover:bg-blue-500/20",
                    isToday && !isSelected ? "border border-blue-400/60" : "border border-transparent",
                  ].join(" ")}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>오늘: {format(new Date(), "yyyy.MM.dd", { locale: ko })}</span>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDayClick(today);
              }}
              className="rounded-md px-2 py-1 font-medium text-blue-500 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              오늘로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
