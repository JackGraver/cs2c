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
                    kill.attacker_side === "ct"
                        ? "text-blue-400"
                        : "text-orange-400"
                }
            >
                {kill.attacker_name}
            </span>

            {kill.assister_name !== "N/A" && (
                <>
                    {" + "}
                    <span
                        className={
                            kill.assister_side === "ct"
                                ? "text-blue-400"
                                : "text-orange-400"
                        }
                    >
                        {kill.assister_name}
                    </span>
                </>
            )}

            {kill.assistedflash && <>(/)</>}

            {kill.attackerinair && <>^</>}
            <> {kill.weapon} </>
            {/* {kill.noscope && kill.weapon === "awp" && <>(N)</>} */}
            {kill.thrusmoke && <>(S)</>}
            {kill.penetrated && <>(P)</>}
            {kill.headshot && <>(H)</>}

            <span
                className={
                    kill.user_side === "ct"
                        ? "text-blue-400"
                        : "text-orange-400"
                }
            >
                {kill.user_name}
            </span>
        </div>
    );
}
