import { Kill } from "../../lib/viewer/types/kill";
import { KillCard } from "./KillCard";

type PlayerProps = {
    kills: Kill[];
};

export function KillFeed({ kills }: PlayerProps) {
    if (kills.length === 0) {
        return <></>;
    }
    return (
        <div className="absolute top-2 left-2">
            {kills.map((kill, i) => {
                return <KillCard kill={kill} key={i} />;
            })}
        </div>
    );
}
