import { Kill } from "../../lib/viewer/types/kill";
import { KillCard } from "./KillCard";

type PlayerProps = {
    kills: Kill[];
};

export function KillFeed({ kills }: PlayerProps) {
    if (!kills || kills.length === 0) return null;

    return (
        <div className="absolute top-0 left-0 flex flex-col gap-1 w-fit">
            {kills.map((kill, i) => (
                <KillCard kill={kill} key={i} />
            ))}
        </div>
    );
}
