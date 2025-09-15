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
  switch (state.mode) {
    case 'COMBINATION': {
      state.combiModeData.bank = BANKS[data[2]];
      break;
    }
    case 'PROGRAM': {
      state.progModeData.bank = BANKS[data[2]];
      break;
    }
    default:
      return;
  }
}
