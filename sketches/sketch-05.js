const canvasSketch = require('canvas-sketch')

const settings = {
    dimensions: [1080, 1080],
}

let text = 'A'
let fontSize = 1200
let fontFamily = 'serif'

const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        context.fillStyle = 'black'
        context.font = `${fontSize}px ${fontFamily}`
        context.textBaseline = 'top'
        // context.textAlign = 'center' // ใช้ได้บางครั้ง แต่ไม่ได้แม่นยำ

        const metrics = context.measureText(text)
        // alignment (default ซ้ายสุด เปลี่ยนแปลงตาม translate)
        // baseline (default บนสุด เปลี่ยนแปลงตาม translate)
        // actualBoundingBoxLeft: ระยะระหว่างจุด alignment ถึงขอบซ้ายของอักษร
        // actualBoundingBoxAscent: ระยะระหว่าง baseline ถึงขอบบนของอักษร
        // actualBoundingBoxRight: ระยะระหว่างจุด alignment ถึงขอบขวาของอักษร
        // actualBoundingBoxDescent: ระยะระหว่าง baseline ถึงขอบล่างของอักษร
        const mx = metrics.actualBoundingBoxLeft * -1
        const my = metrics.actualBoundingBoxAscent * -1
        const mw =
            metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
        const mh =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

        const x = (width - mw) * 0.5 - mx
        // ต้องลบด้วย my เพราะมีค่า actualBoundingBoxAscent ซึ่งทำให้ตัวอักษรมี offset จาก baseline
        // ถ้าเราใช้ค่า y ไปคำนวนโดยไม่ลบด้วย my ตอน translate จะทำให้มีการรวม offset ของเดิมด้วยและอักษรจะไม่อยู่ตรงกลาง
        const y = (height - mh) * 0.5 - my

        context.save()
        context.translate(x, y)
        context.beginPath()
        // context.rect(mx, my, mw, mh) // ใช้ log stroke รอบตัวอักษร
        context.stroke()
        context.fillText(text, 0, 0)
        context.restore()
    }
}

canvasSketch(sketch, settings)
