# github-secretary

あなたの GitHub 生活を豊かに。


## 設定

| 環境変数 | 説明 | デフォルト値 |
| -- | -- | -- |
| DISCORD_TOKEN | Discord の Bot のトークン | なし |
| TOML_PATH | セリフを登録した TOML ファイルのパス | `./analecta/laffey.toml` |
| NOTIFY_INTERVAL | 最新の通知データを取得するミリ秒間隔 | `10000` |
| FAUNA_SECRET | 通知システム用の Fauna DB のデータベースのシークレット | なし |


## やること

- [x] GitHub Organization での活動を通知する
  - [ ] OAuth で通知権限を承認できるようにする
- [x] 届いた通知にコマンドを送ると既読や完了にできる
- [x] 自分や他人から、レポジトリ、Issue、PR を持ってくる
  - [x] Issue/PR を持ってくる
  - [x] レポジトリの Issue/PR を列挙する
- [x] toml 設定ファイルでボットの発言内容をカスタマイズする
