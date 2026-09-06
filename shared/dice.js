export class Dice {
  constructor(containerId, onRollComplete) {
    this.container = document.getElementById(containerId);
    this.onRollComplete = onRollComplete;
    this.isRolling = false;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <style>
        .dice-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .dice-cube {
          width: 64px;
          height: 64px;
          background: #ffffff;
          color: #0f172a;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          user-select: none;
          transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .rolling {
          animation: spinDice 0.6s ease-in-out infinite;
        }
        @keyframes spinDice {
          0% { transform: rotate(0deg) scale(0.9); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(0.9); }
        }
      </style>
      <div class="dice-wrapper">
        <div id="diceCube" class="dice-cube">⚀</div>
        <button id="rollBtn" class="btn btn-primary">Roll Dice</button>
      </div>
    `;

    this.cube = this.container.querySelector('#diceCube');
    this.btn = this.container.querySelector('#rollBtn');
    this.btn.addEventListener('click', () => this.roll());
  }

  roll(forcedValue = null) {
    if (this.isRolling) return;
    this.isRolling = true;
    this.btn.disabled = true;
    this.cube.classList.add('rolling');

    const pips = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const outcome = forcedValue || (Math.floor(Math.random() * 6) + 1);

    setTimeout(() => {
      this.cube.classList.remove('rolling');
      this.cube.innerText = pips[outcome - 1];
      this.isRolling = false;
      this.btn.disabled = false;
      if (this.onRollComplete) this.onRollComplete(outcome);
    }, 650);
  }

  setDisabled(disabled) {
    if (this.btn) this.btn.disabled = disabled;
  }
}
