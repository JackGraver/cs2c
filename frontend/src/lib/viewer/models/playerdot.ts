import { Sprite, Text, TextStyle, Texture } from "pixi.js";

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

        this.dot.rotation = this.yaw; //this.yaw * (Math.PI / 180); // Convert yaw to radians\

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
    }

    // Update the position of the circle and the name
    public updatePosition(x: number, y: number, yaw: number) {
        this.dot!.x = x;
        this.dot!.y = y;

        this.nameText!.x = x - this.nameText!.width / 2;
        this.nameText!.y = y - 30;

        this.dot!.angle = -yaw; // * (Math.PI / 180);
    }
}
