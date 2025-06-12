export const animations = {
    // Add this function to create and animate movement
 animateUnitMovement(fromRow, fromCol, toRow, toCol, unit, callback) {
        const sourceCell = document.querySelector(
            `.cell[data-row="${fromRow}"][data-col="${fromCol}"]`
        );
const unitElement = sourceCell.querySelector(".unit");
const targetCell = document.querySelector(
    `.cell[data-row="${toRow}"][data-col="${toCol}"]`
);

const animatedUnit = unitElement.cloneNode(true);
animatedUnit.classList.add("animated-unit");
document.getElementById("gameBoard").appendChild(animatedUnit);

const sourceCellRect = sourceCell.getBoundingClientRect();
const gameBoardRect = gameBoard.getBoundingClientRect();

animatedUnit.style.position = "absolute";
animatedUnit.style.left = `${sourceCellRect.left - gameBoardRect.left}px`;
animatedUnit.style.top = `${sourceCellRect.top - gameBoardRect.top}px`;
animatedUnit.style.width = `${sourceCellRect.width}px`;
animatedUnit.style.height = `${sourceCellRect.height}px`;
animatedUnit.style.zIndex = "100";

unitElement.style.opacity = "0";

const targetCellRect = targetCell.getBoundingClientRect();

setTimeout(() => {
    animatedUnit.style.transition = "left 0.5s, top 0.5s";
    animatedUnit.style.left = `${targetCellRect.left - gameBoardRect.left}px`;
    animatedUnit.style.top = `${targetCellRect.top - gameBoardRect.top}px`;

    setTimeout(() => {
        animatedUnit.remove();
        if (callback) callback();
    }, 500);
}, 50);
},

 animateAttack(fromRow, fromCol, toRow, toCol, attackingUnit, defendingUnit) {
    const sourceCell = document.querySelector(
        `.cell[data-row="${fromRow}"][data-col="${fromCol}"]`
    );
    const targetCell = document.querySelector(
        `.cell[data-row="${toRow}"][data-col="${toCol}"]`
    );

    if (!sourceCell || !targetCell) return;

    const attackEffect = document.createElement("div");
    attackEffect.className = "attack-effect";

    let soundPath = "";
    if (attackingUnit.type === "warrior") {
        attackEffect.innerHTML = `<img src="../assets/images/sword-slash.png" alt="Sword Attack" class="attack-icon" >`;
        soundPath = "../assets/audios/sword-slash.mp3";
    } else if (attackingUnit.type === "archer") {
        attackEffect.innerHTML = `<img src="../assets/images/arrow.png" alt="Arrow Attack" class="attack-icon" >`;
        soundPath = "../assets/audios/arrow-body.mp3";
    } else if (attackingUnit.type === "mage") {
        attackEffect.innerHTML = `<img src="../assets/images/magic-spell.png" alt="Magic Attack" class="attack-icon" >`;
        soundPath = "../assets/audios/magical-spell.mp3";
    }
    const soundEffect = new Audio(soundPath);
    soundEffect.volume = 0.7;
    soundEffect.play().catch(err => console.warn("Audio playback failed:", err));
    const sourceRect = sourceCell.getBoundingClientRect();
    const targetRect = targetCell.getBoundingClientRect();
    const gameBoardRect = document.getElementById("gameBoard").getBoundingClientRect();
    const startX = sourceRect.left - gameBoardRect.left + (sourceRect.width / 2) - 24;
    const startY = sourceRect.top - gameBoardRect.top + (sourceRect.height / 2) - 24;
    const endX = targetRect.left - gameBoardRect.left + (targetRect.width / 2) - 24;
    const endY = targetRect.top - gameBoardRect.top + (targetRect.height / 2) - 24;
    attackEffect.style.position = "absolute";
    attackEffect.style.left = `${startX}px`;
    attackEffect.style.top = `${startY}px`;
    attackEffect.style.zIndex = "200";
    attackEffect.style.transform = "scale(0.8)";
    if (attackingUnit.type === "archer" || attackingUnit.type === "mage") {
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
        attackEffect.style.transform = `scale(0.8) rotate(${angle}deg)`;
    }
    document.getElementById("gameBoard").appendChild(attackEffect);
    requestAnimationFrame(() => {
        attackEffect.style.transition = "transform 0.2s ease";
        attackEffect.style.transform = attackingUnit.type === "warrior" ? "scale(1.2)" :
            `scale(1.2) rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg)`;
        setTimeout(() => {
            attackEffect.style.transition = "left 0.4s ease-in-out, top 0.4s ease-in-out";
            attackEffect.style.left = `${endX}px`;
            attackEffect.style.top = `${endY}px`;
            setTimeout(() => {
                targetCell.classList.add("hit-effect");
                setTimeout(() => {
                    attackEffect.remove();
                    targetCell.classList.remove("hit-effect");
                }, 300);
            }, 400);
        }, 200);
    });
    if (attackingUnit.damage > 5) {
        setTimeout(() => {
            targetCell.style.animation = "shake 0.3s ease-in-out";
            setTimeout(() => {
                targetCell.style.animation = "";
            }, 300);
        }, 600);
    }
    if (!document.getElementById("animationStyles")) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "animationStyles";
        styleSheet.textContent = `
            .hit-effect {
                animation: flash 0.3s;
            }
            
            @keyframes flash {
                0%, 100% { background-color: rgba(255, 0, 0, 0); }
                50% { background-color: rgba(255, 0, 0, 0.5); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .attack-icon {
                width: 48px;
                height: 48px;
                filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.5));
            }
        `;
    }
},

// Add this function to create damage indicator
 showDamageNumber(row, col, damage) {
    const cell = document.querySelector(
        `.cell[data-row="${row}"][data-col="${col}"]`
    );
    const damageText = document.createElement("div");
    damageText.className = "damage-number";
    damageText.textContent = `-${damage}`;

    const cellRect = cell.getBoundingClientRect();
    const gameBoardRect = gameBoard.getBoundingClientRect();

    damageText.style.position = "absolute";
    damageText.style.color = "red";
    damageText.style.fontWeight = "bold";
    damageText.style.fontSize = "24px";
    damageText.style.left = `${cellRect.left + cellRect.width / 2 - gameBoardRect.left
        }px`;
    damageText.style.top = `${cellRect.top + cellRect.height / 2 - gameBoardRect.top
        }px`;
    damageText.style.zIndex = "300";
    damageText.style.textShadow = "2px 2px 0 black";
    gameBoard.appendChild(damageText);
    setTimeout(() => {
        damageText.style.transition = "top 1s, opacity 1s";
        damageText.style.top = `${parseInt(damageText.style.top) - 30}px`;
        damageText.style.opacity = "0";
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    }, 50);
}

};