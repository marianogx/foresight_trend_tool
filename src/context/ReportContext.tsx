"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { generateTrendSummary } from "@/lib/api";
import { toast } from "sonner";

interface ReportContextType {
    isGenerating: boolean;
    startGeneration: (days: number, minSignal: string) => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const startGeneration = async (days: number, minSignal: string) => {
        if (isGenerating) return;

        setIsGenerating(true);
        toast.info("Trend report generation started in background...");

        try {
            // We don't await this here if we want to unblock immediately, 
            // but since we want to track status, we await it. 
            // Because this component is at the Layout level, it won't unmount on navigation.
            await generateTrendSummary(days, minSignal);
            toast.success("Trend report generated successfully!");
        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to generate trend report.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ReportContext.Provider value={{ isGenerating, startGeneration }}>
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error("useReport must be used within a ReportProvider");
    }
    return context;
}
