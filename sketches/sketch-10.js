const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const eases = require('eases')
const colormap = require('colormap')

const settings = {
    dimensions: [1080, 1080],
    animate: true,
}

const particles = []
const cursor = { x: 9999, y: 9999 }
const colors = colormap({
    colormap: 'viridis',
    nshades: 20,
})
let elCanvas

const sketch = ({ width, height, canvas }) => {
    let x, y, particle, radius
    const numCircles = 15 // จำนวนวงกลมจากจุดศูนย์กลาง
    const gapCircle = 8
    const gapDot = 4
    let dotRadius = 12
    let cirRadius = 0
    const fitRadius = dotRadius

    elCanvas = canvas
    canvas.addEventListener('mousedown', onMouseDown)

    for (let i = 0; i < numCircles; i++) {
        // หาเล้นรอบวงของวงกลม
        const circumference = Math.PI * 2 * cirRadius
        // คำนวนหาจำนวนของวงกลมเต็มวงมากสุดที่สามารถอยู่ในเส้นรอบวงของวงกลมใหญ่ได้
        // i = 0 คือวงกลมที่จุดศูนย์กลาง
        // gapDot คือระยะห่างของแต่ละจุดในรัศมีขนาดเดียวกัน
        const numFit = i
            ? Math.floor(circumference / (fitRadius * 2 + gapDot))
            : 1
        // คำนวนหามุมในหน่วย radius ที่วงกลมแต่ละวงจะใช้
        const fitSlice = (Math.PI * 2) / numFit
        for (let j = 0; j < numFit; j++) {
            const theta = fitSlice * j
            x = Math.cos(theta) * cirRadius
            y = Math.sin(theta) * cirRadius

            x += width * 0.5
            y += height * 0.5

            radius = dotRadius

            particle = new Particle({ x, y, radius })
            particles.push(particle)
        }

        // เพิ่มรัศมีขึ้นครั้งละ 24 จากจุดศูนย์กลาง (filRadius) และบวกช่องว่างในแต่ละชั้นของวงกลม
        cirRadius += fitRadius * 2 + gapCircle
        // ใส่ 1 - เพื่อกลับทิศให้วงกลมใหญ่อยู่ข้างในวงกลมเล็กอยู่ข้างนอก
        // ทำให้ไม่เป็น linear โดยการใช้ quadOut
        dotRadius = (1 - eases.quadOut(i / numCircles)) * fitRadius
    }

    return ({ context, width, height }) => {
        context.fillStyle = 'black'
        context.fillRect(0, 0, width, height)

        // ปกติอันไหนวาดทีหลังก็จะอยู่ layer บนกว่า แต่เราต้องการให้ particle ที่ใหญ่กว่าอยู่ด้านบน เลยต้อง sort อีกที
        particles.sort((a, b) => a.scale - b.scale)

        particles.forEach((particle) => {
            particle.update()
            particle.draw(context)
        })
    }
}

const onMouseDown = (e) => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    onMouseMove(e)
}

const onMouseMove = (e) => {
    const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width
    const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height

    cursor.x = x
    cursor.y = y
}

const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)

    cursor.x = 9999
    cursor.y = 9999
}

canvasSketch(sketch, settings)

class Particle {
    constructor({ x, y, radius = 10 }) {
        // position
        this.x = x
        this.y = y
        // acceleration
        this.ax = 0
        this.ay = 0
        // velocity
        this.vx = 0
        this.vy = 0
        // initial position
        this.ix = x
        this.iy = y

        this.radius = radius
        this.scale = 1
        this.color = colors[0]

        // ระยะห่างระหว่าง particle และ cursor น้อยสุดที่จะทำให้ particle ไม่เคลื่อนที่
        this.minDist = random.range(100, 200)

        this.pushFactor = random.range(0.01, 0.02) // ตัวคูณที่ทำให้ความเร่งลดลง
        this.pullFactor = random.range(0.002, 0.006)
        this.dumpFactor = random.range(0.9, 0.95)
    }

    update() {
        let dx, dy, dd, distDelta
        let idxColor

        // pull force
        dx = this.ix - this.x
        dy = this.iy - this.y
        dd = Math.sqrt(dx * dx + dy * dy)

        this.ax = dx * this.pullFactor
        this.ay = dy * this.pullFactor

        this.scale = math.mapRange(dd, 0, 200, 1, 5)
        idxColor = Math.floor(
            math.mapRange(dd, 0, 200, 0, colors.length - 1, true)
        )
        this.color = colors[idxColor]

        // push force
        dx = this.x - cursor.x
        dy = this.y - cursor.y
        dd = Math.sqrt(dx * dx + dy * dy)

        // ยิ่งระยะห่างระหว่าง particle และ cursor น้อยเท่าไหร่ ความเร็วยิ่งมาก (invert กัน)
        // ค่า distDelta เป็นได้ทั้งบวกและลบ ทำให้ความเร่งจากทั้ง pull และ push มาหักล้างกัน
        distDelta = this.minDist - dd

        if (dd < this.minDist) {
            this.ax += (dx / dd) * distDelta * this.pushFactor
            this.ay += (dy / dd) * distDelta * this.pushFactor
        }

        this.vx += this.ax
        this.vy += this.ay

        // คูณเพื่อค่อยๆลดความเร็วจนเข้าใกล้ 0
        this.vx *= this.dumpFactor
        this.vy *= this.dumpFactor

        this.x += this.vx
        this.y += this.vy
    }

    draw(context) {
        context.save()
        context.translate(this.x, this.y)
        context.fillStyle = this.color
        context.beginPath()
        context.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2)
        context.fill()
        context.restore()
    }
}
