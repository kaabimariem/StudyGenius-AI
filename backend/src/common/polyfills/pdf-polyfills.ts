// Polyfills pour pdf-parse dans l'environnement Node.js
// Ces APIs du navigateur ne sont pas disponibles par défaut dans Node.js

if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
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

    constructor(init?: string | number[]) {
      if (init) {
        // Simple initialization
      }
    }

    static fromMatrix(other?: DOMMatrix) {
      return new DOMMatrix();
    }

    static fromFloat32Array(array32: Float32Array) {
      return new DOMMatrix();
    }

    static fromFloat64Array(array64: Float64Array) {
      return new DOMMatrix();
    }

    invertSelf() {
      return this;
    }

    multiplySelf(other?: DOMMatrix) {
      return this;
    }

    preMultiplySelf(other?: DOMMatrix) {
      return this;
    }

    setMatrixValue(transformList: string) {
      return this;
    }

    translateSelf(tx?: number, ty?: number, tz?: number) {
      return this;
    }

    scaleSelf(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number) {
      return this;
    }

    scale3dSelf(scale?: number, originX?: number, originY?: number, originZ?: number) {
      return this;
    }

    rotateSelf(rotX?: number, rotY?: number, rotZ?: number) {
      return this;
    }

    rotateFromVectorSelf(x?: number, y?: number) {
      return this;
    }

    rotateAxisAngleSelf(x?: number, y?: number, z?: number, angle?: number) {
      return this;
    }

    skewXSelf(sx?: number) {
      return this;
    }

    skewYSelf(sy?: number) {
      return this;
    }

    flipXSelf() {
      return this;
    }

    flipYSelf() {
      return this;
    }

    inverse() {
      return new DOMMatrix();
    }

    multiply(other?: DOMMatrix) {
      return new DOMMatrix();
    }

    translate(tx?: number, ty?: number, tz?: number) {
      return new DOMMatrix();
    }

    scale(scaleX?: number, scaleY?: number, scaleZ?: number, originX?: number, originY?: number, originZ?: number) {
      return new DOMMatrix();
    }

    scale3d(scale?: number, originX?: number, originY?: number, originZ?: number) {
      return new DOMMatrix();
    }

    rotate(rotX?: number, rotY?: number, rotZ?: number) {
      return new DOMMatrix();
    }

    rotateFromVector(x?: number, y?: number) {
      return new DOMMatrix();
    }

    rotateAxisAngle(x?: number, y?: number, z?: number, angle?: number) {
      return new DOMMatrix();
    }

    skewX(sx?: number) {
      return new DOMMatrix();
    }

    skewY(sy?: number) {
      return new DOMMatrix();
    }

    flipX() {
      return new DOMMatrix();
    }

    flipY() {
      return new DOMMatrix();
    }

    toFloat32Array() {
      return new Float32Array(16);
    }

    toFloat64Array() {
      return new Float64Array(16);
    }

    toString() {
      return 'matrix(1, 0, 0, 1, 0, 0)';
    }
  } as any;
}

if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {
    constructor(
      public data: Uint8ClampedArray | number,
      public width: number,
      public height?: number,
    ) {
      if (typeof data === 'number') {
        this.data = new Uint8ClampedArray(data * (height || width));
      }
    }
  } as any;
}

if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {
    constructor(path?: Path2D | string) {}
    addPath(path: Path2D, transform?: DOMMatrix2DInit) {}
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {}
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {}
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {}
    closePath() {}
    ellipse(
      x: number,
      y: number,
      radiusX: number,
      radiusY: number,
      rotation: number,
      startAngle: number,
      endAngle: number,
      anticlockwise?: boolean,
    ) {}
    lineTo(x: number, y: number) {}
    moveTo(x: number, y: number) {}
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {}
    rect(x: number, y: number, w: number, h: number) {}
  } as any;
}

// Interface pour DOMMatrix2DInit
interface DOMMatrix2DInit {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  e?: number;
  f?: number;
  m11?: number;
  m12?: number;
  m21?: number;
  m22?: number;
  m41?: number;
  m42?: number;
}


