import { NextResponse } from "next/server";
import { loadSchedule } from "@/utils/loadSchedule";

// Обработчик GET-запросов
export async function GET() {
  try {
    const schedule = await loadSchedule();
    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    console.error("Ошибка загрузки расписания:", error);
    return NextResponse.json({ error: "Ошибка загрузки расписания" }, { status: 500 });
  }
}