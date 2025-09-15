import Image from 'next/image';

export function Logo() {
    return (
      <div className="flex items-center gap-2 font-semibold text-primary">
          <Image
            src="https://picsum.photos/seed/logo/40/40"
            alt="AndonPro logo"
            width={24}
            height={24}
            className="h-6 w-6"
            data-ai-hint="abstract logo"
        />
        <span className="hidden md:inline-block">AndonPro</span>
      </div>
    );
  }
  