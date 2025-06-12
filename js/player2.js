const clans = document.querySelectorAll('.clan');
const nextBtn = document.getElementById('next-btn');
const nameInput = document.getElementById('player2-name');
const clickSound = document.getElementById('click-sound');
const blackScreen = document.getElementById('black-screen'); // <= Ajout

let selectedClan = '';

clans.forEach(clan => {
  clan.addEventListener('click', () => {
    clans.forEach(c => c.classList.remove('selected'));
    clan.classList.add('selected');
    selectedClan = clan.id;
    checkForm();
  });
});

nameInput.addEventListener('input', checkForm);

function checkForm() {
  if (nameInput.value.trim() !== '' && selectedClan !== '') {
    nextBtn.disabled = false;
  } else {
    nextBtn.disabled = true;
  }
}

nextBtn.addEventListener('click', () => {
  clickSound.play();
  blackScreen.style.opacity = 1; 


  clickSound.addEventListener('ended', () => {
    localStorage.setItem('player2Name', nameInput.value.trim());
    localStorage.setItem('player2Clan', selectedClan);
    window.location.href = 'vs.html';
  });
});
