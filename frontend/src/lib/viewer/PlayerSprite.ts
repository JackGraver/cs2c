import { Sprite, TextStyle } from "pixi.js";
import { TextureManager } from "./TextureManager";

export class PlayerSprite {
  dot: Sprite;
  nameText: Text | undefined;
  name: string;

  constructor(name: string, x: number, y: number, yaw: number, side: string) {
    this.name = name;

    const dot = new Sprite(TextureManager.getInstance().getTexture(side));
    dot.x = x;
    dot.y = y;

    dot.zIndex = 2;

    this.dot = dot;

    const style = new TextStyle({
      fontSize: 8,
      fill: "#ffffff",
    });

    // Create the player's name text
    // this.nameText = new Text({ text: this.name, style });
    // this.nameText.x = x - 5;
    // this.nameText.y = y - 10; // Position above the circle
    // this.nameText.zIndex = 2;
  }

  // Update the position of the circle and the name
  public updatePosition(x: number, y: number, yaw: number) {
    this.dot.x = x;
    this.dot.y = y;
    // this.nameText.x = x - 5; // (this.nameText.width / 3);
    // this.nameText.y = y - 10; // Update name position relative to the circle
  }
}
