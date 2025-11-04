import { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  year: number;
  month: number;
  day: number;
  onDateChange: (year: number, month: number, day: number) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function DatePicker({ year, month, day, onDateChange, onOpenChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create Date object from year, month, day
  const selectedDate = new Date(year, month - 1, day);

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

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      const newYear = value.getFullYear();
      const newMonth = value.getMonth() + 1;
      const newDay = value.getDate();
      onDateChange(newYear, newMonth, newDay);
      setIsOpen(false);
    }
  };

  const formatDate = (y: number, m: number, d: number) => {
    return `${y}년 ${m}월 ${d}일`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm sm:text-base px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 cursor-pointer text-gray-700 transition-colors flex items-center justify-between"
        aria-label="날짜 선택"
      >
        <span>{formatDate(year, month, day)}</span>
        <CalendarIcon size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="ko-KR"
            formatDay={(locale, date) => date.getDate().toString()}
            calendarType="gregory"
            next2Label={null}
            prev2Label={null}
          />
        </div>
      )}
    </div>
  );
}
