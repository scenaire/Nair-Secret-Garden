// hooks/usePetalNavigation.ts
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export interface PetalNavigation {
    showTransition: boolean;
    beginNavigation: (href: string) => void;
    handleTransitionComplete: () => void;
}

export function usePetalNavigation(): PetalNavigation {
    const router = useRouter();
    const [targetHref, setTargetHref] = useState<string | null>(null);
    const [showTransition, setShowTransition] = useState(false);

    const beginNavigation = useCallback((href: string) => {
        setTargetHref(href);
        setShowTransition(true);
    }, []);

    const handleTransitionComplete = useCallback(() => {
        if (targetHref) {
            router.push(targetHref);
        }
        setShowTransition(false);
        setTargetHref(null);
    }, [router, targetHref]);

    return {
        showTransition,
        beginNavigation,
        handleTransitionComplete,
    };
}