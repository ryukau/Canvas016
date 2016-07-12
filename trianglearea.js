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
    }

    onLoad(event) {
        this.isUp = true
    }

    onMouseDown(event) {
        this.isUp = false

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        tri.grabVertex(new Vec2(x, y))
        updateCanvas()
    }

    onMouseMove(event) {
        if (this.isUp || isNaN(this.isUp)) {
            return
        }

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        tri.moveGrabbedVertex(new Vec2(x, y))
        updateCanvas()
    }

    onMouseUp(event) {
        this.isUp = true
        tri.releaseVertex()
    }

    onMouseIn(event) {
        this.isUp = true
        tri.releaseVertex()
    }

    onMouseOut(event) {
        this.isUp = true
    }
}

class Triangle {
    constructor(canvas) {
        this.vertices = [
            new Vec2(canvas.Center.x, canvas.Center.y - 100),
            new Vec2(canvas.Center.x + 200 / 1.41421356, canvas.Center.y + 100),
            new Vec2(canvas.Center.x - 200 / 1.41421356, canvas.Center.y + 100),
        ]
        this.thickness = 10
        this.grabbedvertex = null
    }

    area() {
        var a = this.vertices[0]
        var b = this.vertices[1]
        var c = this.vertices[2]
        return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
    }

    // area の b が ベクトル a -> c の 左にあるかどうかを判定。
    left() {
        return this.area() > 0
    }

    canSee(a, b) {
        a = 0
        b = 1
    }

    draw(canvas) {
        canvas.context.strokeStyle = "#444444"
        if (this.left()) {
            canvas.context.fillStyle = "#ffaaaa"
        }
        else {
            canvas.context.fillStyle = "#ffffaa"
        }
        canvas.context.lineWidth = this.thickness
        canvas.context.lineJoin = "round"
        canvas.drawPath(this.vertices)

        canvas.context.fillStyle = "#4444ff"
        canvas.drawPoints(this.vertices, this.thickness)

        canvas.context.fillStyle = "#44ff44"
        canvas.context.font = "32px serif "
        canvas.drawNumbers(this.vertices)

        // draw area size text
        var textsize = 12
        canvas.context.fillStyle = "#444444"
        canvas.context.font = textsize + "px serif"
        canvas.context.fillText(`point[0]: (${this.vertices[0].x}, ${this.vertices[0].y})`, 0, textsize * 1)
        canvas.context.fillText(`point[1]: (${this.vertices[1].x}, ${this.vertices[1].y})`, 0, textsize * 2)
        canvas.context.fillText(`point[2]: (${this.vertices[2].x}, ${this.vertices[2].y})`, 0, textsize * 3)
        canvas.context.fillText(`area: ${this.area()}`, 0, textsize * 4)
    }

    grabVertex(point) {
        var vertex
        for (let index = 0; index < this.vertices.length; ++index) {
            vertex = this.vertices[index]
            if (vertex.sub(point).length <= this.thickness) {
                this.grabbedvertex = vertex
                return
            }
        }
        this.grabbedvertex = null
    }

    releaseVertex() {
        this.grabbedvertex = null
    }

    moveGrabbedVertex(point) {
        if (this.grabbedvertex === null) {
            return
        }

        this.grabbedvertex.copy(point)
    }
}

// エントリポイント //
var cv = new Canvas(512, 512)
var mouse = new Mouse(cv)
var tri = new Triangle(cv)

animate()

function animate() {
    updateCanvas()
    //requestAnimationFrame(animate)
}

function updateCanvas(time) {
    cv.clearWhite()
    tri.draw(cv)
}