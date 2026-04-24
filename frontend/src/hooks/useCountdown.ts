import { useState, useEffect } from 'react';

export const useCountdown = (endDate: string | undefined) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        ms: 0
    });

    useEffect(() => {
        if (!endDate) return;

        const update = () => {
            const ms = Math.max(0, new Date(endDate).getTime() - Date.now());
            setTimeLeft({
                days: Math.floor(ms / 86400000),
                hours: Math.floor((ms % 86400000) / 3600000),
                minutes: Math.floor((ms % 3600000) / 60000),
                ms
            });
        };

        update();
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [endDate]);

    return timeLeft;
};
