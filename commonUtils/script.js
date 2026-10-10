window.addEventListener("DOMContentLoaded", () => {
    const v = document.getElementById("video-open-booster");
    const v1 = document.getElementById("video-open-booster-2");
    if (!v || !v1) return;

    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || 
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad moderni

    v.src = isIOS 
        ? "../img/PARTECIPAZIONI/booster.MOV" 
        : "../img/PARTECIPAZIONI/boosterpack-opening.webm";

    v1.src = isIOS 
        ? "../img/PARTECIPAZIONI/boosterDX.MOV" 
        : "../img/PARTECIPAZIONI/boosterpack-openingDX.webm";

    v.muted = true;
    v.load();

    v1.muted = true;
    v1.load();
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
const video1 = document.getElementById("video-open-booster-2");
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



let sfoglioInCorso = false;
let ignoraClickFinoA = 0;

const SOGLIA_SWIPE = 80;
const DURATA_USCITA = 300;
const DURATA_RITORNO = 250;

let touchStartX = null;
let touchStartY = null;
let touchTarget = null;
let swipeAttivo = false;
let swipeDx = 0;
let direzioneDecisa = false;
let gestoOrizzontale = false;

container.style.touchAction = "pan-y";

function mostraCartaSuccessiva() {
    const newLastCard = container.lastElementChild;
    const conferma = document.getElementById("conferma");

    if (!newLastCard) return;

    if (newLastCard.tagName === "VIDEO") {
        newLastCard.style.visibility = "visible";
        newLastCard.play();

    } else if (newLastCard.id === "penultima") {
        newLastCard.style.zIndex = 2;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newLastCard.classList.add("ill-rare-in");
            });
        });

        newLastCard.addEventListener("animationend", () => {
            fuochiDietroCarta(newLastCard);
            newLastCard.classList.remove("ill-rare-in");
            newLastCard.style.opacity = 1;

            if (conferma) conferma.style.opacity = 1;
        }, { once: true });
    }
}

function sfogliaCarta(carta, conSwipe = false, direzione = 1) {
    if (sfoglioInCorso) return;
    if (carta !== container.lastElementChild) return;
    if (carta.tagName === "VIDEO") return;

    const conferma = document.getElementById("conferma");

    if (container.children.length <= 1) {
        if (!conSwipe && conferma) {
            window.location.href =
                "https://forms.gle/W3KtA7xf38JEan7x5";
        }
        return;
    }

    sfoglioInCorso = true;

    if (conSwipe) {
        const distanza =
            window.innerWidth + carta.offsetWidth;

        carta.style.transition =
            `transform ${DURATA_USCITA}ms ease-out, opacity ${DURATA_USCITA}ms ease-out`;

        carta.style.transform =
            `translateX(${direzione * distanza}px) rotate(${direzione * 25}deg)`;

        carta.style.opacity = "0";

    } else if(carta.id !== "poster") {
        carta.classList.add("img-sfogliata");
    }

    setTimeout(() => {
        carta.remove();
        mostraCartaSuccessiva();
        sfoglioInCorso = false;
    }, conSwipe ? DURATA_USCITA : timeout);
}

function chooseVideo(carta, direzione = 1) {
    if (sfoglioInCorso) return;
    if (carta !== container.lastElementChild) return;
    if (carta.tagName === "VIDEO") return;

    const conferma = document.getElementById("conferma");

    if (container.children.length <= 1) {
        if (!conSwipe && conferma) {
            window.location.href =
                "https://forms.gle/W3KtA7xf38JEan7x5";
        }
        return;
    }

    sfoglioInCorso = true;

    console.log("Controllo rimozione:", {
        direzione,
        tipo: typeof direzione,
        video1:video,
        video2: video1
    });

    if(direzione === 1) {
        document.getElementById("video-open-booster").remove();
    } else if(direzione === -1) {
        document.getElementById("video-open-booster-2").remove();
    } else {
        document.getElementById("video-open-booster").remove();
    }

    setTimeout(() => {
        carta.remove();
        mostraCartaSuccessiva();
        sfoglioInCorso = false;
    }, timeout);
}

