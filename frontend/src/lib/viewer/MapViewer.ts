import { Application, Container, Sprite, Assets, Graphics } from "pixi.js";

import { TextureManager } from "./TextureManager";
import { getMapInfo, MapInfo } from "./MapData";
import { Player } from "./types/player_data";
import { TickData } from "./types/tick_data";
import { PlayerDot } from "./models/player";

export class MapViewer {
    private container: HTMLDivElement;
    private app: Application;
    private root: Container;

    private tempLayer: Container;

    private players: Record<string, Player> = {};
    private inAirGrenades: Record<number, Sprite> = {};

    private textureManager: TextureManager;

    private mapInfo: MapInfo;

    private mapWidth: number;
    private mapHeight: number;

    constructor(cont: HTMLDivElement, map: string) {
        this.container = cont;
        this.root = new Container();
        this.root.sortableChildren = true;
        this.app = new Application();

        this.tempLayer = new Container();
        this.tempLayer.position.set(0, 0);
        this.tempLayer.visible = true;
        this.tempLayer.zIndex = 200;
        this.tempLayer.sortableChildren = true;

        this.textureManager = TextureManager.getInstance();

        this.mapInfo = getMapInfo(map);
    }

    async init() {
        await this.app.init({
            width: 1024,
            height: 768,
            backgroundAlpha: 0,
            antialias: true,
        });

        this.app.stage.addChild(this.root);
        this.container.appendChild(this.app.canvas);

        this.root.addChild(this.tempLayer);

        await this.textureManager.createTextures(
            this.app.renderer,
            ["t", "ct", "dead", "smoke"],
            [0xff0000, 0x0000ff, 0xd3d3d3, 0xffc0cb]
        );

        await this.drawMap();
    }

    private async drawMap() {
        // const texture = await Assets.load("/de_inferno.png");
        const texture = await Assets.load(this.mapInfo.imagePath);
        const sprite = new Sprite(texture);

        // Get container size (could be dynamic if container resizes)
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        // Calculate the scale factor based on the container dimensions
        const scaleX = containerWidth / texture.width;
        const scaleY = containerHeight / texture.height;

        // Use the smaller scale factor to maintain aspect ratio
        const scale = Math.min(scaleX, scaleY);
        // const scale = (scaleX + scaleY) / 2 - 0.03;

        console.log("s", scale);

        // Apply scaling to the sprite
        sprite.scale.set(scale);
        console.log(sprite.width, sprite.height);
        this.mapWidth = sprite.width;
        this.mapHeight = sprite.height;

        // Position the sprite in the center of the container
        sprite.anchor.set(0.5);
        sprite.x = containerWidth / 2;
        sprite.y = containerHeight / 2;
        console.log("x y map", containerWidth / 2, containerHeight / 2);

        const g = new Graphics();
        g.circle(0, 0, 8);
        g.fill({ color: 0xa9f920 });

        // const [x, y] = this.transformCoordinates(-1675, 351);
        const [x, y] = this.transformCoordinates(0, 0);
        console.log("test 1 (t) [170, 545]", x, y);
        g.position.set(x, y);
        // g.position.set(170, 545);
        g.zIndex = 500;
        this.root.addChild(g);

        // const g2 = new Graphics();
        // g2.circle(0, 0, 8);
        // g2.fill({ color: 0xffffff });

        // const [x2, y2] = this.transformCoordinates(2473, 2005);
        // console.log("test 2 (ct) [850, 270]", x2, y2);
        // g2.position.set(x2, y2);
        // // g2.position.set(850, 270);
        // g2.zIndex = 500;
        // this.root.addChild(g2);

        // Ensure the sprite is at the lowest layer
        sprite.zIndex = 0;

        this.root.addChild(sprite);
    }

    async createPlayers(firstTick: TickData) {
        for (let i = 0; i < firstTick.players.length; i++) {
            const p = firstTick.players[i];
            const [x, y] = this.transformCoordinates(p.X, p.Y);

            const playerName = p.name;
            const playerSide = p.side;

            const playerDot = new PlayerDot(
                playerName,
                x,
                y,
                p.yaw,
                playerSide
            );

            playerDot.dot.zIndex = 120;

            this.players[playerName] = {
                display: playerDot,
                X: p.X,
                Y: p.Y,
                name: p.name,
                side: p.side as "ct" | "t",
                health: Number(p.health),
                yaw: p.yaw,
                defuser: false,
                bomb: false,
                knife: p.knife,
                secondary: p.secondary,
                primary: p.primary,
                grenades: p.grenades,
            };

            this.root.addChild(playerDot.dot);
        }
    }

