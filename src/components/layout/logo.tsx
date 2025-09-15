import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
      <div className={cn("flex items-center gap-2 font-semibold text-primary", className)}>
          <Image
            src="/Andonpro_Logo_Musta.jpg"
            alt="AndonPro logo"
            width={100}
            height={24}
            className="h-auto w-auto"
        />
      </div>
    );
  }
  