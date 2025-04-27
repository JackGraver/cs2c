import { Sprite, Texture } from "pixi.js";
import { TickData } from "../types/tick_data";
import { Player } from "../types/player_data";

export interface DisplayDot {
    dot: Sprite | undefined;
    // texture: Texture;
    x: number;
    y: number;
    rotation?: number;
    alpha?: number;

    create(texture: Texture): void;
    update(previousTick: Player, currentTick: Player, t: number): void;
    destroy(): void;

    // transformCoordinates(x: number, y: number): [number, number];
}
