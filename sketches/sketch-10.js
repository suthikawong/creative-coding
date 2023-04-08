const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const eases = require('eases')
const colormap = require('colormap')
const interpolate = require('color-interpolate')

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
let imgA, imgB

const sketch = ({ width, height, canvas }) => {
    let x, y, particle, radius

    const imgACanvas = document.createElement('canvas')
    const imgAContext = imgACanvas.getContext('2d')

    const imgBCanvas = document.createElement('canvas')
    const imgBContext = imgBCanvas.getContext('2d')

    imgACanvas.width = imgA.width
    imgACanvas.height = imgA.height

    imgBCanvas.width = imgB.width
    imgBCanvas.height = imgB.height

    imgAContext.drawImage(imgA, 0, 0)
    imgBContext.drawImage(imgB, 0, 0)

    const imgAData = imgAContext.getImageData(
        0,
        0,
        imgA.width,
        imgA.height
    ).data
    const imgBData = imgBContext.getImageData(
        0,
        0,
        imgB.width,
        imgB.height
    ).data

    const numCircles = 30 // จำนวนวงกลมจากจุดศูนย์กลาง
    const gapCircle = 2
    const gapDot = 2
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
        let ix, iy, idx, r, g, b, colA, colB, colMap // colMap ใช้ทำสี particle ตอนเลื่อน mouse

        for (let j = 0; j < numFit; j++) {
            const theta = fitSlice * j
            x = Math.cos(theta) * cirRadius
            y = Math.sin(theta) * cirRadius

            x += width * 0.5
            y += height * 0.5

            // (x / width) คือการหาจุดที่จะ map สีบน canvas ใหญ่
            // และเอามาคูณกับ imgA.width เพื่อเทียบว่าอยู่ที่จุดไหนบน canvas เล็ก
            // ถ้า imgA และ imgB มีขนาด width, height เท่ากัน ไม่ต้องคำนวนใหม่
            ix = Math.floor((x / width) * imgA.width)
            iy = Math.floor((y / height) * imgA.height)
            // คำนวนหาว่าอยู่ index ไหนใน array (imgAData)
            // หา rgb ของ imgA
            idx = (iy * imgA.width + ix) * 4
            r = imgAData[idx]
            g = imgAData[idx + 1]
            b = imgAData[idx + 2]
            colA = `rgb(${r}, ${g}, ${b})`

            // เปลี่ยนรัศมีของวงกลมเล็กตามความสว่าง
            // ต้องคิดจาก r ของรูปหลัก
            radius = math.mapRange(r, 0, 255, 1, 12)

            // หา rgb ของ imgB
            idx = (iy * imgB.width + ix) * 4
            r = imgBData[idx]
            g = imgBData[idx + 1]
            b = imgBData[idx + 2]
            colB = `rgb(${r}, ${g}, ${b})`

            // ใช้สีจากทั้ง imgA และ imgB
            colMap = interpolate([colA, colB])

            particle = new Particle({ x, y, radius, colMap })
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

        context.drawImage(imgACanvas, 0, 0)

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

const loadImage = async (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject()
        img.src = url
    })
}

const start = async () => {
    // imgA ใช้เป็นรูป main ในการ map สี
    imgA = await loadImage('../resources/images/image-01.jpg')
    // imgB จะมีการใช้สีเมื่อเลื่อน mouse
    imgB = await loadImage('../resources/images/image-02.jpg')
    canvasSketch(sketch, settings)
}

start()

class Particle {
    constructor({ x, y, radius = 10, colMap }) {
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
        this.colMap = colMap
        this.color = colMap(0)

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
        // idxColor = Math.floor(
        //     math.mapRange(dd, 0, 200, 0, colors.length - 1, true)
        // )
        // this.color = colors[idxColor]

        // มีการเปลี่ยนไปใช้สีของ imgA และ imgB โดยขึ้นกับระยะห่างระหว่างจุดกับ mouse
        this.color = this.colMap(math.mapRange(dd, 0, 200, 0, 1, true))

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
