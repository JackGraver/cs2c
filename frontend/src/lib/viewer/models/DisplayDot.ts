import { Sprite, Texture } from "pixi.js";
import { TickData } from "../types/TickData";
import { Player } from "../types/player_data";

export interface DisplayDot<
    UpdateParams extends any[] = [Player, Player, number]
> {
    dot: Sprite | undefined;
    // texture: Texture;
    x: number;
    y: number;
    rotation?: number;
    alpha?: number;

    create(texture: Texture): void;
    update(...params: UpdateParams): void;
    destroy(): void;

    // transformCoordinates(x: number, y: number): [number, number];
}
