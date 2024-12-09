"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { documentCategories } from "@/utils/documents";
import { DocumentsSection } from "@/components/documents-section";

export default function SpravkaPage() {
  const router = useRouter();

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="items-center justify-center">
          <h1 className="text-xl md:text-4xl font-bold text-center">
            Заказ справок и документов
          </h1>
          <p className="text-center text-muted-foreground mt-2 text-base md:text-lg px-2">
            Выберите необходимый документ и заполните онлайн-форму
          </p>
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          К расписанию
        </Button>
        {documentCategories.map((category, index) => (
          <DocumentsSection key={index} category={category} />
        ))}
      </div>
    </main>
  );
}
