import { MessageEmbed, EmbedFieldData } from "discord.js";

import { Analecta } from "../../exp/analecta";
import { colorFromState } from "../../exp/state-color";
import { replyFailure } from "../../abst/reply-failure";
import { CommandProcessor, connectProcessors } from "../../abst/connector";
import { Message } from "../../abst/message";
import { Repository } from "./repo";

export interface PartialBranch {
  name: string;
}

export interface Branch {
  name: string;
  commit: {
    author: {
      avatar_url: string;
      login: string;
    };
  };
  _links: {
    html: string;
  };
}

export type Query = {
  fetchRepo: (
    owner: string,
    repoName: string
  ) => Promise<Repository>;
  fetchBranches: (
    owner: string,
    repoName: string
  ) => Promise<PartialBranch[]>;
  fetchABranch: (
    owner: string,
    repoName: string,
    branchName: string
  ) => Promise<Branch>;
};

const ghPattern = /^\/ghb\s+([^/\s]+)(\/([^/\s]+))?(\s+(.+))?$/;

const genSubCommands = (
  matches: RegExpMatchArray,
  query: Query
): CommandProcessor[] =>
  [
    externalBranch(matches[1])(matches[3], matches[5]),
    internalBranch(matches[1], matches[5]),
    externalBranchList(matches[1])(matches[3]),
    internalBranchList(matches[1]),
  ]
    .map((e) => e(query))
    .concat(replyFailure);

export const bringBranch = (query: Query) => async (
  analecta: Analecta,
  msg: Message
): Promise<boolean> => {
  const matches = await msg.matchCommand(ghPattern);
  if (matches == null) {
    return false;
  }

  return msg.withTyping(() =>
    connectProcessors(genSubCommands(matches, query))(analecta, msg)
  );
};

const externalBranchList = (owner?: string) => (repo?: string) => (
  query: Query
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  if (owner == null || repo == null) {
    return false;
  }
  try {
    const {
      name: repoName,
      html_url,
      owner: { avatar_url, html_url: owner_url, login },
    } = await query.fetchRepo(owner, repo);

    const fields: EmbedFieldData[] = (
      await query.fetchBranches(owner, repo)
    ).map(({ name }, i) => ({
      name: (i + 1).toString().padStart(2, "0"),
      value: `[${name}](https://github.com/${login}/${repoName}/tree/${name})`.toLowerCase(),
    }));
    if (fields.length <= 0) {
      await msg.reply(analecta.NothingToBring);
      return true;
    }

    await msg.sendEmbed(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor(login, avatar_url, owner_url)
        .setURL(html_url)
        .setTitle(repoName)
        .setFooter(analecta.EnumBranch)
        .addFields(fields)
    );
  } catch (_e) {
    return false;
  }

  return true;
};

const internalBranchList = externalBranchList("approvers");

const externalBranch = (owner?: string) => (repo?: string, branch?: string) => (
  query: Query
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  if (owner == null || repo == null || branch == null) {
    return false;
  }
  try {
    const {
      name,
      commit: {
        author: { avatar_url, login },
      },
      _links: { html },
    } = await query.fetchABranch(owner, repo, branch);

    await msg.sendEmbed(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor(
          login,
          avatar_url,
          `https://github.com/${login}`.toLowerCase()
        )
        .setURL(html)
        .setTitle(name)
        .setFooter(analecta.BringBranch)
    );
  } catch (_e) {
    return false;
  }

  return true;
};

const internalBranch = externalBranch("approvers");
