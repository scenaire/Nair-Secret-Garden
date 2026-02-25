// hooks/useDemoAuth.ts
import { useCallback, useState } from "react";

export interface DemoUserProfile {
    name: string;
    avatar: string;
}

interface UseDemoAuthResult {
    user: DemoUserProfile | null;
    isLoggedIn: boolean;
    loginWithTwitch: () => void;
}

export function useDemoAuth(): UseDemoAuthResult {
    const [user, setUser] = useState<DemoUserProfile | null>(null);

    const loginWithTwitch = useCallback(() => {
        // TODO: เปลี่ยนเป็น Twitch OAuth จริงในอนาคต
        setUser({
            name: "Guest",
            avatar: "https://placekitten.com/40/40",
        });
    }, []);

    return {
        user,
        isLoggedIn: user !== null,
        loginWithTwitch,
    };
}