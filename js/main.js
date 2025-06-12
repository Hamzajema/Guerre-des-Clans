// Import the classes
import { Unit, Clan } from './units.js';
import { animations } from './animations.js';



document.addEventListener("DOMContentLoaded", function () {
    
    const gameBoard = document.getElementById("gameBoard");
    const playerTurn = document.getElementById("playerTurn");
    const gamePhase = document.getElementById("gamePhase");
    const gameLog = document.getElementById("gameLog");
    const player1Dice = document.getElementById("player1Dice");
    const player2Dice = document.getElementById("player2Dice");
    const startButton = document.getElementById("startButton");
    const moveButton = document.getElementById("moveButton");
    const attackButton = document.getElementById("attackButton");
    const defendButton = document.getElementById("defendButton");
    const endTurnButton = document.getElementById("endTurnButton");
    const player1UnitCount = document.getElementById("player1Units");
    const player2UnitCount = document.getElementById("player2Units");
    const tutorialButton = document.getElementById("tutorialButton");
    const tutorialModal = document.getElementById("tutorialModal");
    const restartButton = document.getElementById("restartButton");
    const start = document.getElementById("start");
    const closeTutorial = document.getElementById("closeTutorial");
    window.onload = initializeAIAndML;

    // Initialisation des variables du jeu
    let gameState = {
        phase: "setup", 
        round: 0,
        currentPlayer: 1,
        selectedClan: {
            player1: null,
            player2: null,
        },
        board: Array(10)
            .fill()
            .map(() => Array(10).fill(null)),
        selectedCell: null,
        selectedUnit: null,
        movablePositions: [],
        attackablePositions: [],
        remainingUnits: {
            player1: [],
            player2: [],
        },
        unitsToPlace: {
            player1: [],
            player2: [],
        },
    };

    startButton.disabled = false;
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        .hit-effect {
            animation: hit-flash 0.3s;
        }
        
        @keyframes hit-flash {
            0% { background-color: transparent; }
            50% { background-color: rgba(255, 0, 0, 0.5); }
            100% { background-color: transparent; }
        }
        
        .attack-effect {
            pointer-events: none;
        }
        
        .attack-icon {
            width: 40px;
            height: 40px;
            transform: translate(-50%, -50%);
        }
        
        .damage-number {
            pointer-events: none;
            transform: translate(-50%, -50%);
        }
        
        .animated-unit {
            pointer-events: none;
        }
        
        .death-animation {
            animation: death-fade 0.5s forwards;
        }
        
        @keyframes death-fade {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(styleElement);
    // Initialiser le jeu
    createGameBoard();
    
    function createGameBoard() {
        gameBoard.innerHTML = "";
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.dataset.row = row;
                cell.dataset.col = col;
                if (row < 3) {
                    cell.classList.add("player1-zone"); 
                } else if (row >= 3 && row <= 6) {
                    cell.classList.add("neutral-zone"); 
                } else {
                    cell.classList.add("player2-zone");
                }
                cell.addEventListener("click", () => handleCellClick(row, col));
                gameBoard.appendChild(cell);
            }
        }
    }

    startButton.addEventListener("click", () => {
        gameState.selectedClan.player1 =
            localStorage.getItem("player1Clan") || "mountains";
        gameState.selectedClan.player2 =
            localStorage.getItem("player2Clan") || "plains";
        startGame();
        start.style.display = "none";
        restartButton.style.display = "flex";
    });

    restartButton.addEventListener("click", () => {
        window.location.reload();
        console.log("click restartButton");
        start.style.display = "block";
        restartButton.style.display = "none";
    });

    function startGame() {
        gameState.phase = "placement";
        generateUnitsToPlace();
        updateUI();
        logMessage("Partie démarrée! Phase de placement des unités.");
        logMessage(
            `Joueur 1 (${Clan.getClan(gameState.selectedClan.player1).name
            }): placez vos unités dans les 3 premières lignes.`
        );
    }

    // Générer les unités à placer pour chaque joueur selon leur clan
    function generateUnitsToPlace() {
        const player1Clan = Clan.getClan(gameState.selectedClan.player1);
        const player2Clan = Clan.getClan(gameState.selectedClan.player2);
        console.log("player1Clan:", gameState.selectedClan.player1);
        console.log("player2Clan:", gameState.selectedClan.player2);
        gameState.unitsToPlace.player1 = player1Clan.generateUnits(1);
        gameState.unitsToPlace.player2 = player2Clan.generateUnits(2);
        gameState.remainingUnits.player1 = [...gameState.unitsToPlace.player1];
        gameState.remainingUnits.player2 = [...gameState.unitsToPlace.player2];
        updateUnitCounts();
    }

    function updateUI() {
        playerTurn.textContent = `Tour du Joueur ${gameState.currentPlayer}`;
        playerTurn.className = `player-turn player${gameState.currentPlayer}-turn`;
        gamePhase.textContent = getPhaseText(gameState.phase);
        updateButtons();
        updateUnitCounts();
    }

    // Obtenir le texte descriptif pour la phase actuelle
    function getPhaseText(phase) {
        switch (phase) {
            case "setup":
                return "Phase de configuration";
            case "placement":
                return "Phase de placement des unités";
            case "diceRoll":
                return "Lancer de dés pour déterminer le premier joueur";
            case "movement":
                return "Phase de mouvement";
            case "action":
                return "Phase d'action";
            case "gameOver":
                return "Partie terminée";
            default:
                return "";
        }
    }

    // Mettre à jour l'état des boutons selon la phase du jeu
    function updateButtons() {
        moveButton.disabled = gameState.phase !== "movement";
        attackButton.disabled = gameState.phase !== "action";
        defendButton.disabled = gameState.phase !== "action";
        endTurnButton.disabled =
            gameState.phase === "setup" ||
            gameState.phase === "placement" ||
            gameState.phase === "gameOver";
    }

    // Mettre à jour le compteur d'unités restantes
    function updateUnitCounts() {
        player1UnitCount.innerHTML = `<strong>Joueur 1</strong><p>Unités: ${gameState.remainingUnits.player1.length}</p>`;
        player2UnitCount.innerHTML = `<strong>Joueur 2</strong><p>Unités: ${gameState.remainingUnits.player2.length}</p>`;
    }

    // Gérer le clic sur une cellule
    function handleCellClick(row, col) {
        const cell = gameState.board[row][col];
        if (gameState.phase === "placement") {
            handlePlacementPhase(row, col);
            return;
        }
        if (gameState.phase === "movement") {
            handleMovementPhase(row, col);
            return;
        }
        if (gameState.phase === "action") {
            handleActionPhase(row, col);
            return;
        }
    }

    // Gérer la phase de placement
    function handlePlacementPhase(row, col) {
        let isValidZone = false;
        if (gameState.currentPlayer === 1 && row < 3) {
            isValidZone = true;
        } else if (gameState.currentPlayer === 2 && row >= 7) {
            isValidZone = true;
        }
        if (!isValidZone) {
            logMessage(`Vous ne pouvez placer des unités que dans votre zone!`);
            return;
        }
        if (gameState.board[row][col]) {
            logMessage(`Cette case est déjà occupée!`);
            return;
        }
        const unitsToPlace =
            gameState.unitsToPlace[`player${gameState.currentPlayer}`];
        if (unitsToPlace.length > 0) {
            const unit = unitsToPlace.shift();
            gameState.board[row][col] = unit;
            renderUnit(row, col, unit);
            gameState.round++;
            logMessage(
                `Joueur ${gameState.currentPlayer} a placé un ${unit.name
                } en position (${row + 1},${col + 1}).`
            );
            if (unitsToPlace.length === 0) {
                if (gameState.currentPlayer === 1) {
                    gameState.currentPlayer = 2;
                    logMessage(
                        `Joueur 2 (${Clan.getClan(gameState.selectedClan.player2).name
                        }): placez vos unités dans les 3 dernières lignes.`
                    );
                } else {
                    startBattle();
                }
                updateUI();
            }
        }
    }

    // Afficher une unité sur le plateau
    function renderUnit(row, col, unit) {
        const cellElement = document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
        );
        if (cellElement) {
        const existingUnit = cellElement.querySelector(".unit");
        if (existingUnit) {
            existingUnit.remove();
        }
        const unitElement = document.createElement("div");
        unitElement.className = "unit";
        unitElement.dataset.unitId = unit.id;
        unitElement.classList.add(`player-${unit.player}`);
        const unitImage = document.createElement("img");
        unitImage.src = unit.imageUrl;
        unitImage.alt = unit.name + "_" + unit.player;
        unitElement.appendChild(unitImage);
        const unitInfo = document.createElement("div");
        unitInfo.className = "unit-info";
        unitInfo.textContent = `${unit.health}♥`;
        unitElement.appendChild(unitInfo);
        cellElement.appendChild(unitElement);
        }
    }

    // Commencer la bataille après la phase de placement
    function startBattle() {
        gameState.phase = "diceRoll";
        logMessage("Toutes les unités sont placées. Début de la bataille!");
        logMessage("Lancer de dés pour déterminer qui commence...");
        setTimeout(rollDiceForInitiative, 1000);
    }

    // Lancer les dés pour déterminer qui commence
    function rollDiceForInitiative() {
        disableControls();
        prepareAnimationElements();
        let animationFrames = 20; 
        let currentFrame = 0;
        let finalRoll1, finalRoll2;
        finalRoll1 = Math.floor(Math.random() * 6) + 1;
        finalRoll2 = Math.floor(Math.random() * 6) + 1;
        const animateRoll = () => {
        const tempRoll1 = Math.floor(Math.random() * 6) + 1;
        const tempRoll2 = Math.floor(Math.random() * 6) + 1;
        updateDiceDisplay(player1Dice, tempRoll1);
        updateDiceDisplay(player2Dice, tempRoll2);
        player1Dice.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        player2Dice.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        currentFrame++;
        if (currentFrame < animationFrames) {
            setTimeout(animateRoll, 100);
        } else {
            updateDiceDisplay(player1Dice, finalRoll1);
            updateDiceDisplay(player2Dice, finalRoll2);
            player1Dice.style.transform = "rotate(0deg)";
            player2Dice.style.transform = "rotate(0deg)";
            highlightWinner(finalRoll1, finalRoll2);
            if (finalRoll1 > finalRoll2) {
            gameState.currentPlayer = 1;
            logMessage(
                `Joueur 1 a obtenu ${finalRoll1} et Joueur 2 a obtenu ${finalRoll2}. Joueur 1 commence!`
            );
            } else if (finalRoll2 > finalRoll1) {
            gameState.currentPlayer = 2;
            logMessage(
                `Joueur 1 a obtenu ${finalRoll1} et Joueur 2 a obtenu ${finalRoll2}. Joueur 2 commence!`
            );
            } else {
            logMessage(
                `Égalité! Les deux joueurs ont obtenu ${finalRoll1}. On relance...`
            );
            setTimeout(rollDiceForInitiative, 1000);
            return;
            }
            enableControls();
            setTimeout(() => {
            gameState.phase = "movement";
            updateUI();
            logMessage(
                `Tour du Joueur ${gameState.currentPlayer}. Phase de mouvement.`
            );
            }, 1000);
        }
        };
        animateRoll();
        }

    // Lancer les dés pour déterminer si l'attaque est resue
    function attaqueDiceForInitiative() {
        return new Promise((resolve) => {
            disableControls();
            let playerWin = 0;
            prepareAnimationElements();
            let animationFrames = 20; 
            let currentFrame = 0;
            let finalRoll1, finalRoll2;
            finalRoll1 = Math.floor(Math.random() * 6) + 1;
            finalRoll2 = Math.floor(Math.random() * 6) + 1;
            console.log("Dice animation started. Final values:", finalRoll1, finalRoll2);
            const animateRoll = () => {
                const tempRoll1 = Math.floor(Math.random() * 6) + 1;
                const tempRoll2 = Math.floor(Math.random() * 6) + 1;
                updateDiceDisplay(player1Dice, tempRoll1);
                updateDiceDisplay(player2Dice, tempRoll2);
                player1Dice.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
                player2Dice.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
                currentFrame++;
                if (currentFrame < animationFrames) {
                    setTimeout(animateRoll, 100);
                } else {
                    updateDiceDisplay(player1Dice, finalRoll1);
                    updateDiceDisplay(player2Dice, finalRoll2);
                    player1Dice.style.transform = "rotate(0deg)";
                    player2Dice.style.transform = "rotate(0deg)";
                    highlightWinner(finalRoll1, finalRoll2);
                    if (finalRoll1 > finalRoll2) {
                        playerWin = 1;
                        logMessage(
                            `Joueur 1 a obtenu ${finalRoll1} et Joueur 2 a obtenu ${finalRoll2}. Joueur 1 gagne!`
                        );
                        enableControls();
                        console.log("Player 1 wins initiative with", finalRoll1, "vs", finalRoll2);
                        resolve(playerWin);
                    } else if (finalRoll2 > finalRoll1) {
                        playerWin = 2;
                        logMessage(
                            `Joueur 1 a obtenu ${finalRoll1} et Joueur 2 a obtenu ${finalRoll2}. Joueur 2 gagne!`
                        );
                        enableControls();
                        console.log("Player 2 wins initiative with", finalRoll2, "vs", finalRoll1);
                        resolve(playerWin);
                    } else {
                        logMessage(
                            `Égalité! Les deux joueurs ont obtenu ${finalRoll1}. On relance...`
                        );
                        setTimeout(() => {
                            attaqueDiceForInitiative().then(result => resolve(result));
                        }, 1000);
                    }
                }
            };
            animateRoll();
        });
    }
    // Fonction pour préparer les éléments d'animation
    function prepareAnimationElements() {
        player1Dice.classList.add("dice-animation");
        player2Dice.classList.add("dice-animation");
        playDiceSound();
    }

    // Fonction pour mettre à jour l'affichage des dés
    function updateDiceDisplay(diceElement, value) {
        diceElement.textContent = value;
    }

    // Fonction pour mettre en évidence le gagnant
    function highlightWinner(roll1, roll2) {
        player1Dice.classList.remove("winner", "loser", "tie");
        player2Dice.classList.remove("winner", "loser", "tie");
        if (roll1 > roll2) {
        player1Dice.classList.add("winner");
        player2Dice.classList.add("loser");
        } else if (roll2 > roll1) {
        player2Dice.classList.add("winner");
        player1Dice.classList.add("loser");
        } else {
        player1Dice.classList.add("tie");
        player2Dice.classList.add("tie");
        }
    }

    // Fonctions pour désactiver/activer les contrôles pendant l'animation
    function disableControls() {
        const buttons = document.querySelectorAll(".game-button");
        buttons.forEach((button) => {
        button.disabled = true;
        });
    }

    function enableControls() {
        const buttons = document.querySelectorAll(".game-button");
        buttons.forEach((button) => {
        button.disabled = false;
        });
    }

    // Fonction pour jouer un son de dés 
    function playDiceSound() {
        const diceSound = new Audio("../assets/audios/dice.mp3");
        diceSound.play();
    }
    // Gérer la phase de mouvement
    function handleMovementPhase(row, col) {
        if (gameState.selectedCell === null) {
        const unit = gameState.board[row][col];
        if (unit && unit.player === gameState.currentPlayer) {
            selectCell(row, col);
            showMovablePositions(row, col);
        } else {
            logMessage("Sélectionnez une de vos unités.");
        }
        } else {
        const selectedRow = gameState.selectedCell.row;
        const selectedCol = gameState.selectedCell.col;
        const isMovable = gameState.movablePositions.some(
            (pos) => pos.row === row && pos.col === col
        );
        if (isMovable) {
            const unit = gameState.board[selectedRow][selectedCol];
            gameState.board[row][col] = unit;
            gameState.board[selectedRow][selectedCol] = null;
            renderUnit(row, col, unit);
            clearCell(selectedRow, selectedCol, 0);
            gameState.round++;
            logMessage(`${unit.name} déplacé en (${row + 1},${col + 1}).`);
            gameState.phase = "action";
            clearSelection();
            updateUI();
            logMessage(
            "Phase d'action. Choisissez une action : Attaquer, Défendre ou Passer."
            );
        } else {
            const unit = gameState.board[row][col];
            if (unit && unit.player === gameState.currentPlayer) {
            clearSelection();
            selectCell(row, col);
            showMovablePositions(row, col);
            } else {
            logMessage("Mouvement invalide. Choisissez une case adjacente vide.");
            }
        }
        }
    }

    // Sélectionner une cellule
    function selectCell(row, col) {
        gameState.selectedCell = { row, col };
        gameState.selectedUnit = gameState.board[row][col];
        const cellElement = document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
        );
        if (cellElement) {
        cellElement.classList.add("selected-cell");
        }
    }

    // Afficher les positions de mouvement possibles
    function showMovablePositions(row, col) {
        clearHighlightedCells();
        const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 }, 
        { row: 0, col: -1 }, 
        { row: 0, col: 1 },
        ];
        gameState.movablePositions = [];
        for (let dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            if (gameState.board[newRow][newCol] === null) {
            gameState.movablePositions.push({ row: newRow, col: newCol });
            const cellElement = document.querySelector(
                `.cell[data-row="${newRow}"][data-col="${newCol}"]`
            );
            if (cellElement) {
                cellElement.classList.add("movable-cell");
            }
            }
        }
        }
    }

    // Gérer la phase d'action
    function handleActionPhase(row, col) {
        if (gameState.selectedCell === null) {
        const unit = gameState.board[row][col];
        if (unit && unit.player === gameState.currentPlayer) {
            selectCell(row, col);
            showAttackablePositions(row, col);
        } else {
            logMessage("Sélectionnez une de vos unités pour attaquer.");
        }
        } else {
        const selectedRow = gameState.selectedCell.row;
        const selectedCol = gameState.selectedCell.col;
        const isAttackable = gameState.attackablePositions.some(
            (pos) => pos.row === row && pos.col === col
        );
        if (isAttackable) {
            gameState.round++;
            const attackingUnit = gameState.board[selectedRow][selectedCol];
            const defendingUnit = gameState.board[row][col];
            const defRow = row;
            const defCol = col;
            performAttack(attackingUnit, defendingUnit, row, col).then(() => {
                console.log("attackingUnit", attackingUnit, "defendingUnit", defendingUnit);
                checkWinCondition();
                if (gameState.phase !== "gameOver") {
                    console.log("gameOver");
                    prepareNextTurn();
                }
            });
        } else {
            const unit = gameState.board[row][col];
            if (unit && unit.player === gameState.currentPlayer) {
            clearSelection();
            selectCell(row, col);
            showAttackablePositions(row, col);
            } else {
            logMessage("Cible invalide. Choisissez une unité ennemie à portée.");
            }
        }
        }
    }

    // Afficher les positions d'attaque possibles
    function showAttackablePositions(row, col) {
        clearHighlightedCells();
        const unit = gameState.board[row][col];
        const range = unit.range;
        gameState.attackablePositions = [];
        for (let r = Math.max(0, row - range); r <= Math.min(9, row + range); r++) {
        for (
            let c = Math.max(0, col - range);
            c <= Math.min(9, col + range);
            c++
        ) {
            const distance = Math.abs(r - row) + Math.abs(c - col);
            if (
            distance <= range &&
            gameState.board[r][c] &&
            gameState.board[r][c].player !== gameState.currentPlayer
            ) {
            gameState.attackablePositions.push({ row: r, col: c });
            const cellElement = document.querySelector(
                `.cell[data-row="${r}"][data-col="${c}"]`
            );
            if (cellElement) {
                cellElement.classList.add("attackable-cell");
            }
            }
        }
        }
    }

    // Vérifier si un joueur a gagné
    function checkWinCondition() {
        const clans = Clan.getAllClans();
        console.log("isAttackable", gameState.remainingUnits.player1);
        if (gameState.remainingUnits.player1.length === 0) {
        gameState.phase = "gameOver";
        logMessage(
            "Joueur 2 a gagné! Toutes les unités du Joueur 1 sont vaincues."
        );
        displayGameOver(2);
        updateGameStatistics(2);
        } else if (gameState.remainingUnits.player2.length === 0) {
        gameState.phase = "gameOver";
        logMessage(
            "Joueur 1 a gagné! Toutes les unités du Joueur 2 sont vaincues."
        );
        updateGameStatistics(1);
        displayGameOver(1);
        }
    }
    function displayGameOver(winner) {
        const clans = Clan.getAllClans();
        const winnerClan = winner === 1 ? gameState.selectedClan.player1 : gameState.selectedClan.player2;
        const winnerName = clans[winnerClan].name;
        const winnerSprite = clans[winnerClan].sprite;
        saveGameResult(winner, gameState);
        const gameOverModal = document.createElement("div");
        gameOverModal.id = "game-over-modal";
        const contentContainer = document.createElement("div");
        contentContainer.className = "victory-content";
        const victoryTitle = document.createElement("h1");
        victoryTitle.textContent = "VICTORY!";
        victoryTitle.className = "victory-title";
        const winnerText = document.createElement("h2");
        winnerText.textContent = `Le Joueur ${winner} (${winnerName}) a remporté la partie !!`;
        winnerText.className = "winner-text";
        const spriteContainer = document.createElement("div");
        spriteContainer.className = "sprite-container";
        const winnerSpriteElement = document.createElement("div");
        winnerSpriteElement.id = "winner-sprite";
        winnerSpriteElement.style.backgroundImage = `url(${winnerSprite})`;
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "buttons-container";
        const playAgainBtn = document.createElement("button");
        playAgainBtn.textContent = "Rejouer";
        playAgainBtn.className = "play-again-btn action-btn";
        playAgainBtn.onclick = function () {
            document.body.removeChild(gameOverModal);
            window.location.reload(); // Reload the page to reset the game
        };
        const historyBtn = document.createElement("button");
        historyBtn.textContent = "Voir l'historique";
        historyBtn.className = "history-btn action-btn";
        historyBtn.onclick = function () {
            displayGameHistory();
        };
        spriteContainer.appendChild(winnerSpriteElement);
        contentContainer.appendChild(victoryTitle);
        contentContainer.appendChild(winnerText);
        contentContainer.appendChild(spriteContainer);
        buttonsContainer.appendChild(playAgainBtn);
        buttonsContainer.appendChild(historyBtn);
        contentContainer.appendChild(buttonsContainer);
        gameOverModal.appendChild(contentContainer);
        document.body.appendChild(gameOverModal);
        updateUI();
        try {
            const victorySound = new Audio("../assets/audios/game-start-317318.mp3");
            victorySound.volume = 0.7;
            victorySound.play();
        } catch (e) {
            console.log("Victory sound couldn't be played");
        }
    }

    moveButton.addEventListener("click", () => {
        if (gameState.phase === "movement") {
        logMessage(
            "Sélectionnez une de vos unités, puis une case adjacente pour la déplacer."
        );
        }
    });

    // Bouton d'attaque
    attackButton.addEventListener("click", () => {
        if (gameState.phase === "action") {
        logMessage(
            "Sélectionnez une de vos unités, puis une unité ennemie à portée pour l'attaquer."
        );
        }
    });
        
    defendButton.addEventListener("click", () => {
        if (gameState.phase === "action") {
            if (gameState.selectedCell) {
                const row = gameState.selectedCell.row;
                const col = gameState.selectedCell.col;
                const unit = gameState.board[row][col];
                if (unit && unit.player === gameState.currentPlayer) {
                    const defenseBonus = 3;
                    unit.temporaryDefenseBonus = defenseBonus;
                    unit.defensiveStance = true;
                    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                    cellElement.classList.add("defensive-stance");
                    const shieldIcon = document.createElement("div");
                    shieldIcon.className = "defense-icon";
                    shieldIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4169E1" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>`;
                    cellElement.appendChild(shieldIcon);
                    logMessage(`${unit.name} se met en position défensive (+${defenseBonus} de défense jusqu'au prochain tour).`);
                    animateDefenseEffect(row, col);
                    unit.defenseRoundCounter = gameState.round;
                    prepareNextTurn();
                } else {
                    logMessage("Vous ne pouvez mettre en position défensive que vos propres unités.");
                }
            } else {
                logMessage("Sélectionnez d'abord une de vos unités.");
            }
        }
    });

    // Ajouter cette fonction pour animer l'effet de défense
    function animateDefenseEffect(row, col) {
        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const rect = cellElement.getBoundingClientRect();
        const gameBoardRect = document.getElementById("gameBoard").getBoundingClientRect();
        const defenseEffect = document.createElement("div");
        defenseEffect.className = "defense-effect";
        defenseEffect.style.position = "absolute";
        defenseEffect.style.left = `${rect.left - gameBoardRect.left + (rect.width / 2) - 40}px`;
        defenseEffect.style.top = `${rect.top - gameBoardRect.top + (rect.height / 2) - 40}px`;
        defenseEffect.style.width = "80px";
        defenseEffect.style.height = "80px";
        defenseEffect.style.borderRadius = "50%";
        defenseEffect.style.border = "3px solid #4169E1";
        defenseEffect.style.boxShadow = "0 0 10px #4169E1";
        defenseEffect.style.opacity = "0";
        defenseEffect.style.transform = "scale(0.7)";
        defenseEffect.style.zIndex = "100";
        document.getElementById("gameBoard").appendChild(defenseEffect);
        requestAnimationFrame(() => {
            defenseEffect.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
            defenseEffect.style.opacity = "0.7";
            defenseEffect.style.transform = "scale(1.2)";
            setTimeout(() => {
                defenseEffect.style.opacity = "0";
                defenseEffect.style.transform = "scale(1.5)";
                setTimeout(() => {
                    defenseEffect.remove();
                }, 500);
            }, 700);
        });
        const defenseSound = new Audio("../assets/audios/shield-bloc.mp3");
        defenseSound.volume = 0.5;
        defenseSound.play().catch(err => console.warn("Audio playback failed:", err));
    }

    // Ajouter cette fonction pour vérifier et retirer les bonus de défense au début de chaque tour
    function checkAndRemoveDefenseBonus() {
        console.log("Current gameState:", gameState);
        for (let row = 0; row < gameState.board.length; row++) {
            for (let col = 0; col < gameState.board[row].length; col++) {
                console.log("Checking for defense bonuses...");
                const unit = gameState.board[row][col];
                if (unit && unit.defensiveStance) {
                    if (unit.defenseRoundCounter < gameState.round) {
                        unit.temporaryDefenseBonus = 0;
                        unit.defensiveStance = false;
                        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                        cellElement.classList.remove("defensive-stance");
                        const defenseIcon = cellElement.querySelector(".defense-icon");
                        console.log("Removing defense icon...");
                        
                        if (defenseIcon) {
                            defenseIcon.remove();
                        }

                        logMessage(`${unit.name} n'est plus en position défensive.`);
                    }
                }
            }
        }
    }
    if (!document.getElementById("defenseStyles")) {
        const defenseStyles = document.createElement("style");
        defenseStyles.id = "defenseStyles";
        defenseStyles.textContent = `
    .defensive-stance {
        outline: 2px solid #4169E1;
        box-shadow: 0 0 8px #4169E1;
    }
    
    .defense-icon {
        position: absolute;
        top: 2px;
        right: 2px;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 50%;
        padding: 2px;
        z-index: 50;
    }
`;
        document.head.appendChild(defenseStyles);
    }

    // Bouton de fin de tour
    endTurnButton.addEventListener("click", () => {
        if (gameState.phase === "movement" || gameState.phase === "action") {
        logMessage(`Joueur ${gameState.currentPlayer} termine son tour.`);
        prepareNextTurn();
        }
    });

    // Effacer la sélection
    function clearSelection() {
        if (gameState.selectedCell) {
        const cellElement = document.querySelector(
            `.cell[data-row="${gameState.selectedCell.row}"][data-col="${gameState.selectedCell.col}"]`
        );
        if (cellElement) {
            cellElement.classList.remove("selected-cell");
        }
        }
        clearHighlightedCells();
        gameState.selectedCell = null;
        gameState.selectedUnit = null;
        gameState.movablePositions = [];
        gameState.attackablePositions = [];
    }

    // Effacer les cellules en surbrillance
    function clearHighlightedCells() {
        document.querySelectorAll(".movable-cell").forEach((cell) => {
        cell.classList.remove("movable-cell");
        });
        document.querySelectorAll(".attackable-cell").forEach((cell) => {
        cell.classList.remove("attackable-cell");
        });
    }

    // Effacer une cellule
    function clearCell(row, col, numero) {
        const cellElement = document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
        );
        if (cellElement) {
        const unitElement = cellElement.querySelector(".unit");
        if (unitElement) {
            const unitIdToDelete = unitElement.getAttribute("data-unit-id");
            if (numero == 1) {
            gameState.remainingUnits.player1 =
                gameState.remainingUnits.player1.filter(
                (unit) => unit.id !== unitIdToDelete
                );
            } else if (numero == 2) {
            gameState.remainingUnits.player2 =
                gameState.remainingUnits.player2.filter(
                (unit) => unit.id !== unitIdToDelete
                );
            }
            console.log("Updated units:", gameState.remainingUnits.player1);
            console.log("Updated units:", gameState.remainingUnits.player2);
            unitElement.remove();
        }
        }
    }

    // Ajouter un message au journal
    function logMessage(message) {
        const logEntry = document.createElement("p");
        logEntry.textContent = message;
        gameLog.appendChild(logEntry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }

    // Afficher/cacher le tutoriel
    tutorialButton.addEventListener("click", () => {
        tutorialModal.style.display = "flex";
    });

    closeTutorial.addEventListener("click", () => {
        tutorialModal.style.display = "none";
    });

    // Fermer le tutoriel en cliquant en dehors
    tutorialModal.addEventListener("click", (e) => {
        if (e.target === tutorialModal) {
        tutorialModal.style.display = "none";
        }
    });
    // Update when unit successfully attacks
    function gainExperience(unit, damage) {
        if (!unit) return;
        unit.experience += damage;
        if (unit.experience >= unit.level * 10) {
        levelUp(unit);
        }
    }

    function levelUp(unit) {
        unit.level++;
        unit.damage += 2;
        unit.maxHealth += 5;
        unit.health += 5; 
        const unitElement = document.querySelector(`[data-unit-id="${unit.id}"]`);
        if (unitElement) {
        unitElement.classList.add("leveled-up");
        }
        logMessage(`${unit.name} has leveled up to level ${unit.level}!`);
    }
    let combatHistory = [];

    // Initialiser le réseau neuronal pour la prédiction de combat
    function initializeNeuralNetwork() {
        if (typeof brain === "undefined") {
        console.error(
            "Brain.js library not loaded. Please include it in your HTML file."
        );
        return false;
        }
        try {
        gameState.neuralNet = new brain.NeuralNetwork({
            hiddenLayers: [6, 3], 
            activation: "sigmoid",
        });
        if (combatHistory.length === 0) {
            combatHistory = generateInitialCombatData();
        }
        trainCombatModel();
        console.log("Neural network initialized successfully");
        return true;
        } catch (error) {
        console.error("Error initializing neural network:", error);
        return false;
        }
    }

    // Générer des données de combat initiales pour l'entraînement
    function generateInitialCombatData() {
        const sampleData = [];
        for (let i = 0; i < 50; i++) {
        const attackerHealth = Math.floor(Math.random() * 20) + 10;
        const attackerDamage = Math.floor(Math.random() * 7) + 3;
        const attackerDefense = Math.floor(Math.random() * 5) + 1;
        const attackerLevel = Math.floor(Math.random() * 3) + 1;
        const defenderHealth = Math.floor(Math.random() * 20) + 10;
        const defenderDefense = Math.floor(Math.random() * 5) + 1;
        const defenderLevel = Math.floor(Math.random() * 3) + 1;
        const damagePerTurn = Math.max(1, attackerDamage - defenderDefense);
        const turnsToKill = Math.ceil(defenderHealth / damagePerTurn);
        const counterDamage = Math.floor(Math.random() * 5) + 2;
        const damageTaken = Math.max(1, counterDamage - attackerDefense);
        const turnsToBeKilled = Math.ceil(attackerHealth / damageTaken);
        const result =
            turnsToKill <= turnsToBeKilled ? "attackerWins" : "defenderWins";
        sampleData.push({
            attacker: {
            health: attackerHealth,
            damage: attackerDamage,
            defense: attackerDefense,
            level: attackerLevel,
            },
            defender: {
            health: defenderHealth,
            defense: defenderDefense,
            level: defenderLevel,
            },
            result: result,
        });
        }
        return sampleData;
    }

    // Entraînez-vous avec les données de combat existantes
    function trainCombatModel() {
        if (!gameState.neuralNet || combatHistory.length === 0) {
        console.error(
            "Neural network not initialized or no combat history available"
        );
        return;
        }
        const trainingData = combatHistory.map((combat) => ({
        input: {
            attackerHealth: normalize(combat.attacker.health, 0, 50),
            attackerDamage: normalize(combat.attacker.damage, 0, 20),
            attackerDefense: normalize(combat.attacker.defense, 0, 10),
            attackerLevel: normalize(combat.attacker.level || 1, 1, 5),
            defenderHealth: normalize(combat.defender.health, 0, 50),
            defenderDefense: normalize(combat.defender.defense, 0, 10),
            defenderLevel: normalize(combat.defender.level || 1, 1, 5),
        },
        output: {
            attackerWins: combat.result === "attackerWins" ? 1 : 0,
        },
        }));
        try {
        gameState.neuralNet.train(trainingData, {
            iterations: 1000,
            errorThresh: 0.005,
            log: true,
            logPeriod: 100,
        });
        console.log(
            "Combat model trained successfully with",
            combatHistory.length,
            "examples"
        );
        } catch (error) {
        console.error("Error training combat model:", error);
        }
    }

        
    function predictCombatOutcome(attacker, defender) {
        if (!gameState.neuralNet) {
        console.error("Neural network not initialized");
        return "unknown";
        }
        try {
        const attackerHealth =
            attacker && attacker.health !== undefined ? attacker.health : 0;
        const attackerDamage =
            attacker && attacker.damage !== undefined ? attacker.damage : 0;
        const attackerDefense =
            attacker && attacker.defense !== undefined ? attacker.defense : 0;
        const attackerLevel =
            attacker && attacker.level !== undefined ? attacker.level : 1;
        const defenderHealth =
            defender && defender.health !== undefined ? defender.health : 0;
        const defenderDamage =
            defender && defender.damage !== undefined ? defender.damage : 0;
        const defenderDefense =
            defender && defender.defense !== undefined ? defender.defense : 0;
        const defenderLevel =
            defender && defender.level !== undefined ? defender.level : 1;
        const prediction = gameState.neuralNet.run({
            attackerHealth: normalize(attackerHealth, 0, 50),
            attackerDamage: normalize(attackerDamage, 0, 20),
            attackerDefense: normalize(attackerDefense, 0, 10),
            attackerLevel: normalize(attackerLevel, 1, 5),
            defenderHealth: normalize(defenderHealth, 0, 50),
            defenderDamage: normalize(defenderDamage, 0, 20),
            defenderDefense: normalize(defenderDefense, 0, 10),
            defenderLevel: normalize(defenderLevel, 1, 5),
        });
        if (!prediction || prediction.attackerWins === undefined) {
            console.error("Invalid prediction result:", prediction.attackerWins);
            return "unknown";
        }
        console.log(
            "Raw prediction value:",
            prediction.attackerWins,
            attacker.player
        );
        const winProbability = parseFloat(prediction.attackerWins);
        if (winProbability > 0.4) return "very likely win";
        if (winProbability > 0.0007) return "likely win";
        if (winProbability > 0.0006) return "uncertain";
        if (winProbability > 0.0002) return "likely loss";
        if (winProbability > 0.0001) return "very likely loss";
        return "very likely loss";
        } catch (error) {
        console.error("Error predicting combat outcome:", error);
        return "unknown";
        }
    }
    // Résultat de combat record pour l'entraînement
    function recordCombatResult(attacker, defender, result) {
        combatHistory.push({
        attacker: {
            health: attacker.health,
            damage: attacker.damage,
            defense: attacker.defense,
            level: attacker.level || 1,
            type: attacker.type,
        },
        defender: {
            health: defender.health,
            defense: defender.defense,
            level: defender.level || 1,
            type: defender.type,
        },
        result: result,
        });
        if (combatHistory.length % 5 === 0 && combatHistory.length <= 100) {
        trainCombatModel();
        } else if (combatHistory.length % 20 === 0) {
        trainCombatModel();
        }
    }

    // Fonction d'aide pour normaliser les valeurs entre 0 et 1
    function normalize(val, min, max) {
        return Math.max(0, Math.min(1, (val - min) / (max - min)));
    }

    // Ajouter à l'état du jeu
    function initializePlayerPerformance() {
        gameState.playerPerformance = {
        wins: 0,
        losses: 0,
        unitKills: 0,
        unitLosses: 0,
        gamesPlayed: 0,
        };
    }

    // Difficulté de l'IA basée sur les performances du joueur
    function updateAIDifficulty() {
        if (gameState.playerPerformance.gamesPlayed < 3) {
        return;
        }
        const winRatio =
        gameState.playerPerformance.wins /
        Math.max(
            1,
            gameState.playerPerformance.wins + gameState.playerPerformance.losses
        );
        const killRatio =
        gameState.playerPerformance.unitKills /
        Math.max(
            1,
            gameState.playerPerformance.unitKills +
            gameState.playerPerformance.unitLosses
        );
        if (winRatio > 0.7 && killRatio > 0.6) {
        gameState.aiDifficulty = "hard";
        document.getElementById("aiDifficultySelect").value = "hard";
        } else if (winRatio < 0.3 && killRatio < 0.4) {
        gameState.aiDifficulty = "easy";
        document.getElementById("aiDifficultySelect").value = "easy";
        } else {
        gameState.aiDifficulty = "medium";
        document.getElementById("aiDifficultySelect").value = "medium";
        }
        logMessage(`AI difficulty adjusted to: ${gameState.aiDifficulty}`);
    }

    // la fonction performAttack pour l'attaque avec le modèle ML utilisé et l'enregistrement des données de combat
    async  function performAttack(attackingUnit, defendingUnit, defRow, defCol) {
        console.log("attackingUnit.player", attackingUnit.player);
        const rowSelc = gameState.selectedCell.row;
    const colSelc =  gameState.selectedCell.col;
        if (!attackingUnit || !defendingUnit) return;
            await attaqueDiceForInitiative().then(initiativeWinner => {             
            if (attackingUnit.player == initiativeWinner) {
                logMessage(`Player ${initiativeWinner}remporte l'initiative !`);
                displayPrediction(attackingUnit, defendingUnit);
                if (gameState.neuralNet) {
                    const prediction = predictCombatOutcome(attackingUnit, defendingUnit);
                    logMessage(
                        `Combat prediction:Player ${attackingUnit.player} ${prediction}`
                    );
                }
                let damage = attackingUnit.damage;
                let defense = defendingUnit.defense + (defendingUnit.temporaryDefenseBonus || 0);
                console.log("defendingUnit effect added to cell:", defendingUnit);
                if (defendingUnit.defensiveStance) {
                    animateBlockEffect(defRow, defCol);
                }
                if (
                    attackingUnit.type === "mage" &&
                    ((attackingUnit.player === 1 &&
                        gameState.selectedClan.player1 === "sages") ||
                        (attackingUnit.player === 2 &&
                            gameState.selectedClan.player2 === "sages"))
                ) {
                    damage += 2;
                }
                if (
                    (defendingUnit.player === 1 &&
                        gameState.selectedClan.player1 === "mountains") ||
                    (defendingUnit.player === 2 &&
                        gameState.selectedClan.player2 === "mountains")
                ) {
                    defense += 1;
                }
                const actualDamage = Math.max(1, damage - defense);
                defendingUnit.health -= actualDamage;
                animations.animateAttack(
                    rowSelc,
                    colSelc,
                    defRow,
                    defCol,
                    attackingUnit,
                    defendingUnit
                );
                animations.showDamageNumber(defRow, defCol, actualDamage)
                logMessage(
                    `${attackingUnit.name} attacks ${defendingUnit.name} for ${actualDamage} damage!`
                );
                if (defendingUnit.health <= 0) {
                    if (defendingUnit.player === 1) {
                        gameState.playerPerformance.unitLosses++;
                        gameState.board[defRow][defCol] = null;
                        clearCell(defRow, defCol, 1);
                    } else {
                        gameState.playerPerformance.unitKills++;
                        gameState.board[defRow][defCol] = null;
                        clearCell(defRow, defCol, 2);
                    }
                    recordCombatResult(attackingUnit, defendingUnit, "attackerWins");
                    gainExperience(attackingUnit, actualDamage);
                    logMessage(`${defendingUnit.name} was defeated!`);
                } else {
                    renderUnit(defRow, defCol, defendingUnit);
                    recordCombatResult(attackingUnit, defendingUnit, "partial");
                }
                checkWinCondition();
                renderUnit(
                    rowSelc,
                    colSelc,
                    attackingUnit
                );
            }
        });
    }
    // Fonction d'animation de blocage 
    function animateBlockEffect(row, col) {
        const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        const blockEffect = document.createElement("div");
        blockEffect.className = "block-effect";
        blockEffect.innerHTML = `<div style="font-weight: bold; color: #4169E1; font-size: 24px;">BLOCK!</div>`;
        blockEffect.style.position = "absolute";
        blockEffect.style.top = "50%";
        blockEffect.style.left = "50%";
        blockEffect.style.transform = "translate(-50%, -50%)";
        blockEffect.style.zIndex = "201";
        blockEffect.style.textShadow = "0 0 5px white";
        cellElement.appendChild(blockEffect);
        setTimeout(() => {
            blockEffect.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
            blockEffect.style.opacity = "0";
            blockEffect.style.transform = "translate(-50%, -100%)";
            setTimeout(() => {
                blockEffect.remove();
            }, 500);
        }, 800);
        const blockSound = new Audio("../assets/audios/shield-bloc.mp3");
        blockSound.volume = 0.5;
        blockSound.play().catch(err => console.warn("Audio playback failed:", err));
    }

    // Implémentation d'un adversaire IA utilisant l'algorithme minimax
    function implementAI() {
        console.log("Initializing AI opponent system");
        gameState.aiEnabled = false;
        gameState.aiDifficulty = "medium"; 
        const aiToggleButton = document.createElement("button");
        aiToggleButton.id = "aiToggleButton";
        aiToggleButton.className = "game-button";
        aiToggleButton.textContent = "Enable AI Opponent";
        aiToggleButton.addEventListener("click", toggleAI);
        const aiDifficultySelect = document.createElement("select");
        aiDifficultySelect.id = "aiDifficultySelect";
        aiDifficultySelect.className = "game-select";
        ["easy", "medium", "hard"].forEach((difficulty) => {
        const option = document.createElement("option");
        option.value = difficulty;
        option.textContent =
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        aiDifficultySelect.appendChild(option);
        });
        aiDifficultySelect.addEventListener("change", (e) => {
        gameState.aiDifficulty = e.target.value;
        logMessage(`AI difficulty set to: ${gameState.aiDifficulty}`);
        });
        const aiControlsDiv = document.createElement("div");
        aiControlsDiv.className = "ai-controls";
        aiControlsDiv.appendChild(aiToggleButton);
        aiControlsDiv.appendChild(document.createTextNode(" Difficulty: "));
        aiControlsDiv.appendChild(aiDifficultySelect);
        const gameControls = document.querySelector("#gameControls");
        if (gameControls) {
        gameControls.appendChild(aiControlsDiv);
        } else {
        console.error("Game controls container not found");
        }
    }

    function toggleAI() {
        gameState.aiEnabled = !gameState.aiEnabled;
        document.getElementById("aiToggleButton").textContent = gameState.aiEnabled
        ? "Disable AI Opponent"
        : "Enable AI Opponent";
        logMessage(
        gameState.aiEnabled ? "AI opponent enabled" : "AI opponent disabled"
        );
        if (gameState.aiEnabled && gameState.currentPlayer === 2) {
        setTimeout(aiTakeTurn, 1000);
        }
    }

    //fonction prepareNextTurn pour déclencher les mouvements de l'IArrr
        function prepareNextTurn() {
            clearSelection();
            console.log("Preparing for next turn...");
            checkAndRemoveDefenseBonus();
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        gameState.phase = "movement";
        updateUI();
        logMessage(`Player ${gameState.currentPlayer}'s turn. Movement phase.`);
        if (gameState.aiEnabled && gameState.currentPlayer === 2) {
        setTimeout(aiTakeTurn, 1000);
        }
    }

    function aiTakeTurn() {
        if (!gameState.aiEnabled || gameState.currentPlayer !== 2) return;
        if (gameState.phase === "movement") {
        aiMovementPhase();
        } else if (gameState.phase === "action") {
        aiActionPhase();
        }
    }

    function aiMovementPhase() {
        const aiUnits = [];
        for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const unit = gameState.board[row][col];
            if (unit && unit.player === 2) {
            aiUnits.push({ unit, row, col });
            }
        }
        }
        if (aiUnits.length === 0) {
        prepareNextTurn();
        return;
        }
        let selectedUnitInfo;
        switch (gameState.aiDifficulty) {
        case "easy":
            selectedUnitInfo = aiUnits[Math.floor(Math.random() * aiUnits.length)];
            break;
        case "medium":
            selectedUnitInfo =
            findUnitThatCanAttack(aiUnits) ||
            aiUnits[Math.floor(Math.random() * aiUnits.length)];
            break;
        case "hard":
            selectedUnitInfo =
            findBestUnitWithMinimax(aiUnits, 2) ||
            aiUnits[Math.floor(Math.random() * aiUnits.length)];
            break;
        }
        selectCell(selectedUnitInfo.row, selectedUnitInfo.col);
        showMovablePositions(selectedUnitInfo.row, selectedUnitInfo.col);
        let movePosition;
        if (gameState.movablePositions && gameState.movablePositions.length > 0) {
            gameState.round++;
        switch (gameState.aiDifficulty) {
            case "easy":
            movePosition =
                gameState.movablePositions[
                Math.floor(Math.random() * gameState.movablePositions.length)
                ];
            break;
            case "medium":
            movePosition =
                findMoveTowardEnemy(selectedUnitInfo, gameState.movablePositions) ||
                gameState.movablePositions[
                Math.floor(Math.random() * gameState.movablePositions.length)
                ];
            break;
            case "hard":
            movePosition =
                findBestMoveWithMinimax(
                selectedUnitInfo,
                gameState.movablePositions,
                2
                ) ||
                gameState.movablePositions[
                Math.floor(Math.random() * gameState.movablePositions.length)
                ];
            break;
        }
        setTimeout(() => {
            animations.animateUnitMovement(
            selectedUnitInfo.row,
            selectedUnitInfo.col,
            movePosition.row,
            movePosition.col,
            selectedUnitInfo.unit,
            () => {
                gameState.board[movePosition.row][movePosition.col] =
                selectedUnitInfo.unit;
                gameState.board[selectedUnitInfo.row][selectedUnitInfo.col] = null;
                renderUnit(
                movePosition.row,
                movePosition.col,
                selectedUnitInfo.unit
                );
                clearCell(selectedUnitInfo.row, selectedUnitInfo.col);

                logMessage(
                `${selectedUnitInfo.unit.name} moved to (${
                    movePosition.row + 1
                },${movePosition.col + 1}).`
                );
                gameState.phase = "action";
                clearSelection();
                updateUI();
                logMessage("Action phase. AI is thinking...");
                setTimeout(aiActionPhase, 1000);
            }
            );
        }, 500);
        } else {
        gameState.phase = "action";
        clearSelection();
        updateUI();
        setTimeout(aiActionPhase, 500);
        }
    }

    function aiActionPhase() {
        const aiUnits = [];
        for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const unit = gameState.board[row][col];
            if (unit && unit.player === 2) {
            aiUnits.push({ unit, row, col });
            }
        }
        }
        if (aiUnits.length === 0) {
        prepareNextTurn();
        return;
        }
        let attackingUnitInfo = null;
        let targetInfo = null;
        for (const unitInfo of aiUnits) {
        selectCell(unitInfo.row, unitInfo.col);
        showAttackablePositions(unitInfo.row, unitInfo.col);
        if (
            gameState.attackablePositions &&
            gameState.attackablePositions.length > 0
        ) {
            attackingUnitInfo = unitInfo;
            switch (gameState.aiDifficulty) {
            case "easy":
                targetInfo =
                gameState.attackablePositions[
                    Math.floor(Math.random() * gameState.attackablePositions.length)
                ];
                break;
            case "medium":
                targetInfo = findLowestHealthTarget(gameState.attackablePositions);
                break;
            case "hard":
                targetInfo =
                findBestTargetWithMinimax(gameState.attackablePositions, 2) ||
                findLowestHealthTarget(gameState.attackablePositions);
                break;
            }
            break;
        }
        }
        if (attackingUnitInfo && targetInfo) {
        const attackingUnit =
            gameState.board[attackingUnitInfo.row][attackingUnitInfo.col];
        const defendingUnit = gameState.board[targetInfo.row][targetInfo.col];
            const defRow = targetInfo.row;
            const defCol = targetInfo.col;
        setTimeout(() => {
            performAttack(
            attackingUnit,
            defendingUnit,
            targetInfo.row,
            targetInfo.col
            );
            if (!checkWinCondition() && gameState.phase !== "gameOver") {
            prepareNextTurn();
            }
        }, 500);
        } else {
        logMessage(`AI Player ends turn.`);
        prepareNextTurn();
        }
    }

    // Fonctions d'assistance pour la logique de l'IA
    function findUnitThatCanAttack(units) {
        for (const unitInfo of units) {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
            const targetUnit = gameState.board[row][col];
            if (targetUnit && targetUnit.player === 1) {
                const distance =
                Math.abs(unitInfo.row - row) + Math.abs(unitInfo.col - col);
                if (distance <= unitInfo.unit.range) {
                return unitInfo;
                }
            }
            }
        }
        }
        return null;
    }

    function findMoveTowardEnemy(unitInfo, movablePositions) {
        let closestEnemy = null;
        let minDistance = Infinity;
        for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const targetUnit = gameState.board[row][col];
            if (targetUnit && targetUnit.player === 1) {
            const distance =
                Math.abs(unitInfo.row - row) + Math.abs(unitInfo.col - col);
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = { row, col };
            }
            }
        }
        }
        if (!closestEnemy) return null;
        let bestMove = null;
        let bestDistance = minDistance;
        for (const move of movablePositions) {
        const newDistance =
            Math.abs(move.row - closestEnemy.row) +
            Math.abs(move.col - closestEnemy.col);
        if (newDistance < bestDistance) {
            bestDistance = newDistance;
            bestMove = move;
        }
        }
        return bestMove;
    }

    function findLowestHealthTarget(attackablePositions) {
        let lowestHealthTarget = null;
        let lowestHealth = Infinity;
        for (const pos of attackablePositions) {
        const unit = gameState.board[pos.row][pos.col];
        if (unit && unit.health < lowestHealth) {
            lowestHealth = unit.health;
            lowestHealthTarget = pos;
        }
        }
        return lowestHealthTarget;
    }

    // Algorithme Minimax pour une IA plus difficile
    function findBestUnitWithMinimax(units, depth) {
        let bestScore = -Infinity;
        let bestUnit = null;
        for (const unitInfo of units) {
        const score = evaluateUnitPotential(unitInfo);
        if (score > bestScore) {
            bestScore = score;
            bestUnit = unitInfo;
        }
        }
        return bestUnit;
    }

    function evaluateUnitPotential(unitInfo) {
        let score = 0;
        score += unitInfo.unit.damage * 2;
        score += unitInfo.unit.health;
        score += unitInfo.unit.range * 3;
        score += unitInfo.unit.level * 5;
        for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const targetUnit = gameState.board[row][col];
            if (targetUnit && targetUnit.player === 1) {
            const distance =
                Math.abs(unitInfo.row - row) + Math.abs(unitInfo.col - col);
            if (distance <= unitInfo.unit.range) {
                score += 50;
                score += Math.max(0, 20 - targetUnit.health);
            }
            }
        }
        }
        const distanceFromCenter =
        Math.abs(unitInfo.row - 4.5) + Math.abs(unitInfo.col - 4.5);
        score -= distanceFromCenter * 2;
        return score;
    }

    function findBestMoveWithMinimax(unitInfo, movablePositions, depth) {
        let bestScore = -Infinity;
        let bestMove = null;
        for (const movePos of movablePositions) {
        let score = 0;
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
            const targetUnit = gameState.board[row][col];
            if (targetUnit && targetUnit.player === 1) {
                const currentDistance =
                Math.abs(unitInfo.row - row) + Math.abs(unitInfo.col - col);
                const newDistance =
                Math.abs(movePos.row - row) + Math.abs(movePos.col - col);
                if (newDistance < currentDistance) {
                score += 5;
                }
                if (newDistance <= unitInfo.unit.range) {
                score += 20;
                score += Math.max(0, 10 - targetUnit.health);
                }
            }
            }
        }
        const distanceFromCenter =
            Math.abs(movePos.row - 4.5) + Math.abs(movePos.col - 4.5);
        score -= distanceFromCenter;
        if (score > bestScore) {
            bestScore = score;
            bestMove = movePos;
        }
        }
        return bestMove;
    }

    function findBestTargetWithMinimax(attackablePositions, depth) {
        let bestScore = -Infinity;
        let bestTarget = null;
        for (const targetPos of attackablePositions) {
        const targetUnit = gameState.board[targetPos.row][targetPos.col];
        if (!targetUnit) continue;
        let score = 0;
        score += 50 - targetUnit.health * 2;
        score += targetUnit.damage * 3;
        score += targetUnit.range * 2;
        score += targetUnit.level * 10;
        const distanceFromCenter =
            Math.abs(targetPos.row - 4.5) + Math.abs(targetPos.col - 4.5);
        if (distanceFromCenter < 3) {
            score += 15;
        }
        if (score > bestScore) {
            bestScore = score;
            bestTarget = targetPos;
        }
        }
        return bestTarget;
    }

    // Mettre à jour l'état du jeu à la fin de la session
    function updateGameStatistics(winner) {
        if (winner === 1) {
        gameState.playerPerformance.wins++;
        } else {
        gameState.playerPerformance.losses++;
        }
        gameState.playerPerformance.gamesPlayed++;
        updateAIDifficulty();
        try {
        localStorage.setItem("combatHistory", JSON.stringify(combatHistory));
        localStorage.setItem(
            "playerPerformance",
            JSON.stringify(gameState.playerPerformance)
        );
        } catch (error) {
        console.error("Failed to save game statistics:", error);
        }
    }

    // Charger l'historique des combats précédents s'il est disponible
    function loadPreviousCombatHistory() {
        try {
        const savedHistory = localStorage.getItem("combatHistory");
        if (savedHistory) {
            combatHistory = JSON.parse(savedHistory);
            console.log(`Loaded ${combatHistory.length} previous combat records`);
        }
        const savedPerformance = localStorage.getItem("playerPerformance");
        if (savedPerformance) {
            gameState.playerPerformance = JSON.parse(savedPerformance);
            console.log("Loaded previous player performance data");
        }
        } catch (error) {
        console.error("Failed to load previous game statistics:", error);
        }
    }

    // Ajouter des visualisations pour les prédictions ML
    function addMLVisualization() {
        const mlInsightsContainer = document.createElement("div");
        mlInsightsContainer.id = "mlInsights";
        Object.assign(mlInsightsContainer.style, {
            position: "fixed",
            right: "20px",
            top: "90px",         
            width: "260px",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.7)",
            fontFamily: "'MedievalSharp', cursive",
            zIndex: "1001",
        });
        document.body.appendChild(mlInsightsContainer);
    }

    //Afficher les prédictions ML dans l'interface utilisateur
    function displayPrediction(attackingUnit, defendingUnit) {
        if (!gameState.neuralNet) return;
        const prediction = predictCombatOutcome(attackingUnit, defendingUnit);
        const c = document.querySelector("#mlInsights");
        if (!c) return;
        c.innerHTML = ""; 
        const card = document.createElement("div");
        Object.assign(card.style, {
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "4px",
            padding: "8px",
            marginBottom: "8px",
            background: "rgba(30,30,30,0.6)",
        });
        const title = document.createElement("h3");
        title.textContent = "🔮 Prédiction de combat";
        Object.assign(title.style, {
            margin: "0 0 8px",
            fontSize: "16px",
            textAlign: "center",
        });
        card.appendChild(title);
        const result = document.createElement("div");
        result.textContent = prediction;
        Object.assign(result.style, {
            textAlign: "center",
            padding: "6px",
            borderRadius: "3px",
            marginBottom: "10px",
            fontWeight: "bold",
            background: {
                "very likely win": "#2ecc71",
                "likely win": "#27ae60",
                "uncertain": "#f1c40f",
                "likely loss": "#e67e22",
                "very likely loss": "#c0392b"
            }[prediction] || "#7f8c8d"
        });
        card.appendChild(result);
        const flex = document.createElement("div");
        Object.assign(flex.style, {
            display: "flex",
            justifyContent: "space-between",
            gap: "6px"
        });
        [ {u: attackingUnit, label: "Attaquant"}, {u: defendingUnit, label: "Défenseur"} ]
        .forEach(({u, label}) => {
            const box = document.createElement("div");
            Object.assign(box.style, {
                flex: "1",
                background: "rgba(255,255,255,0.1)",
                padding: "6px",
                borderRadius: "4px"
            });
            console.log('${Unit.getHealth(u.type)}',Unit.getHealth(u.type));
            
            box.innerHTML = `
            <div style="font-weight:bold; margin-bottom:4px;">${label}</div>
            <div style="font-size:12px;">${u.name} (J${u.player})</div>
            <div style="font-size:11px; margin-top:4px;">
                ❤️ ${u.health}/30<br>
                ⚔️ ${u.damage}   🛡️ ${u.defense}
            </div>`;
            flex.appendChild(box);
        });
        card.appendChild(flex);
        c.appendChild(card);
    }

    // Ajouter des styles CSS pour les visualisations ML
    function addMLStyles() {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            .ml-insights-container {
            display: flex;
                position: fixed;
                right: 10px;
                top: 10px;
                width: 250px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 14px;
            }
            
            .prediction-display {
                display: flex;
                flex-direction: column;
            }
            
            .prediction-display h3 {
                margin: 0 0 10px 0;
                text-align: center;
            }
            
            .prediction-result {
                text-align: center;
                padding: 5px;
                border-radius: 3px;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .prediction-units {
                display: flex;
                justify-content: space-between;
            }
            
            .prediction-unit {
                width: 48%;
                padding: 5px;
                border-radius: 3px;
            }
            
            .attacker {
                background-color: rgba(100, 150, 255, 0.3);
            }
            
            .defender {
                background-color: rgba(255, 100, 100, 0.3);
            }
            
            .unit-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .unit-stats {
                font-size: 12px;
            }
            
            .leveled-up {
                animation: level-up-animation 1s ease-in-out;
                box-shadow: 0 0 10px gold;
            }
            
            @keyframes level-up-animation {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Initialiser tout ce qui concerne l'IA et le ML
    function initializeAIAndML() {
        loadPreviousCombatHistory();
        initializePlayerPerformance();
        const neuralNetInitialized = initializeNeuralNetwork();
        if (neuralNetInitialized) {
        addMLVisualization();
        addMLStyles();
        }
        implementAI();
        addCombatInsightsButton();
        console.log("AI and ML systems initialized successfully");
    }

    // Ajoutez une fonction d'analyse de combat pour fournir des informations
    function analyzeCombatTrends() {
        if (combatHistory.length < 10) {
        return "Not enough combat data for meaningful analysis";
        }
        const unitTypeStats = {};
        combatHistory.forEach((combat) => {
        console.log("combat", combat);
        const attackerType = combat.attacker.type || "unknown";
        const defenderType = combat.defender.type || "unknown";
        const result = combat.result;
        if (!unitTypeStats[attackerType]) {
            unitTypeStats[attackerType] = { wins: 0, losses: 0, total: 0 };
        }
        if (!unitTypeStats[defenderType]) {
            unitTypeStats[defenderType] = { wins: 0, losses: 0, total: 0 };
        }
        if (result === "attackerWins") {
            unitTypeStats[attackerType].wins++;
            unitTypeStats[defenderType].losses++;
        } else if (result === "defenderWins") {
            unitTypeStats[attackerType].losses++;
            unitTypeStats[defenderType].wins++;
        }
        unitTypeStats[attackerType].total++;
        unitTypeStats[defenderType].total++;
        });
        let insights = "Combat Analysis:\n";
        let i=0
        for (const [unitType, stats] of Object.entries(unitTypeStats)) {        
        if (i > 0) {
        const winRate = Math.round((stats.wins / stats.total) * 100);
        insights += `• ${unitType}: ${winRate}% win rate (${stats.wins}/${stats.total} battles)\n`;
            }
            i++;
        }
        return insights;
    }

    // Afficher les informations de combat dans le journal de jeu
    function showCombatInsights() {
        const insights = analyzeCombatTrends();
        logMessage(insights);
    }

    // bouton pour afficher les informations de combat
    function addCombatInsightsButton() {
        const insightsButton = document.createElement("button");
        insightsButton.id = "combatInsightsButton";
        insightsButton.className = "game-button";
        insightsButton.textContent = "Afficher les informations de combat";
        insightsButton.addEventListener("click", showCombatInsights);
        const gameControls = document.querySelector("#gameControls");
        if (gameControls) {
        gameControls.appendChild(insightsButton);
        }
        }

    function saveGameResult(winner, gameState) {
            const clans = Clan.getAllClans();
            const winnerClan = winner === 1 ? gameState.selectedClan.player1 : gameState.selectedClan.player2;
            const loserClan = winner === 1 ? gameState.selectedClan.player2 : gameState.selectedClan.player1;
            const winnerName = clans[winnerClan].name;
            let nameLocal = `player${winner}Name`;

            let playerwinner = localStorage.getItem(nameLocal) || [];
            const gameResult = {
                playerwinner: playerwinner,
                date: new Date().toISOString(),
                winner: winner,
                winnerClan: winnerClan,
                winnerClanName: winnerName,
                loserClan: loserClan,
                loserClanName: clans[loserClan].name,
                rounds: gameState.round,
                timestamp: Date.now() 
            };
            let gameHistory = JSON.parse(localStorage.getItem('samuraiGameHistory')) || [];
            gameHistory.push(gameResult);
            if (gameHistory.length > 10) {
                gameHistory = gameHistory.slice(-10);
            }
            localStorage.setItem('samuraiGameHistory', JSON.stringify(gameHistory));
    }

    function displayGameHistory() {
            const gameHistory = JSON.parse(localStorage.getItem('samuraiGameHistory')) || [];
            if (gameHistory.length === 0) {
                return;
            }
            const historyModal = document.createElement("div");
            historyModal.id = "history-modal";
            historyModal.className = "history-modal";
            const contentContainer = document.createElement("div");
            contentContainer.className = "history-content";
            const historyTitle = document.createElement("h2");
            historyTitle.textContent = "Historique des parties";
            historyTitle.className = "history-title";
            const closeButton = document.createElement("button");
            closeButton.textContent = "×";
            closeButton.className = "close-history-btn";
            closeButton.onclick = function () {
                document.body.removeChild(historyModal);
            };
            const historyList = document.createElement("ul");
            historyList.className = "history-list";
            gameHistory.sort((a, b) => b.timestamp - a.timestamp);
            gameHistory.forEach((game, index) => {
                const gameItem = document.createElement("li");
                gameItem.className = "history-item";
                const gameDate = new Date(game.date);
                const formattedDate = `${gameDate.toLocaleDateString()} ${gameDate.toLocaleTimeString()}`;
                gameItem.innerHTML = `
            <div class="history-game-number">Partie ${gameHistory.length - index}</div>
            <div class="history-winner">
                <strong>Vainqueur:</strong> Joueur ${game.winner} (${game.winnerClanName})
            </div>
            <div class="history-loser">
                <strong>Perdant:</strong> ${game.loserClanName}
            </div>
            <div class="history-rounds">
                <strong>Tours:</strong> ${game.rounds}
            </div>
            <div class="history-date">
                <strong>Date:</strong> ${formattedDate}
            </div>
        `;
                historyList.appendChild(gameItem);
            });
            contentContainer.appendChild(closeButton);
            contentContainer.appendChild(historyTitle);
            contentContainer.appendChild(historyList);
            historyModal.appendChild(contentContainer);
            document.body.appendChild(historyModal);
    }
    });


