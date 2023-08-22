import { REST } from "@discordjs/rest";
import { token } from "./env";

export const rest = new REST({ version: "10" }).setToken(token);
