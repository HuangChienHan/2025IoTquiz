# Render 部署說明

## 1. 建置指令 (Build Command)
在 Render 的 Settings 中，將 Build Command 設定為：
```bash
npm install && npm run build
```

## 2. 啟動指令 (Start Command)
將 Start Command 設定為：
```bash
npm start
```

## 3. 資料庫注意事項 (SQLite)
本專案使用 SQLite (`quiz.db`) 作為資料庫。
在 Render 平台上，預設的檔案系統是 **暫時性的 (Ephemeral)**，這代表：
- **每次重新部署或重啟後，資料庫資料將會遺失 (重置)。**
- 若需要保存資料，您必須在 Render 服務設定中新增 **Disk** (例如掛載於 `/data`)，並修改程式碼中的資料庫路徑指向 `/data/quiz.db`。
- 或者，您可以考慮使用外部資料庫服務 (如 Turso, Supabase, Postgres 等)。

目前的 `lib/db.ts` 設定是將資料庫放在專案根目錄 (`process.cwd() + '/quiz.db'`)。
