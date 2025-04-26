import { Kill } from "../../lib/viewer/types/kill";

type KillCardProps = {
    kill: Kill;
};

export function KillCard({ kill }: KillCardProps) {
    return (
        <div>
            {kill.attacker_name} killed {kill.user_name}
        </div>
    );
}
