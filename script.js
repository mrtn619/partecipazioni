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

    const forzaFrame = () => {
        v.play().then(() => {
            v.pause();
            v.currentTime = 0;
        }).catch((err) => {
            console.log("play bloccato:", err); // utile per debug
            document.addEventListener("touchstart", () => {
                v.play().then(() => { v.pause(); v.currentTime = 0; });
            }, { once: true });
        });
    };

    if (v.readyState >= 2) {
        forzaFrame();
    } else {
        v.addEventListener("loadeddata", forzaFrame, { once: true });
    }
});

const container = document.getElementById("card-container");
const video = document.getElementById("video-open-booster");
const boostercontainer = document.getElementById("video-container");
const timeout = 300;

container.addEventListener("click", (event) => {
    const clicked = event.target;
    const lastCard = container.lastElementChild;
    const conferma = document.getElementById("conferma");

    if(clicked === lastCard && container.children.length > 1) {

        if(clicked.tagName === "VIDEO") {
            clicked.play();
            return;
        }

        clicked.classList.add("img-sfogliata");

        setTimeout(() => {
            clicked.remove();

            const newLastCard = container.lastElementChild;

            if (newLastCard.id === "penultima") {
                newLastCard.classList.add("carta-in-entrata");

                newLastCard.addEventListener("animationend", () => {
                    newLastCard.classList.remove("carta-in-entrata");
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