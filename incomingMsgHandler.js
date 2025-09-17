midi.addEventListener('newMessage', (e) => {
  const data = e.detail;
  if (data[0] === 0xfe || data[0] === 0xf8) return;
  console.log(data);
  // Channel
  switch (data[0]) {
    // response to bank change channel message
    case 0xb0: {
      if (data[1] === 32) {
        processBankData(data);
        midi.dispatchEvent(
          new CustomEvent('bankChangedOnKeybardStateUpdated', { detail: state })
        );
      }
      break;
    }
    case 0xc0: {
      processPatchData(data);
      break;
    }
  }
  // sysEx
  switch (data[4]) {
    case 0x42: {
      // keyboard replay for mode request from app
      proccessModeData(data);
      midi.dispatchEvent(
        new CustomEvent('modeRequestStateUpdated', { detail: state })
      );
      break;
    }
    case 0x4e: {
      // recevied when mode changed on keyboard
      proccessModeData(data);
      midi.dispatchEvent(
        new CustomEvent('modeChangedOnKeybaordStateUpdated', { detail: state })
      );
      break;
    }
    case 0x51: {
      // received when sent global dump request
      midi.dispatchEvent(
        new CustomEvent('globalDumpReceived', { detail: data })
      );
      break;
    }
    case 0x40: {
      // Received when sent current program data dump request
      midi.dispatchEvent(
        new CustomEvent('programDataReceived', { detail: data })
      );
      break;
    }
    case 0x49: {
      // Received when sent current combination data dump request
      midi.dispatchEvent(
        new CustomEvent('combinationDataReceived', { detail: data })
      );
      break;
    }
    default: {
      return;
    }
  }
});
