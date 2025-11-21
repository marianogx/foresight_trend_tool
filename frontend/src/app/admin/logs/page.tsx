"use client";

import { useEffect, useState } from "react";
import { fetchLogs } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface SystemLog {
    id: number;
    timestamp: string;
    level: string;
    event_type: string;
    message: string;
    details: any;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await fetchLogs(0, 100, levelFilter, undefined, search);
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            loadLogs();
        }, 500);
        return () => clearTimeout(debounce);
    }, [levelFilter, search]);

    const getLevelBadge = (level: string) => {
        switch (level) {
            case "ERROR": return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> ERROR</Badge>;
            case "WARNING": return <Badge variant="outline" className="text-yellow-500 border-yellow-500 gap-1"><AlertTriangle className="w-3 h-3" /> WARN</Badge>;
            default: return <Badge variant="secondary" className="gap-1"><Info className="w-3 h-3" /> INFO</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-12 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold tracking-tighter mb-2">System Logs</h1>
                <p className="text-muted-foreground">Monitor system events, errors, and AI activities.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Levels</SelectItem>
                                    <SelectItem value="INFO">Info</SelectItem>
                                    <SelectItem value="WARNING">Warning</SelectItem>
                                    <SelectItem value="ERROR">Error</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead className="w-[100px]">Level</TableHead>
                                        <TableHead className="w-[150px]">Event Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead className="w-[200px]">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No logs found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                                                </TableCell>
                                                <TableCell>{getLevelBadge(log.level)}</TableCell>
                                                <TableCell className="font-medium">{log.event_type}</TableCell>
                                                <TableCell>{log.message}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {log.details ? JSON.stringify(log.details) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
