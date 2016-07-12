class Canvas {
    constructor(width, height) {
        this.canvas = document.createElement("canvas")
        this.width = width
        this.height = height
        this.canvas.width = width
        this.canvas.height = height
        this.context = this.canvas.getContext("2d")
        this.imageData = this.context.getImageData(0, 0, width, height)
        this.pixels = this.imageData.data
        document.body.appendChild(this.canvas)
    }

    get CurrentPixels() {
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
        this.pixels = this.imageData.data
        return this.pixels
    }

    get Center() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        }
    }

    set visible(isVisible) {
        if (isVisible) {
            canvas.sytle.display = "inline"
        }
        else {
            canvas.style.display = "none"
        }
    }

    drawPath(poly) {
        if (poly.length < 1) {
            return
        }

        this.context.beginPath()
        this.context.moveTo(poly[0].x, poly[0].y)
        for (let i = 1; i < poly.length; ++i) {
            this.context.lineTo(poly[i].x, poly[i].y)
        }
        this.context.closePath()
        this.context.fill()
        this.context.stroke()
    }

    drawPoints(points, radius) {
        for (let index = 0; index < points.length; ++index) {
            this.drawPoint(points[index], radius)
        }
    }

    drawNumbers(points) {
        for (let index = 0; index < points.length; ++index) {
            this.context.fillText(index, points[index].x, points[index].y)
        }
    }

    drawLine(a, b) {
        this.context.beginPath()
        this.context.moveTo(a.x, a.y)
        this.context.lineTo(b.x, b.y)
        this.context.stroke()
    }

    drawPoint(point, radius) {
        this.context.beginPath()
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, false)
        this.context.fill()
    }

    clearWhite() {
        this.context.fillStyle = "#ffffff"
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fill()
    }

    clear(color) {
        this.context.fillStyle = color
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fill()
    }

    resetTransform() {
        this.context.transform(1, 0, 0, 1, 0, 0)
    }

    putPixels() {
        this.context.putImageData(this.imageData, 0, 0)
    }

    setPixel(x, y, color) {
        var index = (y * this.canvas.width + x) * 4
        this.pixels[index + 0] = color.r
        this.pixels[index + 1] = color.g
        this.pixels[index + 2] = color.b
        this.pixels[index + 3] = color.a
    }

    feedback(alpha, white) {
        for (var y = 0; y < this.canvas.height; ++y) {
            for (var x = 0; x < this.canvas.width; ++x) {
                var index = (y * this.canvas.width + x) * 4
                this.pixels[index + 0] = Math.min(this.pixels[index + 0] * white, 255) // R
                this.pixels[index + 1] = Math.min(this.pixels[index + 1] * white, 255) // G
                this.pixels[index + 2] = Math.min(this.pixels[index + 2] * white, 255) // B
                this.pixels[index + 3] *= alpha // A
            }
        }
        this.context.putImageData(this.imageData, 0, 0)
    }
}

class Timer {
    constructor() {
        this.time_now = Date.now()
        this.time_previous = time_now
    }

    get dt() {
        this.time_now = Date.now()
        var delta = this.time_now - this.time_previous
        this.time_previous = this.time_now
        return delta
    }

    get now() {
        return this.time_now
    }
}

// 2次元のベクトル計算。
class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    get unit() {
        var length = 1 / Math.sqrt(this.x * this.x + this.y * this.y)
        return new Vec2(this.x * length, this.y * length)
    }

    copy(v) {
        this.x = v.x
        this.y = v.y
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y)
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }

    mul(r) {
        return new Vec2(this.x * r, this.y * r)
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    cross(v) {
        return this.x * v.y - this.y * v.x
    }
}

// ユーティリティ。
class U {
    // オブジェクトをスワップ。
    static swap(a, b) {
        var temp = a
        a = b
        b = temp
    }

    // 双曲関数。
    static sinh(x) {
        return (Math.exp(x) - Math.exp(-x)) * 0.5
    }

    static cosh(x) {
        return (Math.exp(x) + Math.exp(-x)) * 0.5
    }

    static tanh(x) {
        var a = Math.exp(x),
            b = Math.exp(-x)
        return (a - b) / (a + b)
    }

    static sech(x) {
        return 2 / (Math.exp(x) - Math.exp(-x))
    }

    static csch(x) {
        return 2 / (Math.exp(x) + Math.exp(-x))
    }

    static coth(x) {
        var a = Math.exp(x),
            b = Math.exp(-x)
        return (a + b) / (a - b)
    }

    // value を [min, max] の範囲に収める。
    static clamp(value, min, max) {
        return isNaN(value) ? 0 : Math.max(min, Math.min(value, max));
    }

    static randomPow(n) {
        var r = Math.random()
        return Math.pow(r, n)
    }

    // [0, m) の範囲の値を返す余り演算。
    static mod(n, m) {
        return ((n % m) + m) % m
    }

    // 線形補間。
    static linterp(a, b, r) {
        return a * r + b * (1 - r)
    }

    // 対数的に線形補間。
    static loginterp(a, b, r) {
        return Math.exp(Math.log(a) * r + Math.log(b) * (1 - r))
    }

    // 極座標。
    static toPolar(v) {
        return {
            x: V2(length),
            y: Math.atan2(v.y, v.x)
        }
    }

    // ベクトルと角度。
    static angle2D(origin, a, b) {
        var ax = a.x - origin.x,
            ay = a.y - origin.y,
            bx = b.x - origin.x,
            by = b.y - origin.y,
            c1 = Math.sqrt(ax * ax + ay * ay),
            c2 = Math.sqrt(bx * bx + by * by),
            c = (ax * bx + ay * by) / (c1 * c2)

        return isNaN(c) ? 0 : Math.acos(Math.min(c, 1))
    }

    static angle2D360(origin, a, b) {
        var ax = a.x - origin.x,
            ay = a.y - origin.y,
            bx = b.x - origin.x,
            by = b.y - origin.y,
            c1 = Math.sqrt(ax * ax + ay * ay),
            c2 = Math.sqrt(bx * bx + by * by),
            denom = c1 * c2,
            c, rad, sign

        if (denom === 0) {
            return 0
        }

        c = (ax * bx + ay * by) / (c1 * c2),
            rad = Math.acos(Math.min(c, 1)),
            sign = Math.sign(ax * by - ay * bx)

        if (sign < 0) {
            return Math.PI + Math.PI - rad
        }
        return rad
    }

    // 当たり判定 (HitTest) 。
    static isPointInPath(point, poly) {
        var i = 0,
            j = poly.length - 1,
            c = false

        for (; i < poly.length; ++i) {
            if (((poly[i].y > point.y) != (poly[j].y > point.y))
                && (point.x < (poly[j].x - poly[i].x) * (point.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
                c = !c
            }
            j = i
        }
        return c
    }

    // ランダムなカラーコードを生成。
    // 少し明るめの色。
    static randomColorCode() {
        return "#" + ("00000" + Math.floor(0x888880 * (1 + Math.random())).toString(16)).slice(-6)
    }

    static hsv2rgb(h, s, v, a) {
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: a
        };
    }

    // "#123456" といった形式のカラーコードを表す文字列を生成。
    static toColorCode(r, g, b) {
        r = U.clamp(r, 0, 255)
        g = U.clamp(g, 0, 255)
        b = U.clamp(b, 0, 255)

        r = ("0" + Math.floor(r).toString(16)).slice(-2)
        g = ("0" + Math.floor(g).toString(16)).slice(-2)
        b = ("0" + Math.floor(b).toString(16)).slice(-2)
        return "#" + r + g + b
    }
}
