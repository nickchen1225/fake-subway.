# Subway Web Arcade

一個可直接部署到 GitHub Pages 的原創無限跑酷 Web Arcade 範例。

## 功能

- 4 個原創主題
- Canvas 無限跑酷
- 鍵盤控制
- Xbox / 相容 Gamepad 控制
- Gamepad API
- 自訂鍵盤配置
- localStorage 保存設定與各主題最高分
- 暫停、重新開始、倒數
- 程式化背景、障礙物、金幣與簡單 Web Audio 音效
- 手機觸控按鈕
- 無需 Node.js / npm / 後端
- GitHub Pages 可直接部署

## GitHub Pages

1. 建立 GitHub repository。
2. 將本專案所有檔案放到 repository 根目錄。
3. GitHub → Settings → Pages。
4. Build and deployment 選 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/ (root)`。
6. 儲存後等待 GitHub Pages 發布。

## Xbox / Gamepad

請使用支援 Gamepad API 的現代瀏覽器，並在遊戲頁載入後連接控制器。

預設：
- 左類比左右：左右移
- A：跳躍
- B：滑行
- Start：暫停

不同控制器／瀏覽器可能回報不同按鍵編號；遊戲採用標準 Gamepad mapping，同時提供鍵盤控制作為備援。

## 授權與素材

本專案程式碼與圖形是為此範例原創製作。不要將官方 Subway Surfers 的 APK、遊戲檔、角色、貼圖、音樂或其他未授權資源放入公開 repository。
