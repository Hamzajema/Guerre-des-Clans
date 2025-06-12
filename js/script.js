const startBtn = document.getElementById('start-btn');
const startSound = document.getElementById('start-sound');
const blackScreen = document.getElementById('black-screen');

startBtn.addEventListener('click', () => {
  startSound.play();
  document.getElementById('start-screen').style.opacity = 0;

  blackScreen.style.opacity = 1;
  
  startSound.addEventListener('ended', () => {
    window.location.href = "player1.html";
  });
});
window.onload = addHistoryButtonToGame();
/**
   * Displays the game history modal
   */
function displayGameHistory() {
  // Get game history from local storage
  const gameHistory = JSON.parse(localStorage.getItem('samuraiGameHistory')) || [];

  // If no history, just return
  if (gameHistory.length === 0) {
    return;
  }

  // Create modal for game history
  const historyModal = document.createElement("div");
  historyModal.id = "history-modal";
  historyModal.className = "history-modal";

  // Create content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "history-content";

  // Create title
  const historyTitle = document.createElement("h2");
  historyTitle.textContent = "Historique des parties";
  historyTitle.className = "history-title";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.className = "close-history-btn";
  closeButton.onclick = function () {
    document.body.removeChild(historyModal);
  };

  // Create history list
  const historyList = document.createElement("ul");
  historyList.className = "history-list";

  // Sort games by timestamp (newest first)
  gameHistory.sort((a, b) => b.timestamp - a.timestamp);

  // Add each game to the list
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

  // Assemble the modal
  contentContainer.appendChild(closeButton);
  contentContainer.appendChild(historyTitle);
  contentContainer.appendChild(historyList);
  historyModal.appendChild(contentContainer);

  // Add to the document
  document.body.appendChild(historyModal);
}
function addHistoryButtonToGame() {
  // Check if there's any history to show
  const gameHistory = JSON.parse(localStorage.getItem('samuraiGameHistory')) || [];
  if (gameHistory.length === 0) {
    return; // No history to show, so don't add the button
  }

  // Create a history button
  const historyButton = document.createElement("button");
  historyButton.id = "game-history-btn";
  historyButton.className = "game-history-btn";
  historyButton.textContent = "Historique";

  // Style the button
  historyButton.style.position = "absolute";
  historyButton.style.top = "10px";
  historyButton.style.right = "10px";
  historyButton.style.padding = "8px 15px";
  historyButton.style.backgroundColor = "#4a4a4a";
  historyButton.style.color = "white";
  historyButton.style.border = "none";
  historyButton.style.borderRadius = "5px";
  historyButton.style.cursor = "pointer";
  historyButton.style.zIndex = "1000";

  // Add hover effect
  historyButton.onmouseover = function () {
    this.style.backgroundColor = "#666666";
  };
  historyButton.onmouseout = function () {
    this.style.backgroundColor = "#4a4a4a";
  };

  // Add click event
  historyButton.onclick = function () {
    displayGameHistory();
  };

  // Add to the document
  document.body.appendChild(historyButton);
}


