
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function FooterLogo({ className }: { className?: string }) {
    return (
      <div className={cn("flex items-center gap-2 font-semibold text-primary", className)}>
         <Image
            src="/Andonpro_Logo_Valkoinen_Syvätty.png"
            alt="AndonPro logo"
            width={100}
            height={24}
            className="h-auto w-auto"
            priority
        />
      </div>
    );
  }
