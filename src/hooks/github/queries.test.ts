import { describe, expect, it } from "vitest";
import { escapeGraphQLString } from "./queries";

describe("escapeGraphQLString", () => {
  it("escapes backslashes", () => {
    expect(escapeGraphQLString("foo\\bar")).toBe("foo\\\\bar");
  });

  it("escapes double quotes", () => {
    expect(escapeGraphQLString('foo"bar')).toBe('foo\\"bar');
  });

  it("handles clean strings", () => {
    expect(escapeGraphQLString("hello-world")).toBe("hello-world");
  });

  it("handles both backslashes and quotes", () => {
    expect(escapeGraphQLString('"\\test\\"')).toBe('\\"\\\\test\\\\\\"');
  });

  it("handles empty string", () => {
    expect(escapeGraphQLString("")).toBe("");
  });
});
