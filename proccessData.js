function proccessModeData(data) {
  const modeValue = data[5];
  switch (modeValue) {
    case 0x00: {
      state.mode = 0;
      break;
    }
    case 0x02: {
      state.mode = 2;
      break;
    }
  }
}

function processBankData(data) {
  state.activeBank = data[2];
}
