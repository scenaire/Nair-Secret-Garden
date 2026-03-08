// components/landing/SakuraHeroLazy.tsx
// Use this in page.tsx instead of importing SakuraHero directly.
//
//   import { SakuraHeroLazy } from "@/components/landing/SakuraHeroLazy";
//   <SakuraHeroLazy />

import dynamic from "next/dynamic";

export const SakuraHeroLazy = dynamic(
    () => import("./SakuraHero").then((m) => ({ default: m.SakuraHero })),
    {
        ssr: false,           // never render on server → no hydration mismatch
        loading: () => (
            <div className="w-full" style={{ minHeight: 400 }} /> // reserve space while loading
        ),
    }
);