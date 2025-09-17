function proccessModeData(data) {
  const modeValue = data[5];
  switch (modeValue) {
    case 0x00: {
      const mode = 'COMBINATION';
      state.mode = mode;
      break;
    }
    case 0x02: {
      const mode = 'PROGRAM';
      state.mode = mode;
      break;
    }
  }
}

function processBankData(data) {
  state.activeBank = BANKS[data[2]];
}
