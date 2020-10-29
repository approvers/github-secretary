import { CommandProcessor, connectProcessors } from "../abst/connector";
import type { Query, UserDatabase } from "../op/interfaces";
import type { Analecta } from "../exp/analecta";
import { bringBranch } from "../op/bring/branch";
import { bringIssue } from "../op/bring/issue";
import { bringPR } from "../op/bring/pr";
import { bringRepo } from "../op/bring/repo";
import { error } from "../op/error";
import { flavor } from "../op/flavor";
import { markAsRead } from "../op/subscribe/mark-as-read";
import { subscribeNotification } from "../op/subscribe/subscribe-notification";
import { unsubNotification } from "../op/subscribe/unsubscribe-notification";

export const procs = (
  analecta: Analecta,
  db: UserDatabase,
  query: Query,
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
