import {
    Application,
    Container,
    Sprite,
    Assets,
    Graphics,
    Ticker,
} from "pixi.js";

import { TextureManager } from "./managers/TextureManager";
import { getMapInfo, MapInfo } from "./models/MapData";
import { TickData } from "./types/TickData";
import { PlayerDot } from "./models/PlayerDot";
import {
    getGrenadeNameFromType,
    GrenadeType,
    textureMap,
} from "./types/InAirGrenade";
import { InAirGrenadeDot } from "./models/InAirGrenadeDot";
import { Zi } from "./types/zIndex";
import { BombDot } from "./models/BombDot";

export class MapViewer {
    private container: HTMLDivElement;
    private app: Application;
    private root: Container;

    private mapLayer: Container;

    private tempLayer: Container;

    private trailContainer: Container;

    private players: Record<string, PlayerDot> = {};
    private inAirGrenades: Record<number, InAirGrenadeDot> = {};
    private activeSmokes: Record<number, Graphics> = {};
    private activeShots: Record<number, boolean> = {};
    private bomb: BombDot = new BombDot(this.transformCoordinates.bind(this));

    private textureManager: TextureManager;

    private mapInfo: MapInfo;

    private mapWidth: number = 0;
    private mapHeight: number = 0;

    constructor(cont: HTMLDivElement, map: string) {
        this.container = cont;
        this.root = new Container();
        this.root.interactive = true;
        this.root.sortableChildren = true;
        this.app = new Application();

        this.mapLayer = new Container();

        this.mapLayer.zIndex = 0;

        this.tempLayer = new Container();
        this.tempLayer.position.set(0, 0);
        this.tempLayer.visible = true;
        this.tempLayer.zIndex = Zi.Grenade - 1;
        this.tempLayer.sortableChildren = true;

        this.trailContainer = new Container();
        this.tempLayer.position.set(0, 0);
        this.tempLayer.visible = true;
        this.tempLayer.zIndex = Zi.Grenade - 2;
        this.tempLayer.sortableChildren = true;

        this.mapInfo = getMapInfo(map);

        this.textureManager = TextureManager.getInstance();
    }

    async updateMap(map: string) {
        this.mapInfo = getMapInfo(map);
        this.mapLayer.removeChildren();
        this.drawMap();
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

        this.root.addChild(this.mapLayer);

        this.root.addChild(this.tempLayer);

        this.root.addChild(this.trailContainer);

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

        sprite.zIndex = Zi.Map;

        this.mapLayer.addChild(sprite);
    }

    async createPlayers(firstTick: TickData) {
        for (let i = 0; i < firstTick.players.length; i++) {
            const p = firstTick.players[i];
            const [x, y] = this.transformCoordinates(p.X, p.Y);

            const playerName = p.name;
            const playerSide = p.is_ct;

            const playerDot = new PlayerDot(
                playerName,
                x,
                y,
                p.yaw,
                playerSide,
                this.transformCoordinates.bind(this),
                this.textureManager
            );

            await playerDot.create(
                this.textureManager.getTexture(playerDot.side)!
            );

            this.players[playerName] = playerDot;

            this.root.addChild(playerDot.dot!);
            this.root.addChild(playerDot.nameText!);
        }
        // this.bomb.create();
    }

    async reDrawPlayers() {
        Object.entries(this.players).forEach(([, p]) => {
            p.dot!.texture = this.textureManager.getTexture(p.side)!;
        });
    }

    public hasPlayers() {
        return Object.keys(this.players).length !== 0;
    }

