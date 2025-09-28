
"use client";

import { seedDatabase } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Database } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

export default function SeedPage() {
    const [isSeeding, startSeedingTransition] = useTransition();
    const [isDone, setIsDone] = useState(false);
    const { toast } = useToast();

    const handleSeed = () => {
        startSeedingTransition(async () => {
            const result = await seedDatabase();
            if (result.success) {
                toast({
                    title: "Database Seeded!",
                    description: "The sample data has been added to your database.",
                });
                setIsDone(true);
            } else {
                toast({
                    variant: "destructive",
                    title: "Seeding Failed",
                    description: result.error,
                });
            }
        });
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Database className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Seed Your Database</CardTitle>
                    <CardDescription>
                        {isDone 
                            ? "Your database has been populated with sample data."
                            : "Click the button below to populate your Firestore database with sample data. This will allow you to test and explore the application's features."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {isDone ? (
                        <Button asChild>
                            <Link href="/login">Proceed to Login</Link>
                        </Button>
                    ) : (
                        <Button onClick={handleSeed} disabled={isSeeding} className="w-full">
                            {isSeeding && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Seed Database
                        </Button>
                    )}
                    <p className="text-xs text-muted-foreground">This action can be performed multiple times.</p>
                </CardContent>
            </Card>
        </div>
    )
}
