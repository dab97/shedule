'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DynamicSchedule from "@/components/DynamicSchedule";
//import AlternativeHome from "./alternative-home";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <DynamicSchedule />
    </main>
  );
}
