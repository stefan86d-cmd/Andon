
"use client";

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function FooterLogo() {
    const { resolvedTheme } = useTheme();
    const [logoSrc, setLogoSrc] = useState("/Andonpro_Liikemerkki_Musta_Syvätty.png");

    useEffect(() => {
        setLogoSrc(resolvedTheme === 'dark' ? "/Andonpro_Liikemerkki_Valkoinen_Syvätty.png" : "/Andonpro_Liikemerkki_Musta_Syvätty.png");
    }, [resolvedTheme]);
    
    return (
        <Image
            src={logoSrc}
            alt="AndonPro mark"
            width={24}
            height={24}
            priority
        />
    );
}
