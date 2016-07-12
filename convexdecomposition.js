// ノート
//
// 全てのVerticesがn、Reflex verticesがrあるとする。
// Reflex verticesを見つけるためにO(n)。
//
// --
// Bayazitのアルゴリズム(https://mpen.ca/406/bayazit)。
// ComplexityはO(n) + 2 * O(n r) + O(n r)。まとめるとO(n r)。
//
// --
// BayazitのアルゴリズムのCase1のみを繰り返すだけでも凸分割できる。
// ただし、分割後のポリゴン数はBayazitやKeilよりも多くなる。
// Case1のComplexityはO(n r)。nは下ろしたエッジとぶつかるエッジを見つけるコスト。
//
// --
// ここでCase1の手順を以下のように変えてみる。
// 1. 自身以外のReflex verticesを一つ選び、双方がReflexでなくなる場合エッジをつなぐ。
// 2. 1に該当するReflex verticesがない場合はBayazit Case1のエッジをつなぐ。
//
// 操作2.に移る条件の詳細
// 2-1. 2つのReflex verticesが既存のポリゴン上で隣接していない。
// 2-2. 双方がReflexでなくなる。
// 2-3. 互いをつなぐエッジが既存のエッジと交差しない。
//
// 2-2.にr^2。2-3.にn。
// 併せてO(r^2 n) + O(r log n)。
//
// 操作1.で複数の候補がある場合はどうか。
// 事前に、隣り合うReflex verticesの間にエッジが引けるか確認するステップを入れると？
// （未検証）
//

///////////////////////////////////////////////////////////////////////////////
class Mouse {
    constructor(canvas) {
        this.isUp = true

        this.canvas = canvas
        // canvas.canvas.addEventListener("load", this.onLoad, false)
        canvas.canvas.addEventListener("mousedown", this.onMouseDown, false)
        // canvas.canvas.addEventListener("mousemove", this.onMouseMove, false)
        // canvas.canvas.addEventListener("mouseup", this.onMouseUp, false)
        // canvas.canvas.addEventListener("mousein", this.onMouseIn, false)
        // canvas.canvas.addEventListener("mouseout", this.onMouseOut, false)
    }

    onLoad(event) {
        this.isUp = true
    }

    onMouseDown(event) {
        this.isUp = false

        var rect = event.target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top

        polygon.add(new Vec2(x, y))
        updateCanvas()
    }

    onMouseMove(event) {
        if (this.isUp || isNaN(this.isUp)) {
            return
        }

        // var rect = event.target.getBoundingClientRect()
        // var x = event.clientX - rect.left
        // var y = event.clientY - rect.top

        // updateCanvas()
    }

    onMouseUp(event) {
        this.isUp = true
    }

    onMouseIn(event) {
        this.isUp = true
    }

    onMouseOut(event) {
        this.isUp = true
    }
}

///////////////////////////////////////////////////////////////////////////////
class Polygon2D {
    constructor() {
        this.vertices = []//this.createRandomStar(8)

        this.reflexes = []
        this.mids = []
        this.added = []
        this.polygons = []
        this.decompose()

        console.log(this.reflexes, this.added, this.mids)
        console.log(this.polygons)
    }

    add(vector) {
        this.vertices.push(vector)
        this.decompose()
    }

    at(index) {
        return this.vertices[U.mod(index, this.vertices.length)]
    }

    decompose() {
        this.reflexes = []
        this.mids = []
        this.added = []
        this.polygons = []

        if (this.isSelfIntersect()) {
            return
        }

        this.reflexes = this.findReflexVertices()
        this.polygons = this.bisection(this.vertices.slice(0))
    }

    // http://geomalgorithms.com/a09-_intersect-3.html
    // 線分のデータ構造がないので上のアルゴリズムをやめて総当たりにした。
    isSelfIntersect() {
        var i, j, i_next, j_next, intersection
        for (i = 0; i < this.vertices.length; ++i) {
            for (j = 0; j < this.vertices.length; ++j) {
                i_next = (i + 1) % this.vertices.length
                j_next = (j + 1) % this.vertices.length
                if (i === j || i_next === j || i === j_next) {
                    continue
                }

                intersection = this.intersectSegmentSegment(
                    this.vertices[i], this.vertices[i_next],
                    this.vertices[j], this.vertices[j_next]
                )
                if (intersection !== null) {
                    return true
                }
            }
        }
        return false
    }

