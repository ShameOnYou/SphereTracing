const maxDst = 1000
let fps = 60;
let now;
let then = Date.now();
let interval = 1000/fps;
let delta;
let degs = 0

let point = {
    x: 800,
    y: 500,
    angle: 0  * (Math.PI / 180)
}


let circles = []
let rectangles = []
let points = [point]
let hits = []
let calcs = 0;

function createEdges(width, height){

    const topEdge = {
        x: 0,
        y: 0,
        w: width,
        h: 1,
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: 1
    }
    const rightEdge = {
        x: width,
        y: 0,
        w: 1,
        h: height,
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: height
    }
    const bottomEdge = {
        x: 0,
        y: height - 1,
        w: width,
        h: 1,
        minX: 0,
        maxX: width,
        minY: height,
        maxY: height + 1
    }
    const leftEdge = {
        x: 0,
        y: 0,
        w: 1,
        h: height,
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: height
    }

    rectangles = [topEdge, rightEdge, bottomEdge, leftEdge]
}

function initiateRectAndCircle(){
    for(let i = 0; i < 50; i++){
        if (Math.random() > 0.5){
            const x = (Math.random() * 1500)
            const y = (Math.random() * 900)
            const w = (Math.random() * 100)
            const h = (Math.random() * 100)
            const maxX = x + w
            const maxY = y + h
            rectangles[rectangles.length] = {
                x: x,
                y: y,
                w: w,
                h: h,
                minX: x,
                maxX: maxX,
                minY: y,
                maxY: maxY
            }
        }
        else{
            circles[circles.length] = {
                x: (Math.random() * 1500),
                y: (Math.random() * 900),
                radius: ((Math.random() + 0.2 )* 50)
            }
        }
    }
}


function length(x, y){

    return Math.sqrt((x * x) + (y * y))
}

function signedDstToCircle(point, centre, radius){

    return length(centre.x-point.x, centre.y - point.y) - radius

}

function signedDstToBox(point, rect ){

    const dx = Math.max(rect.minX - point.x, 0, point.x - rect.maxX)
    const dy = Math.max(rect.minY - point.y, 0, point.y - rect.maxY)

    return Math.sqrt(dx*dx + dy*dy);
}

function signedDstToScene(point){

    let dstToScene = maxDst

    for(let i = 0; i < circles.length; i++){
        const dstToCircle = signedDstToCircle(point, {x: circles[i].x, y: circles[i].y}, circles[i].radius)
        dstToScene = Math.min(dstToCircle, dstToScene)

    }

    for(let i = 0; i < rectangles.length; i++){
        const dstToBox = signedDstToBox(point, rectangles[i])
        dstToScene = Math.min(dstToBox, dstToScene)

    }

    return dstToScene
}


window.onload = () => {
    const canvas = document.getElementById("c");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createEdges(canvas.width, canvas.height)
    initiateRectAndCircle()

    // document.addEventListener('mousemove', (event) => {
    //     let x = event.clientX
    //     let y = event.clientY
    //     let angle = Math.atan2((point.y - y), (point.x - x))
    //     point.angle = angle + 3.14159
    //     console.log(angle)
    //     points = []
    //     points = [point]
    // });


    window.requestAnimationFrame(AnimationLoop);

}

let stopAnimationFrame = false
let count = 0
let endReached = false
function AnimationLoop() {
    calcs = 0
    if(!stopAnimationFrame || count < 2){
        window.requestAnimationFrame(AnimationLoop);
    }
    else{
        count++
    }
    now = Date.now();
    delta = now - then;
    const vx = Math.cos(point.angle)
    const vy = Math.sin(point.angle)
    if (true) {
        then = now - (delta % interval);
        const canvas = document.getElementById('c')
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, 1920, 1080)

        drawRanCircles(ctx)
        drawRanRects(ctx)

        for (let i = 0; i < points.length; i++) {
            const dstToScene = signedDstToScene(points[i])
            if(!endReached){
            ctx.beginPath()
            ctx.rect(points[i].x, points[i].y, 1, 1)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(points[i].x, points[i].y, dstToScene, 0, 2 * Math.PI)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(points[i].x, points[i].y)
            ctx.lineTo(points[i].x + (vx * dstToScene), points[i].y + (vy * dstToScene))
            ctx.stroke()
        }
            if(dstToScene >= maxDst || dstToScene <= 1){
                endReached = true
                if(degs < 360){
                    hits[hits.length] = points[i]
                }
                else{
                    drawLight(ctx)
                    stopAnimationFrame = true

                }


            }
            if (dstToScene < maxDst && dstToScene > 1 && !endReached) {
                points[points.length] = {x: points[i].x + (vx * dstToScene), y: points[i].y + (vy * dstToScene)}
            }


        }
        ctx.beginPath()
        ctx.moveTo(hits[0].x, hits[0].y)
        for(let i = 1; i < hits.length - 1; i++){

            let pointX = hits[i].x
            let pointY = hits[i].y
            ctx.strokeStyle = 'white'
            ctx.lineTo(pointX, pointY)
        }
        ctx.stroke()
        ctx.strokeStyle = 'white'
    if(endReached){
        if(point.angle < 6.28319) {
            endReached = false
            degs += 0.2
            point.angle = degs * (Math.PI / 180)
            points = [point]
        }

    }

    }


}

function drawLight(ctx){
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(hits[0].x, hits[0].y)
    for(let i = 1; i < hits.length - 1; i++){
        let pointX = hits[i].x
        let pointY = hits[i].y
        ctx.strokeStyle = 'white'
        ctx.lineTo(pointX, pointY)
    }
    ctx.closePath()
    ctx.fill()
}

function drawRanCircles(ctx){
    for(let i = 0; i < circles.length; i++){

        ctx.fillStyle = 'black';
        ctx.beginPath()
        ctx.arc(circles[i].x, circles[i].y, circles[i].radius, 0 , Math.PI * 2)
        ctx.fill()
    }
}

function drawRanRects(ctx){
    for(let i = 0; i < rectangles.length; i++){

        ctx.beginPath()
        ctx.fillStyle = 'black';
        ctx.fillRect(rectangles[i].x, rectangles[i].y, rectangles[i].w, rectangles[i].h)

    }

}

