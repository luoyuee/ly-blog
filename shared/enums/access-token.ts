export const AccessTokenScopeEnum = {
  HITOKOTO_IMPORT: "hitokoto:import",
  NOTE_IMPORT: "note:import"
} as const;

export type AccessTokenScope = (typeof AccessTokenScopeEnum)[keyof typeof AccessTokenScopeEnum];

export const ACCESS_TOKEN_SCOPES = Object.values(AccessTokenScopeEnum);
