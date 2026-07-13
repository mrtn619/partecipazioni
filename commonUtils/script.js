window.addEventListener("DOMContentLoaded", () => {
    const v = document.getElementById("video-open-booster");
    if (!v) return;

    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || 
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad moderni

    v.src = isIOS 
        ? "../img/PARTECIPAZIONI/booster.MOV" 
        : "../img/PARTECIPAZIONI/boosterpack-opening.webm";

    v.muted = true;
    v.load();
});

//pointer
const pointer = document.getElementById("clicker");
const INACTIVITY_DELAY = 10000;
let inactivityTimer;

function showPointer() {
    pointer.classList.add("visible");
}

function hidePointer() {
    pointer.classList.remove("visible");
}

function resetTimer() {
    hidePointer();
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showPointer, INACTIVITY_DELAY);
}

["click", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetTimer, { passive: true });
})

resetTimer();

//gestione sfoglio
const container = document.getElementById("card-container");

const primaCarta = container.querySelector(
    'img[src*="1 - Presentazione.png"]'
);

if (primaCarta) {
    primaCarta.decode().catch(() => {
    });
}

const video = document.getElementById("video-open-booster");
const boostercontainer = document.getElementById("video-container");
const timeout = 300;

const canvasFuochi = document.createElement("canvas");
canvasFuochi.id = "fuochi";
document.body.appendChild(canvasFuochi);

Object.assign(canvasFuochi.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "1",
    pointerEvents: "none"
});

const ctxFuochi = canvasFuochi.getContext("2d");
let particelle = [];
let dpr = 1;

function ridimensionaFuochi() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvasFuochi.width = window.innerWidth * dpr;
    canvasFuochi.height = window.innerHeight * dpr;

    ctxFuochi.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", ridimensionaFuochi);
ridimensionaFuochi();

function fuochiDietroCarta(carta) {
    const rect = carta.getBoundingClientRect();
    const raggioMassimo = Math.hypot(
        window.innerWidth,
        window.innerHeight
    ) * .42;

    const punti = [
        [-rect.width * .55, -rect.height * .45],
        [0,                 -rect.height * .55],
        [ rect.width * .55, -rect.height * .45],
        [-rect.width * .65, 0],
        [ rect.width * .65, 0],
        [-rect.width * .55,  rect.height * .45],
        [0,                  rect.height * .60],
        [ rect.width * .55,  rect.height * .45]
    ];

    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    punti.forEach(([offsetX, offsetY], indice) => {
        setTimeout(() => {
            for (let i = 0; i < 24; i++) {
                const angolo = Math.random() * Math.PI * 2;
                const distanza = 70 + Math.random() * (raggioMassimo - 70);

                particelle.push({
                    x: centroX + offsetX,
                    y: centroY + offsetY,
                    dx: Math.cos(angolo) * distanza,
                    dy: Math.sin(angolo) * distanza,
                    dimensione: 2 + Math.random() * 3,
                    durata: 650 + Math.random() * 250,
                    inizio: performance.now()
                });
            }

            animaFuochi(); // qui, dopo aver creato le particelle
        }, indice * 70);
    });

}

let fuochiAttivi = false;

function animaFuochi() {
    if (fuochiAttivi) return;
    fuochiAttivi = true;

    function frame(ora) {
        ctxFuochi.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particelle = particelle.filter(p => {
            const progresso = (ora - p.inizio) / p.durata;

            if (progresso >= 1) return false;

            const opacita = 1 - progresso;
            const x = p.x + p.dx * progresso;
            const y = p.y + p.dy * progresso + 80 * progresso * progresso;

            ctxFuochi.save();
            ctxFuochi.globalAlpha = opacita;
            ctxFuochi.fillStyle = "#ffffff";
            ctxFuochi.shadowColor = "#ffffff";
            ctxFuochi.shadowBlur = 14;

            ctxFuochi.beginPath();
            ctxFuochi.arc(
                x,
                y,
                p.dimensione * (1 - progresso * .55),
                0,
                Math.PI * 2
            );
            ctxFuochi.fill();
            ctxFuochi.restore();

            return true;
        });

        if (particelle.length > 0) {
            requestAnimationFrame(frame);
        } else {
            fuochiAttivi = false;
        }
    }

    requestAnimationFrame(frame);
}

container.addEventListener("click", (event) => {
    const clicked = event.target;
    const lastCard = container.lastElementChild;
    const conferma = document.getElementById("conferma");

    if(clicked === lastCard && container.children.length > 1) {

        if(clicked.tagName === "VIDEO") return;

        if(clicked.id!="poster") {
            clicked.classList.add("img-sfogliata");
        }

        setTimeout(() => {
            clicked.remove();

            const newLastCard = container.lastElementChild;

            if(newLastCard && newLastCard.tagName === "VIDEO"){
                newLastCard.play();

            } else if (newLastCard.id === "penultima") {
                newLastCard.style.zIndex=2;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        newLastCard.classList.add("ill-rare-in");
                    });
                });

            newLastCard.addEventListener("animationend", () => {
                fuochiDietroCarta(newLastCard);

                newLastCard.classList.remove("ill-rare-in");
                newLastCard.style.opacity = 1;
                conferma.style.opacity = 1;
            }, { once: true });
            }

        }, timeout);
    } else if (clicked === lastCard && conferma) {
        window.location.href="https://forms.gle/W3KtA7xf38JEan7x5";
    }
});

video.addEventListener("ended", () => {

        video.remove();

    const imgs = container.querySelectorAll("img:not(#conferma):not(#penultima)");
    
    imgs.forEach(img => {
        img.style.transition = "none";
        img.style.opacity = "1";
        img.style.pointerEvents = "auto";
    });

    void container.offsetHeight;

    imgs.forEach(img => {
        img.style.transition = "";
    });
});