import { Graphics, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { TextureManager } from "../TextureManager";

export class PlayerDot {
  dot: Sprite;
  nameText: Text | undefined;
  name: string;

  constructor(name: string, px: number, py: number, yaw: number, side: string) {
    this.name = name;

    // const [x, y] = this.transformCoordinates(px, py);
    const [x, y] = [px, py];

    const texture = TextureManager.getInstance().getTexture(side)!;
    this.dot = new Sprite(texture);
    this.dot.anchor.set(0.5);
    this.dot.x = x;
    this.dot.y = y;
    this.dot.rotation = yaw * (Math.PI / 180);
  }

  //   async init(x: number, y: number, yaw: number) {
  //     const texture = TextureManager.getInstance().getTexture("T");
  //     this.dot.texture = texture!;
  //     this.dot.anchor.set(0.5);
  //     this.dot.x = x;
  //     this.dot.y = y;
  //     this.dot.rotation = yaw * (Math.PI / 180);
  //   }

  // Update the position of the circle and the name
  public updatePosition(x: number, y: number, yaw: number) {
    this.dot.x = x;
    this.dot.y = y;
    // this.nameText.x = x - 5; // (this.nameText.width / 3);
    // this.nameText.y = y - 10; // Update name position relative to the circle
  }

  private transformCoordinates(x: number, y: number) {
    const X_MIN = -1750,
      X_MAX = 2625;
    const Y_MIN = -900,
      Y_MAX = 3700;

    // const containerWidth = this.container.width - 24;
    // const containerHeight = this.container.height + 8;
    const containerWidth = 744;
    const containerHeight = 776;

    const normX = (x - X_MIN) * (containerWidth / (X_MAX - X_MIN));
    const normY =
      containerHeight - (y - Y_MIN) * (containerHeight / (Y_MAX - Y_MIN));

    return [normX, normY];
  }

  private async createPlayerIconTexture(svgUrl: string): Promise<Texture> {
    const img = new Image();
    img.src = svgUrl;
    await img.decode(); // Wait for it to load

    const baseTexture = Texture.from(img);
    return baseTexture;
  }
}
