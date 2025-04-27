import {
    Application,
    Container,
    Sprite,
    Assets,
    Graphics,
    Ticker,
    // ColorMatrixFilter,
} from "pixi.js";

import { TextureManager } from "./TextureManager";
import { getMapInfo, MapInfo } from "./MapData";
import { Player } from "./types/player_data";
import { TickData } from "./types/tick_data";
import { PlayerDot } from "./models/playerdot";
import { GrenadeType, InAirGrenade } from "./types/in_air_grenade";
import { InAirGrenadeDot } from "./models/air_grenadedot";
import { Zi } from "./zIndex";

export class MapViewer {
    private container: HTMLDivElement;
    private app: Application;
    private root: Container;

    private tempLayer: Container;

    private players: Record<string, Player> = {};
    private inAirGrenades: Record<number, InAirGrenade> = {};
    private activeSmokes: Record<number, Graphics> = {};
    private activeShots: Record<number, boolean> = {};
    private bombDrawn: boolean;

    private textureManager: TextureManager;

    private mapInfo: MapInfo;

    private mapWidth: number = 0;
    private mapHeight: number = 0;

    constructor(cont: HTMLDivElement, map: string) {
        this.container = cont;
        this.root = new Container();
        this.root.sortableChildren = true;
        this.app = new Application();

        this.tempLayer = new Container();
        this.tempLayer.position.set(0, 0);
        this.tempLayer.visible = true;
        this.tempLayer.zIndex = Zi.Grenade - 1;
        this.tempLayer.sortableChildren = true;

        this.mapInfo = getMapInfo(map);

        this.textureManager = TextureManager.getInstance();
    }

    async init() {
        await this.textureManager.whenReady();

        await this.app.init({
            width: 1024,
            height: 768,
            backgroundAlpha: 0,
            antialias: true,
        });

        this.app.stage.addChild(this.root);
        this.container.appendChild(this.app.canvas);

        this.root.addChild(this.tempLayer);

        await this.drawMap();
    }

