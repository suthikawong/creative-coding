const canvasSketch = require('canvas-sketch')

const settings = {
    dimensions: [1080, 1080],
}

const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        context.fillStyle = 'black'

        const x = width * 0.5
        const y = height * 0.5
        const w = width * 0.3
        const h = height * 0.3

        // เราจใช้ save, restore คู่กันในการจำ state ของ translate และ reset state
        context.save()
        // พูดง่ายๆคือ translate เอาไว้เลื่อนจุดหมุน
        // โดยปกติจุดหมุนจะอยู่ที่ (0, 0) แต่ถ้าใช้ translate จะเลื่อนมาที่ตำแหน่ง (x, y)
        context.translate(x, y)
        context.rotate(0.3) // radian unit
        context.beginPath()
        // ที่ติดลบเพราะตอนนี้จุดอ้างอิงอยู่ที่กึ่งกลางกระดาษ ถ้ากำหนด x,y = 0 กล่องจะไม่อยู่ตรงกลาง
        context.rect(-w * 0.5, -h * 0.5, w, h)
        context.fill()
        context.restore()

        context.translate(100, 400)
        context.beginPath()
        context.arc(0, 0, 50, 0, Math.PI * 2)
        context.fill()
    }
}

canvasSketch(sketch, settings)
