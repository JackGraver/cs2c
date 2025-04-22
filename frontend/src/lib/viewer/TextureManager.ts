import * as PIXI from "pixi.js";

import { Texture, Renderer, Graphics } from "pixi.js";

export class TextureManager {
  private static instance: TextureManager;
  private textures: Record<string, PIXI.Texture> = {};

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): TextureManager {
    if (!TextureManager.instance) {
      TextureManager.instance = new TextureManager();
    }
    return TextureManager.instance;
  }

  public async createTextures(
    renderer: PIXI.Renderer,
    keys: string[],
    colors: number[]
  ): Promise<void> {
    if (keys.length !== colors.length) return;

    const texturePromises = keys.map((key, i) => {
      return new Promise<void>((resolve) => {
        if (key === "smoke") {
          this.textures[key] = this.makeSmokeTextures(renderer, colors[i]);
        } else {
          this.textures[key] = this.makePlayerTextures(renderer, colors[i]);
        }
        resolve(); // Ensure the promise resolves after texture creation
      });
    });
    await Promise.all(texturePromises);
  }

  private makePlayerTextures(renderer: Renderer, color: number): Texture {
    const texture = new Graphics().circle(0, 0, 7.5).fill(color);

    return renderer.generateTexture(texture);
  }

  private makeSmokeTextures(renderer: Renderer, color: number) {
    const texture = new Graphics()
      .circle(0, 0, 25)
      .fill({ color: color, alpha: 0.05 })
      .setStrokeStyle({ color: 0x00ff00, width: 2 });

    return renderer.generateTexture(texture);
  }

  // Load textures into the manager
  // public async loadTexture(key: string, color: number): Promise<void> {
  //     const texture = new PIXI.Graphics()
  //     .circle(0, 0, 5)
  //     .fill(color);

  //     // You can also use sprite creation for more complex textures if necessary
  //     this.textures[key] = texture.generateCanvasTexture();
  // }

  // Get texture by key
  public getTexture(key: string): PIXI.Texture | undefined {
    return this.textures[key];
  }
}
