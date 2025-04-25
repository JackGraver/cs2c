import { Sprite, Texture } from "pixi.js";
import { GrenadeType, InAirGrenade } from "../types/in_air_grenade";

export class InAirGrenadeDot {
    dot: Sprite | undefined;
    x: number;
    y: number;
    id: number;
    type: GrenadeType;
    thrower: string;

    constructor(
        x: number,
        y: number,
        id: number,
        type: GrenadeType,
        thrower: string
    ) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.thrower = thrower;
    }

    async init(texture: Texture) {
        this.dot = new Sprite(texture);

        this.dot.scale.set(0.5); // Scale if necessary

        const bounds = this.dot.getLocalBounds();

        this.dot.pivot.set(
            (bounds.x + bounds.width) / 2,
            (bounds.y + bounds.height) / 2
        );

        this.dot.position.set(this.x, this.y);
    }

    public updatePosition(x: number, y: number) {
        this.dot!.x = x;
        this.dot!.y = y;
    }
}
