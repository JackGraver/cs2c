import { Graphics, Sprite, Texture } from "pixi.js";
import { DisplayDot } from "./DisplayDot";
import { TickData } from "../types/TickData";
import { Zi } from "../types/zIndex";

export class BombDot {
    dot: Graphics | undefined;
    x: number = -1;
    y: number = -1;
    tick: number = -1;
    displayed: boolean = false;

    // transformCoordinates: (x: number, y: number) => [number, number];

    constructor(
        // transformCoordinates: (x: number, y: number) => [number, number],
        x: number,
        y: number,
        tick: number
    ) {
        this.x = x;
        this.y = y;
        this.tick = tick;

        // this.transformCoordinates = transformCoordinates;
        this.dot = new Graphics();
        this.dot.rect(0, 0, 10, 15);
        this.dot.fill({ color: 0xffbf00 });
        // [x, y] = transformCoordinates(x, y);
        this.dot.position.set(x, y);
        this.dot.visible = true;
        this.displayed = true;
        this.dot.zIndex = Zi.Grenade;
    }

    toggleVisible(vis: boolean) {
        this.dot!.visible = vis;
    }

    // async create() {
    //     this.dot = new Graphics();
    //     this.dot.rect(0, 0, 10, 15);
    //     this.dot.fill({ color: 0xffbf00 });
    //     this.dot.visible = false;
    //     this.dot.zIndex = Zi.Grenade;
    // }

    // update(tick: TickData): void {
    //     if (this.displayed && tick.tick < this.tick) {
    //         this.dot!.visible = false;
    //     } else if (tick.bomb_plant.length !== 0) {
    //         this.tick = tick.bomb_plant[0].tick;
    //         const [x, y] = this.transformCoordinates(
    //             tick.bomb_plant[0].user_X,
    //             tick.bomb_plant[0].user_Y
    //         );

    //         this.dot!.position.set(x, y);
    //         this.dot!.visible = true;
    //         this.displayed = true;
    //     }
    // }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
}