    isClockwise(vertices) {
        var sum = 0
        for (var index = 0; index < vertices.length; index++) {
            var a = vertices[index]
            var b = vertices[(index + 1) % vertices.length]
            sum += b.x * a.y - b.y * a.x
        }
        return sum < 0 ? false : true
    }

    bisection(vertices) {
        if (this.isClockwise(vertices)) {
            console.log("Vertices are not ordered by clockwise.")
            // this.vertices.reverse()
            return null
        }

        if (vertices.length < 4) {
            return null
        }
        var reflex_vertex = this.findReflexVertex(vertices) // このへんひどい。
        if (reflex_vertex === null) {
            return null
        }
        var index_reflex = vertices.indexOf(reflex_vertex)
        if (index_reflex < 0) {
            return null
        }

        var here = vertices[index_reflex]
        var prev = vertices[U.mod(index_reflex - 1, vertices.length)]
        var next = vertices[(index_reflex + 1) % vertices.length]
        //var mid = prev.add(next).mul(0.5)
        var mid = prev.add(next).mul(0.5).sub(here).mul(-1).add(here)
        this.mids.push(mid) // debug

        var intersections = []
        var index, polygons, index_next, j_next, intersection
        debugger
        for (index = 0; index < vertices.length; ++index) {
            index_next = (index + 1) % vertices.length
            if (index === index_reflex || index_next === index_reflex) {
                continue
            }

            intersection = this.intersectSegmentHalfline(
                here, mid,
                vertices[index], vertices[index_next]
            )
            if (intersection !== null) {
                intersections.push({ point: intersection, index: index_next })
            }
        }
        console.log("intersections", intersections)

        // Reflex vertex から延びる半直線と交差する辺の中で一番近いものを選んで自己交差を防ぐ。
        intersections.sort((a, b) => a.point.sub(here).length - b.point.sub(here).length)
        intersection = intersections.shift()
        vertices.splice(intersection.index, 0, intersection.point)
        if (intersection.index < index_reflex) {
            ++index_reflex
        }
        polygons = this.splitPoly(index_reflex, intersection.index, vertices)
        this.added.push(intersection.point) // debug

        var rec1 = this.bisection(polygons[0])
        if (rec1 !== null) {
            polygons = polygons.concat(rec1)
        }
        var rec2 = this.bisection(polygons[1])
        if (rec2 !== null) {
            polygons = polygons.concat(rec2)
        }

        return polygons
    }

    splitPoly(start, end, vertices) {
        var poly1 = []
        var poly2 = []

        if (start <= end) {
            poly1 = vertices.slice(start, end + 1)
            poly2 = vertices.slice(end, vertices.length)
            poly2 = poly2.concat(vertices.slice(0, start + 1))
        } else {
            poly1 = vertices.slice(start, vertices.length)
            poly1 = poly1.concat(vertices.slice(0, end + 1))
            poly2 = vertices.slice(end, start + 1)
        }

        return [poly1, poly2]
    }