    public async renderInterpolatedFrame(
        currentTick: TickData,
        previousTick: TickData,
        t: number
    ) {
        // console.log("render?", currentTick.players);
        // console.log("update", this.players);
        // === UPDATE PLAYERS ===
        for (const player of currentTick.players) {
            const prev = previousTick.players.find(
                (p) => p.name === player.name
            );
            if (!prev) continue;

            this.players[player.name]?.update(
                prev,
                player,
                t,
                this.mapInfo.Z_SWITCH ? this.mapInfo.Z_SWITCH : NaN,
                this.mapInfo.name === "de_nuke" ? true : false
            );
        }

        // === Bomb ===
        // this.bomb?.update(currentTick);
        // if (this.bomb.displayed) {
        //     this.tempLayer.addChild(this.bomb.dot!);
        // }

        // === DRAW SHOTS ===
        for (const shot of currentTick.shots) {
            if (!this.activeShots[shot.shot_id]) {
                this.activeShots[shot.shot_id] = true;
                let [x, y] = this.transformCoordinates(shot.X, shot.Y);
                const yawInRadians = (shot.yaw * Math.PI) / 180;

                const directionX = Math.cos(yawInRadians);
                const directionY = Math.sin(yawInRadians);

                x += directionX * 15;
                y += -directionY * 15;

                this.triggerGrenadeEffect(x, y, GrenadeType.Shot);
            }
        }

        // === DRAW ACTIVE SMOKES ===
        for (const smoke of currentTick.smokes) {
            const prev = previousTick.smokes.find(
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

                this.inAirGrenades[smoke.entity_id]?.deleteTrail(
                    this.trailContainer
                );
            }
        }

        for (const [id, graphic] of Object.entries(this.activeSmokes)) {
            const stillActive = currentTick.smokes.some(
                (s) => s.entity_id === Number(id)
            );

            if (!stillActive) {
                this.tempLayer.removeChild(graphic);
                delete this.activeSmokes[Number(id)];
            }
        }

        // // === DRAW ACTIVE MOLOTOVS ===
        for (const molly of currentTick.mollys) {
            const prev = previousTick.mollys.find(
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

        // === DRAW IN AIR GRENADES ===
        for (const tickGrenade of currentTick.in_air_grenades) {
            const prev = previousTick.in_air_grenades.find(
                (f) => f.entity_id === tickGrenade.entity_id
            );

            // Check if we have a corresponding previous state for interpolation
            if (!prev) continue;

            const grenade = this.inAirGrenades[tickGrenade.entity_id];
            // Check if the sprite already exists in inAirGrenades
            if (grenade) {
                grenade.update(prev, tickGrenade, t);

                const origin = grenade.trail?.getOrigin();
                if (origin) {
                    this.trailContainer.addChild(origin);
                }

                for (const point of grenade.trail.getTrail()) {
                    // setTimeout(() => {
                    this.trailContainer.addChild(point.line);
                    point.rendered = true;
                    // }, 100); // 100ms delay (adjust as needed)
                }
            } else {
                // If the sprite doesn't exist, create it
                const grenadeDot = new InAirGrenadeDot(
                    tickGrenade.X,
                    tickGrenade.Y,
                    tickGrenade.entity_id,
                    getGrenadeNameFromType(tickGrenade.type)!,
                    this.transformCoordinates.bind(this)
                );

                const textureKey = textureMap[grenadeDot.type]; // fallback
                grenadeDot.create(this.textureManager.getTexture(textureKey)!);

                this.inAirGrenades[tickGrenade.entity_id] = grenadeDot;
                this.tempLayer.addChild(grenadeDot.dot!);
            }
        }

        // If there are grenades in inAirGrenades that are no longer in currentTick, remove them
        for (const [id, sprite] of Object.entries(this.inAirGrenades)) {
            const flash = currentTick.in_air_grenades.find(
                (f) => f.entity_id === Number(id)
            );

            if (!flash) {
                // Grenade no longer exists, so we assume it just exploded
                this.triggerGrenadeEffect(
                    sprite.dot!.x,
                    sprite.dot!.y,
                    sprite.type
                );

                this.inAirGrenades[Number(id)]?.deleteTrail(
                    this.trailContainer
                );

                // Remove the grenade sprite
                this.tempLayer.removeChild(sprite.dot!);
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

    private transformCoordinates(x: number, y: number): [number, number] {
        const { X_MIN, X_MAX, Y_MIN, Y_MAX } = this.mapInfo;

        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        const mapWidth = this.mapWidth;
        const mapHeight = this.mapHeight;

        const xNorm = (x - X_MIN) / (X_MAX - X_MIN);
        const yNorm = (y - Y_MIN) / (Y_MAX - Y_MIN);

        const xMap = xNorm * mapWidth;
        const yMap = (1 - yNorm) * mapHeight; // flip Y

        const offsetX = (containerWidth - mapWidth) / 2; // apply -30px X shift
        const offsetY = (containerHeight - mapHeight) / 2; // no Y shift

        const screenX = xMap + offsetX;
        const screenY = yMap + offsetY;

        return [screenX, screenY];
    }

    public destroy() {
        this.app.destroy(true, { children: true });
        this.container.innerHTML = "";
    }
}
