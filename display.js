// const modeDataPort = document.getElementById('mode-data-port');
// const bankDataPort = document.getElementById('bank-data-port');
const patchnameDataPort = document.getElementById('patchname-data-port');
const showNumPadd = document.getElementById('show-number-padd');
// -----------------------------------------------------------------------
const modeProgButton = document.getElementById('mode-program');
const modeCombiButton = document.getElementById('mode-combination');
const resetButton = document.getElementById('request-global');
// ----------------------------------------------------------------------

const traMinusButton = document.getElementById('transpose-minus');
const traValue = document.getElementById('transpose-value');
const traPlusButton = document.getElementById('transpose-plus');

// --------------------------------------------------------------------

const bankAbtn = document.getElementById('bank-a-btn');
const bankBbtn = document.getElementById('bank-b-btn');

// --------------------------------------------------------------------
const userScaleContainer = document.querySelector('.userscale');
const scaleNotesBtns = userScaleContainer.querySelectorAll('button');

// ----------------------------------------------------------------------

const patchButtonsContainer = document.querySelector('.change-patch-buttons');

let currentTransposeValue = +traValue.textContent;

showNumPadd.addEventListener('click', (_) => {
  console.log(patchButtonsContainer.style.getPropertyValue('display'));
  if (patchButtonsContainer.style.getPropertyValue('display') === 'none') {
    patchButtonsContainer.style.display = 'flex';
    return;
  }
  patchButtonsContainer.style.display = 'none';
});
midi.addEventListener('connectorReady', () => {
  midi.sendMessage(requestModeMessage);
  delayedMessage(globalDumpRequest);
});

resetButton.addEventListener('click', (_) => {
  midi.sendMessage(originalGlobalDumpData);
  window.location.reload();
});

// ----------------------------------------------------------------------
// CHANGE MODE

if (state.mode === 'PROGRAM') modeProgButton.classList.add('active-btn');
modeProgButton.addEventListener('click', (_) => {
  midi.sendMessage(progModeMessage);
  toggleActiveButtons(modeProgButton, modeCombiButton);
  state.mode = 'PROGRAM';
  dispatchNewEvent('modeChangedOnApp', midi, state);
});

if (state.mode === 'COMBINATION') modeCombiButton.classList.add('active-btn');
modeCombiButton.addEventListener('click', (_) => {
  midi.sendMessage(combiModeMessage);
  toggleActiveButtons(modeCombiButton, modeProgButton);
  state.mode = 'COMBINATION';
  dispatchNewEvent('modeChangedOnApp', midi, state);
});

// ----------------------------------------------------------------------
// TRANSPOSE

// -
traMinusButton.addEventListener('click', (_) => {
  currentTransposeValue--;
  if (currentTransposeValue === 0) {
    removeActiveStyle([traMinusButton, traPlusButton]);
  }
  if (currentTransposeValue !== -12) {
    if (currentTransposeValue < 0) {
      traPlusButton.classList.remove('active-btn');
      traMinusButton.classList.add('active-btn');
    }
    traValue.textContent = currentTransposeValue;
    const readyDump = constructTransposDump(currentTransposeValue);
    midi.sendMessage(readyDump);
    delayedMessage(globalDumpRequest);
  }
});
// +
traPlusButton.addEventListener('click', (_) => {
  if (currentTransposeValue !== 12) {
    currentTransposeValue++;
    if (currentTransposeValue === 0) {
      removeActiveStyle([traMinusButton, traPlusButton]);
    }
    if (currentTransposeValue > 0) {
      traPlusButton.classList.add('active-btn');
      traMinusButton.classList.remove('active-btn');
    }
    traValue.textContent = currentTransposeValue;
    const readyDump = constructTransposDump(currentTransposeValue);
    midi.sendMessage(readyDump);
    delayedMessage(globalDumpRequest);
  }
});

// ----------------------------------------------------------------------
// UserScale
scaleNotesBtns.forEach((btn) => {
  btn.value = -50;
  btn.addEventListener('click', (_) => {
    btn.classList.toggle('active-btn');

    const btnPortion = btn.dataset.id;
    const btnIndexInArray = +btn.dataset.index;
    let btnValue = +btn.value;
    if (!btn.classList.contains('active-btn')) {
      btnValue = 0;
    }
    if (btnPortion === 'firstPortion') {
      tunningMessage1Temp[btnIndexInArray] = btnValue;
      readyTunningMessage1 = encode7bitTo8(tunningMessage1Temp);
      const newDump = injectTunningArray(
        readyTunningMessage1,
        readyTunningMessage2
      );
      midi.sendMessage(newDump);
    } else {
      tunningMessage2Temp[btnIndexInArray] = btnValue;
      readyTunningMessage2 = encode7bitTo8(tunningMessage2Temp);
      const newDump = injectTunningArray(
        readyTunningMessage1,
        readyTunningMessage2
      );
      midi.sendMessage(newDump);
    }
    delayedMessage(globalDumpRequest);
  });
});

// ----------------------------------------------------------------------
// Change banks
if (state.activeBank === 'A') bankAbtn.classList.add('active-btn');
bankAbtn.addEventListener('click', (_) => {
  if (bankAbtn.classList.contains('active-btn')) return;

  bankAbtn.classList.add('active-btn');
  bankBbtn.classList.remove('active-btn');

  const bankNumber = BANKS_NUMBERS[bankAbtn.value];
  state.activeBank = bankAbtn.value;
  midi.changeBank(bankNumber);
  dispatchNewEvent('bankChangedOnApp', midi, state);
});

if (state.activeBank === 'B') bankBbtn.classList.add('active-btn');
bankBbtn.addEventListener('click', (_) => {
  if (bankBbtn.classList.contains('active-btn')) return;

  bankBbtn.classList.add('active-btn');
  bankAbtn.classList.remove('active-btn');

  const bankNumber = BANKS_NUMBERS[bankBbtn.value];
  state.activeBank = bankBbtn.value;
  midi.changeBank(bankNumber);
  dispatchNewEvent('bankChangedOnApp', midi, state);
});

// ----------------------------------------------------------------------
// Change Patch
let numOfClicks = 0;
let clickedNumber = '';
const changePatchButtons = patchButtonsContainer.querySelectorAll('button');
changePatchButtons.forEach((btn) => {
  btn.addEventListener('click', (_) => {
    btn.classList.add('active-patch-btn');
    numOfClicks++;
    const btnValue = +btn.value;
    clickedNumber += btnValue;
    if (+clickedNumber > 99) {
      changePatchButtons.forEach((btn) =>
        btn.classList.remove('active-patch-btn')
      );
      numOfClicks = 0;
      return;
    }
    if (numOfClicks === 2) {
      numOfClicks = 0;
      changePatchButtons.forEach((btn) =>
        btn.classList.remove('active-patch-btn')
      );
      midi.changePatch(+clickedNumber);
      state.mode === 'PROGRAM'
        ? (state.progModeData.patchNumber = +clickedNumber)
        : (state.combiModeData.patchNumber = +clickedNumber);
      clickedNumber = '';
      dispatchNewEvent('patchCangedOnApp', midi, state);
    }
  });
});
const buttons = document.body.querySelectorAll('button');
buttons.forEach((btn) => (btn.style.backgroundColor = genRandomColor()));
