import { config } from "dotenv";

config({ path: "../.env" });

const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const token = getEnv("DISCORD_BOT_TOKEN");
export const clientId = getEnv("DISCORD_CLIENT_ID");
export const guildId = getEnv("DISCORD_GUILD_ID");
export const warningChannelId = getEnv("DISCORD_WARNING_CHANNEL_ID");