// CLICK E TAP
container.addEventListener("click", (event) => {
    if (Date.now() < ignoraClickFinoA) return;

    if (event.target.id === "poster") {
        chooseVideo(event.target, 1);
    } else {
        sfogliaCarta(event.target);
    }
});

// INIZIO DEL TOCCO
container.addEventListener("touchstart", (event) => {
    if (sfoglioInCorso || event.touches.length !== 1) return;

    const carta = container.lastElementChild;

    if (!carta || carta.tagName === "VIDEO") return;
    if (container.children.length <= 1) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchTarget = carta;
    swipeAttivo = true;
    swipeDx = 0;
    direzioneDecisa = false;
    gestoOrizzontale = false;

    if (carta.id !== "poster") {
        carta.style.transition = "none";
    }
}, { passive: true });

// MOVIMENTO DEL DITO
container.addEventListener("touchmove", (event) => {
    if (!swipeAttivo || !touchTarget) return;
    if (event.touches.length !== 1) return;

    const dx = event.touches[0].clientX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;

    if (!direzioneDecisa && Math.hypot(dx, dy) > 8) {
        direzioneDecisa = true;
        gestoOrizzontale = Math.abs(dx) > Math.abs(dy);
    }

    if (!gestoOrizzontale) return;

    swipeDx = dx;
    if (touchTarget.id === "poster")
        return;

    const rotazione = Math.max(
        -18,
        Math.min(18, dx * 0.05)
    );

    touchTarget.style.transform =
        `translateX(${dx}px) rotate(${rotazione}deg)`;

}, { passive: true });

// RILASCIO DEL DITO
container.addEventListener("touchend", () => {
    if (!swipeAttivo || !touchTarget) return;

    const carta = touchTarget;
    const dx = swipeDx;
    const eraSwipe = gestoOrizzontale;

    swipeAttivo = false;
    touchTarget = null;
    touchStartX = null;
    touchStartY = null;

    if (!eraSwipe) {
        carta.style.transition = "";
        return;
    }

    ignoraClickFinoA = Date.now() + 500;

    if (carta.id === "poster") {
        if (Math.abs(dx) >= SOGLIA_SWIPE) {
            const direzione = dx > 0 ? 1 : -1;
            chooseVideo(carta, direzione);
        }
        return;
    }

    if (Math.abs(dx) >= SOGLIA_SWIPE) {
        const direzione = dx > 0 ? 1 : -1;
        sfogliaCarta(carta, true, direzione);

    } else {
        carta.style.transition =
            `transform ${DURATA_RITORNO}ms ease-out`;

        carta.style.transform = "translateX(0) rotate(0)";

        setTimeout(() => {
            if (carta.isConnected) {
                carta.style.transform = "";
                carta.style.transition = "";
            }
        }, DURATA_RITORNO);
    }
}, { passive: true });

// TOCCO INTERROTTO
container.addEventListener("touchcancel", () => {
    if (touchTarget) {
        touchTarget.style.transition =
            `transform ${DURATA_RITORNO}ms ease-out`;
        touchTarget.style.transform = "translateX(0) rotate(0)";
    }

    swipeAttivo = false;
    touchTarget = null;
    touchStartX = null;
    touchStartY = null;
});

function fineVideo() {
    document.getElementById("video-open-booster")?.remove();
    document.getElementById("video-open-booster-2")?.remove();

    const imgs = container.querySelectorAll(
        "img:not(#conferma):not(#penultima)"
    );

    imgs.forEach(img => {
        img.style.transition = "none";
        img.style.opacity = "1";
        img.style.pointerEvents = "auto";
    });

    void container.offsetHeight;

    imgs.forEach(img => {
        img.style.transition = "";
    });

    sfoglioInCorso = false;
}

video?.addEventListener("ended", fineVideo);
video1?.addEventListener("ended", fineVideo);