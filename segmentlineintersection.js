class Mouse {
    constructor(canvas) {
        this.isUp = true

        this.canvas = canvas
        canvas.canvas.addEventListener("load", this.onLoad, false)
        canvas.canvas.addEventListener("mousedown", this.onMouseDown, false)
        canvas.canvas.addEventListener("mousemove", this.onMouseMove, false)
        canvas.canvas.addEventListener("mouseup", this.onMouseUp, false)
        canvas.canvas.addEventListener("mousein", this.onMouseIn, false)
        canvas.canvas.addEventListener("mouseout", this.onMouseOut, false)

        this.grab = null
    }

    onLoad(event) {
        this.isUp = true
    }

    onMouseDown(event) {
        this.isUp = false

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        this.grab = grabVertex(new Vec2(x, y))
        updateCanvas()
    }

    onMouseMove(event) {
        if (this.isUp || isNaN(this.isUp)) {
            return
        }

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        if (this.grab !== null) {
            this.grab.copy(new Vec2(x, y))
        }
        updateCanvas()
    }

    onMouseUp(event) {
        this.isUp = true
        this.grab = null
    }

    onMouseIn(event) {
        this.isUp = true
        this.grab = null
    }

    onMouseOut(event) {
        this.isUp = true
        this.grab = null
    }
}

class Line {
    constructor(canvas) {
        this.vertices = [
            new Vec2(canvas.Center.x - 100, canvas.Center.y),
            new Vec2(canvas.Center.x + 100, canvas.Center.y)
        ]
        this.thickness = 5
    }

    draw(canvas) {
        canvas.context.fillStyle = "#ff4444"
        canvas.context.strokeStyle = "#666666"
        canvas.context.lineWidth = this.thickness

        var sub = this.vertices[1].sub(this.vertices[0])
        var left = sub.mul(-1e4).add(this.vertices[0])
        var right = sub.mul(1e4).add(this.vertices[0])
        canvas.drawLine(left, right)

        canvas.drawLine(this.vertices[0], this.vertices[1])
        canvas.drawPoint(this.vertices[0], this.thickness)
        canvas.drawPoint(this.vertices[1], this.thickness)
    }

    hitTest(point) {
        var vertex
        for (let index = 0; index < this.vertices.length; ++index) {
            vertex = this.vertices[index]
            if (vertex.sub(point).length <= this.thickness) {
                return vertex
            }
        }
        return null
    }
}

class Segment {
    constructor(canvas) {
        this.vertices = [
            new Vec2(canvas.Center.x, canvas.Center.y - 100),
            new Vec2(canvas.Center.x, canvas.Center.y + 100)
        ]
        this.thickness = 5
    }

    draw(canvas) {
        canvas.context.fillStyle = "#4444ff"
        canvas.context.strokeStyle = "#666666"
        canvas.context.lineWidth = this.thickness
        canvas.drawLine(this.vertices[0], this.vertices[1])
        canvas.drawPoint(this.vertices[0], this.thickness)
        canvas.drawPoint(this.vertices[1], this.thickness)
    }

    hitTest(point) {
        var vertex
        for (let index = 0; index < this.vertices.length; ++index) {
            vertex = this.vertices[index]
            if (vertex.sub(point).length <= this.thickness) {
                return vertex
            }
        }
        return null
    }
}

// エントリポイント //
var cv = new Canvas(512, 512)
var mouse = new Mouse(cv)
var seg = new Segment(cv)
var line = new Line(cv)
var cross

test()

animate()

function animate() {
    updateCanvas()
    //requestAnimationFrame(animate)
}

function updateCanvas(time) {
    cv.clearWhite()
    seg.draw(cv)
    line.draw(cv)

    cross = intersectSegmentLine(
        line.vertices[0], line.vertices[1],
        seg.vertices[0], seg.vertices[1]
    )
    console.log(cross)
    if (cross !== null) {
        cv.context.fillStyle = "#ffff44"
        cv.drawPoint(cross, 5)
    }
}

function grabVertex(point) {
    var grab = null

    grab = seg.hitTest(point)
    if (grab !== null) return grab

    grab = line.hitTest(point)
    if (grab !== null) return grab

    return null
}

function intersectSegmentLine(a, b, c, d) {
    b = b.sub(a).unit
    var v1x = a.x - c.x
    var v1y = a.y - c.y
    var v2x = d.x - c.x
    var v2y = d.y - c.y
    var denom = 1 / (b.x * v2y - b.y * v2x)
    //var t1 = (v2x * v1y - v2y * v1x) * denom
    var t2 = (b.x * v1y - b.y * v1x) * denom

    if (t2 >= 0 && t2 <= 1) {
        //return new Vec2(a.x + t1 * b.x, a.y + t1 * b.y)
        return new Vec2(c.x + t2 * v2x, c.y + t2 * v2y)
    }
    return null
}

function test() {
    // intersectSegmentLine()
    // 交差。
    console.log(intersectSegmentLine(
        new Vec2(2, 1),
        new Vec2(2, 7),
        new Vec2(1, 2),
        new Vec2(3, 2)
    ))
    // 交差しない。平行。
    console.log(intersectSegmentLine(
        new Vec2(0, 0),
        new Vec2(1, 0),
        new Vec2(0, 1),
        new Vec2(1, 1)
    ))
    // 始点が同じ。
    console.log(intersectSegmentLine(
        new Vec2(0, 0),
        new Vec2(0, 1),
        new Vec2(0, 0),
        new Vec2(1, 0)
    ))
    // 終点が同じ。
    console.log(intersectSegmentLine(
        new Vec2(0, 1),
        new Vec2(0, 7),
        new Vec2(1, 0),
        new Vec2(0, 7)
    ))
    // 重なっている。
    console.log(intersectSegmentLine(
        new Vec2(0, 1),
        new Vec2(0, 0),
        new Vec2(0, 10),
        new Vec2(0, 0)
    ))
}