    public hasPlayers() {
        return Object.keys(this.players).length !== 0;
    }

    public async interpolateAndRenderPlayers(
        currentTick: TickData,
        previousTick: TickData
    ) {
        currentTick.players.forEach((player) => {
            const prevPlayer = previousTick.players.find(
                (p) => p.name === player.name
            );
            if (!prevPlayer) return;

            const deltaX = player.X - prevPlayer.X;
            const deltaY = player.Y - prevPlayer.Y;

            // Interpolated position
            const interpolatedX = prevPlayer.X + deltaX * 0.5;
            const interpolatedY = prevPlayer.Y + deltaY * 0.5;

            // Transform to canvas coordinates
            const [x, y] = this.transformCoordinates(
                interpolatedX,
                interpolatedY
            );

            const playerSprite = this.players[player.name].display.dot;

            if (player.health === 0) {
                playerSprite.texture = this.textureManager.getTexture("dead")!;
            } else {
                playerSprite.texture = this.textureManager.getTexture(
                    player.side
                )!;
            }

            if (playerSprite) {
                playerSprite.x = x;
                playerSprite.y = y;
            }
        });
    }

    public renderInterpolatedFrame(
        currentTick: TickData,
        previousTick: TickData,
        t: number
    ) {
        for (const player of currentTick.players) {
            const prev = previousTick.players.find(
                (p) => p.name === player.name
            );
            if (!prev) continue;

            const interpX = prev.X + (player.X - prev.X) * t;
            const interpY = prev.Y + (player.Y - prev.Y) * t;
            const interpYaw = prev.yaw + (player.yaw - prev.yaw) * t; // optional

            const [x, y] = this.transformCoordinates(interpX, interpY);

            const sprite = this.players[player.name].display.dot;

            if (sprite) {
                if (player.health === 0) {
                    sprite.texture = this.textureManager.getTexture("dead")!;
                } else {
                    sprite.texture = this.textureManager.getTexture(
                        player.side
                    )!;
                }

                sprite.x = x;
                sprite.y = y;

                this.players[player.name].display.updatePosition(
                    x,
                    y,
                    interpYaw
                );
            }
        }
        // === DRAW ACTIVE SMOKES ===
        // for (const smoke of currentTick.activeSmokes) {
        //     const prev = previousTick.activeSmokes.find(
        //         (s) => s.id === smoke.id
        //     );
        //     if (!prev) continue;

        //     const interpX = prev.X + (smoke.X - prev.X) * t;
        //     const interpY = prev.Y + (smoke.Y - prev.Y) * t;

        //     const [x, y] = this.transformCoordinates(interpX, interpY);
        //     const g = new Graphics();
        //     g.circle(0, 0, 20);
        //     g.fill({ color: 0x888888, alpha: 0.4 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }

        // // === DRAW ACTIVE MOLOTOVS ===
        // for (const molly of currentTick.activeMolly) {
        //     const prev = previousTick.activeMolly.find(
        //         (m) => m.id === molly.id
        //     );
        //     if (!prev) continue;

        //     const interpX = prev.X + (molly.X - prev.X) * t;
        //     const interpY = prev.Y + (molly.Y - prev.Y) * t;

        //     const [x, y] = this.transformCoordinates(interpX, interpY);
        //     const g = new Graphics();
        //     g.circle(0, 0, 20);
        //     g.fill({ color: 0xff4500, alpha: 0.5 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }

        // === DRAW FLASHES ===

        for (const flash of currentTick.activeGrenades) {
            const prev = previousTick.activeGrenades.find(
                (f) => f.entity_id === flash.entity_id
            );

            // Check if we have a corresponding previous state for interpolation
            if (!prev) continue;

            const interpX = prev.X + (flash.X - prev.X) * t;
            const interpY = prev.Y + (flash.Y - prev.Y) * t;

            const [x, y] = this.transformCoordinates(interpX, interpY);

            // Check if the sprite already exists in inAirGrenades
            if (this.inAirGrenades[flash.entity_id]) {
                const sprite = this.inAirGrenades[flash.entity_id];
                // Update the sprite position
                sprite.x = x;
                sprite.y = y;
            } else {
                // If the sprite doesn't exist, create it
                const sprite = new Sprite(this.textureManager.getTexture("t")); // Use the appropriate texture for your grenade
                sprite.zIndex = 120;
                sprite.position.set(x, y);
                this.inAirGrenades[flash.entity_id] = sprite;
                this.tempLayer.addChild(sprite);
            }
        }

        // If there are grenades in inAirGrenades that are no longer in currentTick, remove them
        for (const [id, sprite] of Object.entries(this.inAirGrenades)) {
            const flash = currentTick.activeGrenades.find(
                (f) => f.entity_id === Number(id)
            );

            if (!flash) {
                // Remove the sprite if the grenade is no longer in the current tick
                this.tempLayer.removeChild(sprite);
                delete this.inAirGrenades[Number(id)];
            }
        }

        // for (const flash of currentTick.activeGrenades) {
        //     const prev = previousTick.activeGrenades.find(
        //         (f) => f.id === flash.id
        //     );
        //     if (!prev) continue;

        //     const interpX = prev.X + (flash.X - prev.X) * t;
        //     const interpY = prev.Y + (flash.Y - prev.Y) * t;

        //     const [x, y] = this.transformCoordinates(interpX, interpY);
        //     const g = new Graphics();
        //     g.rect(-5, -2, 10, 4);
        //     g.fill({ color: 0xffff00, alpha: 0.9 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }
    }

