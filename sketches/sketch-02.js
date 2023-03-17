const canvasSketch = require('canvas-sketch')

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
            const slice = redToDeg(360 / num)
            const angle = slice * i

            x = cx + radius * Math.sin(angle)
            y = cy + radius * Math.cos(angle)
            // console.log('radius : ', radius)
            // console.log('sin : ', Math.sin(angle))
            // console.log('cos : ', Math.cos(angle))
            // console.log('x : ', x)
            // console.log('y : ', y)
            // console.log('angle : ', angle)

            context.save()
            // จุดหมุนของแท่งสี่เหลี่ยม
            context.translate(x, y)
            context.rotate(-angle)
            context.beginPath()
            context.rect(-w * 0.5, -h * 0.5, w, h)
            context.fill()
            context.restore()
        }
    }
}

const redToDeg = (degrees) => {
    return (degrees / 180) * Math.PI
}

canvasSketch(sketch, settings)
