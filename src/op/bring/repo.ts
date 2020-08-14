import { Analecta } from "../../exp/analecta.ts";
import { CommandProcessor, connectProcessors } from "../../abst/connector.ts";
import { replyFailure } from "../../abst/reply-failure.ts";
import { Message } from "../../abst/message.ts";
import { EmbedMessage } from "../../exp/embed-message.ts";

export type Query = {
  fetchRepo: (
    owner: string,
    repoName: string,
  ) => Promise<{
    name: string;
    description?: string;
    html_url: string;
    owner: { avatar_url: string; html_url: string; login: string };
  }>;
};

const ghPattern = /^\/ghr\s+([^/]+)(\/(.+))?$/;

const genSubCommands = (
  matches: RegExpMatchArray,
  query: Query,
): CommandProcessor[] =>
  [internalRepo(matches[1]), externalRepo(matches[1])(matches[3])]
    .map((e) => e(query))
    .concat(replyFailure);

export const bringRepo = (query: Query) =>
  async (
    analecta: Analecta,
    msg: Message,
  ): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches == null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query))(analecta, msg)
    );
  };

const externalRepo = (owner?: string) =>
  (repo?: string) =>
    (
      query: Query,
    ): CommandProcessor =>
      async (analecta: Analecta, msg: Message): Promise<boolean> => {
        if (owner == null || repo == null) {
          return false;
        }
        try {
          const {
            name,
            description,
            html_url,
            owner: { avatar_url, html_url: owner_url, login },
          } = await query.fetchRepo(owner, repo);

          msg.sendEmbed(
            new EmbedMessage()
              .author({ name: login, icon_url: avatar_url, url: owner_url })
              .url(html_url)
              .description(description || "")
              .title(name)
              .footer({ text: analecta.BringRepo }),
          );
        } catch (_e) {
          /** @ignore */
          return false;
        }

        return true;
      };

const internalRepo = externalRepo("approvers");
