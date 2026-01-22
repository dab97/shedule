"use client";

import useSWR from "swr";
import { ScheduleItem } from "@/types/schedule";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    RotateCcw,
    Users,
    CalendarDays,
    Clock,
    FileText,
    User,
    AlertOctagon,
    Eye,
    EyeOff,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    SlidersHorizontal,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useTransition } from "react";
import { parse, isValid } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Стандартные тайм-слоты из calendar (schedule-view.tsx)
const VALID_TIME_SLOTS = [
    "08.30 - 10.00",
    "10.10 - 11.40",
    "12.10 - 13.40",
    "13.50 - 15.20",
    "15.30 - 17.00",
    "17.10 - 18.40",
    "18.50 - 20.20",
    "20.30 - 22.00",
];

// Допустимые дни недели
const VALID_DAYS = ["пн", "вт", "ср", "чт", "пт", "сб"];

interface InvisibleRecord {
    item: ScheduleItem;
    index: number;
    reasons: string[];
}

export default function DebugPage() {
    const { data: schedule, error, isLoading, mutate } = useSWR<ScheduleItem[]>(
        "/api/schedule/",
        fetcher
    );
    const [showDetails, setShowDetails] = useState(false);
    const [isTableReady, setIsTableReady] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [showAllDuplicates, setShowAllDuplicates] = useState(false);
    const [showAllInvisible, setShowAllInvisible] = useState(false);

    // Обработчик показа таблицы с отложенным рендерингом
    const handleToggleDetails = () => {
        if (!showDetails) {
            setShowDetails(true);
            startTransition(() => {
                setIsTableReady(true);
            });
        } else {
            setShowDetails(false);
            setIsTableReady(false);
        }
    };

    // Фильтр и сортировка таблицы
    const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'invisible'>('all');
    const [sortField, setSortField] = useState<'group' | 'date' | 'teacher' | 'time' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Состояние обновления
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Обработчик кнопки "Обновить"
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await mutate();
        } finally {
            setIsRefreshing(false);
        }
    };

    // Вычисляем статистику и проверки
    const stats = useMemo(() => {
        if (!schedule) return null;

        const uniqueGroups = new Set(schedule.map(item => item.group));
        const uniqueTeachers = new Set(schedule.map(item => item.teacher));
        const uniqueDates = new Set(schedule.map(item => item.date));
        const uniqueSubjects = new Set(schedule.map(item => item.subject));
        const uniqueTimeSlots = new Set(schedule.map(item => item.time));

        // Проверяем на пустые поля
        const emptyFields = {
            group: schedule.filter(item => !item.group || item.group.trim() === '').length,
            date: schedule.filter(item => !item.date || item.date.trim() === '').length,
            time: schedule.filter(item => !item.time || item.time.trim() === '').length,
            subject: schedule.filter(item => !item.subject || item.subject.trim() === '').length,
            teacher: schedule.filter(item => !item.teacher || item.teacher.trim() === '').length,
            classroom: schedule.filter(item => !item.classroom || item.classroom.trim() === '').length,
        };

        // Дубликаты (по ключу группа-дата-время-преподаватель-предмет)
        const keyCount = new Map<string, number>();
        schedule.forEach(item => {
            const key = `${item.group} | ${item.date} | ${item.time} | ${item.teacher} | ${item.subject}`;
            keyCount.set(key, (keyCount.get(key) || 0) + 1);
        });
        const duplicates = Array.from(keyCount.entries()).filter(([, count]) => count > 1);

        // === КРИТИЧЕСКИЕ ПРОВЕРКИ ДЛЯ ОТОБРАЖЕНИЯ В КАЛЕНДАРЕ ===

        // 1. Проверка тайм-слотов
        const invalidTimeSlots: { item: ScheduleItem; index: number }[] = [];
        schedule.forEach((item, index) => {
            if (item.time && !VALID_TIME_SLOTS.includes(item.time)) {
                invalidTimeSlots.push({ item, index: index + 1 });
            }
        });

        // 2. Проверка формата даты (dd.MM.yyyy)
        const invalidDates: { item: ScheduleItem; index: number }[] = [];
        schedule.forEach((item, index) => {
            if (item.date) {
                const parsed = parse(item.date, "dd.MM.yyyy", new Date());
                if (!isValid(parsed)) {
                    invalidDates.push({ item, index: index + 1 });
                }
            }
        });

        // 3. Проверка дня недели
        const invalidDays: { item: ScheduleItem; index: number }[] = [];
        schedule.forEach((item, index) => {
            if (item.dayOfWeek) {
                const dayLower = item.dayOfWeek.toLowerCase();
                const hasValidDay = VALID_DAYS.some(d => dayLower.includes(d));
                if (!hasValidDay) {
                    invalidDays.push({ item, index: index + 1 });
                }
            }
        });

        // 4. Сводка: записи которые НЕ отобразятся в календаре
        const invisibleRecords: InvisibleRecord[] = [];
        schedule.forEach((item, index) => {
            const reasons: string[] = [];

            // Проверка времени
            if (item.time && !VALID_TIME_SLOTS.includes(item.time)) {
                reasons.push(`Время "${item.time}" не совпадает со слотами календаря`);
            }

            // Проверка даты
            if (item.date) {
                const parsed = parse(item.date, "dd.MM.yyyy", new Date());
                if (!isValid(parsed)) {
                    reasons.push(`Неверный формат даты "${item.date}"`);
                }
            } else {
                reasons.push("Дата не указана");
            }

            // Проверка дня недели
            if (item.dayOfWeek) {
                const dayLower = item.dayOfWeek.toLowerCase();
                const hasValidDay = VALID_DAYS.some(d => dayLower.includes(d));
                if (!hasValidDay) {
                    reasons.push(`День недели "${item.dayOfWeek}" не распознан`);
                }
            }

            if (reasons.length > 0) {
                invisibleRecords.push({ item, index: index + 1, reasons });
            }
        });

        return {
            total: schedule.length,
            groups: uniqueGroups.size,
            teachers: uniqueTeachers.size,
            dates: uniqueDates.size,
            subjects: uniqueSubjects.size,
            timeSlots: uniqueTimeSlots.size,
            emptyFields,
            duplicates,
            hasEmptyFields: Object.values(emptyFields).some(v => v > 0),
            hasDuplicates: duplicates.length > 0,
            // Новые проверки
            invalidTimeSlots,
            invalidDates,
            invalidDays,
            invisibleRecords,
            hasInvalidTimeSlots: invalidTimeSlots.length > 0,
            hasInvalidDates: invalidDates.length > 0,
            hasInvalidDays: invalidDays.length > 0,
            hasInvisibleRecords: invisibleRecords.length > 0,
        };
    }, [schedule]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-muted" />
                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Загрузка данных...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8">
                <Card className="border-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            Ошибка загрузки
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="text-xs font-mono">Debug</Badge>
                    Проверка данных расписания
                </h1>
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                    {isRefreshing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    {isRefreshing ? "Обновление..." : "Обновить"}
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid grid-cols-3 max-w-md mx-auto">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="checks">Проверки</TabsTrigger>
                    <TabsTrigger value="details">Детали</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">

                    {/* КРИТИЧЕСКАЯ СЕКЦИЯ: Невидимые записи */}
                    {stats?.hasInvisibleRecords && (
                        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <AlertOctagon className="h-5 w-5" />
                                    КРИТИЧНО: {stats.invisibleRecords.length} записей НЕ отображаются в календаре!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-600 mb-4">
                                    Эти записи есть в Google Sheets, но студенты и преподаватели их НЕ видят!
                                </p>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {(showAllInvisible ? stats.invisibleRecords : stats.invisibleRecords.slice(0, 5)).map(({ item, index, reasons }) => (
                                        <div key={index} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="font-mono">#{index}</Badge>
                                                        <span className="font-semibold">{item.group}</span>
                                                        <span className="text-muted-foreground">|</span>
                                                        <span>{item.date}</span>
                                                        <span className="text-muted-foreground">|</span>
                                                        <span className="text-red-600 font-medium">{item.time}</span>
                                                    </div>
                                                    <p className="text-sm mt-1">{item.subject}</p>
                                                    <div className="mt-2 space-y-1">
                                                        {reasons.map((reason, i) => (
                                                            <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                                                                <EyeOff className="h-3 w-3" />
                                                                {reason}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.invisibleRecords.length > 5 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-red-600"
                                            onClick={() => setShowAllInvisible(!showAllInvisible)}
                                        >
                                            {showAllInvisible
                                                ? "Скрыть"
                                                : `Показать все ${stats.invisibleRecords.length} записей`}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Индикатор: всё ОК */}
                    {!stats?.hasInvisibleRecords && (
                        <Card className="border border-green-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Eye className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-600">Все записи отображаются в календаре</p>
                                        <p className="text-sm text-muted-foreground">
                                            Все {stats?.total} записей из Google Sheets корректно попадают в календарь
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Общая статистика */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Занятий</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.total || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Группы</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.groups || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Преподаватели</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.teachers || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Учебные дни</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.dates || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Временные слоты</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.timeSlots || 0}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Дисциплины</span>
                                </div>
                                <p className="text-3xl font-bold font-mono tabular-nums">{stats?.subjects || 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="checks" className="space-y-6">
                    {/* Проверки: Тайм-слоты */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className={stats?.hasInvalidTimeSlots ? "border border-red-500" : "border border-green-500"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {stats?.hasInvalidTimeSlots ? (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <span>Формат времени</span>
                                </CardTitle>
                                <CardDescription>
                                    Проверка корректности записи времени (ЧЧ:ММ - ЧЧ:ММ)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.hasInvalidTimeSlots ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-red-600 mb-2">
                                            Найдено {stats.invalidTimeSlots.length} записей с нестандартным временем.
                                            Они не отобразятся в календаре!
                                        </p>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {stats.invalidTimeSlots.slice(0, 10).map(({ item, index }) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="truncate">#{index} {item.group} — {item.date}</span>
                                                    <Badge variant="destructive">{item.time}</Badge>
                                                </div>
                                            ))}
                                            {stats.invalidTimeSlots.length > 10 && (
                                                <p className="text-xs text-muted-foreground">
                                                    ...и ещё {stats.invalidTimeSlots.length - 10}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs text-muted-foreground">Допустимые слоты:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {VALID_TIME_SLOTS.map(slot => (
                                                    <Badge key={slot} variant="outline" className="text-xs">{slot}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900 dark:text-green-100">Всё отлично!</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">Все записи имеют корректный формат времени</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Проверка формата даты */}
                        <Card className={stats?.hasInvalidDates ? "border border-red-500" : "border border-green-500"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {stats?.hasInvalidDates ? (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <span>Формат даты</span>
                                </CardTitle>
                                <CardDescription>
                                    Проверка корректности записи даты (ДД.ММ.ГГГГ)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.hasInvalidDates ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-red-600">
                                            Найдено {stats.invalidDates.length} записей с некорректной датой (ожидается dd.MM.yyyy)
                                        </p>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {stats.invalidDates.slice(0, 10).map(({ item, index }) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="truncate">#{index} {item.group}</span>
                                                    <Badge variant="destructive">{item.date || "пусто"}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900 dark:text-green-100">Всё отлично!</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">Все даты указаны верно</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Separator />

                    {/* Проверки: Пустые поля и дубликаты */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Пустые поля */}
                        <Card className={stats?.hasEmptyFields ? "border border-amber-500" : "border border-green-500"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {stats?.hasEmptyFields ? (
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <span>Заполненность данных</span>
                                </CardTitle>
                                <CardDescription>
                                    Поиск пропущенных обязательных полей
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.hasEmptyFields ? (
                                    <div className="space-y-2">
                                        {Object.entries(stats.emptyFields).map(([field, count]) => (
                                            count > 0 && (
                                                <div key={field} className="flex items-center justify-between">
                                                    <span className="capitalize">{field}</span>
                                                    <Badge variant="destructive">{count} пустых</Badge>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900 dark:text-green-100">Всё отлично!</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">Все обязательные поля заполнены</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Повторяющиеся записи */}
                        <Card className={stats?.hasDuplicates ? "border border-amber-500" : "border border-green-500"}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {stats?.hasDuplicates ? (
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                    <span>Дубликаты записей</span>
                                </CardTitle>
                                <CardDescription>
                                    Поиск полностью идентичных повторяющихся строк
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.hasDuplicates ? (
                                    <div className={`space-y-2 ${showAllDuplicates ? "" : "max-h-60 overflow-y-auto"}`}>
                                        {(showAllDuplicates ? stats.duplicates : stats.duplicates.slice(0, 10)).map(([key, count]) => (
                                            <div key={key} className="flex items-start justify-between gap-2 text-sm">
                                                <span className="font-mono text-xs break-all min-w-0">{key}</span>
                                                <Badge variant="outline" className="shrink-0">{count}x</Badge>
                                            </div>
                                        ))}
                                        {stats.duplicates.length > 10 && !showAllDuplicates && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-muted-foreground"
                                                onClick={() => setShowAllDuplicates(true)}
                                            >
                                                Показать ещё {stats.duplicates.length - 10}
                                            </Button>
                                        )}
                                        {showAllDuplicates && stats.duplicates.length > 10 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-muted-foreground"
                                                onClick={() => setShowAllDuplicates(false)}
                                            >
                                                Скрыть
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-900/50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900 dark:text-green-100">Всё отлично!</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">Полных дубликатов не найдено</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                    {/* Детальный список */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                                <span>Полный список записей</span>
                                <div className="flex items-center gap-2">
                                    {showDetails && (
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                value={visibilityFilter}
                                                onValueChange={(value) => setVisibilityFilter(value as 'all' | 'visible' | 'invisible')}
                                            >
                                                <SelectTrigger className="w-[180px] h-8 text-sm">
                                                    <SelectValue placeholder="Все записи" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все записи</SelectItem>
                                                    <SelectItem value="visible">Только видимые</SelectItem>
                                                    <SelectItem value="invisible">Только невидимые</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleToggleDetails}
                                        disabled={isPending}
                                    >
                                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isPending ? "Загрузка..." : showDetails ? "Скрыть" : "Показать"}
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        {showDetails && (
                            <CardContent>
                                {(isPending || !isTableReady) ? (
                                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                        {Array.from({ length: 28 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-6 w-8" />
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 w-20" />
                                                <Skeleton className="h-6 w-12" />
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 flex-1" />
                                                <Skeleton className="h-6 w-32" />
                                                <Skeleton className="h-6 w-12" />
                                                <Skeleton className="h-6 w-6" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-background z-10">
                                                <tr className="border-b">
                                                    <th className="text-left p-2">#</th>
                                                    <th
                                                        className="text-left p-2 cursor-pointer hover:bg-muted/50 select-none"
                                                        onClick={() => {
                                                            if (sortField === 'group') {
                                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                            } else {
                                                                setSortField('group');
                                                                setSortDirection('asc');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Группа
                                                            {sortField === 'group' ? (
                                                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                            ) : (
                                                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="text-left p-2 cursor-pointer hover:bg-muted/50 select-none"
                                                        onClick={() => {
                                                            if (sortField === 'date') {
                                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                            } else {
                                                                setSortField('date');
                                                                setSortDirection('asc');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Дата
                                                            {sortField === 'date' ? (
                                                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                            ) : (
                                                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="text-left p-2">День</th>
                                                    <th
                                                        className="text-left p-2 cursor-pointer hover:bg-muted/50 select-none"
                                                        onClick={() => {
                                                            if (sortField === 'time') {
                                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                            } else {
                                                                setSortField('time');
                                                                setSortDirection('asc');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Время
                                                            {sortField === 'time' ? (
                                                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                            ) : (
                                                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="text-left p-2">Дисциплина</th>
                                                    <th
                                                        className="text-left p-2 cursor-pointer hover:bg-muted/50 select-none"
                                                        onClick={() => {
                                                            if (sortField === 'teacher') {
                                                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                            } else {
                                                                setSortField('teacher');
                                                                setSortDirection('asc');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Преподаватель
                                                            {sortField === 'teacher' ? (
                                                                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                            ) : (
                                                                <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="text-left p-2">Ауд.</th>
                                                    <th className="text-center p-2">Видимость</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    // Подготавливаем данные с индексами и признаком невидимости
                                                    let tableData = schedule?.map((item, idx) => ({
                                                        item,
                                                        originalIndex: idx + 1,
                                                        isInvisible: stats?.invisibleRecords.some(r => r.index === idx + 1) || false
                                                    })) || [];

                                                    // Фильтрация по видимости
                                                    if (visibilityFilter === 'visible') {
                                                        tableData = tableData.filter(row => !row.isInvisible);
                                                    } else if (visibilityFilter === 'invisible') {
                                                        tableData = tableData.filter(row => row.isInvisible);
                                                    }

                                                    // Сортировка
                                                    if (sortField) {
                                                        tableData.sort((a, b) => {
                                                            let aVal = '';
                                                            let bVal = '';

                                                            if (sortField === 'date') {
                                                                // Сортировка по дате — парсим dd.MM.yyyy
                                                                const aDate = parse(a.item.date || '', 'dd.MM.yyyy', new Date());
                                                                const bDate = parse(b.item.date || '', 'dd.MM.yyyy', new Date());
                                                                const aTime = isValid(aDate) ? aDate.getTime() : 0;
                                                                const bTime = isValid(bDate) ? bDate.getTime() : 0;
                                                                return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
                                                            }

                                                            aVal = (a.item[sortField] || '').toLowerCase();
                                                            bVal = (b.item[sortField] || '').toLowerCase();

                                                            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                                                            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                                                            return 0;
                                                        });
                                                    }

                                                    return tableData.map(({ item, originalIndex, isInvisible }) => (
                                                        <tr
                                                            key={originalIndex}
                                                            className={`border-b hover:bg-muted/50 ${isInvisible ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
                                                        >
                                                            <td className="p-2 text-muted-foreground">{originalIndex}</td>
                                                            <td className="p-2">{item.group || <span className="text-red-500">—</span>}</td>
                                                            <td className="p-2">{item.date || <span className="text-red-500">—</span>}</td>
                                                            <td className="p-2">{item.dayOfWeek || <span className="text-red-500">—</span>}</td>
                                                            <td className={`p-2 ${!VALID_TIME_SLOTS.includes(item.time) ? 'text-red-600 font-semibold' : ''}`}>
                                                                {item.time || <span className="text-red-500">—</span>}
                                                            </td>
                                                            <td className="p-2 truncate max-w-40">{item.subject || <span className="text-red-500">—</span>}</td>
                                                            <td className="p-2 truncate max-w-40">{item.teacher || <span className="text-red-500">—</span>}</td>
                                                            <td className="p-2">{item.classroom || <span className="text-red-500">—</span>}</td>
                                                            <td className="p-2 text-center">
                                                                {isInvisible ? (
                                                                    <EyeOff className="h-4 w-4 text-red-500 mx-auto" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4 text-green-500 mx-auto" />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {visibilityFilter !== 'all' && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Показано {visibilityFilter === 'invisible' ? stats?.invisibleRecords.length : (stats?.total || 0) - (stats?.invisibleRecords.length || 0)} из {stats?.total} записей
                                    </p>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
