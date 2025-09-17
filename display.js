// const modeDataPort = document.getElementById('mode-data-port');
// const bankDataPort = document.getElementById('bank-data-port');
const patchnameDataPort = document.getElementById('patchname');
const showNumPadd = document.getElementById('show-number-padd');
// -----------------------------------------------------------------------
const modeProgButton = document.getElementById('mode-program');
const modeCombiButton = document.getElementById('mode-combination');
const resetButton = document.getElementById('request-global');
// ----------------------------------------------------------------------

const traMinusButton = document.getElementById('transpose-minus');
const traValue = document.getElementById('transpose-value');
const traPlusButton = document.getElementById('transpose-plus');
let currentTransposeValue = +traValue.textContent;
// --------------------------------------------------------------------

const bankAbtn = document.getElementById('bank-a-btn');
const bankBbtn = document.getElementById('bank-b-btn');

// --------------------------------------------------------------------
const userScaleContainer = document.querySelector('.userscale');
const scaleNotesBtns = userScaleContainer.querySelectorAll('button');

// ----------------------------------------------------------------------

const prevPatchBtn = document.getElementById('previous-patch');
const nextPatchBtn = document.getElementById('next-patch');

const printDataPort = document.querySelector('.data-print-port');
const patchButtonsContainer = document.querySelector('.change-patch-buttons');

// Toggle numbers pad
showNumPadd.addEventListener('click', (_) => {
  if (patchButtonsContainer.style.getPropertyValue('display') === 'none') {
    patchButtonsContainer.style.display = 'flex';
    return;
  }
  patchButtonsContainer.style.display = 'none';
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

// TRANSPOSE

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
    /**
     * 1- construct transpose message
     * 2- inject transpose data array block into global dump
     * 3- send ready global dump
     */
    const readyDump = constructTransposDump(currentTransposeValue);
    midi.sendMessage(readyDump);
    /**
     * update current global dump by requesting current dump on keyboard -> emit -> uiUpdater response
     */
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
    /**
     * 1- construct transpose message
     * 2- inject transpose data array block into global dump
     * 3- send ready global dump
     */
    const readyDump = constructTransposDump(currentTransposeValue);

    midi.sendMessage(readyDump);
    /**
     * update current global dump by requesting current dump on keyboard -> emit -> uiUpdater response
     */
    delayedMessage(globalDumpRequest);
  }
});

// ----------------------------------------------------------------------
// UserScale
scaleNotesBtns.forEach((btn) => {
  btn.value = -50;
  btn.addEventListener('click', (_) => {
    btn.classList.toggle('active-btn');

    /**
     * btn portions relate to portion of tunning notes in the dump data
     * they are 2 portions each 7bytes*2  befor converting them to 8bytes*2
     * each portion encodes data into 7bit save data
     * final portions in global dump start at index 14 16bytes*7bit
     */
    const btnPortion = btn.dataset.id;
    const btnIndexInArray = +btn.dataset.index;
    let btnValue = +btn.value;

    if (!btn.classList.contains('active-btn')) {
      btnValue = 0;
    }

    if (btnPortion === 'firstPortion') {
      /**
       * if btn is first portion use tunning message template 1
       * each btn index represent the position of the note in the portion array
       * for example if C is clicked = [-50, 0, 0, 0, 0, 0, 0]
       * now ready tunning message portion 1 is ready
       * there is ready message portion 2 not changed, which 8byte
       */
      tunningMessage1Temp[btnIndexInArray] = btnValue;
      readyTunningMessage1 = encode7bitTo8(tunningMessage1Temp);

      /**
       * inject both messages at the correct position in the dump
       * receive ready dump and send it
       * do same if btn portion is 2 with switching the template messages and ready messages
       */
      const newDump = injectTunningArray(
        readyTunningMessage1,
        readyTunningMessage2
      );

      /**
       * update current global dump by requesting current dump on keyboard -> emit -> uiUpdater response
       */

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
      changePatchButtons.forEach((btn) =>
        btn.classList.remove('active-patch-btn')
      );
      numOfClicks = 0;
      return;
    }
    /**
     * if number of click  reched 2 and the number if less than 100
     */
    if (numOfClicks === 2) {
      numOfClicks = 0;
      changePatchButtons.forEach((btn) =>
        btn.classList.remove('active-patch-btn')
      );

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
  patchNumberCounter--; // NEED TO CONVERT TO UNSIGNED HEX -1 === 127
  let counter = patchNumberCounter;
  if (counter < 0) {
    counter = toHex7bit(patchNumberCounter - 28);
  }
  midi.changePatch(counter);
  dispatchNewEvent('patchCangedOnApp', midi, state);
});
nextPatchBtn.addEventListener('click', (_) => {
  patchNumberCounter++;
  if (patchNumberCounter > 99) {
  }
  midi.changePatch(patchNumberCounter);
  dispatchNewEvent('patchCangedOnApp', midi, state);
});

/**
 * Select all buttons in the document and assign random bg color to them
 */
const buttons = document.body.querySelectorAll('button');
buttons.forEach((btn) => (btn.style.backgroundColor = genRandomColor()));
