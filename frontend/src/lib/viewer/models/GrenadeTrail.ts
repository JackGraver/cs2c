import { Container, Graphics } from "pixi.js";

type TrailPoint = {
    line: Graphics;
    tick: number;
    rendered: boolean;
};

type OriginPoint = {
    point: Graphics;
    rendered: boolean;
};

export class GrenadeTrail {
    private origin?: OriginPoint;
    private trail: TrailPoint[] = [];

    addPoint(x: number, y: number, tick: number) {
        const last = this.trail[this.trail.length - 1];

        const shouldAdd =
            !last ||
            (() => {
                const dx = x - last.line.position.x;
                const dy = y - last.line.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance >= 10;
            })();

        if (shouldAdd) {
            // Create origin only on first point
            if (!this.origin) {
                const o = new Graphics()
                    .circle(0, 0, 6)
                    .stroke({ width: 2, color: 0xffffff });
                o.position.set(x, y);
                o.zIndex = -1; // Optional: behind trail lines
                this.origin = { point: o, rendered: false };
            }

            const line = new Graphics().rect(0, 0, 4, 1).fill(0xf7f7f7);
            line.position.set(x, y);

            if (last) {
                const dx = x - last.line.position.x;
                const dy = y - last.line.position.y;
                line.rotation = Math.atan2(dy, dx);
            }

            this.trail.push({
                line,
                tick,
                rendered: false,
            });
        }
    }

    getTrail(): TrailPoint[] {
        return this.trail.filter((point) => !point.rendered);
    }

    getOrigin(): Graphics | undefined {
        return this.origin?.point;
    }

    clear(trailContainer: Container) {
        this.trail.forEach((point) => {
            trailContainer.removeChild(point.line);
        });
        if (this.origin) {
            trailContainer.removeChild(this.origin.point);
        }
        this.trail = [];
        this.origin = undefined;
    }

    latestPoint(): TrailPoint | undefined {
        return this.trail[this.trail.length - 1];
    }
}
