import { YMDDate } from "../types";

export function YMDToQueryDate(date: YMDDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function YMDToDisplayDate(date: YMDDate): string {
  return `${date.year}년 ${String(date.month).padStart(2, "0")}월 ${String(date.day).padStart(2, "0")}일`;
}