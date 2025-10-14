
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useUser } from "@/contexts/user-context"
import type { Theme } from "@/lib/types";

function ThemeSync() {
    const { currentUser } = useUser();
    const { setTheme } = useTheme();

    React.useEffect(() => {
        if (currentUser?.theme) {
            setTheme(currentUser.theme);
        }
    }, [currentUser?.theme, setTheme]);
    
    return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        <ThemeSync />
        {children}
    </NextThemesProvider>
  )
}
