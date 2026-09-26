import { describe, expect, it } from "vitest";

import { decideProxyRedirect } from "../auth/proxy-redirect";

describe("decideProxyRedirect", () => {
  it("renders /login when the server rejects a still-valid JWT", () => {
    const revoked = { claimsAuthenticated: true, serverUser: false as const };
    expect(decideProxyRedirect("/login", revoked)).toBeNull();
    expect(decideProxyRedirect("/signup", revoked)).toBeNull();
  });

  it("sends a server-confirmed user away from the auth pages", () => {
    expect(
      decideProxyRedirect("/login", {
        claimsAuthenticated: true,
        serverUser: true,
      }),
    ).toBe("/dashboard");
  });

  it("sends an anonymous visitor from a protected page to /login", () => {
    expect(
      decideProxyRedirect("/dashboard", {
        claimsAuthenticated: false,
        serverUser: null,
      }),
    ).toBe("/login");
    expect(
      decideProxyRedirect("/cv", {
        claimsAuthenticated: true,
        serverUser: null,
      }),
    ).toBeNull();
  });
});
