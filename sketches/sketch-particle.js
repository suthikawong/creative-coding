const canvasSketch = require('canvas-sketch')

const settings = {
    dimensions: [1080, 1080],
    animate: true,
}

const particles = []
const cursor = { x: 9999, y: 9999 }
let elCanvas

const sketch = ({ width, height, canvas }) => {
    let x, y, particle
    elCanvas = canvas
    canvas.addEventListener('mousedown', onMouseDown)

    for (let i = 0; i < 1; i++) {
        x = width * 0.5
        y = height * 0.5

        particle = new Particle({ x, y })
        particles.push(particle)
    }

    return ({ context, width, height }) => {
        context.fillStyle = 'black'
        context.fillRect(0, 0, width, height)

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

        // ระยะห่างระหว่าง particle และ cursor น้อยสุดที่จะทำให้ particle ไม่เคลื่อนที่
        this.minDist = 100

        this.pushFactor = 0.02 // ตัวคูณที่ทำให้ความเร่งลดลง
        this.pullFactor = 0.004
        this.dumpFactor = 0.95
    }

    update() {
        let dx, dy, dd, distDelta

        // pull force
        dx = this.ix - this.x
        dy = this.iy - this.y
        this.ax = dx * this.pullFactor
        this.ay = dy * this.pullFactor

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
        context.fillStyle = 'white'
        context.beginPath()
        context.arc(0, 0, this.radius, 0, Math.PI * 2)
        context.fill()
        context.restore()
    }
}
