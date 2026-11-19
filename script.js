const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let nameParticles = [];

const particleCount = 15000;
const nama = "sisilia";

let nameOpacity = 0;
let nameReady = false;

// --- Pengaturan Foto ---
const personImg = new Image();
personImg.src = "foto.jpeg";

let photoOpacity = 0;
let photoReady = false;

personImg.onload = () => {
    photoReady = true;
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const centerX = () => canvas.width / 2;
const centerY = () => canvas.height / 2;

function heart(t) {
    return {
        x: 16 * Math.pow(Math.sin(t), 3),
        y: -(13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t))
    };
}

class Particle {
    constructor() {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        const h = heart(t);

        this.targetX = h.x * 13 * r;
        this.targetY = h.y * 13 * r;

        this.x = centerX() + this.targetX;
        this.y = centerY() + this.targetY;

        this.size = Math.random() * 1.2 + 0.3;
        this.offset = Math.random() * 10;
    }

    update(time) {
        const pulse = 1 + Math.sin(time * 0.002) * 0.035;

        const tx = centerX() + this.targetX * pulse;
        const ty = centerY() + this.targetY * pulse;

        this.x += (tx - this.x) * 0.05;
        this.y += (ty - this.y) * 0.05;

        this.alpha = 0.4 + Math.sin(time * 0.003 + this.offset) * 0.6;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = "#168cff";

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createHeartParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function createNameParticles() {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    let fontSize = Math.min(canvas.width * 0.10, 90);

    tempCtx.font = `bold ${fontSize}px Arial`;

    while (tempCtx.measureText(nama).width > canvas.width * 0.85) {
        fontSize -= 2;
        tempCtx.font = `bold ${fontSize}px Arial`;
    }

    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillStyle = "white";

    const nameY = centerY() - Math.min(280, canvas.height * 0.32);

    tempCtx.fillText(nama, centerX(), nameY);

    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

    nameParticles = [];

    for (let y = 0; y < canvas.height; y += 3) {
        for (let x = 0; x < canvas.width; x += 3) {
            const index = (y * canvas.width + x) * 4;

            if (imageData.data[index + 3] > 128) {
                nameParticles.push({
                    x: centerX() + (Math.random() - 0.5) * 150,
                    y: nameY + (Math.random() - 0.5) * 100,
                    targetX: x,
                    targetY: y,
                    size: Math.random() * 1.2 + 0.4,
                    offset: Math.random() * 10
                });
            }
        }
    }

    nameReady = true;
}

function drawName(time) {
    if (!nameReady) return;

    nameOpacity += (1 - nameOpacity) * 0.015;

    nameParticles.forEach(p => {
        p.x += (p.targetX - p.x) * 0.025;
        p.y += (p.targetY - p.y) * 0.025;

        const flicker = 0.7 + Math.sin(time * 0.004 + p.offset) * 0.3;

        ctx.globalAlpha = nameOpacity * flicker;
        ctx.fillStyle = "#20aaff";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function drawPersonPhoto(time) {
    if (!photoReady || !nameReady) return;

    photoOpacity += (1 - photoOpacity) * 0.02;

    const diameter = Math.min(canvas.width, canvas.height) * 0.22;
    const x = centerX();
    const y = centerY() + 10;

    ctx.save();
    ctx.globalAlpha = photoOpacity;
    ctx.shadowColor = "#00b7ff";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(x, y, diameter / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const imgRatio = personImg.width / personImg.height;
    let drawW = diameter;
    let drawH = diameter;

    if (imgRatio > 1) {
        drawW = diameter * imgRatio;
    } else {
        drawH = diameter / imgRatio;
    }

    ctx.drawImage(personImg, x - drawW / 2, y - drawH / 2, drawW, drawH);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = photoOpacity;
    ctx.strokeStyle = "#66d9ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, diameter / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

let sparks = [];

for (let i = 0; i < 800; i++) {
    sparks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.2,
        speed: Math.random() * 1.5 + 0.3
    });
}

function drawSparks() {
    sparks.forEach(p => {
        p.y -= p.speed;

        if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = Math.random() * 0.8;
        ctx.fillStyle = "#008cff";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function drawGlow(time) {
    const x = centerX();
    const y = centerY() + 180;

    const pulse = Math.sin(time * 0.005) * 10;

    const gradient = ctx.createRadialGradient(
        x, y, 2,
        x, y, 110 + pulse
    );

    gradient.addColorStop(0, "rgba(0,180,255,0.8)");
    gradient.addColorStop(0.4, "rgba(0,100,255,0.3)");
    gradient.addColorStop(1, "rgba(0,0,255,0)");

    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.ellipse(x, y, 100 + pulse, 25, 0, 0, Math.PI * 2);
    ctx.fill();
}

function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGlow(time);
    drawSparks();

    particles.forEach(p => {
        p.update(time);
        p.draw();
    });

    drawPersonPhoto(time);
    drawName(time);

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

createHeartParticles();
animate(0);

setTimeout(() => {
    createNameParticles();
}, 2000);

window.addEventListener("resize", () => {
    resizeCanvas();
    createHeartParticles();

    if (nameReady) {
        createNameParticles();
    }
});