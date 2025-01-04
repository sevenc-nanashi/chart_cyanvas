import { REST } from "@discordjs/rest";
import { token } from "./env.ts";

export const rest = new REST({ version: "10" }).setToken(token);
