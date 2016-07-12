class Vertex extends Vec2 {
    constructor(x, y) {
        super(x, y)
        this.edges = []
    }

    // Vertex を中心として反時計回りに p0 から近い順にソート。
    // ソートしたら順に prev, next に割り当て。
    sort() {
        var origin = new Vec2(this.x, this.y),
            p0 = new Vec2(this.x, this.y - 1),
            length = this.edges.length - 1

        this.edges.sort(function (a, b) {
            var angle_a = U.angle2D360(origin, p0, a),
                angle_b = U.angle2D360(origin, p0, b)

            return angle_a - angle_b
        })

        for (let i = 0; i < length; ++i) {
            this.connect(this.edges[i], this.edges[i + 1])
        }
        this.connect(this.edges[length], this.edges[0])
    }

    connect(e1, e2) {
        e1.twin.next = e2
        e2.prev = e1.twin
    }
}

///////////////////////////////////////////////////////////////////////////////
class Face {
    constructor(edge) {
        this.edge = edge
    }
}

///////////////////////////////////////////////////////////////////////////////
class Edge {
    constructor(tail, twin) {
        this.prev
        this.next
        this.twin = twin
        this.tail = tail
        this.left
    }

    set Prev(prev) {
        this.prev = prev
    }

    set Next(next) {
        this.next = next
    }

    set Twin(twin) {
        this.twin = twin
    }
}

///////////////////////////////////////////////////////////////////////////////
// http://cs.stackexchange.com/questions/2450/constructing-of-double-connected-edge-list-dcel
class Polygon2D {
    // Doubly Connected Edge List (DCEL)
    constructor() {
        this.vertices = this.createRandomStar(8)
        this.edges = []
        this.createEdges()
        for (let i = 0; i < this.vertices.length; ++i) {
            this.vertices[i].sort()
        }
        this.faces = this.createFaces()
    }

    createFaces() {
        var faces = [],
            edges = this.edges.slice(),
            start, current

        while (edges.length > 0) {
            faces.push(new Face(edges[0]))
            start = edges[0].tail
            current = edges.shift()
            while (start !== current.next.tail && edges.length > 0) {
                current = current.next
                edges.splice(edges.indexOf(current), 1)
            }
        }

        return faces
    }

    // 入力された vertices が順序よく並んでいる必要あり。
    createEdges() {
        var length = this.vertices.length - 1
        for (let i = 0; i < length; ++i) {
            this.createHalfEdge(this.vertices[i], this.vertices[i + 1])
        }
        this.createHalfEdge(this.vertices[length], this.vertices[0])
    }

    // v1 -> v2 の halfedge を作る。
    createHalfEdge(v1, v2) {
        var he1 = {},
            he2 = {}

        he1 = new Edge(v1, he2)
        he2 = new Edge(v2, he1)
        he1.Twin = he2

        v1.edges.push(he1)
        v2.edges.push(he2)

        this.edges.push(he1, he2)
    }

    createRandomStar(num_points) {
        var vertices = [],
            max_length = cv.width * 0.5,
            d_theta = 2 * Math.PI / num_points,
            theta, length

        for (let i = 0; i < num_points; ++i) {
            length = (Math.random() * 0.6 + 0.2) * max_length
            theta = i * d_theta
            vertices.push(new Vertex(
                Math.cos(theta) * length + cv.Center.x,
                Math.sin(theta) * length + cv.Center.y
            ))
        }

        return vertices
    }

    draw(canvas) {
        var context = canvas.context,
            start = this.edges[0],
            edge = start

        // draw init line
        context.strokeStyle = "#444444"
        context.lineWidth = 10
        context.beginPath()
        context.moveTo(edge.tail.x, edge.tail.y)
        while (edge.next !== start) {
            edge = edge.next
            context.lineTo(edge.tail.x, edge.tail.y)
        }
        context.closePath()
        context.stroke()

        // draw points
        context.fillStyle = "#6666ff"
        for (let i = 0; i < this.vertices.length; ++i) {
            canvas.drawPoint(this.vertices[i], 5)
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// エントリポイント
var cv = new Canvas(512, 512)
var polygon = new Polygon2D()

animate()

function animate() {
    updateCanvas()
    //requestAnimationFrame(animate)
}

function updateCanvas(time) {
    cv.clearWhite()
    polygon.draw(cv)
}