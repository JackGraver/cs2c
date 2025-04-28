import { Sprite, Text, TextStyle, Texture } from "pixi.js";
import { DisplayDot } from "./DisplayDot";
import { TickData } from "../types/TickData";
import { Zi } from "../types/zIndex";
import { Player } from "../types/player_data";
import { TextureManager } from "../managers/TextureManager";

export class PlayerDot implements DisplayDot<[Player, Player, number]> {
    dot: Sprite | undefined;
    x: number;
    y: number;

    nameText: Text | undefined;

    transformCoordinates: (x: number, y: number) => [number, number];

    yaw: number;
    side: string;
    name: string;
    textureManager: TextureManager;

    constructor(
        name: string,
        px: number,
        py: number,
        yaw: number,
        side: string,
        transformCoordinates: (x: number, y: number) => [number, number],
        textureManager: TextureManager
    ) {
        this.name = name;

        this.x = px;
        this.y = py;

        this.yaw = yaw;

        this.side = side;

        this.transformCoordinates = transformCoordinates;

        this.textureManager = textureManager;
    }

    async create(texture: Texture) {
        this.dot = new Sprite(texture);

        this.dot.scale.set(0.5); // Scale if necessary

        const bounds = this.dot.getLocalBounds();

        this.dot.pivot.set(
            (bounds.x + bounds.width) / 2,
            (bounds.y + bounds.height) / 2
        );

        this.dot.position.set(this.x, this.y);

        this.dot.rotation = this.yaw; //this.yaw * (Math.PI / 180); // Convert yaw to radians\

        this.dot.zIndex = Zi.Player;

        const strokeColour = this.side === "ct" ? "#008CFF" : "#FF7700";

        const style = new TextStyle({
            fontSize: 10,
            fill: "#ffffff",
            stroke: { color: strokeColour, width: 5, join: "round" },
        });

        this.nameText = new Text({ text: this.name, style: style });
        this.nameText.position.set(
            this.x - this.nameText!.width / 2,
            this.y - 30
        );
        this.nameText.zIndex = Zi.PlayerName;
    }

    update(prev: Player, curr: Player, t: number): void {
        const interpX = prev.X + (curr.X - prev.X) * t;
        const interpY = prev.Y + (curr.Y - prev.Y) * t;
        const interpYaw = this.interpolateAngle(prev.yaw, curr.yaw, t);

        const [x, y]: [number, number] = this.transformCoordinates(
            interpX,
            interpY
        );

        const texture =
            curr.health === 0
                ? this.textureManager.getTexture("dead")!
                : this.textureManager.getTexture(this.side)!;

        if (curr.health === 0) {
            this.nameText!.visible = false;
            this.dot!.zIndex = Zi.DeadPlayer;
        } else {
            this.nameText!.visible = true;
            this.dot!.zIndex = Zi.Player;
        }

        this.dot!.texture = texture;

        this.dot!.x = x;
        this.dot!.y = y;

        this.nameText!.x = x - this.nameText!.width / 2;
        this.nameText!.y = y - 30;

        this.dot!.angle = -interpYaw;
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }

    private interpolateAngle(a: number, b: number, t: number): number {
        let diff = b - a;

        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        return a + diff * t;
    }
}
