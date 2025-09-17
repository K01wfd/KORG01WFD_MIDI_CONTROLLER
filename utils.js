/**
 * Generate random colors, avoid too bright or too dark
 * @returns {string} hsl(h, s, l)
 */
function genRandomColor() {
  let minL = 30;
  let maxL = 35;
  let minS = 30; // avoid grayish colors
  let maxS = 100;

  let hue = 0;
  hue = Math.floor(Math.random() * 360);

  const saturation = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
  const luminance = Math.floor(Math.random() * (maxL - minL + 1)) + minL;

  return `hsl(${hue}, ${saturation}%, ${luminance}%)`;
}

/**
 * Wrap into 7-bit range (0–127)
 * @param {number}  value  - any number
 * @returns {string} in 127 range HEX
 */
function toHex7bit(value) {
  const byte = (value + 128) % 128;
  return byte.toString(16).toUpperCase().padStart(4, '0x');
}

/**
 * Dispatch a New Event
 * @param {string}  ev  - event name
 * @param {object} target - target class
 * @param {object} data - to pass through detail object
 * @returns {void}
 */
function dispatchNewEvent(ev, target, data = {}) {
  target.dispatchEvent(new CustomEvent(ev, { detail: data }));
}

/**
 * Switch active btn style between provided buttons
 * First element receives the active class
 *
 * @param {HTMLElement}  btn1  - any HTML Element
 * @param {HTMLElement}  btn2  - any HTML Element
 * @returns {void}
 */
function toggleActiveButtons(btn1, btn2) {
  btn1.classList.add('active-btn');
  btn2.classList.remove('active-btn');
}

/**
 * Encode 7bits into 8bits.
 * When number greater than 127, collect the msb, store it in the header bit.
 * [0, -1, 0, 0, 0, 0, 0] -> second bit is greater than 127.
 * now should be [1, 127, 0, 0, 0, 0, 0, 0]
 * @param {number[]}  values  - 7bits array
 * @returns {number[]} 8bit array
 */

function encode7bitTo8(values) {
  if (values.length !== 7) {
    throw new Error('Block must contain exactly 7 values');
  }

  let flag = 0;
  const data = [];

  values.forEach((val, i) => {
    if (val < 0) {
      flag |= 1 << i; // set bit i for negative value
      data.push((128 + val) & 0x7f); // e.g. -1 → 127, -2 → 126
    } else {
      data.push(val & 0x7f); // positive or zero
    }
  });

  return [flag, ...data];
}

/**
 * Inject Ready Tunning portions into global dump.
 * Tunning portion is devided into two 8bytes portions
 * @param {number[]}  array1  - Tunning Portion Array
 * @param {number[]}  array2  - Tunning Portion Array
 * @returns {number[]} New Global Dump
 */

function injectTunningArray(array1, array2) {
  const dumpHead = globalDumpData.slice(0, 14);
  const dumpTail = globalDumpData.slice(-1);
  const newDump = [...dumpHead, ...array1, ...array2, ...dumpTail];
  return newDump;
}

/**
 * Inject Ready transpose portion into global dump
 *
 * @param {number[]} dump - Transpose Portion Array
 * @returns {number[]} New Global Dump
 */

function injectTransposeArray(array) {
  const dumpHead = globalDumpData.slice(0, 6);
  const dumpTail = globalDumpData.slice(14);
  const newDump = [...dumpHead, ...array, ...dumpTail];
  return newDump;
}

/**
 * Split Korg 01/Wfd global dump into its sections.
 *
 * @param {number[]} dump - Array of bytes from SysEx dump
 * @returns {object} sections
 */
function parseGlobalDump(dump) {
  if (!Array.isArray(dump)) {
    throw new Error('Dump must be an array of numbers');
  }

  return {
    header: dump.slice(0, 6), // bytes 0–5
    master: dump.slice(6, 14), // bytes 6–13
    tuningAndPedals: dump.slice(14, 30), // bytes 14–29
    tail: dump[30], // byte 31
  };
}

/**
 * Build transpose message based on value provided
 *
 * @param {number} transposeValue - Current transpose value
 * @returns {Array} global dump array
 */

function constructTransposDump(transposeValue) {
  transposeMessageTemp[1] = transposeValue;
  const readyTransposeBlock = encode7bitTo8(transposeMessageTemp);
  const readyDump = injectTransposeArray(readyTransposeBlock);
  return readyDump;
}

/**
 * remove active btn style from provided buttons
 *
 * @param {HTMLButtonElement[] | HTMLElement[]} buttons - Elements to remove style from
 * @returns {void}
 */
//
function removeActiveStyle(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove('active-btn');
  });
}

/**
 * Send delayed MIDI Message
 * @param {number[]} message - Message to send
 * @param {number} timer - number of milliseconds to wait, default 50 milliseconds
 */
function delayedMessage(message, timer = 50) {
  setTimeout(() => midi.sendMessage(message), timer);
}

/**
 * Send delayed MIDI Message
 * @param {number[]} dump - dump to parse patch name from
 * @returns {string} str - the parsed Patch name
 */
function parsePatchName(dump) {
  const LOWER = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(i + 97)
  );
  const UPPER = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(i + 65)
  );
  const SYMBOLS = Array.from({ length: 32 }, (_, i) =>
    String.fromCharCode(i + 32)
  );

  const characters = [...UPPER, ...LOWER, ...SYMBOLS];

  const sliced = dump.slice(6, 17);
  let str = '';

  for (let i = 0; i < sliced.length; i++) {
    const char = String.fromCharCode(sliced[i]);
    if (characters.includes(char)) str += char;
  }
  return str;
}

function displayPatchDetails(state) {
  let patchNumber =
    state.patchNumber < 0
      ? +toHex7bit(state.patchNumber - 28)
      : state.patchNumber;
  return `${BANKS[state.activeBank]}${patchNumber}: ${state.patchName}`;
}

function getConvertedPatchNum() {
  if (state.patchNumber === -101) state.patchNumber = -1;
  if (state.patchNumber === 100) state.patchNumber = 0;
  if (state.patchNumber < 0) {
    state.patchNumber = +toHex7bit(state.patchNumber - 28);
  }
  return state.patchNumber;
}
const BANKS = {
  0: 'A',
  1: 'B',
};
const BANKS_NUMBERS = {
  A: 0,
  B: 1,
};

// Prevent zoom on double touch
document.addEventListener(
  'dblclick',
  function (event) {
    event.preventDefault();
  },
  { passive: false }
);
// function printMIDIData(data, title, dataPort) {
//   const dataContainer = document.createElement('div');
//   dataContainer.classList.add('data-container');

//   const dataHeader = document.createElement('header');
//   dataHeader.classList.add('print-data-header');

//   const dataTitle = document.createElement('h3');
//   dataTitle.textContent = title;

//   const dateElement = document.createElement('span');
//   dateElement.textContent = new Date().toLocaleTimeString();

//   dataHeader.append(...[dataTitle, dateElement]);

//   const dataText = data.join('-');
//   const dataElement = document.createElement('p');
//   dataElement.textContent = dataText;

//   dataContainer.append(...[dataHeader, dataText]);
//   dataPort.appendChild(dataContainer);
// }
