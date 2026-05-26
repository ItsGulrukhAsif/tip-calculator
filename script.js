/* ── STATE ─────────────────────────────────────────────── */
const state = {
  bill: null,
  tip: 0,          // active tip percent (number)
  tipMode: 'none', // 'preset' | 'custom' | 'none'
  people: 1,
  errors: { bill: '', tip: '', people: '' },
};

/* ── DOM REFS ──────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const billInput    = $('bill');
const peopleInput  = $('people');
const tipCustom    = $('tip-custom');
const customToggle = $('custom-toggle');
const customWrap   = $('custom-tip-wrap');
const presets      = document.querySelectorAll('.preset-btn[data-tip]');
const resetBtn     = $('reset-btn');

const outBill      = $('out-bill');
const outTipPct    = $('out-tip-pct');
const outTip       = $('out-tip');
const outTotal     = $('out-total');
const outPerPerson = $('out-per-person');
const heroSub      = $('hero-sub');
const roundingNote = $('rounding-note');

const billError   = $('bill-error');
const tipError    = $('tip-error');
const peopleError = $('people-error');

/* ── VALIDATION ────────────────────────────────────────── */
const MAX_TIP = 100;

function validateBill(raw) {
  if (raw === '' || raw === null) return 'Please enter a bill amount.';
  const n = parseFloat(raw);
  if (isNaN(n)) return 'Enter a valid number.';
  if (n <= 0) return 'Bill must be greater than zero.';
  if (n > 10_000_000) return 'That number seems a bit high!';
  return '';
}

function validateTip(raw, mode) {
  if (mode === 'none') return '';
  if (mode === 'custom') {
    if (raw === '' || raw === null) return 'Enter a custom tip percentage.';
    const n = parseFloat(raw);
    if (isNaN(n)) return 'Enter a valid number.';
    if (n < 0) return 'Tip cannot be negative.';
    if (n > MAX_TIP) return `Tip cannot exceed ${MAX_TIP}%.`;
  }
  return '';
}

function validatePeople(raw) {
  if (raw === '' || raw === null) return 'Enter number of people.';
  const n = parseInt(raw, 10);
  if (isNaN(n) || !Number.isInteger(n)) return 'Must be a whole number.';
  if (n < 1) return 'At least 1 person required.';
  if (n > 9999) return 'Max 9,999 people supported.';
  return '';
}

/* ── ROUNDING POLICY ───────────────────────────────────── */
// Round UP each person's share to the nearest paisa (0.01 Rs).
// The group never underpays; any overage is disclosed in the UI.
function computePerPerson(grandTotal, people) {
  const exact = grandTotal / people;
  const rounded = Math.ceil(exact * 100) / 100;
  const actualCollected = rounded * people;
  const overage = parseFloat((actualCollected - grandTotal).toFixed(2));
  return { perPerson: rounded, overage };
}

