const canvasSketch = require('canvas-sketch')

const settings = {
    dimensions: [1080, 1080],
    animate: true,
}

let elCanvas
let points

const sketch = ({ canvas }) => {
    points = [
        new Point({ x: 200, y: 540 }),
        new Point({ x: 400, y: 700 }),
        new Point({ x: 800, y: 540 }),
        new Point({ x: 600, y: 700 }),
        new Point({ x: 640, y: 900 }),
    ]

    canvas.addEventListener('mousedown', onMouseDown)
    elCanvas = canvas

    return ({ context, width, height }) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        context.beginPath()
        context.moveTo(points[0].x, points[0].y)

        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y)
        }
        context.stroke()

        context.beginPath()
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i]
            const next = points[i + 1]

            const mx = curr.x + (next.x - curr.x) * 0.5
            const my = curr.y + (next.y - curr.y) * 0.5

            // draw midpoints
            // context.beginPath()
            // context.fillStyle = 'blue'
            // context.arc(mx, my, 5, 0, Math.PI * 2)
            // context.fill()

            if (i == 0) context.moveTo(curr.x, curr.y)
            else if (i == points.length - 2)
                context.quadraticCurveTo(curr.x, curr.y, next.x, next.y)
            else context.quadraticCurveTo(curr.x, curr.y, mx, my)
        }

        context.lineWidth = 4
        context.strokeStyle = 'blue'
        context.stroke()

        points.forEach((point) => {
            point.draw(context)
        })
    }
}

const onMouseDown = (e) => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width
    const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height

    let hit = false
    points.forEach((point) => {
        point.isDragging = point.hitTest(x, y)
        if (!hit && point.isDragging) {
            hit = true
        }
    })

    // ถ้าไม่ได้คลิกจุดเก่า ให้สร้างจุดใหม่
    if (!hit) {
        points.push(new Point({ x, y }))
    }
}

const onMouseMove = (e) => {
    // ค่าที่ได้จาก offsetX เป็นค่า pixel ที่มีการ scale เพื่อให้สามารถแสดง canvas ทั้งหมดบน browser ได้ไม่ว่ารูปจะใหญ่แค่ไหน
    // เลยต้องมีการคำนวนหาค่า x ในหน่วย pixel ที่ค่ามากสุดเป็นความกว้างของ canvas (ปรับ scale)
    const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width
    const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height

    points.forEach((point) => {
        if (point.isDragging) {
            point.x = x
            point.y = y
        }
    })
}

const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
}

class Point {
    constructor({ x, y, control = false }) {
        this.x = x
        this.y = y
        this.control = control
    }

    draw(context) {
        context.save()
        context.translate(this.x, this.y)
        context.beginPath()
        context.fillStyle = this.control ? 'red' : 'black'
        context.arc(0, 0, 10, 0, 2 * Math.PI)
        context.fill()
        context.restore()
    }

    // เช็คว่าจุดที่ mousedown เป็นจุดที่ plot บน canvas หรือไม่
    hitTest(x, y) {
        const dx = this.x - x
        const dy = this.y - y
        const dd = Math.sqrt(dx * dx + dy * dy)
        // ถ้าระยะห่างระหว่างจุดที่ plot และจุดที่ mousedown ไม่เกิน 20 แสดงว่ากำลังลากจุดนั้นอยู่
        // (รัศมีของจุดคือ 10)
        return dd < 20
    }
}

canvasSketch(sketch, settings)
