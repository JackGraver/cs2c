import * as PIXI from "pixi.js";

import { Graphics, Texture } from "pixi.js";

export class TextureManager {
    private static instance: TextureManager;
    private textures: Record<string, Texture> = {};

    private readyPromise: Promise<void>;

    private svgMap: Record<string, string> = {
        ct: "/map/ct.svg",
        t: "/map/t.svg",
        dead: "/map/dead.svg",
        grenade: "/map/grenade.svg",
        he: "/map/he.png",
        flash: "/map/flashbang.png",
        molly: "/map/molly.png",
        incendiary: "/map/inc.png",
        smoke: "/map/smoke.png",
    };

    private constructor() {
        this.readyPromise = this.createTextures();
    }

    public async whenReady(): Promise<void> {
        return this.readyPromise;
    }

    public static getInstance(): TextureManager {
        if (!TextureManager.instance) {
            TextureManager.instance = new TextureManager();
        }
        return TextureManager.instance;
    }

    public getTextures() {
        return this.textures;
    }

    public hasTextures() {
        return Object.keys(this.textures).length === 0;
    }

    public async createTextures(): Promise<void> {
        const texturePromises = Object.entries(this.svgMap).map(
            async ([key, path]) => {
                const graphic = await PIXI.Assets.load(path);
                this.textures[key] = graphic;
            }
        );

        await Promise.all(texturePromises);
    }

    public getTexture(key: string): Texture | undefined {
        return this.textures[key];
    }
}
