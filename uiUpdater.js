/**
 * ID: MCOA
 * emited from app
 * send mode data request -> update ui
 * response in MR
 */
midi.addEventListener('modeChangedOnApp', (e) => {
  const state = e.detail;
  if (state.mode === 0) {
    toggleActiveButtons(modeCombiButton, modeProgButton);
  } else if (state.mode === 2) {
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
  if (state.mode === 0) {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else if (state.mode === 2) {
    toggleActiveButtons(modeProgButton, modeCombiButton);
    midi.sendMessage(currProgRequest);
  }
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
  if (state.mode === 0) {
    toggleActiveButtons(modeCombiButton, modeProgButton);
    midi.sendMessage(currCombiRequest);
  } else if (state.mode === 2) {
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
  if (state.activeBank === 0) toggleActiveButtons(bankAbtn, bankBbtn);
  else toggleActiveButtons(bankBbtn, bankAbtn);
  displayPatchDetails(state);
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
  if (state.mode === 0) {
    midi.sendMessage(currCombiRequest);
  } else if (state.mode === 2) {
    midi.sendMessage(currProgRequest);
  }
  if (state.activeBank === 0) toggleActiveButtons(bankAbtn, bankBbtn);
});

/**
 * ID: PDR, ID: CDR
 * emited from message handler when requesting and changing mode - bank - patch on keyboard
 * receive patch request replay either 0x40 or 0x49 -> receive data -> uiUpdater update ui
 */

midi.addEventListener('programDataReceived', (e) => {
  const data = e.detail;
  const parsedPatchName = parsePatchName(data);
  state.patchName = parsedPatchName;
  patchnameDataPort.textContent = displayPatchDetails(state);
});

midi.addEventListener('combinationDataReceived', (e) => {
  const data = e.detail;
  const parsedPatchName = parsePatchName(data);
  state.patchName = parsedPatchName;
  patchnameDataPort.textContent = displayPatchDetails(state);
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
  if (mode === 2) {
    midi.sendMessage(currProgRequest);
  } else if (mode === 0) {
    midi.sendMessage(currCombiRequest);
  }
});

midi.addEventListener('globalDumpReceived', (e) => {
  removeActiveStyle(scaleNotesBtns);
  const data = e.detail;
  globalDumpData = data;
  const { tuningAndPedals } = parseGlobalDump(globalDumpData);

  const unStrippedPortion1 = tuningAndPedals.slice(0, 8);
  const unStrippedPortion2 = tuningAndPedals.slice(8, 16);
  readyTunningMessage1 = unStrippedPortion1;
  readyTunningMessage2 = unStrippedPortion2;

  const firstPortionStripped = tuningAndPedals.slice(1, 8);
  const secondPortionStriped = tuningAndPedals.slice(9);
  tunningMessage1Temp = firstPortionStripped;
  tunningMessage2Temp = secondPortionStriped;

  firstPortionStripped.forEach((byte, i) => {
    if (byte > 0) {
      scaleNotesBtns.forEach((btn) => {
        if (btn.dataset.id === 'firstPortion' && +btn.dataset.index === i)
          btn.classList.add('active-btn');
      });
    }
  });
  secondPortionStriped.forEach((byte, i) => {
    if (byte > 0) {
      scaleNotesBtns.forEach((btn) => {
        if (btn.dataset.id === 'secondPortion' && +btn.dataset.index === i)
          btn.classList.add('active-btn');
      });
    }
  });
});
