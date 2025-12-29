
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

const tourSteps = [
    {
        title: "Welcome to AndonPro!",
        description: "This quick tour will walk you through the key features of the application. Let's get started!",
        image: PlaceHolderImages.find(p => p.id === 'welcome-tour-1'),
    },
    {
        title: "The Dashboard: Your Command Center",
        description: "Get a live overview of your factory floor, with real-time stats on open issues, resolution times, and critical alerts.",
        image: PlaceHolderImages.find(p => p.id === 'welcome-tour-2'),
    },
    {
        title: "Configure Your Factory",
        description: "Head to the 'Production Lines' and 'User Management' pages to set up your factory layout and invite your team members.",
        image: PlaceHolderImages.find(p => p.id === 'welcome-tour-3'),
    },
    {
        title: "Report & Resolve Issues",
        description: "Operators can instantly report issues from their station, and supervisors can track, update, and resolve them in real-time.",
        image: PlaceHolderImages.find(p => p.id === 'welcome-tour-4'),
    },
     {
        title: "You're All Set!",
        description: "You're ready to start improving your production efficiency. Click below to close this tour.",
        image: PlaceHolderImages.find(p => p.id === 'welcome-tour-5'),
    },
];

interface WelcomeTourProps {
    isOpen: boolean;
    onClose: (dontShowAgain: boolean) => void;
}

export function WelcomeTour({ isOpen, onClose }: WelcomeTourProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    
    React.useEffect(() => {
        if (!api) return;
        
        setCurrent(api.selectedScrollSnap());
        
        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };
        
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(dontShowAgain)}>
            <DialogContent className="sm:max-w-2xl" hideCloseButton>
                 <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {tourSteps.map((step, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Card className="border-0 shadow-none">
                                        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                                            </DialogHeader>
                                            {step.image && (
                                                <div className="relative w-full h-64">
                                                    <Image
                                                        src={step.image.imageUrl}
                                                        alt={step.image.description}
                                                        fill
                                                        className="rounded-lg object-contain"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-muted-foreground">{step.description}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
                
                <div className="flex justify-center space-x-2 pb-4">
                    {tourSteps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => api?.scrollTo(i)}
                            className={cn(
                                "h-2 w-2 rounded-full",
                                current === i ? "bg-primary" : "bg-muted-foreground/50"
                            )}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center w-full">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(!!checked)} />
                        <Label htmlFor="dont-show-again" className="text-sm text-muted-foreground">Don't show this again</Label>
                    </div>
                    <Button onClick={() => onClose(dontShowAgain)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    