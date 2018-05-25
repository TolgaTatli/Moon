new p5();
var images = [];
var a = 0;

function preload() {
    for (var i = 0; i < 80 / 2; i++) {
        images[i] = loadImage("img/" + floor(random(0, 214)) + ".png");
    }
}

let ratio = 25 / 7;
let amount = floor(random(5, 9));
let howmany = amount * amount * ratio;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    go();
    // preload();
}

function mousePressed() {
    preload();
}

function keyTyped() {
    if (key === 'a') {
        saveCanvas('my', 'png');
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    go();
}

function draw() {
    go();
}


function go() {
    var i = 0;

    //image(images[0],0,0);
    for (var y = 0; y < windowHeight; y = y + windowWidth / amount / ratio) {
        for (var x = 0; x < windowWidth; x = x + windowWidth / amount) {
            image(images[i % images.length], x, y, windowWidth / amount, windowWidth / amount / ratio);
            i++;

        }
    }
}