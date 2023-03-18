const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')

const settings = {
    dimensions: [1080, 1080],
}

const sketch = ({ context, width, height }) => {
    const agents = []
    for (let i = 0; i < 40; i++) {
        const x = random.range(0, width)
        const y = random.range(0, height)
        agents.push(new Agent(x, y))
    }
    return ({ context, width, height }) => {
        agents.forEach((agent) => agent.draw(context))
    }
}

canvasSketch(sketch, settings)

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Agent {
    constructor(x, y) {
        this.pos = new Point(x, y)
        this.radius = 10
    }
    draw(context) {
        context.beginPath()
        context.arc(this.pos.x, this.pos.y, this.radius, 0, math.degToRad(360))
        context.fillStyle = 'black'
        context.fill()
    }
}
