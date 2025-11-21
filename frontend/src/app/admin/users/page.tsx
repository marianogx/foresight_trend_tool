"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for now
const INITIAL_USERS = [
    { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Editor", email: "editor@example.com", role: "Editor", status: "Active" },
];

export default function UsersPage() {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Management</h3>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? "Cancel" : "Add User"}
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New User</CardTitle>
                        <CardDescription>Create a new user account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input placeholder="Full Name" />
                            <Input placeholder="Email Address" />
                            <Input placeholder="Password" type="password" />
                            <Button>Create User</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm">Edit</Button>
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
