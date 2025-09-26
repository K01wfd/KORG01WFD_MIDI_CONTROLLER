const patchnameDataPort = document.getElementById('patchname');

// -----------------------------------------------------------------------
const modeProgButton = document.getElementById('mode-program');
const modeCombiButton = document.getElementById('mode-combination');
const resetButton = document.getElementById('request-global');
// ----------------------------------------------------------------------
const tunnerBtn = document.getElementById('tunner');
// --------------------------------------------------------------------

const bankAbtn = document.getElementById('bank-a-btn');
const bankBbtn = document.getElementById('bank-b-btn');

// --------------------------------------------------------------------

// ----------------------------------------------------------------------

const prevPatchBtn = document.getElementById('previous-patch');
const nextPatchBtn = document.getElementById('next-patch');
const patchButtonsContainer = document.querySelector('.change-patch-buttons');

tunnerBtn.addEventListener('click', (_) => {
  window.location.replace('https://k01wfd.github.io/MIDIC/');
});
// Reset global to saved default global and reload
resetButton.addEventListener('click', (_) => {
  midi.sendMessage(originalGlobalDumpData);
  setTimeout(() => window.location.reload(), 50);
});

// When connection ready
midi.addEventListener('connectorReady', () => {
  /**
   * requestMode -> msg handler replay 0x42 -> proccessor proccess data -> emit -> uiUpdater respond to event,
   * depending on mode -> send current patch dump request
   */
  midi.sendMessage(requestModeMessage);
  midi.changeBank(state.activeBank);
  midi.changePatch(getConvertedPatchNum());
  /**
   * request current golbal data -> global data received -> emit -> uiUpdater respond
   */
  delayedMessage(globalDumpRequest);
});

// CHANGE MODE

if (state.mode === 2) modeProgButton.classList.add('active-btn');
modeProgButton.addEventListener('click', (_) => {
  /**
   * mode change in app -> send message -> update state mode -> emit -> uiUpdater response -> send current mode request ->
   *  process replay data -> emit -> uiUpdater response
   */
  midi.sendMessage(switchToProgMessage);
  toggleActiveButtons(modeProgButton, modeCombiButton);
  state.mode = 2;
  dispatchNewEvent('modeChangedOnApp', midi, state);
});

if (state.mode === 0) modeCombiButton.classList.add('active-btn');
modeCombiButton.addEventListener('click', (_) => {
  /**
   * mode change in app -> send message -> update state mode -> emit -> uiUpdater response -> send current mode request ->
   *  process replay data -> emit -> uiUpdater response
   */
  midi.sendMessage(switchToCombiMessage);
  toggleActiveButtons(modeCombiButton, modeProgButton);
  state.mode = 0;
  dispatchNewEvent('modeChangedOnApp', midi, state);
});

// Change banks
if (state.activeBank === 0) bankAbtn.classList.add('active-btn');
bankAbtn.addEventListener('click', (_) => {
  if (bankAbtn.classList.contains('active-btn')) return;

  bankAbtn.classList.add('active-btn');
  bankBbtn.classList.remove('active-btn');

  /**
   * Get bank number from bank string value which is either A or B for korg 01/wfd
   * update active bank in the state
   * send change bank
   * emit -> uiUpdater response
   */
  state.activeBank = +bankAbtn.value;
  midi.changeBank(state.activeBank);
  dispatchNewEvent('bankChangedOnApp', midi, state);
});

if (state.activeBank === 1) bankBbtn.classList.add('active-btn');
bankBbtn.addEventListener('click', (_) => {
  if (bankBbtn.classList.contains('active-btn')) return;

  bankBbtn.classList.add('active-btn');
  bankAbtn.classList.remove('active-btn');

  /**
   * Get bank number from bank string value which is either A or B for korg 01/wfd
   * update active bank in the state
   * send change bank
   * emit -> uiUpdater response
   */
  state.activeBank = +bankBbtn.value;
  midi.changeBank(state.activeBank);
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
    /**
     * if clicked number greater than 99 reset
     */
    if (+clickedNumber > 99) {
      changePatchButtons.forEach((btn) => btn.classList.remove('active-patch-btn'));
      numOfClicks = 0;
      return;
    }
    /**
     * if number of click  reched 2 and the number if less than 100
     */
    if (numOfClicks === 2) {
      numOfClicks = 0;
      changePatchButtons.forEach((btn) => btn.classList.remove('active-patch-btn'));

      /**
       * send change patch number message
       * depending on the current state mode, upadet each mode data in the state
       */
      midi.changePatch(+clickedNumber);
      state.patchNumber = +clickedNumber;
      clickedNumber = '';

      /**
       * emit -> uiUpdater response
       */
      dispatchNewEvent('patchCangedOnApp', midi, state);
    }
  });
});

prevPatchBtn.addEventListener('click', (_) => {
  state.patchNumber--;

  if (state.patchNumber === -1) {
    midi.changeBank(state.prevBank);
    state.activeBank = state.prevBank;
    state.prevBank = state.activeBank === 0 ? 1 : 0;
  }

  midi.changePatch(getConvertedPatchNum());
  dispatchNewEvent('patchCangedOnApp', midi, state);
});
nextPatchBtn.addEventListener('click', (_) => {
  state.patchNumber++;

  if (state.patchNumber === 100) {
    midi.changeBank(state.prevBank);
    state.activeBank = state.prevBank;
    state.prevBank = state.activeBank === 0 ? 1 : 0;
  }

  midi.changePatch(getConvertedPatchNum());
  dispatchNewEvent('patchCangedOnApp', midi, state);
});

/**
 * Select all buttons in the document and assign random bg color to them
 */
const buttons = document.body.querySelectorAll('button');
buttons.forEach((btn) => (btn.style.backgroundColor = genRandomColor()));
