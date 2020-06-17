declare const nominalDiscordId: unique symbol;
export type DiscordId = string & {
  [nominalDiscordId]: never;
};
