const elements = {
    wordContainer: document.getElementById('word'),
    domWrongLetters: document.getElementById('wrong-letters'),
    playAgainBtn: document.getElementById('play-button'),
    popup: document.getElementById('popup-container'),
    notification: document.getElementById('notification-container'),
    finalMessage: document.getElementById('final-message'),
    figureParts: document.querySelectorAll('.figure-part'),
};

const state = {
    words: [],
    selectedWord: '',
    correctLetters: [],
    wrongLetters: [],
    gameDone: false,
    timeout: null,
};

const setState = (newState = {}) => ((prevState = state) => Object.assign(prevState, newState))();

const getWords = (async () => {
    const words = await fetch('https://cors-anywhere.herokuapp.com/https://api.datamuse.com/words?ml=ringing+in+the+ears')
        .then(res => res.json())
        .then(data => data.map(({ word }) => word));

    setState({ words, selectedWord: words[Math.floor(Math.random() * words.length)] });

    displayWord();
})();

const showNotification = () => {
    elements.notification.classList.add('show');

    state.timeout && clearTimeout(state.timeout);

    setState({ timeout: setTimeout(() => elements.notification.classList.remove('show'), 1000) });
};

const renderLetter = letter => {
    let markup = `<span class="letter">${state.correctLetters.includes(letter) ? letter : ''}</span>`;

    elements.wordContainer.insertAdjacentHTML('beforeend', markup);
};

const displayWord = () => {
    const { selectedWord, correctLetters } = state;
    const { wordContainer, finalMessage, popup } = elements;

    wordContainer.textContent = '';

    selectedWord.split('').forEach(renderLetter);

    let areAllLettersPresent = selectedWord.split('').every(letter => correctLetters.includes(letter));

    if (areAllLettersPresent) {
        setState({ gameDone: true });
        finalMessage.textContent = 'Congratulations You Won 👌';
        popup.classList.add('show-popup');
    }
};

const updateWrongLetters = () => {
    const { wrongLetters } = state;
    const { domWrongLetters, figureParts, finalMessage, popup } = elements;

    domWrongLetters.textContent = '';

    domWrongLetters.insertAdjacentHTML(
        'afterbegin',
        `
        ${wrongLetters.length ? '<p>Wrong</p>' : ''}
        ${wrongLetters.map(letter => `<span>${letter}</span>`).join('')}
        `,
    );

    figureParts.forEach((part, partIdx) => partIdx < wrongLetters.length && (part.style.display = 'block'));

    if (wrongLetters.length === figureParts.length) {
        setState({ gameDone: true });
        finalMessage.textContent = 'Unfortunately you lost. 😓';
        popup.classList.add('show-popup');
    }
};

document.addEventListener('keydown', ({ key: letter, ctrlKey }) => {
    const { gameDone, selectedWord, correctLetters, wrongLetters } = state;

    if (gameDone || ctrlKey || !/^(\w)$/i.test(letter)) return;

    if (selectedWord.includes(letter) && !correctLetters.includes(letter)) {
        correctLetters.push(letter);
        displayWord();
    } else if (wrongLetters.includes(letter) || correctLetters.includes(letter)) showNotification();
    else {
        wrongLetters.push(letter);
        updateWrongLetters();
    }
});

elements.playAgainBtn.addEventListener('click', () => location.reload());