    // 半直線 a -> b と 線分 cd の交点を返す。
    intersectSegmentHalfline(a, b, c, d) {
        b = b.sub(a).unit
        var v1x = a.x - c.x
        var v1y = a.y - c.y
        var v2x = d.x - c.x
        var v2y = d.y - c.y
        var denom = 1 / (b.x * v2y - b.y * v2x)
        var t1 = (v2x * v1y - v2y * v1x) * denom
        var t2 = (b.x * v1y - b.y * v1x) * denom

        if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
            return new Vec2(c.x + t2 * v2x, c.y + t2 * v2y)
        }
        return null
    }

    // 直線 ab と 線分 cd の交点を返す。
    // https://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/
    intersectSegmentLine(a, b, c, d) {
        b = b.sub(a).unit
        var v1x = a.x - c.x
        var v1y = a.y - c.y
        var v2x = d.x - c.x
        var v2y = d.y - c.y
        var denom = 1 / (b.x * v2y - b.y * v2x)
        var t2 = (b.x * v1y - b.y * v1x) * denom

        if (t2 >= 0 && t2 <= 1) {
            return new Vec2(c.x + t2 * v2x, c.y + t2 * v2y)
        }
        return null
    }

    // 線分 ab と 線分 cd の交点を返す。
    // http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    intersectSegmentSegment(a, b, c, d) {
        var s1x = b.x - a.x
        var s1y = b.y - a.y
        var s2x = d.x - c.x
        var s2y = d.y - c.y
        var denom = 1 / (s1x * s2y - s2x * s1y)
        var acx = a.x - c.x
        var acy = a.y - c.y
        var s = (s1x * acy - s1y * acx) * denom
        var t = (s2x * acy - s2y * acx) * denom

        if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
            return new Vec2(a.x + t * s1x, a.y + t * s1y)
        }
        return null
    }

    // 180°以上の角を持つ頂点を一つ見つける。
    // 入力される this.edges は時計回りであること。
    findReflexVertex(vertices) {
        var area
        for (let index = 0; index < vertices.length; ++index) {
            area = this.area(
                vertices[U.mod(index - 1, vertices.length)],
                vertices[index],
                vertices[(index + 1) % vertices.length]
            )
            if (0 > area) {
                return vertices[index]
            }
        }
        return null
    }

    // 180°以上の角を持つ頂点を列挙する。
    // 入力される this.edges は時計回りであること。
    findReflexVertices() {
        var reflexes = []

        for (let index = 0; index < this.vertices.length; ++index) {
            if (0 > this.area(this.at(index - 1), this.at(index), this.at(index + 1))) {
                reflexes.push(this.vertices[index])
            }
        }
        return reflexes
    }

    // Vertex a, b, c からなる三角形の面積。
    // b が a -> c の左側にあると正、右側にあると負の値をとる。
    area(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
    }

    createRandomStar(num_points) {
        var vertices = [],
            max_length = cv.width * 0.5,
            d_theta = 2 * Math.PI / num_points,
            theta, length

        for (let i = 0; i < num_points; ++i) {
            length = (Math.random() * 0.6 + 0.2) * max_length
            theta = i * d_theta
            vertices.push(new Vec2(
                Math.cos(theta) * length + cv.Center.x,
                Math.sin(theta) * length + cv.Center.y
            ))
        }

        return vertices
    }

    draw(canvas) {
        var context = canvas.context

        // draw init line
        context.lineJoin = "round"
        context.strokeStyle = "#888888"
        context.lineWidth = 8
        canvas.drawPath(this.vertices)

        // draw polygons
        context.strokeStyle = "#444444"
        context.lineWidth = 2
        if (this.polygons !== null) {
            for (let i = 0; i < this.polygons.length; ++i) {
                canvas.drawPath(this.polygons[i])
            }
        }

        // draw points
        context.fillStyle = "#6666ff"
        for (let i = 0; i < this.vertices.length; ++i) {
            canvas.drawPoint(this.vertices[i], 5)
        }
        context.font = "24px serif"
        canvas.drawNumbers(this.vertices)

        // draw reflex points
        context.fillStyle = "#ff3333"
        for (let i = 0; i < this.reflexes.length; ++i) {
            canvas.drawPoint(this.reflexes[i], 5)
        }

        // draw added points
        context.fillStyle = "#ffff33"
        for (let i = 0; i < this.added.length; ++i) {
            canvas.drawPoint(this.added[i], 5)
        }

        // draw mid points
        context.fillStyle = "#33ffff"
        for (let i = 0; i < this.mids.length; ++i) {
            canvas.drawPoint(this.mids[i], 5)
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// エントリポイント
var cv = new Canvas(512, 512)
var mouse = new Mouse(cv)
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

// UI //

function onClickButtonReverse() {
    polygon.vertices.reverse()
    polygon.decompose()
    updateCanvas()
}

function onClickButtonReset() {
    polygon.vertices = []
    polygon.decompose()
    updateCanvas()
}