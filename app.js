const elements = {
    wordContainer: document.getElementById("word"),
    domWrongLetters: document.getElementById("wrong-letters"),
    playAgainBtn: document.getElementById("play-button"),
    popup: document.getElementById("popup-container"),
    notification: document.getElementById("notification-container"),
    finalMessage: document.getElementById("final-message"),
    figureParts: document.querySelectorAll(".figure-part"),
};

let words = [];
let selectedWord;

const getWords = (async _ => {
    words = await fetch(
        "https://cors-anywhere.herokuapp.com/https://api.datamuse.com/words?ml=ringing+in+the+ears",
    )
        .then(res => res.json())
        .then(data => data.map(({ word }) => word));

    selectedWord = words[Math.floor(Math.random() * words.length)];

    displayWord();
})();

const data = {
    correctLetters: [],
    wrongLetters: [],
    gameDone: false,
};

let timeOut;
const showNotification = _ => {
    elements.notification.classList.add("show");

    timeOut && clearTimeout(timeOut);

    timeOut = setTimeout(_ => elements.notification.classList.remove("show"), 1000);
};

const renderLetter = letter => {
    let markup = `<span class="letter">${data.correctLetters.includes(letter) ? letter : ""}</span>`;

    elements.wordContainer.insertAdjacentHTML("beforeend", markup);
};

const displayWord = _ => {
    const { wordContainer, finalMessage, popup } = elements;

    wordContainer.textContent = "";

    selectedWord.split("").forEach(renderLetter);

    let areAllLettersPresent = selectedWord.split("").every(letter => data.correctLetters.includes(letter));

    if (areAllLettersPresent) {
        data.gameDone = true;
        finalMessage.textContent = "Congratulations! You Won! :)";
        popup.classList.add("show-popup");
    }
};

const updateWrongLetters = _ => {
    const { domWrongLetters, figureParts, finalMessage, popup } = elements;

    domWrongLetters.textContent = "";

    domWrongLetters.insertAdjacentHTML(
        "afterbegin",
        `
            ${data.wrongLetters.length ? "<p>Wrong</p>" : ""}
            ${data.wrongLetters.map(letter => `<span>${letter}</span>`).join("")}
        `,
    );

    figureParts.forEach((part, partIdx) => partIdx < data.wrongLetters.length && (part.style.display = "block"));

    if (data.wrongLetters.length === figureParts.length) {
        data.gameDone = true;
        finalMessage.textContent = "Unfortunately you lost. :(";
        popup.classList.add("show-popup");
    }
};

document.addEventListener("keydown", ({ key, ctrlKey }) => {
    if (data.gameDone || ctrlKey || !/\b[a-z]{1}/.test(key)) return;

    if (selectedWord.includes(key) && !data.correctLetters.includes(key)) {
        data.correctLetters.push(key);
        displayWord();
    } else if (data.wrongLetters.includes(key) || data.correctLetters.includes(key)) showNotification();
    else {
        data.wrongLetters.push(key);
        updateWrongLetters();
    }
});

elements.playAgainBtn.addEventListener("click", _ => location.reload());
