import { bringIssue } from './bring-issue';
import { flavor } from './flavor';
import { bringRepo } from './bring-repo';
import { connectProcessors, CommandProcessor } from '../abst/connector';
import { Analecta } from '../exp/analecta';
import { bringPR } from './bring-pr';

export const procs = (analecta: Analecta): CommandProcessor =>
  connectProcessors([flavor(new RegExp(analecta.CallPattern)), bringIssue, bringPR, bringRepo]);
