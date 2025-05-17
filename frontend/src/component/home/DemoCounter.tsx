import { useEffect, useRef, useState } from "react";

type DemoCounterProps = {
    numDemos: number;
};

export default function DemoCounter({ numDemos }: DemoCounterProps) {
    const [currentNum, setCurrentNum] = useState(0);
    const requestRef = useRef<number>(undefined);
    const startTimeRef = useRef<number>(undefined);

    const duration = 2000; // total duration in ms (e.g., 2 seconds)

    // Easing function: easeOutCubic
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOut(progress);
            const value = Math.floor(eased * numDemos);

            setCurrentNum(value);

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            startTimeRef.current = undefined;
        };
    }, [numDemos]);

    return (
        <div>
            <p>{currentNum}</p>
            <p>Num Demos</p>
        </div>
    );
}
