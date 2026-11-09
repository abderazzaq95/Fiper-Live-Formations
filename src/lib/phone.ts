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
