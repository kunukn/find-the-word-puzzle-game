;

/**
 * Polyfill startsWith
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/**
 * DOM Util
 */
function $$(expr, context) {
    let arr = Array.prototype.slice.call((context || document).querySelectorAll(expr), 0);
    return arr.length > 1 ? arr : arr[0];
}

document.addEventListener("DOMContentLoaded", function(event) {
    viewModel.startNewGame();
    $$('#audio-music').volume = .5;
});

let viewModel = (() => {

    /**
     * Randomize array element order in-place.
     * Durstenfeld shuffle algorithm.   
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    

    // $ prefix means DOM element
    const $componentGame = $$('.component--game');
    const $wordElements = $$('.word', $componentGame);
    const $gameBoard = $$('.game-board', $componentGame);
    const $intro = $$('.intro', $componentGame);
    const $chosen = $$('.chosen', $intro);
    const $headLine = $$('h1', $intro);
    const $btnRestart = $$('.btn--restart', $componentGame);
    const $btnSound = $$('.btn--sound', $componentGame);
    const $btnMusic = $$('.btn--music', $componentGame);
    const $btnMode = $$('.btn--mode', $componentGame);
    const $hud = $$('.hud', $componentGame);
    const $timer = $$('.timer', $hud);
    const $timerValue = $$('.value', $timer);
    const $points = $$('.points', $hud);
    const $pointsValue = $$('.value', $points);
    const $audioMouseClick = $$('#audio-mouse-click', $componentGame);
    const $audioBoomBang = $$('#audio-boom-bang', $componentGame);
    const $audioCountdown = $$('#audio-countdown', $componentGame);
    const $audioSuccessful = $$('#audio-successful', $componentGame);
    const $audioMusic = $$('#audio-music', $componentGame);

    // Word options for the game, insert your words here
    const wordOptions =
        `appreciate abandoned absolutely accommodation advertisement accurately achievement acknowledge additional 
    afternoon afterwards approximately basketball bathroom batteries beginner boyfriend bracelet building 
    circumstance candidate calculation communication companion centimeter complicated congratulation developer 
    deliberately demonstrate determination dangerous difference disappointment downstairs dictionary efficiently 
    education electricity embarrassment encouragement engineering entertainment frontend familiar generation gentleman 
    geography girlfriend grandfather grandmother hairdresser happiness headphones handwriting however immigration 
    insurance information international introduction investigation involvement landscape laboratory language lieutenant 
    laundromat luggage magazine manufacture management microphone microwave motorcycle medicine morning outdoors 
    occasionally organization outstanding observation packaging pedagogical painting participate photograph pronunciation 
    professional programmer punishment qualification remember restaurant refrigerator scientist sandwich satisfaction 
    something situation sentence salesperson supermarket technology temperature triangle teammate thousandth tomorrow toothbrush 
    typewriter understanding undergraduate umbrella vacations videographer vitamins vegetables waitress wedding workplace`.match(/\S+/g);


    function Game() {
        this.state = 'init';
        this.mode = gameMode;
        this.points = 0;
        this.word = '';
        this.guess = '';
        this.duration = 0;
        this.timeLeft = 40;
        this.sound = soundEnabled;
        this.music = musicEnabled;
    }

    let game = new Game();
    let timerId;
    let gameMode = 'easy';
    let soundEnabled = false;
    let musicEnabled = false;

    function resetGameTitle() {
        $headLine.innerText = 'Find the word';
    }

    function getRandomWord() {
        return wordOptions[~~(Math.random() * wordOptions.length)];
    }

    function resetGame() {
        clearTimeout(timerId);

        game = new Game();

        clearCheckmarks();
        enableGame();

        // UI
        $gameBoard.classList.remove('game-ended');
        $timerValue.innerText = game.timeLeft;
        $chosen.innerText = '';
        resetGameTitle();
        $btnRestart.style.display = 'none';
        $gameBoard.style.display = 'none';
        $hud.style.display = 'none';
        $chosen.style.display = 'none';
    }

    function startNewGame() {
        resetGame();
        getNewWord();

        // UI
        $btnRestart.style.display = 'inline-block';
        $gameBoard.style.display = 'block';
        $hud.style.display = 'flex';
        $chosen.style.display = 'block';
        $pointsValue.innerText = game.points;

        // Game loop
        timerId = setInterval(() => {

            game.duration++;
            game.timeLeft--;
            $timerValue.innerText = game.timeLeft;
            if (game.timeLeft === 4) {
                if (game.sound) $audioCountdown.play();
            }

            updateGameState();

        }, 1000);
    }

    function updateGameState() {
        if (game.timeLeft <= 0) {
            gameEnded();
        }
    }

    function getNewWord() {
        clearCheckmarks();
        $chosen.innerText = '';

        game.guess = '';
        game.word = getRandomWord();
        let word = game.word;
        let partialWords = [];

        // Easy version
        if (game.mode === 'easy') {
            let length = ~~(word.length / 3);
            partialWords.push(word.substring(0, length));
            partialWords.push(word.substring(length, length * 2));
            partialWords.push(word.substring(length * 2));
            partialWords.push('');
        } else {
            // Hard version
            let length = ~~(word.length / 4);
            partialWords.push(word.substring(0, length));
            partialWords.push(word.substring(length, length * 2));
            partialWords.push(word.substring(length * 2, length * 3));
            partialWords.push(word.substring(length * 3));
        }

        shuffleArray(partialWords);

        for (var i = 0; i < $wordElements.length; i++) {
            $wordElements[i].innerText = partialWords[i];
        }

        game.state = 'new word';
    }

    function gameEnded() {
        clearTimeout(timerId);
        game.state = 'game ended';
        disableGame();
        $headLine.innerText = 'Game ended';
        $gameBoard.classList.add('game-ended');
    }

    function clearCheckmarks() {
        // UI
        $wordElements.forEach((element) => {
            element.classList.remove('correct');
            element.classList.remove('incorrect');
        });
    }

    function enableGame() {
        $gameBoard.classList.remove('disabled');
        $gameBoard.classList.remove('correct-answer');
        $gameBoard.classList.remove('incorrect-answer');
        updateGameState();
    }

    function disableGame(isCorrect) {
        $gameBoard.classList.add('disabled');
        if (isCorrect === true) {
            $gameBoard.classList.add('correct-answer');
        } else if (isCorrect === false) {
            $gameBoard.classList.add('incorrect-answer');
        }
    }

    if (musicEnabled) $audioMusic.play();
    else $btnMusic.classList.add('disabled');
    if (!soundEnabled) $btnSound.classList.add('disabled');

    //debug
    for (var i = 0; i < 100; i++) {
        //console.debug(getRandomWord());
    }
    //console.debug('wordOptions count is ' + wordOptions.length);

    return {
        resetGame: function(element) {
            resetGame();
        },
        restartGame: function(element) {
            if (game.sound) $audioMouseClick.play();

            startNewGame();
        },
        startNewGame: function(element) {
            startNewGame();
        },
        toggleMode: function(element) {
            if (game.sound) $audioMouseClick.play();

            if (element.innerText.toLowerCase() === 'easy') {
                element.style.color = 'tomato';
                gameMode = 'hard';
                game.mode = gameMode;
                element.innerText = gameMode;
            } else {
                element.style.color = 'green';
                gameMode = 'easy';
                game.mode = gameMode;
                element.innerText = gameMode;
            }
        },
        soundToggle: function() {
            soundEnabled = !soundEnabled;
            game.sound = soundEnabled;
            $audioMouseClick.play();
            $btnSound.classList.toggle('disabled');
        },
        musicToggle: function() {
            musicEnabled = !musicEnabled;
            game.music = musicEnabled;

            if (game.sound) $audioMouseClick.play();

            if (game.music)
                $audioMusic.play();
            else
                $audioMusic.pause();

            $btnMusic.classList.toggle('disabled');
        },
        chooseWord: function(element) {

            let partialWord = element.innerText;
            $chosen.innerText += partialWord;

            let chosenWord = $chosen.innerText.toLowerCase();
            game.guess += chosenWord;

            let isCorrect = element.innerText !== '' && game.word.startsWith(chosenWord);

            if (isCorrect) {

                element.classList.add('correct');

                if (game.word === chosenWord) {

                    if (game.sound) $audioSuccessful.play();

                    disableGame(isCorrect);
                    game.points++;
                    $pointsValue.innerText = game.points;

                    setTimeout(() => {
                        getNewWord();
                        resetGameTitle();
                        enableGame();
                    }, 1000);
                } else {
                    if (game.sound) $audioMouseClick.play();
                }

            } else {
                if (game.sound) $audioBoomBang.play();

                element.classList.add('incorrect');
                disableGame(isCorrect);
                $headLine.innerText = game.word.toUpperCase();

                setTimeout(() => {
                    getNewWord();
                    resetGameTitle();
                    enableGame();
                }, 2500);
            }

            element.innerText = '';
        }
    };

})();