    private async drawMap() {
        const texture = await Assets.load(this.mapInfo.imagePath);
        const sprite = new Sprite(texture);

        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        const scaleX = containerWidth / texture.width;
        const scaleY = containerHeight / texture.height;

        const scale = Math.min(scaleX, scaleY);

        sprite.scale.set(scale);
        this.mapWidth = sprite.width;
        this.mapHeight = sprite.height;

        sprite.anchor.set(0.5);
        sprite.x = containerWidth / 2;
        sprite.y = containerHeight / 2;

        // const colorMatrix = new ColorMatrixFilter();
        // colorMatrix.greyscale(0.5, false); // 1 is full greyscale

        // // Apply to sprite
        // sprite.filters = [colorMatrix];

        sprite.zIndex = Zi.Map;

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

            await playerDot.init(this.textureManager.getTexture(playerSide)!);

            playerDot.dot!.zIndex = Zi.Player;
            playerDot.nameText!.zIndex = Zi.PlayerName;

            this.players[playerName] = {
                display: playerDot,
                X: p.X,
                Y: p.Y,
                name: p.name,
                side: p.side as "ct" | "t",
                team_name: p.team_name,
                health: Number(p.health),
                yaw: p.yaw,
                defuser: false,
                bomb: false,
                knife: p.knife,
                secondary: p.secondary,
                primary: p.primary,
                grenades: p.grenades,
            };

            this.root.addChild(playerDot.dot!);
            this.root.addChild(playerDot.nameText!);
        }
    }

    async reDrawPlayers() {
        Object.entries(this.players).forEach(([, p]) => {
            p.display.dot!.texture = this.textureManager.getTexture(p.side)!;
        });
    }

    public hasPlayers() {
        return Object.keys(this.players).length !== 0;
    }

    private interpolateAngle(a: number, b: number, t: number): number {
        let diff = b - a;

        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        return a + diff * t;
    }

    public async renderInterpolatedFrame(
        currentTick: TickData,
        previousTick: TickData,
        t: number
    ) {
        // === UPDATE PLAYERS ===
        for (const player of currentTick.players) {
            const prev = previousTick.players.find(
                (p) => p.name === player.name
            );
            if (!prev) continue;

            const interpX = prev.X + (player.X - prev.X) * t;
            const interpY = prev.Y + (player.Y - prev.Y) * t;
            const interpYaw = this.interpolateAngle(prev.yaw, player.yaw, t);

            const [x, y] = this.transformCoordinates(interpX, interpY);

            const sprite = this.players[player.name].display;

            const texture =
                player.health === 0
                    ? this.textureManager.getTexture("dead")!
                    : this.textureManager.getTexture(sprite.side)!;

            if (sprite) {
                if (player.health === 0) {
                    sprite.nameText!.visible = false;
                    sprite.dot!.zIndex = Zi.DeadPlayer;
                } else {
                    sprite.nameText!.visible = true;
                    sprite.dot!.zIndex = Zi.Player;
                }

                sprite.dot!.texture = texture;

                sprite.updatePosition(x, y, interpYaw);
            }
        }

        if (currentTick.bomb_plant.length !== 0) {
            const bomb = currentTick.bomb_plant[0];
            const [x, y] = this.transformCoordinates(bomb.user_X, bomb.user_Y);

            let b = new Graphics();
            b = new Graphics();
            b.rect(0, 0, 10, 15);
            b.fill({ color: 0xffbf00, alpha: 0.8 });
            b.position.set(x, y);
            b.zIndex = Zi.Grenade;

            this.tempLayer.addChild(b);
            // this.activeSmokes[smoke.entity_id] = g;
        }

        // === DRAW SHOTS ===
        for (const shot of currentTick.shots) {
            if (!this.activeShots[shot.shot_id]) {
                this.activeShots[shot.shot_id] = true;
                let [x, y] = this.transformCoordinates(
                    shot.user_X,
                    shot.user_Y
                );
                const yawInRadians = (shot.user_yaw * Math.PI) / 180;

                const directionX = Math.cos(yawInRadians);
                const directionY = Math.sin(yawInRadians);

                x += directionX * 15;
                y += -directionY * 15;

                this.triggerGrenadeEffect(x, y, GrenadeType.Shot);
            }
        }

        // === DRAW ACTIVE SMOKES ===
        for (const smoke of currentTick.activeSmokes) {
            const prev = previousTick.activeSmokes.find(
                (s) => s.entity_id === smoke.entity_id
            );
            if (!prev) continue;

            const interpX = prev.X + (smoke.X - prev.X) * t;
            const interpY = prev.Y + (smoke.Y - prev.Y) * t;

            const [x, y] = this.transformCoordinates(interpX, interpY);

            let g = new Graphics();
            if (this.activeSmokes[smoke.entity_id]) {
                g = this.activeSmokes[smoke.entity_id];
                g.position.set(x, y);
            } else {
                g = new Graphics();
                g.circle(0, 0, 20);
                g.fill({ color: 0x888888, alpha: 0.4 });
                g.position.set(x, y);
                g.zIndex = Zi.Grenade;

                this.tempLayer.addChild(g);
                this.activeSmokes[smoke.entity_id] = g;
            }
        }

        for (const [id, graphic] of Object.entries(this.activeSmokes)) {
            const stillActive = currentTick.activeSmokes.some(
                (s) => s.entity_id === Number(id)
            );

            if (!stillActive) {
                this.tempLayer.removeChild(graphic);
                delete this.activeSmokes[Number(id)];
            }
        }

        // // === DRAW ACTIVE MOLOTOVS ===
        for (const molly of currentTick.activeMolly) {
            const prev = previousTick.activeMolly.find(
                (m) => m.entity_id === molly.entity_id
            );
            if (!prev) continue;

            const interpX = prev.X + (molly.X - prev.X) * t;
            const interpY = prev.Y + (molly.Y - prev.Y) * t;

            const [x, y] = this.transformCoordinates(interpX, interpY);

            let g = new Graphics();
            if (this.activeSmokes[molly.entity_id]) {
                g = this.activeSmokes[molly.entity_id];
                g.position.set(x, y);
            } else {
                g = new Graphics();
                g.circle(0, 0, 20);
                g.fill({ color: 0xff4500, alpha: 0.4 });
                g.position.set(x, y);
                g.zIndex = Zi.Grenade;

                this.tempLayer.addChild(g);
                this.activeSmokes[molly.entity_id] = g;
            }
        }

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
                sprite.display.x = x;
                sprite.display.y = y;

                sprite.display.updatePosition(x, y);
            } else {
                // If the sprite doesn't exist, create it
                const grenadeDot = new InAirGrenadeDot(
                    x,
                    y,
                    flash.entity_id,
                    flash.grenade_type,
                    flash.thrower
                );
                await grenadeDot.init(
                    this.textureManager.getTexture("grenade")!
                );
                grenadeDot.dot!.zIndex = Zi.Grenade;

                this.inAirGrenades[flash.entity_id] = {
                    display: grenadeDot,
                    X: x,
                    Y: y,
                    entity_id: flash.entity_id,
                    grenade_type: flash.grenade_type,
                    thrower: flash.thrower,
                };
                this.tempLayer.addChild(grenadeDot.dot!);
            }
        }

        // If there are grenades in inAirGrenades that are no longer in currentTick, remove them
        for (const [id, sprite] of Object.entries(this.inAirGrenades)) {
            const flash = currentTick.activeGrenades.find(
                (f) => f.entity_id === Number(id)
            );

            if (!flash) {
                // Grenade no longer exists, so we assume it just exploded
                this.triggerGrenadeEffect(
                    sprite.display.x,
                    sprite.display.y,
                    sprite.grenade_type
                ); // ⬅️ Your custom effect

                // Remove the grenade sprite
                this.tempLayer.removeChild(sprite.display.dot!);
                delete this.inAirGrenades[Number(id)];
            }
        }
    }

    private triggerGrenadeEffect(
        x: number,
        y: number,
        type: GrenadeType | undefined
    ) {
        let color: number;
        let alpha: number = 0.8;
        let size: number = 25;

        if (type === GrenadeType.Flashbang) {
            color = 0xffffff; // white
        } else if (type === GrenadeType.HE) {
            color = 0xff4500; // reddish-orange (you can tweak this)
        } else if (type === GrenadeType.Shot) {
            color = color = 0xffffff;
            size = 15;
        } else {
            color = 0xffffff; // fallback/default color
            alpha = 0;
        }

        const effect = new Graphics().circle(0, 0, size).fill({ color, alpha });

        effect.position.set(x, y);
        effect.zIndex = Zi.Grenade;
        this.tempLayer.addChild(effect);

        // Fade out and remove
        Ticker.shared.addOnce(() => {
            const fade = new Ticker();
            let alpha = 0.8;

            fade.add(() => {
                alpha -= 0.1;
                effect.alpha = alpha;

                if (alpha <= 0) {
                    this.tempLayer.removeChild(effect);
                    fade.stop();
                }
            });

            fade.start();
        });
    }

    public async drawFrame(tick: TickData) {
        this.tempLayer?.removeChildren();

        // === DRAW PLAYERS ===
        for (let i = 0; i < tick.players.length; i++) {
            const p = tick.players[i];
            const [x, y] = this.transformCoordinates(p.X, p.Y);

            if (!this.players[p.name]) continue;

            // const playerGraphic = this.players[p.name].display.dot;

            // if (p.health === 0) {
            //     playerGraphic.texture = this.textureManager.getTexture("dead")!;
            // } else {
            //     playerGraphic.texture = this.textureManager.getTexture(p.side)!;
            // }

            this.players[p.name].display.updatePosition(x, y, p.yaw);
            // this.players[p.name].display.updatePosition(newX, newY, p.yaw);
        }
    }

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
