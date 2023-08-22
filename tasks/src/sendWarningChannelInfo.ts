import { rest } from "./common";
import { RESTGetAPICurrentUserResult, Routes } from "discord-api-types/v10";
import { warningChannelId } from "./env";

const main = async () => {
  const user = (await rest.get(
    Routes.user("@me")
  )) as RESTGetAPICurrentUserResult;
  console.log(`${user.username}#${user.discriminator} (${user.id})`);
  await rest.post(Routes.channelMessages(warningChannelId), {
    body: {
      content:
        "This channel is for warnings only. A private thread will be created to notify warning when you violate the rules.",
    },
  });
};

main();
