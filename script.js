const container = document.getElementById("card-container");
const video = document.getElementById("video-open-booster");

container.addEventListener("click", (event) => {
    const clicked = event.target;
    const lastCard = container.lastElementChild;

    if(clicked === lastCard && container.children.length > 1) {

        if (clicked.tagName === "VIDEO"){
            return;
        }

        clicked.classList.add("elemento-sfogliato");

        setTimeout(() => {
            clicked.remove();

            const newLastCard = container.lastElementChild;
            if (newLastCard && newLastCard.tagName === "VIDEO") {
                newLastCard.play();
            }
        }, 500);
    }
});

video.addEventListener("ended", () => {
    video.remove();
});