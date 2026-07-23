"use client";

import { useState } from "react";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const YEARS_PER_PAGE = 12;

function buildCalendarGrid(year: number, month: number) {
  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { day: number; offset: -1 | 0 | 1 }[] = [];

  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: prevMonthDays - firstDow + 1 + i, offset: -1 });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, offset: 0 });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, offset: 1 });
  }
  return cells;
}

interface DateCalendarProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
}

export function DateCalendar({ value, onChange, minDate }: DateCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [mode, setMode] = useState<"day" | "year">("day");
  const [yearPageStart, setYearPageStart] = useState(
    Math.floor(today.getFullYear() / YEARS_PER_PAGE) * YEARS_PER_PAGE
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const openYearPicker = () => {
    setYearPageStart(Math.floor(viewYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    setMode("year");
  };

  const selectYear = (year: number) => {
    setViewYear(year);
    setMode("day");
  };

  const cells = buildCalendarGrid(viewYear, viewMonth);
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i);

  return (
    <div className="mml-calendar">
      <div className="mml-calendar-head">
        <button
          type="button"
          onClick={mode === "day" ? handlePrevMonth : () => setYearPageStart((y) => y - YEARS_PER_PAGE)}
        >
          ‹
        </button>
        {mode === "day" ? (
          <button type="button" className="mml-calendar-year-toggle" onClick={openYearPicker}>
            {viewYear}년 {viewMonth + 1}월
          </button>
        ) : (
          <span>
            {yearPageStart}년 - {yearPageStart + YEARS_PER_PAGE - 1}년
          </span>
        )}
        <button
          type="button"
          onClick={mode === "day" ? handleNextMonth : () => setYearPageStart((y) => y + YEARS_PER_PAGE)}
        >
          ›
        </button>
      </div>

      {mode === "day" ? (
        <div className="mml-calendar-grid">
          {DOW.map((d) => (
            <div key={d} className="dow">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            const isSelected =
              cell.offset === 0 &&
              value?.getFullYear() === viewYear &&
              value?.getMonth() === viewMonth &&
              value?.getDate() === cell.day;
            const cellDate = new Date(viewYear, viewMonth, cell.day);
            const isDisabled = cell.offset === 0 && minDate !== undefined && cellDate < minDate;
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                className={`${cell.offset !== 0 ? "muted" : ""}${isSelected ? " selected" : ""}`}
                onClick={() => cell.offset === 0 && !isDisabled && onChange(cellDate)}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mml-calendar-year-grid">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={year === viewYear ? "selected" : ""}
              onClick={() => selectYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
