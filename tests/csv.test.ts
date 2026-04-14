import { describe, expect, it } from "vitest";
import { buildCsv, csvEscape } from "../src/csv/csv.js";

describe("csvEscape", () => {
  it("wraps values in quotes", () => {
    expect(csvEscape("value")).toBe('"value"');
  });

  it("escapes quotes inside values", () => {
    expect(csvEscape('he said "hello"')).toBe('"he said ""hello"""');
  });
});

describe("buildCsv", () => {
  it("builds a single-row CSV with fixed-width transaction columns", () => {
    expect(
      buildCsv([
        { label: "address", value: "0xabc" },
        { label: "Balance", value: "4.2" },
        { label: "Latest Normal Transaction", value: "0xnormal-1" },
        { label: "Latest Internal Transaction", value: "0xinternal-1" },
        { label: "Transaction count", value: "42" },
        { label: "Is contract", value: "false" },
      ]),
    ).toBe(
      'address,Balance,Latest Normal Transaction,Latest Internal Transaction,Transaction count,Is contract\n"0xabc","4.2","0xnormal-1","0xinternal-1","42","false"\n',
    );
  });

  it("uses empty strings when transaction data is missing", () => {
    expect(
      buildCsv([
        { label: "address", value: "0xabc" },
        { label: "Balance", value: "4.2" },
        { label: "Latest Normal Transaction", value: "" },
        { label: "Latest Internal Transaction", value: "" },
        { label: "Transaction count", value: "" },
        { label: "Is contract", value: "" },
      ]),
    ).toBe(
      'address,Balance,Latest Normal Transaction,Latest Internal Transaction,Transaction count,Is contract\n"0xabc","4.2","","","",""\n',
    );
  });
});