/* ── FORMAT ────────────────────────────────────────────── */
function fmt(n) {
  if (!isFinite(n)) return 'Rs —';
  return 'Rs\u00a0' + n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── RENDER ────────────────────────────────────────────── */
let lastPerPerson = null;

function render() {
  const billErr   = state.errors.bill;
  const tipErr    = state.errors.tip;
  const peopleErr = state.errors.people;

  setError(billError,   billInput,   billErr);
  setError(tipError,    null,        tipErr);
  setError(peopleError, peopleInput, peopleErr);

  const hasErrors = billErr || tipErr || peopleErr;
  const bill      = state.bill;
  const tip       = state.tip;
  const people    = state.people;

  if (hasErrors || bill === null || bill <= 0) {
    outBill.textContent      = 'Rs 0.00';
    outTipPct.textContent    = tip;
    outTip.textContent       = 'Rs 0.00';
    outTotal.textContent     = 'Rs 0.00';
    outPerPerson.textContent = 'Rs 0.00';
    heroSub.textContent      = '— enter details above —';
    roundingNote.classList.remove('visible');
    roundingNote.textContent = '';
    return;
  }

  const tipAmt = parseFloat((bill * tip / 100).toFixed(2));
  const total  = parseFloat((bill + tipAmt).toFixed(2));
  const { perPerson, overage } = computePerPerson(total, people);

  outBill.textContent      = fmt(bill);
  outTipPct.textContent    = tip;
  outTip.textContent       = fmt(tipAmt);
  outTotal.textContent     = fmt(total);
  outPerPerson.textContent = fmt(perPerson);

  if (lastPerPerson !== null && lastPerPerson !== perPerson) {
    outPerPerson.classList.remove('bump');
    void outPerPerson.offsetWidth;
    outPerPerson.classList.add('bump');
  }
  lastPerPerson = perPerson;

  heroSub.textContent = people === 1 ? 'just you' : `÷ ${people} people`;

  if (overage > 0) {
    roundingNote.textContent = `↑ rounded up · group collects +Rs ${overage.toFixed(2)} extra`;
    roundingNote.classList.add('visible');
  } else {
    roundingNote.classList.remove('visible');
    roundingNote.textContent = '';
  }
}

function setError(el, inputEl, msg) {
  if (msg) {
    el.textContent = msg;
    el.classList.add('visible');
    if (inputEl) {
      inputEl.classList.add('error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
  } else {
    el.classList.remove('visible');
    el.textContent = '';
    if (inputEl) {
      inputEl.classList.remove('error');
      inputEl.setAttribute('aria-invalid', 'false');
    }
  }
}

/* ── EVENTS ────────────────────────────────────────────── */
billInput.addEventListener('input', () => {
  const raw = billInput.value.trim();
  const err = validateBill(raw === '' ? '' : raw);
  state.errors.bill = err;
  state.bill = err ? null : parseFloat(raw);
  render();
});

peopleInput.addEventListener('input', () => {
  const raw = peopleInput.value.trim();
  const err = validatePeople(raw === '' ? '' : raw);
  state.errors.people = err;
  state.people = err ? 1 : parseInt(raw, 10);
  render();
});

presets.forEach(btn => {
  btn.addEventListener('click', () => {
    state.tip     = parseInt(btn.dataset.tip, 10);
    state.tipMode = 'preset';
    state.errors.tip = '';

    presets.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    customToggle.classList.remove('active');
    customToggle.setAttribute('aria-pressed', 'false');

    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    customWrap.classList.remove('visible');
    tipCustom.value = '';

    render();
  });
});

customToggle.addEventListener('click', () => {
  const isOpen = customWrap.classList.contains('visible');
  if (isOpen) {
    customWrap.classList.remove('visible');
    customToggle.classList.remove('active');
    customToggle.setAttribute('aria-pressed', 'false');
    if (state.tipMode === 'custom') {
      state.tip = 0;
      state.tipMode = 'none';
      state.errors.tip = '';
      render();
    }
  } else {
    customWrap.classList.add('visible');
    customToggle.classList.add('active');
    customToggle.setAttribute('aria-pressed', 'true');
    presets.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    state.tipMode = 'custom';
    tipCustom.focus();
    render();
  }
});

tipCustom.addEventListener('input', () => {
  const raw = tipCustom.value.trim();
  const err = validateTip(raw === '' ? '' : raw, 'custom');
  state.errors.tip = err;
  state.tip = err ? 0 : parseFloat(raw || '0');
  render();
});

resetBtn.addEventListener('click', () => {
  billInput.value   = '';
  peopleInput.value = '';
  tipCustom.value   = '';

  state.bill    = null;
  state.tip     = 0;
  state.tipMode = 'none';
  state.people  = 1;
  state.errors  = { bill: '', tip: '', people: '' };

  presets.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
  customToggle.classList.remove('active');
  customToggle.setAttribute('aria-pressed', 'false');
  customWrap.classList.remove('visible');

  lastPerPerson = null;
  render();
  billInput.focus();
});

/* ── KEYBOARD NAV ──────────────────────────────────────── */
billInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); presets[0].focus(); }
});
tipCustom.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); peopleInput.focus(); }
});
peopleInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); resetBtn.focus(); }
});

/* ── INIT ──────────────────────────────────────────────── */
render();
