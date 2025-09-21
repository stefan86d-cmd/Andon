
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
    const { resolvedTheme } = useTheme();
    const [logoSrc, setLogoSrc] = useState("/Andonpro_logo_musta_syvätty.jpg");

    useEffect(() => {
        setLogoSrc(resolvedTheme === 'dark' ? "/Andonpro_logo_valkoinen_syvätty.jpg" : "/Andonpro_logo_musta_syvätty.jpg");
    }, [resolvedTheme]);

    return (
      <div className={cn("flex items-center gap-2 font-semibold text-primary", className)}>
          <Image
            src={logoSrc}
            alt="AndonPro logo"
            width={100}
            height={24}
            className="h-auto w-auto"
            priority
        />
      </div>
    );
  }
  
