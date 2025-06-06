import { Container, ParticleContainer, Sprite, Texture } from "pixi.js";
import { GrenadeType, InAirGrenade } from "../types/InAirGrenade";
import { DisplayDot } from "./DisplayDot";
import { Zi } from "../types/zIndex";
import { GrenadeTrail } from "./GrenadeTrail";

export class InAirGrenadeDot
    implements DisplayDot<[InAirGrenade, InAirGrenade, number]>
{
    dot: Sprite | undefined;
    x: number;
    y: number;

    id: number;
    type: GrenadeType;

    trail: GrenadeTrail;

    transformCoordinates: (x: number, y: number) => [number, number];

    constructor(
        x: number,
        y: number,
        id: number,
        type: GrenadeType,
        transformCoordinates: (x: number, y: number) => [number, number]
    ) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.transformCoordinates = transformCoordinates;
        this.trail = new GrenadeTrail();
    }

    create(texture: Texture): void {
        this.dot = new Sprite(texture);
        this.dot.scale.set(0.1); // Scale if necessary
        const bounds = this.dot.getLocalBounds();
        this.dot.pivot.set(
            (bounds.x + bounds.width) / 2,
            (bounds.y + bounds.height) / 2
        );
        this.dot.position.set(this.x, this.y);
        this.dot.zIndex = Zi.Grenade;
    }

    update(prev: InAirGrenade, curr: InAirGrenade, t: number): void {
        const interpX = prev.X + (curr.X - prev.X) * t;
        const interpY = prev.Y + (curr.Y - prev.Y) * t;

        const [x, y] = this.transformCoordinates(interpX, interpY);

        this.trail.addPoint(x, y, curr.tick);

        this.dot?.position.set(x, y);
    }

    deleteTrail(trailContainer: Container): void {
        this.trail.clear(trailContainer);
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
}
