window.addEventListener("DOMContentLoaded", () => {
    const v = document.getElementById("video-open-booster");
    if (!v) return;

    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || 
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPad moderni

    v.src = isIOS 
        ? "img/PARTECIPAZIONI/booster.MOV" 
        : "img/PARTECIPAZIONI/boosterpack-opening.webm";

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
const video = document.getElementById("video-open-booster");
const boostercontainer = document.getElementById("video-container");
const timeout = 300;

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
                newLastCard.classList.add("ill-rare-in");

                newLastCard.addEventListener("animationend", () => {
                    newLastCard.classList.remove("ill-rare-in");
                    newLastCard.style.opacity = 1;
                    conferma.style.opacity = 1;
                }, {once: true});
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