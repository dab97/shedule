import { ScheduleItem } from "@/types/schedule";

export const DAYS_ORDER: Record<string, number> = {
    "пн": 1, "понедельник": 1,
    "вт": 2, "вторник": 2,
    "ср": 3, "среда": 3,
    "чт": 4, "четверг": 4,
    "пт": 5, "пятница": 5,
    "сб": 6, "суббота": 6,
    "вс": 7, "воскресенье": 7,
};

export const DAYS_OF_WEEK = [
    { id: "monday", label: "Пн" },
    { id: "tuesday", label: "Вт" },
    { id: "wednesday", label: "Ср" },
    { id: "thursday", label: "Чт" },
    { id: "friday", label: "Пт" },
    { id: "saturday", label: "Сб" },
];

export const TIME_SLOTS = [
    "08.30 - 10.00",
    "10.10 - 11.40",
    "12.10 - 13.40",
    "13.50 - 15.20",
    "15.30 - 17.00",
    "17.10 - 18.40",
    "18.50 - 20.20",
    "20.30 - 22.00",
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 25;

export const TABLE_COLUMNS: { key: keyof ScheduleItem; label: string; className?: string }[] = [
    { key: "group", label: "Группа", className: "w-40" },
    { key: "dayOfWeek", label: "День недели" },
    { key: "date", label: "Дата" },
    { key: "time", label: "Время", className: "w-28" },
    { key: "subject", label: "Дисциплина" },
    { key: "lessonType", label: "Вид занятия" },
    { key: "teacher", label: "Преподаватель" },
    { key: "classroom", label: "Аудитория" },
];

export const STORAGE_KEYS = {
    SELECTED_GROUP: "selectedGroup",
    SELECTED_TEACHER: "selectedTeacher",
} as const;

export const DATE_FORMATS = {
    FULL: "dd.MM.yyyy",
    SHORT: "dd.MM",
} as const;

export const BREAKPOINTS = {
    SM: 640,
} as const;

export const API_ENDPOINTS = {
    SCHEDULE: "/api/schedule/",
    CALENDAR: "/api/calendar/",
} as const;

export const REFRESH_INTERVAL = 60000;
