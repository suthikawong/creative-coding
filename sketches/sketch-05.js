const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')

const settings = {
    dimensions: [1080, 1080],
}
let manager
let text = 'A'
let fontSize = 1200
let fontFamily = 'serif'

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')

const sketch = ({ context, width, height }) => {
    const cell = 20 // กว้างและสูง 20px ต่อ 1 cell
    const cols = Math.floor(width / cell)
    const rows = Math.floor(height / cell)
    const numCells = cols * rows

    typeCanvas.width = cols
    typeCanvas.height = rows

    return ({ context, width, height }) => {
        typeContext.fillStyle = 'black'
        typeContext.fillRect(0, 0, cols, rows)

        fontSize = cols * 1.2

        typeContext.fillStyle = 'white'
        typeContext.font = `${fontSize}px ${fontFamily}`
        typeContext.textBaseline = 'top'

        const metrics = typeContext.measureText(text)
        const mx = metrics.actualBoundingBoxLeft * -1
        const my = metrics.actualBoundingBoxAscent * -1
        const mw =
            metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
        const mh =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

        const tx = (cols - mw) * 0.5 - mx
        const ty = (rows - mh) * 0.5 - my

        typeContext.save()
        typeContext.translate(tx, ty)
        typeContext.beginPath()
        typeContext.stroke()
        typeContext.fillText(text, 0, 0)
        typeContext.restore()

        const typeData = typeContext.getImageData(0, 0, cols, rows).data
        context.fillStyle = 'black'
        context.fillRect(0, 0, width, height)

        context.textBaseline = 'middle'
        context.textAligh = 'center'

        // context.drawImage(typeCanvas, 0, 0)

        for (let i = 0; i < numCells; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = col * cell
            const y = row * cell

            // จะใช้ nested loop ของ row, col ก็ได้ แต่ต้องเปลี่ยน i เป็น (row * 54 + col) ด้วยเพราะ bitmap คือมาเป็น array 1 มิติ
            const r = typeData[i * 4 + 0] // first channel
            const g = typeData[i * 4 + 1] // second channel
            const b = typeData[i * 4 + 2] // third channel
            const a = typeData[i * 4 + 3] // forth channel

            const glyph = getGlyph(r)

            context.font = `${cell * 2}px ${fontFamily}`
            if (Math.random() < 0.1)
                context.font = `${cell * 6}px ${fontFamily}`

            context.fillStyle = 'white'

            context.save()
            context.translate(x, y)
            context.beginPath()
            // context.fillRect(0, 0, cell, cell)
            context.fillText(glyph, 0, 0)
            context.restore()
        }
    }
}

const getGlyph = (v) => {
    if (v < 50) return ''
    if (v < 100) return '.'
    if (v < 150) return '-'
    if (v < 200) return '+'
    const glyphs = ['_', '=', ' ', '/']

    return random.pick(glyphs)
}

const onKeyUp = (e) => {
    text = e.key.toUpperCase()
    manager.render()
}

document.addEventListener('keyup', onKeyUp)

const start = async () => {
    manager = await canvasSketch(sketch, settings)
}
start()
