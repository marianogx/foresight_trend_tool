"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSetting, saveSetting } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
    const [geminiKey, setGeminiKey] = useState("");
    const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash-exp");
    const [steepvPrompt, setSteepvPrompt] = useState("");
    const [trendPrompt, setTrendPrompt] = useState("");
    const [schedule, setSchedule] = useState("hourly");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const keyData = await getSetting("gemini_api_key");
            if (keyData) setGeminiKey(keyData.value);

            const modelData = await getSetting("gemini_model");
            if (modelData) setGeminiModel(modelData.value);

            const steepvData = await getSetting("steepv_prompt");
            if (steepvData) setSteepvPrompt(steepvData.value);

            const trendData = await getSetting("trend_prompt");
            if (trendData) setTrendPrompt(trendData.value);

            const scheduleData = await getSetting("feed_schedule");
            if (scheduleData) setSchedule(scheduleData.value);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await saveSetting("gemini_api_key", geminiKey);
            await saveSetting("gemini_model", geminiModel);
            await saveSetting("steepv_prompt", steepvPrompt);
            await saveSetting("trend_prompt", trendPrompt);
            await saveSetting("feed_schedule", schedule);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Configuration</CardTitle>
                    <CardDescription>
                        Configure the AI service for article categorization.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="geminiKey">Gemini API Key</Label>
                        <Input
                            id="geminiKey"
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="Enter your Google Gemini API Key"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="geminiModel">Gemini Model</Label>
                        <Select value={geminiModel} onValueChange={setGeminiModel}>
                            <SelectTrigger id="geminiModel">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</SelectItem>
                                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                                <SelectItem value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</SelectItem>
                                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                <SelectItem value="gemini-exp-1206">Gemini Experimental 1206</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose the Gemini model for AI processing
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="steepvPrompt">STEEPV Classification Prompt</Label>
                        <Textarea
                            id="steepvPrompt"
                            placeholder="Enter custom prompt for STEEPV classification. Use {title}, {summary}, {industry}, {link} as placeholders."
                            value={steepvPrompt}
                            onChange={(e) => setSteepvPrompt(e.target.value)}
                            className="min-h-[150px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Available placeholders: {'{title}'}, {'{summary}'}, {'{industry}'}, {'{link}'}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="trendPrompt">Trend Summary Prompt</Label>
                        <Textarea
                            id="trendPrompt"
                            placeholder="Enter custom prompt for generating trend summaries from curated articles."
                            value={trendPrompt}
                            onChange={(e) => setTrendPrompt(e.target.value)}
                            className="min-h-[150px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            This prompt will receive a list of articles grouped by industry with all their fields.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                        Configure system behavior.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="schedule">Feed Retrieval Schedule</Label>
                        <Select value={schedule} onValueChange={setSchedule}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading}>
                    {loading ? "Saving..." : "Save All Settings"}
                </Button>
            </div>
        </div>
    );
}
