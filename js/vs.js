const player1Name = localStorage.getItem('player1Name') || 'Player 1';
const player1Clan = localStorage.getItem('player1Clan') || 'mountain';
const player2Name = localStorage.getItem('player2Name') || 'Player 2';
const player2Clan = localStorage.getItem('player2Clan') || 'plains';

document.getElementById('player1-name').innerText = player1Name;
document.getElementById('player2-name').innerText = player2Name;

const clanImages = {
  mountains: '../assets/images/Guerrier.png',
  plains: '../assets/images/Archer.png',
  sages: '../assets/images/Mage.png'
};

document.getElementById('player1-clan').style.backgroundImage = `url('${clanImages[player1Clan]}')`;
document.getElementById('player2-clan').style.backgroundImage = `url('${clanImages[player2Clan]}')`;

const vsSound = document.getElementById('vs-sound');

document.addEventListener('click', () => {
  vsSound.play().catch((error) => {
    console.log('Sound blocked by browser:', error);
  });

  setTimeout(() => {
    window.location.href = 'battle.html';
  }, 5000);
}, { once: true }); // Only first click!
