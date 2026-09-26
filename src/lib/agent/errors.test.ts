import { describe, expect, it } from "vitest";

import { AGENT_UNAVAILABLE_RU, agentErrorText, isGatewayAuthOrCreditError } from "./errors";

describe("agentErrorText", () => {
  it("maps gateway auth and credit failures to a short Russian message", () => {
    expect(isGatewayAuthOrCreditError({ name: "LoadAPIKeyError", message: "Missing API key" })).toBe(
      true,
    );
    expect(agentErrorText({ name: "LoadAPIKeyError", message: "Missing API key" })).toBe(
      AGENT_UNAVAILABLE_RU,
    );
    expect(agentErrorText({ name: "APICallError", message: "Insufficient credits", statusCode: 402 })).toBe(
      AGENT_UNAVAILABLE_RU,
    );
    expect(agentErrorText(new Error("network down"))).not.toBe(AGENT_UNAVAILABLE_RU);
  });
});
