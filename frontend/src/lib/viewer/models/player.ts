import { Sprite, Text, TextStyle, Texture } from "pixi.js";
import { TextureManager } from "../TextureManager";

export class PlayerDot {
    dot: Sprite | undefined;
    nameText: Text | undefined;
    name: string;
    x: number;
    y: number;
    yaw: number;
    side: string;

    constructor(
        name: string,
        px: number,
        py: number,
        yaw: number,
        side: string
    ) {
        this.name = name;

        this.x = px;
        this.y = py;

        this.yaw = yaw;

        this.side = side;
    }

    async init(texture: Texture) {
        // Load the SVG and create a Graphics object from it

        this.dot = new Sprite(texture);

        this.dot.scale.set(0.5); // Scale if necessary

        const bounds = this.dot.getLocalBounds();

        this.dot.pivot.set(
            (bounds.x + bounds.width) / 2,
            (bounds.y + bounds.height) / 2
        );

        this.dot.position.set(this.x, this.y);

        this.dot.rotation = this.yaw; //this.yaw * (Math.PI / 180); // Convert yaw to radians

        // this.dot.fill(0xffffff); // Fill color for your graphic (white here)

        // this.dot.addChild(tigerSvg);
        // this.dot.context = tigerSvg;

        // this.dot.pivot.set(tigerSvg.width / 2, tigerSvg.height / 2);

        // this.dot.position.set(this.x, this.y);
    }

    // Update the position of the circle and the name
    public updatePosition(x: number, y: number, yaw: number) {
        this.dot!.x = x;
        this.dot!.y = y;
        this.dot!.angle = -yaw; // * (Math.PI / 180);
    }

    private async createPlayerIconTexture(svgUrl: string): Promise<Texture> {
        const img = new Image();
        img.src = svgUrl;
        await img.decode(); // Wait for it to load

        const baseTexture = Texture.from(img);
        return baseTexture;
    }
}
