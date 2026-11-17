// Country calling codes (digits only) used to detect a dial code typed twice.
const DIAL_CODES = [
  "964", "961", "966", "971", "974", "965", "973", "968", "212", "90", "962", "20", "970", "963", "967", "216", "213", "218", "249", "222",
  "49", "33", "44", "31", "32", "41", "43", "34", "39", "351", "30", "46", "47", "45", "353", "48", "40", "1", "52", "55", "54", "61", "91",
  "92", "880", "62", "60", "86", "81", "82", "98", "7", "380", "27", "234",
].sort((a, b) => b.length - a.length);

function cleanDigits(value: string) {
  return value.replace(/\D/g, "").replace(/^00/, "");
}

// A national number that merely starts with the same digits as the country code (India 91xxxxxxxx, Iran 98xxxxxxxx,
// Kazakhstan 7xxxxxxxxx) is valid when it has 10 digits, so only treat it as a repeated code when it is longer.
// Brazil (+55) has a real area code 55 with 11-digit mobiles, so it needs one more digit.
function repeatsCode(code: string, national: string) {
  return national.startsWith(code) && national.length >= (code === "55" ? 12 : 11) && national.length - code.length >= 6;
}

/** Local number typed next to a selected dial code: drops a repeated dial code and leading zeros. */
export function localPhoneDigits(dial: string, input: string) {
  const dialDigits = dial.replace(/\D/g, "");
  let digits = cleanDigits(input);
  if (dialDigits && repeatsCode(dialDigits, digits)) digits = digits.slice(dialDigits.length);
  return digits.replace(/^0+/, "");
}

/** Removes an accidentally repeated country code from a full E.164 number, e.g. +96196176927478 -> +96176927478. */
export function dedupeDialCode(e164: string) {
  const digits = e164.replace(/\D/g, "");
  for (const code of DIAL_CODES) {
    if (!digits.startsWith(code)) continue;
    let rest = digits.slice(code.length).replace(/^0+/, "");
    if (repeatsCode(code, rest)) rest = rest.slice(code.length).replace(/^0+/, "");
    return `+${code}${rest}`;
  }
  return `+${digits}`;
}

// Allowed length of the national mobile number (without the country code and without the leading 0), per dial code.
// WhatsApp numbers are mobile numbers, so these are the mobile lengths.
const NATIONAL_LENGTHS: Record<string, [number, number]> = {
  "212": [9, 9], "964": [10, 10], "961": [7, 8], "966": [9, 9], "971": [9, 9], "974": [8, 8], "965": [8, 8], "973": [8, 8],
  "968": [8, 8], "90": [10, 10], "962": [9, 9], "20": [10, 10], "970": [9, 9], "963": [9, 9], "967": [9, 9], "216": [8, 8],
  "213": [9, 9], "218": [9, 9], "249": [9, 9], "222": [8, 8], "49": [10, 11], "33": [9, 9], "44": [10, 10], "31": [9, 9],
  "32": [8, 9], "41": [9, 9], "43": [10, 13], "34": [9, 9], "39": [9, 10], "351": [9, 9], "30": [10, 10], "46": [9, 9],
  "47": [8, 8], "45": [8, 8], "353": [9, 9], "48": [9, 9], "40": [9, 9], "1": [10, 10], "52": [10, 10], "55": [10, 11],
  "54": [10, 11], "61": [9, 9], "91": [10, 10], "92": [10, 10], "880": [10, 10], "62": [9, 12], "60": [9, 10], "86": [11, 11],
  "81": [10, 10], "82": [9, 10], "98": [10, 10], "7": [10, 10], "380": [9, 9], "27": [9, 9], "234": [10, 10],
};

function lengthMessage([min, max]: [number, number]) {
  if (min === max) return `يجب أن يتكون رقم واتساب من ${min} أرقام (أو ${min + 1} إذا بدأ بـ 0) بدون رمز الدولة.`;
  return `يجب أن يتكون رقم واتساب من ${min} إلى ${max} أرقام بدون رمز الدولة.`;
}

/** Form check: the number typed next to the selected dial code. Returns an Arabic error, or null when it is fine. */
export function phoneLengthError(dial: string, input: string) {
  const rule = NATIONAL_LENGTHS[dial.replace(/\D/g, "")];
  const national = localPhoneDigits(dial, input);
  if (!rule) return national.length >= 6 && national.length <= 14 ? null : "رقم واتساب غير صحيح.";
  return national.length >= rule[0] && national.length <= rule[1] ? null : lengthMessage(rule);
}

/** Server check on the final +number. Unknown country codes only get a general 8-15 digit check. */
export function e164LengthError(e164: string) {
  const digits = e164.replace(/\D/g, "");
  const code = DIAL_CODES.find((item) => digits.startsWith(item) && NATIONAL_LENGTHS[item]);
  if (!code) return digits.length >= 8 && digits.length <= 15 ? null : "رقم واتساب غير صحيح.";
  const length = digits.length - code.length;
  const rule = NATIONAL_LENGTHS[code];
  return length >= rule[0] && length <= rule[1] ? null : lengthMessage(rule);
}
