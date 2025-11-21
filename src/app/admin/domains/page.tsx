"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

// Mock data
const INITIAL_DOMAINS = [
    { id: 1, domain: "techcrunch.com", status: "Approved" },
    { id: 2, domain: "wired.com", status: "Approved" },
    { id: 3, domain: "bloomberg.com", status: "Approved" },
];

export default function DomainsPage() {
    const [domains, setDomains] = useState(INITIAL_DOMAINS);
    const [newDomain, setNewDomain] = useState("");

    const handleAdd = () => {
        if (!newDomain) return;
        setDomains([...domains, { id: Date.now(), domain: newDomain, status: "Approved" }]);
        setNewDomain("");
    };

    const handleDelete = (id: number) => {
        setDomains(domains.filter(d => d.id !== id));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Approved Domains</CardTitle>
                    <CardDescription>
                        Only articles from these domains will be automatically processed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Input
                            placeholder="Enter domain (e.g., example.com)"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                        />
                        <Button onClick={handleAdd}>
                            <Plus className="mr-2 h-4 w-4" /> Add Domain
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {domains.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.domain}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