    public async drawFrame(tick: TickData) {
        this.tempLayer?.removeChildren();

        // === DRAW PLAYERS ===
        for (let i = 0; i < tick.players.length; i++) {
            const p = tick.players[i];
            const [x, y] = this.transformCoordinates(p.X, p.Y);

            if (!this.players[p.name]) continue;

            const playerGraphic = this.players[p.name].display.dot;

            if (p.health === 0) {
                playerGraphic.texture = this.textureManager.getTexture("dead")!;
            } else {
                playerGraphic.texture = this.textureManager.getTexture(p.side)!;
            }

            this.players[p.name].display.updatePosition(x, y, p.yaw);
            // this.players[p.name].display.updatePosition(newX, newY, p.yaw);
        }

        // // === DRAW ACTIVE SMOKES ===
        // for (const smoke of tick.activeSmokes) {
        //     const [x, y] = this.transformCoordinates(smoke.X, smoke.Y);
        //     const g = new Graphics();
        //     g.circle(0, 0, 20);
        //     g.fill({ color: 0x888888, alpha: 0.4 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }

        // // // === DRAW ACTIVE MOLOTOVS ===
        // for (const molly of tick.activeMolly) {
        //     const [x, y] = this.transformCoordinates(molly.X, molly.Y);
        //     const g = new Graphics();
        //     g.circle(0, 0, 20);
        //     g.fill({ color: 0xff4500, alpha: 0.5 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }

        // // // === DRAW FLASHES ===
        // for (const flash of tick.activeGrenades) {
        //     const [x, y] = this.transformCoordinates(flash.X, flash.Y);
        //     const g = new Graphics();
        //     g.rect(-5, -2, 10, 4);
        //     g.fill({ color: 0xffff00, alpha: 0.9 });

        //     g.position.set(x, y);
        //     this.tempLayer.addChild(g);
        // }
    }

    // 2473, 2005 - > 820, 270
    // -1675, 351 -> 210, 520

    // screenX = zoom_factor*cartX + screen_width/2
    // screenY = screen_height/2 - zoom_factor*cartY

    // screenx = (cartesianx + screenwidth / 2) / scalefactor;
    // screeny = (-cartesiany + screenheight / 2) / scalefactor;

    private transformCoordinates(x: number, y: number) {
        const { X_MIN, X_MAX, Y_MIN, Y_MAX } = this.mapInfo;

        const containerWidth = 1024;
        const containerHeight = 768;
        const mapWidth = this.mapWidth;
        const mapHeight = this.mapHeight;

        const xNorm = (x - X_MIN) / (X_MAX - X_MIN);
        const yNorm = (y - Y_MIN) / (Y_MAX - Y_MIN);

        const xMap = xNorm * mapWidth;
        const yMap = (1 - yNorm) * mapHeight; // flip Y

        const offsetX = (containerWidth - mapWidth) / 2;
        const offsetY = (containerHeight - mapHeight) / 2;

        const screenX = xMap + offsetX;
        const screenY = yMap + offsetY;

        return [screenX, screenY];
    }

    public destroy() {
        this.app.destroy(true, { children: true });
        this.container.innerHTML = "";
    }
}
