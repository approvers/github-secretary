import { bringIssue } from './bring-issue';
import { flavor } from './flavor';
import { connectProcessors, CommandProcessor } from '../abst/connector';
import { Analecta } from '../exp/analecta';

export const procs = (analecta: Analecta): CommandProcessor =>
  connectProcessors([flavor(new RegExp(analecta.CallPattern)), bringIssue]);
