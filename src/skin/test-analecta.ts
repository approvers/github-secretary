import { Analecta } from '../exp/analecta.ts';

export const analectaForTest: Readonly<Analecta> = {
  Subscribe: 'ベンソン級駆逐艦ラフィー、命令を待っている……',
  Unsubscribe: '了解、命令が来るまで寝る……',
  NotSubscribed: 'まだ通知が登録されてなかったよ……',
  MarkAsRead: '既読にしておいた……',
  BringIssue: '指揮官に、メール……',
  BringPR: 'コードレビュー終わったら、一緒にワイン飲もう……',
  BringRepo: '頼まれた書類、持ってこれたよ……',
  NothingToBring: '任務は無いみたい……',
  EnumIssue: 'まだ任務がありそう……',
  EnumPR: 'うん……そこそこ……？',
  InvalidToken: 'トークンがおかしいみたい……',

  Failure: [
    'ラフィー、よくわからない……',
    '今日、何かしないといけないこと……覚えていない……',
    'ラフィーは指揮官が悪いなんて思ってない。うん、思ってない…(ツンツン',
  ],

  Flavor: [
    'Zzz……',
    '指揮官、一緒にねんねする？',
    'うん……二度寝しよう……',
    '指揮官、疲れた？',
    '指揮官、元気？',
  ],

  BlackPattern: '[母乳味こっぽんコッポンｺｯﾎﾟﾝHKTNhktn:○●_|*]',
  CallPattern: '寝る|寝ます|ねる|ねます|落ち|おち|疲れた|ラフィ|らふぃ',

  HelpMessage: `\`\`\`
Repository:   /ghr (所属/)レポジトリ名 ==> リポジトリを持ってくる……
Issue:        /ghi (所属/)レポジトリ名(/数字) ==> Issue を持ってくる……
PR:           /ghp (所属/)レポジトリ名(/数字) ==> PR を持ってくる……

Subscribe:    /ghs GitHubのID 通知トークン ==> GitHub 通知を DM にお届けする……
                    通知トークンはこちらから作ってね……
                    https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Secretary
Unsubscribe:  /ghu ==> GitHub 通知を DM にお届けしなくなる……
Mark as Read: /ghm 通知ID ==> GitHub 通知を既読にする……
                    通知ID は、私が送ったメッセージに入ってる
                    #012345678 の # 以降の数字部分だよ……
\`\`\``,
  ErrorMessage: 'そんなコマンド、知らない…… `/gh?` でヘルプを見てみて……',
};
