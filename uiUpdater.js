midi.addEventListener('modeChangedOnApp', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(requestModeMessage);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(requestModeMessage);
  }
  saveState(state);
});

midi.addEventListener('modeChangedOnKeybaordStateUpdated', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(currProgRequest);
  }
  saveState(state);
});

midi.addEventListener('modeRequestStateUpdated', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(currProgRequest);
  }
  saveState(state);
});

midi.addEventListener('parameterChanged', (e) => {
  // console.log('parameterChanged UI UPDATER');
  // console.log(e.detail);
});

midi.addEventListener('programDataReceived', (e) => {
  const data = e.detail;
  const patchName = parsePatchName(data);
  state.progModeData.patchName = patchName;
  patchnameDataPort.textContent = state.progModeData.patchName;
});

midi.addEventListener('combinationDataReceived', (e) => {
  const data = e.detail;
  const patchName = parsePatchName(data);
  state.combiModeData.patchName = patchName;
  patchnameDataPort.textContent = state.combiModeData.patchName;
});

midi.addEventListener('bankChangedOnApp', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    midi.sendMessage(currCombiRequest);
  } else {
    midi.sendMessage(currProgRequest);
  }
});

midi.addEventListener('bankChangedOnKeybardStateUpdated', (e) => {
  const state = e.detail;
  const { bank } =
    state.mode === 'PROGRAM' ? state.progModeData : state.combiModeData;
  state.activeBank = bank;
  if (state.activeBank === 'A') toggleActiveButtons(bankAbtn, bankBbtn);
  else toggleActiveButtons(bankBbtn, bankAbtn);
});

midi.addEventListener('patchCangedOnApp', (e) => {
  const state = e.detail;
  const { mode } = state;
  if (mode === 'PROGRAM') {
    midi.sendMessage(currProgRequest);
  } else {
    midi.sendMessage(currCombiRequest);
  }
});

midi.addEventListener('globalDumpReceived', (e) => {
  const data = e.detail;
  globalDumpData = data;
  // const { tuningAndPedals } = parseGlobalDump(globalDumpData);
  // Object.values(tuningAndPedals).forEach((val, i) => {
  //   if (i - 1 > -1 && val > 0) {
  //     scaleNotesBtns.forEach((btn) => {
  //       if (+btn.dataset.index === i - 1) {
  //         btn.classList.add('active-btn');
  //       }
  //     });
  //   }
  // });
});
// const { tuningAndPedals } = parseGlobalDump([
//   240, 66, 48, 43, 81, 0, 0, 0, 2, 0, 7, 7, 4, 0, 16, 0, 0, 0, 0, 78, 0, 0, 4,
//   0, 0, 78, 0, 0, 3, 3, 247,
// ]);
// console.log(tuningAndPedals);
