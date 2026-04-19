# あんまアプリ プロジェクトメモリ

あん摩マッサージ指圧師 国家試験 過去問出題Webアプリ（妹へのプレゼント）

---

## アプリの場所と公開URL

- **ローカル：** `/Users/segawashun/Documents/claude/あんまアプリ/quiz-app/`
- **GitHub：** `https://github.com/godivacod-ui/anma_kakomon_no_oni`
- **公開URL：** `https://godivacod-ui.github.io/anma_kakomon_no_oni/quiz-app/`

---

## 実装済み機能

- ジャンル複数選択・出題数設定
- 4択回答 → 即時フィードバック（正解緑・不正解赤）
- 症例文を別スタイルで表示
- 進捗バー・スコアのリアルタイム更新
- 結果画面：正解率円グラフ・ランク（S〜D）・ジャンル別成績バー
- 間違えた問題 → 復習モード
- 苦手問題の永続保存（localStorage）
- 複数正答対応（`answer_alt` フィールド）
- AI解説の免責メッセージ表示
- **選択肢別解説 + ポイントボックス表示**（quiz.html / quiz.js / style.css 実装済み）

---

## 解説フォーマット（新・現行）

旧フォーマット（`explanation` 単一文字列）は廃止。以下を使う：

```json
{
  "choice_explanations": [
    "1. 正しい。〜理由〜",
    "2. 誤り。〜理由〜",
    "3. 誤り。〜理由〜",
    "4. 誤り。〜理由〜"
  ],
  "point": "ポイントまとめ（覚え方・対比・関連知識）"
}
```

- 各選択肢は `"1. 正しい。"` または `"1. 誤り。"` で始める
- 「〜でないのはどれか」型は括弧補足 `（＝対象でない）` を使う
- 複数正答（`answer_alt` あり）は両正解に「正しい。」を書く
- 解説生成は **`anma-explanation` スキル** が担当する

---

## 問題データの状況

| 回次 | 問題数 | 解説 |
|------|--------|------|
| 第29回 | 160問 | ⚠️ 作業中（問1〜80完了・問81〜160未処理） |
| 第30回 | 160問 | ❌ 未対応 |
| 第31回 | 160問 | ❌ 未対応 |
| 第32回 | 160問 | ❌ 未対応 |
| 第33回 | 160問 | ❌ 未対応 |
| 第34回 | 160問 | ❌ 未対応 |

### 第29回 チャンク進捗

| チャンク | 問題番号 | 保存場所 |
|---------|---------|---------|
| chunk1 | 問1〜40 | `/tmp/q29_chunk1_new.json` ✅ |
| chunk2 | 問41〜80 | `/tmp/q29_chunk2_new.json` ✅ |
| chunk3 | 問81〜120 | 未処理 ❌ |
| chunk4 | 問121〜160 | 未処理 ❌ |

chunk3・4完成後、以下のPythonで統合：

```python
import json
chunks = []
for i in range(1, 5):
    with open(f'/tmp/q29_chunk{i}_new.json') as f:
        chunks.extend(json.load(f))
with open('/Users/segawashun/Documents/claude/あんまアプリ/quiz-app/data/questions_29.json', 'w', encoding='utf-8') as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)
```

---

## ジャンル別 問題番号

| 問題番号 | ジャンル |
|---------|---------|
| 1〜4 | 社会医学 |
| 5〜10 | 衛生学・公衆衛生学 |
| 11〜14 | 関係法規 |
| 15〜27 | 解剖学 |
| 28〜37 | 生理学 |
| 38〜62 | 臨床医学各論 |
| 63〜80 | リハビリテーション医学 |
| 81〜100 | 東洋医学概論 |
| 101〜120 | 経絡経穴概論 |
| 121〜140 | 東洋医学臨床論 |
| 141〜160 | あん摩マッサージ指圧理論 |

---

## スキル

| スキル名 | 用途 |
|---------|------|
| `anma-explanation` | 問題データに選択肢別解説・ポイントを生成して追加する |

呼び出し例：「第29回chunk3の解説を作って」「questions_30.jsonに解説を追加して」

---

## Claude Code 設定

`~/.claude/settings.json` に全ツール自動承認モードを設定済み（離席作業用）：

```json
{
  "permissions": { "defaultMode": "bypassPermissions" },
  "skipDangerousModePermissionPrompt": true
}
```

⚠️ 通常作業に戻る際は `"defaultMode": "default"` に変更すること。

---

## 残タスク

1. 第29回 chunk3（問81〜120）解説生成 → `anma-explanation` スキル使用
2. 第29回 chunk4（問121〜160）解説生成
3. 4チャンク統合 → `questions_29.json` 更新
4. `questions.js` 再生成（全回分まとめ）
5. GitHub プッシュ
6. 第30〜34回の解説生成（各160問）
7. `afk-mode` スキル作成（パーミッション切り替え用）
8. `~/.claude/settings.json` を通常モードに戻す

---

## GitHub 更新手順

```bash
cd /Users/segawashun/Documents/claude/あんまアプリ/quiz-app
git add data/questions.js data/questions_29.json  # 更新したファイルを指定
git commit -m "第XX回 解説フォーマット刷新（選択肢別解説＋ポイント）"
git push
```
