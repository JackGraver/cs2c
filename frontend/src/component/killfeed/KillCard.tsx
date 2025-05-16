import { Kill } from "../../lib/viewer/types/kill";

type KillCardProps = {
    kill: Kill;
};

export function KillCard({ kill }: KillCardProps) {
    return (
        <div className="border rounded-md border-red-400 mt-2 p-1 pl-2 pr-2 text-sm bg-gray-500 bg-opacity-30">
            <>{kill.attackerblind && <>(B)</>}</>
            <span
                className={
                    kill.attacker_ct ? "text-blue-400" : "text-orange-400"
                }
            >
                {kill.attacker}
            </span>
            {kill.assister !== "N/A" && (
                <>
                    {" + "}
                    <span
                        className={
                            kill.assister_ct
                                ? "text-blue-400"
                                : "text-orange-400"
                        }
                    >
                        {kill.assister}
                    </span>
                </>
            )}

            <span
                className={kill.victim_ct ? "text-blue-400" : "text-orange-400"}
            >
                {kill.victim}
            </span>
        </div>
    );
}
