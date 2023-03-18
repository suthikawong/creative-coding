const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')

const settings = {
    dimensions: [1080, 1080],
}

const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        context.fillStyle = 'black'

        const cx = width * 0.5 // center of circle
        const cy = height * 0.5 // center of circle
        const w = width * 0.01
        const h = height * 0.1

        let x
        let y

        const num = 12
        const radius = width * 0.3 // รัศมีของวงกลม

        const i = 3

        for (let i = 0; i < num; i++) {
            const slice = math.degToRad(360 / num)
            const angle = slice * i

            x = cx + radius * Math.sin(angle)
            y = cy + radius * Math.cos(angle)

            context.save()
            // จุดหมุนของแท่งสี่เหลี่ยม
            context.translate(x, y)
            context.rotate(-angle)
            // ทำให้ random อยู่ในช่วง 1-3
            context.scale(random.range(1, 3), 1)
            context.beginPath()
            context.rect(-w * 0.5, -h * 0.5, w, h)
            context.fill()
            context.restore()
        }
    }
}

// const randomRange = (min, max) => {
//     // ทำให้ random อยู่ในช่วง 1-3
//     // Math.random() จำคืนใช่วง 0-1 เรา + 1 ตอนท้ายเพื่อ offset ไม่ให้เป็น 0
//     // และให้คูณด้วย 2 เพื่อที่เมื่อบวก 1 จะได้ค่า max = 3
//     // context.scale(Math.random() * (3 - 1) + 1, 1)
//     return Math.random() * (max - min) + min
// }

// const degToRad = (degrees) => {
//     return (degrees / 180) * Math.PI
// }

canvasSketch(sketch, settings)
