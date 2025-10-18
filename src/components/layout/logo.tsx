
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
      <div className={cn("flex items-center gap-2 font-semibold text-primary", className)}>
          <Image
            src="/Andonpro_Logo_Musta_Syvätty.png"
            alt="AndonPro logo"
            width={120}
            height={29}
            priority
            className="dark:hidden"
        />
         <Image
            src="/Andonpro_Logo_Valkoinen_Syvätty.png"
            alt="AndonPro logo"
            width={120}
            height={29}
            className="hidden dark:block"
            priority
        />
      </div>
    );
  }
  
