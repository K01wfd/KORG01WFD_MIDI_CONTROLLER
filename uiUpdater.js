/**
 * ID: MCOA
 * emited from app
 * send mode data request -> update ui
 * response in MR
 */
midi.addEventListener('modeChangedOnApp', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
  }
  midi.sendMessage(requestModeMessage);
});

/**
 * ID: MCOK
 * emited from message handler
 * depending on mode send current patch data dump request -> update ui
 */
midi.addEventListener('modeChangedOnKeybaordStateUpdated', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(currProgRequest);
  }
  console.log(globalDumpData);
});

/**
 * ID: MR
 * when first render or reset
 * emited from message handler
 * depending on mode send current patch data dump request -> update ui
 * response in PDR or CDR
 */
midi.addEventListener('modeRequestStateUpdated', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(currProgRequest);
  }
});

/**
 * ID: BCOK
 * emited from message handler
 * depending on mode update the modeData in the state -> update ui
 */
midi.addEventListener('bankChangedOnKeybardStateUpdated', (e) => {
  const state = e.detail;
  const { bank } =
    state.mode === 'PROGRAM' ? state.progModeData : state.combiModeData;
  state.activeBank = bank;
  if (state.activeBank === 'A') toggleActiveButtons(bankAbtn, bankBbtn);
  else toggleActiveButtons(bankBbtn, bankAbtn);
});

/**
 * ID: BCOA
 * when bank changed on app
 * depending on mode send current patch data dump request
 * message handler emit -> uiUpdater response
 * response in PDR or CDR
 */
midi.addEventListener('bankChangedOnApp', (e) => {
  const state = e.detail;
  if (state.mode === 'COMBINATION') {
    midi.sendMessage(currCombiRequest);
  } else {
    midi.sendMessage(currProgRequest);
  }
});

/**
 * ID: PDR, ID: CDR
 * emited from message handler when requesting and changing mode - bank - patch on keyboard
 * receive patch request replay either 0x40 or 0x49 -> receive data -> uiUpdater update ui
 */

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

/**
 * ID: PCOA
 * emited from app
 * when patch number changed on app or keyboard will receive [176,0,0], [176, 32, patchNumber]
 * depending on which mode is send request for current patch either combi or program
 * receive patch request replay either 0x40 or 0x49 -> receive data -> uiUpdater update ui
 * response in CDR or PDR
 */

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
  console.log('global data received fired fired');
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
  this.removeEventListener('globalDumpReceived', midi);
});

midi.addEventListener('parameterChanged', (e) => {
  // console.log('parameterChanged UI UPDATER');
  // console.log(e.detail);
});

// const { tuningAndPedals } = parseGlobalDump([
//   240, 66, 48, 43, 81, 0, 0, 0, 2, 0, 7, 7, 4, 0, 16, 0, 0, 0, 0, 78, 0, 0, 4,
//   0, 0, 78, 0, 0, 3, 3, 247,
// ]);
// console.log(tuningAndPedals);
