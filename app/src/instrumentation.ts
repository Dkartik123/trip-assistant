// Polyfill browser APIs required by pdfjs-dist in Node.js (must run before any import)
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    m11 = 1;
    m12 = 0;
    m13 = 0;
    m14 = 0;
    m21 = 0;
    m22 = 1;
    m23 = 0;
    m24 = 0;
    m31 = 0;
    m32 = 0;
    m33 = 1;
    m34 = 0;
    m41 = 0;
    m42 = 0;
    m43 = 0;
    m44 = 1;
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    is2D = true;
    isIdentity = true;
    inverse() {
      return new DOMMatrix();
    }
    multiply() {
      return new DOMMatrix();
    }
    translate() {
      return new DOMMatrix();
    }
    scale() {
      return new DOMMatrix();
    }
    rotate() {
      return new DOMMatrix();
    }
    transformPoint() {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
    toString() {
      return "";
    }
  } as unknown as typeof globalThis.DOMMatrix;
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {
    addPath() {
      /* noop */
    }
    closePath() {
      /* noop */
    }
    moveTo() {
      /* noop */
    }
    lineTo() {
      /* noop */
    }
    bezierCurveTo() {
      /* noop */
    }
    quadraticCurveTo() {
      /* noop */
    }
    arc() {
      /* noop */
    }
    arcTo() {
      /* noop */
    }
    ellipse() {
      /* noop */
    }
    rect() {
      /* noop */
    }
  } as unknown as typeof globalThis.Path2D;
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace = "srgb" as const;
    constructor(sw: number, sh: number) {
      this.width = sw;
      this.height = sh;
      this.data = new Uint8ClampedArray(sw * sh * 4);
    }
  } as unknown as typeof globalThis.ImageData;
}

import { createLogger } from "@/lib/logger";

const log = createLogger("instrumentation");

/**
 * Next.js instrumentation — runs once on server startup.
 * Used to initialize the scheduler and bot.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on server (not edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    log.info("Server starting — initializing services");

    // Initialize scheduler (cron jobs)
    const { initScheduler } = await import("@/lib/scheduler");
    initScheduler();

    log.info("Services initialized");
  }
}
