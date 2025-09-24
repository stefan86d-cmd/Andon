
"use client";

import { Bell, Menu, SpeakerOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { Logo } from "./logo";
import { useUser } from "@/contexts/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { getIssues } from "@/lib/data";
import type { Issue } from "@/lib/types";
import { Badge } from "../ui/badge";

export function Header() {
  const { currentUser } = useUser();
  const [newIssuesCount, setNewIssuesCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevIssuesCountRef = useRef(newIssuesCount);

  useEffect(() => {
    const muted = localStorage.getItem('notificationMuted') === 'true';
    setIsMuted(muted);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!audioRef.current) {
        audioRef.current = new Audio('/audio/notification.mp3');
      }
    }
    
    if (currentUser?.role === 'admin' || currentUser?.role === 'supervisor') {
      const calculateNewIssues = async () => {
        const issues = await getIssues();
        const lastSeenTimestamp = localStorage.getItem('lastSeenIssueTimestamp');
        
        let newCount;
        if (!lastSeenTimestamp) {
          newCount = issues.filter(i => i.status === 'reported' || i.status === 'in_progress').length;
        } else {
          newCount = issues.filter(issue => 
            new Date(issue.reportedAt).getTime() > parseInt(lastSeenTimestamp, 10)
          ).length;
        }

        if (newCount > prevIssuesCountRef.current && !isMuted && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }

        setNewIssuesCount(newCount);
        prevIssuesCountRef.current = newCount;
      };

      calculateNewIssues();

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'lastSeenIssueTimestamp') {
          calculateNewIssues();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      const interval = setInterval(calculateNewIssues, 30000); 

      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [currentUser, isMuted]);
  
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('notificationMuted', String(newMutedState));
  }

  const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {currentUser && <SidebarNav userRole={currentUser.role} />}
        </DropdownMenuContent>
      </DropdownMenu>

      <Logo />
      
      <div className="w-full flex-1" />

      {currentUser && currentUser.role !== 'operator' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
                {newIssuesCount > 0 && (
                    <Badge className="absolute top-0 right-0 h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs font-medium">
                        {newIssuesCount}
                    </Badge>
                )}
            </Button>
          </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
                <Link href="/issues">
                    View Issues
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={toggleMute}>
                {isMuted ? (
                    <Volume2 className="mr-2 h-4 w-4" />
                ) : (
                    <SpeakerOff className="mr-2 h-4 w-4" />
                )}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {currentUser && (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">{capitalize(currentUser.role)}</span>
            <UserNav />
        </div>
      )}
    </header>
  );
}
