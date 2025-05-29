'use client';

import { useEffect, useState } from "react";
import DynamicSchedule from "@/components/DynamicSchedule";
import AlternativeHome from "./alternative-home";

export default function HomePage() {
  const [showSchedule, setShowSchedule] = useState(true);

  useEffect(() => {
    // Проверяем localStorage при загрузке
    const savedSetting = localStorage.getItem('showSchedule');
    if (savedSetting !== null) {
      setShowSchedule(savedSetting === 'true');
    }
  }, []);

  // Функция для быстрого переключения (можно добавить в админ-панель)
  const toggleSchedule = () => {
    const newValue = !showSchedule;
    setShowSchedule(newValue);
    localStorage.setItem('showSchedule', String(newValue));
  };

  return (
    <main className="container mx-auto py-8">
      {/* Секретная кнопка для переключения (можно разместить в админке)
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={toggleSchedule}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm opacity-25 hover:opacity-100 transition-opacity"
          aria-label="Toggle schedule"
        >
          {showSchedule ? 'Скрыть расписание' : 'Показать расписание'}
        </button>
      </div> */}

      {showSchedule ? <DynamicSchedule /> : <AlternativeHome />}
    </main>
  );
}