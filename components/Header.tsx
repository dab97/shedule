"use client";

import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { GraduationCap } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="hidden font-bold sm:inline-block">
                        Расписание РГСУ
                    </div>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
}
