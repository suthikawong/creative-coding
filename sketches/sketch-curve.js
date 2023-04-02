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
        new Point({ x: 400, y: 300, control: true }),
        new Point({ x: 800, y: 540 }),
    ]

    canvas.addEventListener('mousedown', onMouseDown)
    elCanvas = canvas

    return ({ context, width, height }) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        context.beginPath()
        context.moveTo(points[0].x, points[0].y)
        context.quadraticCurveTo(
            points[1].x,
            points[1].y,
            points[2].x,
            points[2].y
        )
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

    points.forEach((point) => {
        point.isDragging = point.hitTest(x, y)
    })
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
