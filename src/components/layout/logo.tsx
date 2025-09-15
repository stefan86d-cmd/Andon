import Image from 'next/image';

export function Logo() {
    return (
      <div className="flex items-center gap-2 font-semibold text-primary">
          <Image
            src="/Andonpro_Logo_Musta.jpg"
            alt="AndonPro logo"
            width={100}
            height={24}
            className="h-6 w-auto"
        />
      </div>
    );
  }
  