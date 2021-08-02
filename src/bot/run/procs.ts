import { CommandProcessor, connectProcessors } from "../abst/connector";
import type { AllApi } from "../abst/api";
import type { Analecta } from "../exp/analecta";
import type { UserDatabase } from "../abst/user-database";
import { bringBranch } from "../play/bring/branch";
import { bringIssue } from "../play/bring/issue";
import { bringPR } from "../play/bring/pr";
import { bringRepo } from "../play/bring/repo";
import { error } from "../play/error";
import { flavor } from "../play/flavor";
import { markAsRead } from "../play/subscribe/mark-as-read";
// eslint-disable-next-line max-len
import { subscribeNotification } from "../play/subscribe/subscribe-notification";
import { unsubNotification } from "../play/subscribe/unsubscribe-notification";

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
