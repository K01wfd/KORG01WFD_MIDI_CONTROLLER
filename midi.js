class MIDIConnector extends EventTarget {
  #_access = null;
  #_output = null;
  #_input = null;
  constructor() {
    super();
    this.#initConnection();
  }

  async #initConnection() {
    try {
      this.#_access = await window.navigator.requestMIDIAccess({ sysex: true });

      this.#_access.outputs.forEach((output) => {
        this.#_output = output;
      });

      this.#_access.inputs.forEach((input) => {
        this.#_input = input;
        this.#_input.onmidimessage = (msg) => this.#messageHandler(msg);
      });
      if (!this.#_output) {
        alert('No MIDI Output Connected');
        return;
      }

      this.dispatchEvent(new CustomEvent('connectorReady'));
    } catch (error) {
      // alert('MIDI NOT SUPPORTED');
      console.log('Error accessing midi on this device 🚫');
    }
  }

  #messageHandler(msg) {
    const data = Array.from(msg.data);
    this.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
  }

  sendMessage(message) {
    try {
      this.#_output.send(message);
    } catch (error) {
      zeroOneAppErrors.midiErrors.push(error);
      saveState('midiErrors', zeroOneAppErrors);
      alert('Error sending message ❗');
    }
  }
  changePatch(patchNumber, channel = 0) {
    this.#_output.send([0xc0 | channel, patchNumber]);
  }
  changeBank(bank, channel = 0) {
    if (!this.#_output) return;

    // Send CC0 (MSB)
    this.#_output.send([0xb0 | channel, 0x00, 0x00]);
    // Send CC32 (LSB)
    this.#_output.send([0xb0 | channel, 0x20, bank]);
    this.#_output.send([0xc0 | channel, getConvertedPatchNum()]);
  }
}

const midi = new MIDIConnector();
