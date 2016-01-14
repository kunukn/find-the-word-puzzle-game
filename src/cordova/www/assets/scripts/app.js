var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if (id === 'deviceready') {
            run();
        }
    }
};

app.initialize();

var viewModel = {};

function $$(expr, context) {
    var arr = Array.prototype.slice.call((context || document).querySelectorAll(expr), 0);
    return arr.length > 1 ? arr : arr[0];
}

var run = function() {
    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    viewModel = (function() {

        // $ prefix means DOM element
        var $componentGame = $$('.component--game');
        var $wordElements = $$('.word', $componentGame);
        var $gameBoard = $$('.game-board', $componentGame);
        var $intro = $$('.intro', $componentGame);
        var $chosen = $$('.chosen', $intro);
        var $headLine = $$('h1', $intro);
        var $btnRestart = $$('.btn--restart', $componentGame);
        var $btnSound = $$('.btn--sound', $componentGame);
        var $btnMusic = $$('.btn--music', $componentGame);
        var $btnMode = $$('.btn--mode', $componentGame);
        var $hud = $$('.hud', $componentGame);
        var $timer = $$('.timer', $hud);
        var $timerValue = $$('.value', $timer);
        var $points = $$('.points', $hud);
        var $pointsValue = $$('.value', $points);
        var $audioMouseClick = $$('#audio-mouse-click', $componentGame);
        var $audioBoomBang = $$('#audio-boom-bang', $componentGame);
        var $audioCountdown = $$('#audio-countdown', $componentGame);
        var $audioSuccessful = $$('#audio-successful', $componentGame);
        var $audioMusic = $$('#audio-music', $componentGame);

        // Word options for the game, insert your words here
        var wordOptions = 'appreciate abandoned absolutely accommodation accurately achievement acknowledge additional circumstance candidate \n    calculation communication companion codepen developer deliberately demonstrate determination dangerous difference disappointment \n    efficiently education electricity embarrassment encouragement engineering entertainment frontend familiar google generation \n    gentleman geography hairdresser happiness handwriting information international introduction investigation involvement landscape \n    laboratory language lieutenant manufacture management microsoft occasionally organization outstanding observation packaging pedagogical \n    professional programmer punishment qualification satisfaction something salesperson technology temperature teammate thousandth twitter \n    understanding undergraduate umbrella videographer'.match(/\S+/g);

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

        var game = new Game();
        var timerId = undefined;
        var gameMode = 'easy';
        var soundEnabled = false;
        var musicEnabled = false;

        function resetGameTitle() {
            $headLine.innerText = 'Find the word';
        }

        function getRandomWord() {
            return wordOptions[~~(Math.random() * wordOptions.length)];
        }

        function _resetGame() {
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

        function _startNewGame() {
            _resetGame();
            getNewWord();

            // UI
            $btnRestart.style.display = 'inline-block';
            $gameBoard.style.display = 'block';
            $hud.style.display = 'flex';
            $chosen.style.display = 'block';
            $pointsValue.innerText = game.points;

            // Game loop
            timerId = setInterval(function() {

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
            var word = game.word;
            var partialWords = [];

            // Easy version
            if (game.mode === 'easy') {
                var length = ~~(word.length / 3);
                partialWords.push(word.substring(0, length));
                partialWords.push(word.substring(length, length * 2));
                partialWords.push(word.substring(length * 2));
                partialWords.push('');
            } else {
                // Hard version
                var length = ~~(word.length / 4);
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
            $wordElements.forEach(function(element) {
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
        for (var i = 0; i < 100; i++) {}
        //console.debug(getRandomWord());

        //console.debug('wordOptions count is ' + wordOptions.length);

        return {
            resetGame: function resetGame(element) {
                _resetGame();
            },
            restartGame: function restartGame(element) {
                if (game.sound) $audioMouseClick.play();

                _startNewGame();
            },
            startNewGame: function startNewGame(element) {
                _startNewGame();
            },
            toggleMode: function toggleMode(element) {
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
            soundToggle: function soundToggle() {
                soundEnabled = !soundEnabled;
                game.sound = soundEnabled;
                $audioMouseClick.play();
                $btnSound.classList.toggle('disabled');
            },
            musicToggle: function musicToggle() {
                musicEnabled = !musicEnabled;
                game.music = musicEnabled;

                if (game.sound) $audioMouseClick.play();

                if (game.music) $audioMusic.play();
                else $audioMusic.pause();

                $btnMusic.classList.toggle('disabled');
            },
            chooseWord: function chooseWord(element) {

                var partialWord = element.innerText;
                $chosen.innerText += partialWord;

                var chosenWord = $chosen.innerText.toLowerCase();
                game.guess += chosenWord;

                var isCorrect = element.innerText !== '' && game.word.startsWith(chosenWord);

                if (isCorrect) {

                    element.classList.add('correct');

                    if (game.word === chosenWord) {

                        if (game.sound) $audioSuccessful.play();

                        disableGame(isCorrect);
                        game.points++;
                        $pointsValue.innerText = game.points;

                        setTimeout(function() {
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

                    setTimeout(function() {
                        getNewWord();
                        resetGameTitle();
                        enableGame();
                    }, 2500);
                }

                element.innerText = '';
            }
        };
    })();

    viewModel.startNewGame();
    $$('#audio-music').volume = .5;
};
