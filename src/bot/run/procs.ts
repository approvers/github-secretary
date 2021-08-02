import { CommandProcessor, connectProcessors } from "../abst/connector";
import type { AllApi } from "../abst/api";
import type { Analecta } from "../exp/analecta";
import { DiscordMessage } from "../skin/discord-message";
import type { Message } from "discord.js";
import type { UserDatabase } from "../abst/user-database";
import { bringBranch } from "../play/bring/branch";
import { bringIssue } from "../play/bring/issue";
import { bringPR } from "../play/bring/pr";
import { bringRepo } from "../play/bring/repo";
import { error } from "../play/error";
import { flavor } from "../play/flavor";
import { markAsRead } from "../play/notify/mark-as-read";
// eslint-disable-next-line max-len
import { subscribeNotification } from "../play/notify/subscribe";
import { unsubNotification } from "../play/notify/unsubscribe";

export const procs = (
  analecta: Analecta,
  db: UserDatabase,
  query: AllApi,
): CommandProcessor =>
  connectProcessors([
    flavor(
      new RegExp(analecta.CallPattern, "u"),
      new RegExp(analecta.BlackPattern, "mu"),
    ),
    bringIssue(query),
    bringPR(query),
    bringBranch(query),
    bringRepo(query),
    subscribeNotification(db, query),
    unsubNotification(db),
    markAsRead(db, query),
    error,
  ]);

export const messageHandler =
  (analecta: Analecta, builtProcs: CommandProcessor) =>
  async (msg: Message): Promise<void> => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content.startsWith("/gh?")) {
      const dm = await msg.author.createDM();
      dm.send(analecta.HelpMessage);
      return;
    }
    const discordMessage = new DiscordMessage(msg);
    await builtProcs(analecta, discordMessage);
  };
