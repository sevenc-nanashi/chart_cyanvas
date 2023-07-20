import { REST } from "@discordjs/rest";
import {
  ApplicationRoleConnectionMetadataType,
  RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
  Routes,
} from "discord-api-types/v10";
import { clientId, token } from "./env";
import "dotenv/config";

const rest = new REST({ version: "10" }).setToken(token);

const registerRoleConnection = async () => {
  rest.put(Routes.applicationRoleConnectionMetadata(clientId), {
    body: [] satisfies RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
  });
};
