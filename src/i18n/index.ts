import { createI18n } from 'vue-i18n'
import type { Locale } from '../domain/game'

const zhHans = {
  brand: { name: 'CAIGE', tagline: '把猜歌局，变成一场好看的游戏' },
  mode: { label: '游戏模式', battle: '猜歌吃鸡', plain: '出你字母', battleNote: '轮流出招 · 全题失守即失败', plainNote: '无玩家 · 共享字符竞猜' },
  toolbar: { local: '仅保存在此设备', saved: '已自动保存', saving: '正在保存', help: '帮助', backup: '备份', theme: '主题', language: '语言', install: '安装应用' },
  theme: { system: '跟随系统', light: '亮色', dark: '暗色', settingsTitle: '主题与配色', settingsDescription: '拖动罗盘色环选择主题色；亮暗模式和战况图会同步使用。', appearance: '外观模式', hue: '主题色相', hueFineTune: '微调色相', hueValue: '色相数值', presets: '快速颜色', useHue: '使用 {hue} 度色相', preview: '实时预览', previewTitle: '主题色舞台', previewBody: '横幅与主要操作会随色相协调变化。', previewAction: '主要操作' },
  setup: {
    eyebrow: '设置 / 01', title: '开局设置', subtitle: '主持人先准备玩家、曲目与本局规则。', players: '玩家与顺序', questions: '题库', rules: '标准规则 · v1', collapse: '折叠开局设置', expand: '展开开局设置',
    editLocked: '对局进行中，设置已锁定。', unlock: '解锁编辑', noQuestions: '还没有题目。', sessionRules: '本局规则',
    sessionRulesPlaceholder: '例如：每人每轮限时 30 秒；不可使用搜索工具……', sessionRulesHint: '会显示在结算截图顶部；重置时可选择是否一并清空。',
  },
  player: { name: '玩家名', placeholder: '输入玩家名', status: { active: '存活', failed: '失败', winner: '胜者' }, questionCount: '{count} 道题' },
  question: {
    title: '题目名', titlePlaceholder: '例如：片头曲', source: '曲目来源', sourcePlaceholder: '选填，例如：动画、游戏或专辑名', sourceUnknown: '来源未填写',
    answer: '曲名原文', answerPlaceholder: '最多 256 个字符', author: '出题者', status: { active: '竞猜中', solved: '已猜出' },
  },
  rules: {
    allowSelf: '允许猜自己的题', globalLetters: '开字母作用于全部可猜题目', targetLetters: '开字母时指定题目', consumeMiss: '猜错也消耗回合',
    disallowSelf: '不允许猜自己的题', keepTurnOnMiss: '猜错不消耗回合', extraTurnOnCorrect: '猜中全曲后获得额外回合', noExtraTurnOnCorrect: '猜中全曲后不获得额外回合',
    autoWinner: '最后一位存活者自动获胜', manualWinner: '不自动判定最后一位存活者获胜', rulesetVersion: 'standard-v{version}', localConfig: '这些选择随存档保存，不会写死在字符引擎里。',
  },
  game: {
    title: '对局舞台', currentTurn: '现在轮到', nextPlayer: '下一位猜测者', waiting: '完成设置后开始对局', finished: '对局已结束', start: '开始对局',
    letter: '开字母', answer: '猜测全曲', inputLetter: '输入 1 个字符', target: '目标题目', submitLetter: '开出字符',
    answerIncorrect: '猜错', answerCorrect: '猜对', plainIntro: '输入一个字符，所有题目会同步揭示命中的位置。', allComplete: '所有题目都已完成',
    turnBadge: '回合', endBadge: '结束', sharedBadge: '共享', playerStandings: '玩家战况',
  },
  board: {
    eyebrow: '主持人状态板', title: '状态板', subtitle: '主持人可直接查看曲名和来源；点击单个字符格可切换自动、显示和隐藏。',
    empty: '先添加题目，状态板就会出现在这里。', anonymousQuestion: '题目 {number}', controlAuto: '自动判定', controlShow: '强制显示', controlHide: '强制隐藏',
    hidden: '未揭示', chars: '{count} 字符', hideSolvedAfterNextAction: '猜中曲目在下一次动作后从战况导出中隐藏；整局结束时重新显示',
  },
  history: {
    eyebrow: '时间线', title: '行动记录', guessedCharacters: '已开字符', noneGuessed: '尚未开过字符', empty: '还没有行动。第一步等你来。',
    letter: '开字符「{value}」', answer: '猜测全曲', actor: '{name} · {action}', result: { hit: '命中', miss: '未命中', invalid: '无效输入', solved: '主持人判定猜中' },
  },
  category: {
    eyebrow: '颜色图例', title: '字符图例', distinguish: '区分字符类型', latin: '英语字母', digit: '数字', 'ascii-symbol': '英文键盘符号', kana: '日语假名',
    hangul: '韩语谚文', cjk: 'CJK 汉字', 'other-letter': '其他字母', 'other-symbol': '其他符号',
  },
  actions: {
    gameActions: '对局操作', addPlayer: '添加玩家', addQuestion: '添加题目', randomPlayers: '随机玩家', randomQuestions: '随机题目',
    restorePlayers: '恢复玩家顺序', restoreQuestions: '恢复题目顺序', undo: '撤销上一步', reset: '重置本局', status: '导出战况', statusMenu: '打开战况导出菜单', copyTextStatus: '复制文字战况', copyCompatibleTextStatus: '复制兼容文字', copyImage: '复制战况图', copyImageHint: '复制战况图', saveImage: '保存战况图',
    export: '导出 JSON', import: '导入 JSON', delete: '删除', moveUp: '上移', moveDown: '下移', cancel: '取消', confirm: '确认', close: '关闭', update: '立即更新',
  },
  dialog: {
    resetTitle: '重置当前模式？', resetBody: '玩家、题目、猜测与主持人控制会被清空；另一个模式和全局偏好会保留。', clearSessionRules: '同时清空主持人填写的本局规则',
    undoTitle: '撤销上一步对局操作？', undoBody: '将恢复执行该操作前的题目、回合、猜测和控制状态。',
    deletePlayerTitle: '删除玩家及其题目？', deletePlayerBody: '该玩家关联的题目也会一并删除，此操作不能撤销。',
    importTitle: '导入会覆盖当前数据', importBody: '建议先导出备份。确认后将载入所选文件。',
    saveImageTitle: '保存战况图到本地？', saveImageBody: '将生成当前战况图并下载为 PNG 文件。',
  },
  help: {
    title: '主持人快速指南', intro: 'Caige 是一款完全本地运行的主持人工具。没有账号、没有云同步，答案只保存在当前设备。',
    step1Title: '1 · 准备题目', step1: '猜歌吃鸡中，每位玩家至少出 1 道题；出你字母则只需要题目。填写曲名原文和本局规则，曲目来源可选。',
    step2Title: '2 · 推进对局', step2: '开字母会按 Excel 的单向 Alias 表展开；猜测全曲时由主持人直接选择猜对或猜错。',
    step3Title: '3 · 主持人控制', step3: '字符底色始终提示类别；点击单个字符格可强制显示或隐藏。误操作可撤销；“导出战况”菜单可复制文字、复制图片或保存图片。',
    shortcuts: '快捷键', privacy: '战况图会保护未完成题目的答案；能访问浏览器存储或开发者工具的人仍可能读取原始数据。',
    keyG: '随机题目序列', keyR: '恢复题目序列', keyC: '重置本局', keyF: '打开战况导出菜单',
  },
  toast: {
    saved: '已保存到此设备', restored: '已恢复上次对局', exported: '备份已下载', imported: '备份已导入', copied: '战况图已复制', textCopied: '文字战况已复制', compatibleTextCopied: '兼容文字已复制', imageSaved: '战况图已保存到本地',
    downloaded: '浏览器不支持图片剪贴板，已下载 PNG', reset: '当前模式已重置', undone: '已撤销上一步对局操作', shuffled: '题目序列已随机',
    restoredOrder: '已恢复题目创建顺序', update: '有新版本可用', invalid: '请输入 1 个有效字符', invalidTarget: '请选择一道仍在竞猜中的题目',
    miss: '主持人判定未猜中，行动已记录', hit: '命中！状态板已更新', solved: '主持人判定猜中，题目已完成', started: '对局开始',
  },
  errors: {
    generic: '操作没有完成，请重试。', storage: '自动保存失败；当前内存中的对局仍可继续。', import: '文件不是有效的 Caige v1 备份。',
    players: { min: '至少需要 2 位玩家。' }, player: { name: '每位玩家都需要名字。', question: '每位玩家至少需要 1 道题。' },
    question: { required: '曲名原文不能为空。', length: '曲名原文不能超过 256 个字符。', author: '每道题都必须关联现有玩家。', target: '指定题目玩法至少需要 1 道题。' },
  },
  screenshot: { rules: '本局规则', appliedRules: '当前规则选项', players: '玩家存活情况', categories: '字符类型', guesses: '已开字符', guessOrder: 'A–Z / 0–9 / Unicode', history: '猜测历史', winnerQuestion: '胜者题目', answerHistory: '猜曲目 {number}', answerResult: { correct: '猜对', incorrect: '猜错' } },
  textStatus: { categories: '字符类型', guessed: '已猜', defaultCategory: '其他字符', disabledCategory: '已关闭类型显示', rules: '规则', nextPlayer: '下一个', category: { latin: '英文字母', digit: '数字', 'ascii-symbol': '英文键盘符号', kana: '假名', hangul: '韩文', cjk: '汉字', 'other-letter': '其他字母', 'other-symbol': '其他符号' } },
  pwa: { offlineReady: 'Caige 已可离线使用', updateAvailable: '有新版本。更新前会先保存当前对局。', installReady: '安装 Caige 到本机', installWaiting: 'PWA 正在准备或当前浏览器不提供安装提示', installPreparing: '开发版 Service Worker 已启用；刷新一次后可再次检查安装按钮', installUnavailable: '当前浏览器未提供安装提示；也可以使用浏览器菜单中的“安装应用”', installDismissed: '已取消安装', installed: 'Caige 已安装到本机' },
}

type MessageSchema<T> = { [Key in keyof T]: T[Key] extends string ? string : MessageSchema<T[Key]> }
type Messages = MessageSchema<typeof zhHans>
const defineMessages = (messages: Messages) => messages

const zhHant = defineMessages({
  brand: { name: 'CAIGE', tagline: '把猜歌局，變成一場好看的遊戲' },
  mode: { label: '遊戲模式', battle: '猜歌吃雞', plain: '出你字母', battleNote: '輪流出招 · 全題失守即失敗', plainNote: '無玩家 · 共享字元競猜' },
  toolbar: { local: '僅儲存在此裝置', saved: '已自動儲存', saving: '正在儲存', help: '說明', backup: '備份', theme: '主題', language: '語言', install: '安裝應用程式' },
  theme: { system: '跟隨系統', light: '亮色', dark: '暗色', settingsTitle: '主題與配色', settingsDescription: '拖動羅盤色環選擇主題色；亮暗模式和戰況圖會同步套用。', appearance: '外觀模式', hue: '主題色相', hueFineTune: '微調色相', hueValue: '色相數值', presets: '快速顏色', useHue: '使用 {hue} 度色相', preview: '即時預覽', previewTitle: '主題色舞台', previewBody: '橫幅與主要操作會隨色相協調變化。', previewAction: '主要操作' },
  setup: {
    eyebrow: '設定 / 01', title: '開局設定', subtitle: '主持人先準備玩家、曲目與本局規則。', players: '玩家與順序', questions: '題庫', rules: '標準規則 · v1', collapse: '摺疊開局設定', expand: '展開開局設定',
    editLocked: '對局進行中，設定已鎖定。', unlock: '解鎖編輯', noQuestions: '還沒有題目。', sessionRules: '本局規則',
    sessionRulesPlaceholder: '例如：每人每輪限時 30 秒；不可使用搜尋工具……', sessionRulesHint: '會顯示在結算圖片頂部；重設時可選擇是否一併清空。',
  },
  player: { name: '玩家名稱', placeholder: '輸入玩家名稱', status: { active: '存活', failed: '失敗', winner: '勝者' }, questionCount: '{count} 道題' },
  question: {
    title: '題目名稱', titlePlaceholder: '例如：片頭曲', source: '曲目來源', sourcePlaceholder: '選填，例如：動畫、遊戲或專輯名稱', sourceUnknown: '未填寫來源',
    answer: '曲名原文', answerPlaceholder: '最多 256 個字元', author: '出題者', status: { active: '競猜中', solved: '已猜出' },
  },
  rules: {
    allowSelf: '允許猜自己的題目', globalLetters: '開字母作用於全部可猜題目', targetLetters: '開字母時指定題目', consumeMiss: '猜錯也消耗回合',
    disallowSelf: '不允許猜自己的題目', keepTurnOnMiss: '猜錯不消耗回合', extraTurnOnCorrect: '猜中全曲後獲得額外回合', noExtraTurnOnCorrect: '猜中全曲後不獲得額外回合',
    autoWinner: '最後一位存活者自動獲勝', manualWinner: '不自動判定最後一位存活者獲勝', rulesetVersion: 'standard-v{version}', localConfig: '這些選項會隨存檔儲存，不會寫死在字元引擎中。',
  },
  game: {
    title: '對局舞台', currentTurn: '現在輪到', nextPlayer: '下一位猜測者', waiting: '完成設定後開始對局', finished: '對局已結束', start: '開始對局',
    letter: '開字母', answer: '猜測全曲', inputLetter: '輸入 1 個字元', target: '目標題目', submitLetter: '開出字元',
    answerIncorrect: '猜錯', answerCorrect: '猜對', plainIntro: '輸入一個字元，所有題目會同步揭示命中的位置。', allComplete: '所有題目都已完成',
    turnBadge: '回合', endBadge: '結束', sharedBadge: '共享', playerStandings: '玩家戰況',
  },
  board: {
    eyebrow: '主持人狀態板', title: '狀態板', subtitle: '主持人可直接查看曲名和來源；點擊單個字元格可切換自動、顯示和隱藏。',
    empty: '先新增題目，狀態板就會出現在這裡。', anonymousQuestion: '題目 {number}', controlAuto: '自動判定', controlShow: '強制顯示', controlHide: '強制隱藏',
    hidden: '未揭示', chars: '{count} 字元', hideSolvedAfterNextAction: '猜中曲目在下一次行動後從戰況匯出中隱藏；整局結束時重新顯示',
  },
  history: {
    eyebrow: '時間軸', title: '行動記錄', guessedCharacters: '已開字元', noneGuessed: '尚未開過字元', empty: '還沒有行動，第一步等你來。',
    letter: '開字元「{value}」', answer: '猜測全曲', actor: '{name} · {action}', result: { hit: '命中', miss: '未命中', invalid: '無效輸入', solved: '主持人判定猜中' },
  },
  category: {
    eyebrow: '顏色圖例', title: '字元圖例', distinguish: '區分字元類型', latin: '英文字母', digit: '數字', 'ascii-symbol': '英文鍵盤符號', kana: '日語假名',
    hangul: '韓語諺文', cjk: 'CJK 漢字', 'other-letter': '其他字母', 'other-symbol': '其他符號',
  },
  actions: {
    gameActions: '對局操作', addPlayer: '新增玩家', addQuestion: '新增題目', randomPlayers: '隨機玩家', randomQuestions: '隨機題目',
    restorePlayers: '恢復玩家順序', restoreQuestions: '恢復題目順序', undo: '復原上一步', reset: '重設本局', status: '匯出戰況', statusMenu: '開啟戰況匯出選單', copyTextStatus: '複製文字戰況', copyCompatibleTextStatus: '複製相容文字', copyImage: '複製戰況圖', copyImageHint: '複製戰況圖', saveImage: '儲存戰況圖',
    export: '匯出 JSON', import: '匯入 JSON', delete: '刪除', moveUp: '上移', moveDown: '下移', cancel: '取消', confirm: '確認', close: '關閉', update: '立即更新',
  },
  dialog: {
    resetTitle: '重設目前模式？', resetBody: '玩家、題目、猜測與主持人控制會被清空；另一個模式和全域偏好會保留。', clearSessionRules: '同時清空主持人填寫的本局規則',
    undoTitle: '復原上一步對局操作？', undoBody: '將恢復執行該操作前的題目、回合、猜測和控制狀態。',
    deletePlayerTitle: '刪除玩家及其題目？', deletePlayerBody: '該玩家關聯的題目也會一併刪除，此操作無法復原。',
    importTitle: '匯入會覆蓋目前資料', importBody: '建議先匯出備份。確認後將載入所選檔案。',
    saveImageTitle: '將戰況圖儲存到本機？', saveImageBody: '將產生目前的戰況圖並下載為 PNG 檔案。',
  },
  help: {
    title: '主持人快速指南', intro: 'Caige 是一款完全在本機執行的主持人工具。沒有帳號、沒有雲端同步，答案只儲存在目前裝置。',
    step1Title: '1 · 準備題目', step1: '猜歌吃雞中，每位玩家至少出 1 道題；出你字母則只需要題目。填寫曲名原文和本局規則，曲目來源可選填。',
    step2Title: '2 · 推進對局', step2: '開字母會依照 Excel 的單向 Alias 表展開；猜測全曲時由主持人直接選擇猜對或猜錯。',
    step3Title: '3 · 主持人控制', step3: '字元底色始終提示類別；點擊單個字元格可強制顯示或隱藏。誤操作可復原；「匯出戰況」選單可複製文字、複製圖片或儲存圖片。',
    shortcuts: '快捷鍵', privacy: '戰況圖會保護未完成題目的答案；能存取瀏覽器儲存空間或開發者工具的人仍可能讀取原始資料。',
    keyG: '隨機題目順序', keyR: '恢復題目順序', keyC: '重設本局', keyF: '開啟戰況匯出選單',
  },
  toast: {
    saved: '已儲存至此裝置', restored: '已恢復上次對局', exported: '備份已下載', imported: '備份已匯入', copied: '戰況圖已複製', textCopied: '文字戰況已複製', compatibleTextCopied: '相容文字已複製', imageSaved: '戰況圖已儲存至本機',
    downloaded: '瀏覽器不支援圖片剪貼簿，已下載 PNG', reset: '目前模式已重設', undone: '已復原上一步對局操作', shuffled: '題目順序已隨機排列',
    restoredOrder: '已恢復題目建立順序', update: '有新版本可用', invalid: '請輸入 1 個有效字元', invalidTarget: '請選擇一道仍在競猜中的題目',
    miss: '主持人判定未猜中，行動已記錄', hit: '命中！狀態板已更新', solved: '主持人判定猜中，題目已完成', started: '對局開始',
  },
  errors: {
    generic: '操作未完成，請再試一次。', storage: '自動儲存失敗；目前記憶體中的對局仍可繼續。', import: '檔案不是有效的 Caige v1 備份。',
    players: { min: '至少需要 2 位玩家。' }, player: { name: '每位玩家都需要名稱。', question: '每位玩家至少需要 1 道題。' },
    question: { required: '曲名原文不能為空。', length: '曲名原文不能超過 256 個字元。', author: '每道題都必須關聯現有玩家。', target: '指定題目玩法至少需要 1 道題。' },
  },
  screenshot: { rules: '本局規則', appliedRules: '目前規則選項', players: '玩家存活狀況', categories: '字元類型', guesses: '已開字元', guessOrder: 'A–Z / 0–9 / Unicode', history: '猜測歷史', winnerQuestion: '勝者題目', answerHistory: '猜曲目 {number}', answerResult: { correct: '猜對', incorrect: '猜錯' } },
  textStatus: { categories: '字元類型', guessed: '已猜', defaultCategory: '其他字元', disabledCategory: '已關閉類型顯示', rules: '規則', nextPlayer: '下一位', category: { latin: '英文字母', digit: '數字', 'ascii-symbol': '英文鍵盤符號', kana: '假名', hangul: '韓文', cjk: '漢字', 'other-letter': '其他字母', 'other-symbol': '其他符號' } },
  pwa: { offlineReady: 'Caige 已可離線使用', updateAvailable: '有新版本。更新前會先儲存目前對局。', installReady: '將 Caige 安裝到本機', installWaiting: 'PWA 正在準備，或目前瀏覽器未提供安裝提示', installPreparing: '開發版 Service Worker 已啟用；重新整理一次後可再次檢查安裝按鈕', installUnavailable: '目前瀏覽器未提供安裝提示；也可使用瀏覽器選單中的「安裝應用程式」', installDismissed: '已取消安裝', installed: 'Caige 已安裝到本機' },
})

const enUS = defineMessages({
  brand: { name: 'CAIGE', tagline: 'Turn a guessing round into a great-looking game' },
  mode: { label: 'Game mode', battle: 'Song Battle Royale', plain: 'Give Your Letters', battleNote: 'Take turns · Lose when every song falls', plainNote: 'No players · Shared character reveals' },
  toolbar: { local: 'Stored on this device only', saved: 'Autosaved', saving: 'Saving', help: 'Help', backup: 'Backup', theme: 'Theme', language: 'Language', install: 'Install app' },
  theme: { system: 'System', light: 'Light', dark: 'Dark', settingsTitle: 'Theme & color', settingsDescription: 'Drag around the compass wheel to choose an accent hue. Appearance and game images update with it.', appearance: 'Appearance', hue: 'Accent hue', hueFineTune: 'Fine-tune hue', hueValue: 'Hue value', presets: 'Quick colors', useHue: 'Use hue {hue}°', preview: 'LIVE PREVIEW', previewTitle: 'Hue-colored stage', previewBody: 'The banner and primary actions adapt to your hue.', previewAction: 'Primary action' },
  setup: {
    eyebrow: 'SETUP / 01', title: 'Game setup', subtitle: 'Prepare the players, songs, and round rules.', players: 'Players & order', questions: 'Question bank', rules: 'Standard rules · v1', collapse: 'Collapse game setup', expand: 'Expand game setup',
    editLocked: 'Setup is locked while the game is active.', unlock: 'Unlock setup', noQuestions: 'No questions yet.', sessionRules: 'Round rules',
    sessionRulesPlaceholder: 'For example: 30 seconds per turn; no search tools…', sessionRulesHint: 'Shown at the top of the result image; resetting can optionally clear it.',
  },
  player: { name: 'Player name', placeholder: 'Enter a player name', status: { active: 'Alive', failed: 'Failed', winner: 'Winner' }, questionCount: '{count} questions' },
  question: {
    title: 'Question name', titlePlaceholder: 'e.g. Opening theme', source: 'Song source', sourcePlaceholder: 'Optional: anime, game, or album', sourceUnknown: 'Source not provided',
    answer: 'Original song title', answerPlaceholder: 'Up to 256 characters', author: 'Author', status: { active: 'In play', solved: 'Solved' },
  },
  rules: {
    allowSelf: 'Allow players to target their own questions', globalLetters: 'Revealed characters apply to all eligible questions', targetLetters: 'Choose a target when revealing a character',
    consumeMiss: 'A miss consumes the turn', disallowSelf: 'Players cannot target their own questions', keepTurnOnMiss: 'A miss does not consume the turn', extraTurnOnCorrect: 'Grant an extra turn after a correct full-song guess', noExtraTurnOnCorrect: 'Do not grant an extra turn after a correct full-song guess',
    autoWinner: 'Last active player wins automatically', manualWinner: 'Do not automatically declare the last active player the winner', rulesetVersion: 'standard-v{version}', localConfig: 'These choices are saved with the game, not hard-coded into the character engine.',
  },
  game: {
    title: 'Game stage', currentTurn: 'Up now', nextPlayer: 'Next guesser', waiting: 'Finish setup to start', finished: 'Game finished', start: 'Start game',
    letter: 'Reveal a character', answer: 'Guess the full song', inputLetter: 'Enter 1 character', target: 'Target question', submitLetter: 'Reveal',
    answerIncorrect: 'Incorrect', answerCorrect: 'Correct', plainIntro: 'Enter one character to reveal every matching position.', allComplete: 'Every question is complete',
    turnBadge: 'TURN', endBadge: 'END', sharedBadge: 'SHARED', playerStandings: 'Player standings',
  },
  board: {
    eyebrow: 'HOST STATUS BOARD', title: 'Status board', subtitle: 'The host can see song titles and sources; click an individual tile to cycle automatic, shown, and hidden.',
    empty: 'Add a question and the status board will appear here.', anonymousQuestion: 'Question {number}', controlAuto: 'Automatic', controlShow: 'Force shown', controlHide: 'Force hidden',
    hidden: 'Hidden', chars: '{count} chars', hideSolvedAfterNextAction: 'Hide solved songs from exports after the next action; show all again when the game ends',
  },
  history: {
    eyebrow: 'TIMELINE', title: 'Action history', guessedCharacters: 'Revealed characters', noneGuessed: 'No characters revealed yet', empty: 'No actions yet. Make the first move.',
    letter: 'revealed “{value}”', answer: 'guessed the full song', actor: '{name} · {action}', result: { hit: 'Hit', miss: 'Miss', invalid: 'Invalid', solved: 'Accepted by host' },
  },
  category: {
    eyebrow: 'COLOR KEY', title: 'Character legend', distinguish: 'Distinguish character types', latin: 'Latin letters', digit: 'Digits', 'ascii-symbol': 'English keyboard symbols', kana: 'Japanese kana',
    hangul: 'Korean Hangul', cjk: 'CJK ideographs', 'other-letter': 'Other letters', 'other-symbol': 'Other symbols',
  },
  actions: {
    gameActions: 'Game actions', addPlayer: 'Add player', addQuestion: 'Add question', randomPlayers: 'Shuffle players', randomQuestions: 'Shuffle questions',
    restorePlayers: 'Restore player order', restoreQuestions: 'Restore question order', undo: 'Undo last action', reset: 'Reset game', status: 'Export status', statusMenu: 'Open the status export menu', copyTextStatus: 'Copy text status', copyCompatibleTextStatus: 'Copy compatible text', copyImage: 'Copy game image', copyImageHint: 'Copy game image', saveImage: 'Save game image',
    export: 'Export JSON', import: 'Import JSON', delete: 'Delete', moveUp: 'Move up', moveDown: 'Move down', cancel: 'Cancel', confirm: 'Confirm', close: 'Close', update: 'Update now',
  },
  dialog: {
    resetTitle: 'Reset the current mode?', resetBody: 'Players, questions, guesses, and host controls will be cleared. The other mode and global preferences remain.', clearSessionRules: 'Also clear the round rules entered by the host',
    undoTitle: 'Undo the last game action?', undoBody: 'Questions, turn, guesses, and controls will return to their previous state.',
    deletePlayerTitle: 'Delete this player and their questions?', deletePlayerBody: 'Questions linked to this player will also be deleted. This cannot be undone.',
    importTitle: 'Importing will replace current data', importBody: 'Export a backup first if needed. Confirm to load the selected file.',
    saveImageTitle: 'Save the game image to this device?', saveImageBody: 'A PNG of the current game board will be generated and downloaded.',
  },
  help: {
    title: 'Host quick guide', intro: 'Caige is a fully local host tool. There are no accounts or cloud sync; answers stay on this device.',
    step1Title: '1 · Prepare questions', step1: 'In Song Battle Royale, every player contributes at least one question. Give Your Letters only needs questions. Enter the original title and round rules; the song source is optional.',
    step2Title: '2 · Run the game', step2: 'Character reveals expand through the one-way Excel Alias table. For a full-song guess, the host directly chooses Correct or Incorrect.',
    step3Title: '3 · Host controls', step3: 'Tile backgrounds always show character categories. Click a tile to force it shown or hidden. Undo restores mistakes; Export status can copy text, copy an image, or save an image.',
    shortcuts: 'Shortcuts', privacy: 'The game image protects answers to unfinished questions. Anyone with access to browser storage or developer tools may still read the raw data.',
    keyG: 'Shuffle question order', keyR: 'Restore question order', keyC: 'Reset game', keyF: 'Open the status export menu',
  },
  toast: {
    saved: 'Saved on this device', restored: 'Previous game restored', exported: 'Backup downloaded', imported: 'Backup imported', copied: 'Game image copied', textCopied: 'Text status copied', compatibleTextCopied: 'Compatible text copied', imageSaved: 'Game image saved to this device',
    downloaded: 'Image clipboard is unavailable; a PNG was downloaded', reset: 'Current mode reset', undone: 'Last game action undone', shuffled: 'Question order shuffled',
    restoredOrder: 'Question creation order restored', update: 'A new version is available', invalid: 'Enter 1 valid character', invalidTarget: 'Select a question that is still in play',
    miss: 'Host marked it incorrect; the action was recorded', hit: 'Hit! The status board was updated', solved: 'Host marked it correct; the question is complete', started: 'Game started',
  },
  errors: {
    generic: 'The operation did not complete. Try again.', storage: 'Autosave failed; the in-memory game can continue.', import: 'This file is not a valid Caige v1 backup.',
    players: { min: 'At least 2 players are required.' }, player: { name: 'Every player needs a name.', question: 'Every player needs at least 1 question.' },
    question: { required: 'The original song title is required.', length: 'The original song title cannot exceed 256 characters.', author: 'Every question must be linked to an existing player.', target: 'Targeted-character mode requires at least 1 question.' },
  },
  screenshot: { rules: 'ROUND RULES', appliedRules: 'CURRENT RULE OPTIONS', players: 'PLAYER SURVIVAL', categories: 'CHARACTER TYPES', guesses: 'REVEALED CHARACTERS', guessOrder: 'A–Z / 0–9 / Unicode', history: 'GUESS HISTORY', winnerQuestion: "WINNER'S QUESTION", answerHistory: 'guessed song {number}', answerResult: { correct: 'correct', incorrect: 'incorrect' } },
  textStatus: { categories: 'Character types', guessed: 'Guessed', defaultCategory: 'Other characters', disabledCategory: 'Type display disabled', rules: 'Rules', nextPlayer: 'Next', category: { latin: 'Latin letters', digit: 'Digits', 'ascii-symbol': 'English keyboard symbols', kana: 'Kana', hangul: 'Hangul', cjk: 'CJK', 'other-letter': 'Other letters', 'other-symbol': 'Other symbols' } },
  pwa: { offlineReady: 'Caige is ready offline', updateAvailable: 'A new version is available. The current game will be saved before updating.', installReady: 'Install Caige on this device', installWaiting: 'The PWA is preparing or this browser does not expose an install prompt', installPreparing: 'The development service worker is enabled. Refresh once, then check the install button again.', installUnavailable: 'This browser did not expose an install prompt. You can also use its Install app menu.', installDismissed: 'Installation canceled', installed: 'Caige was installed on this device' },
})

const jaJP = defineMessages({
  brand: { name: 'CAIGE', tagline: '曲当てゲームを、もっと見やすく楽しく' },
  mode: { label: 'ゲームモード', battle: '曲当てバトルロイヤル', plain: '文字をどうぞ', battleNote: '順番に行動 · 全問正解されたら脱落', plainNote: 'プレイヤーなし · 文字を共有して開示' },
  toolbar: { local: 'この端末のみに保存', saved: '自動保存済み', saving: '保存中', help: 'ヘルプ', backup: 'バックアップ', theme: 'テーマ', language: '言語', install: 'アプリをインストール' },
  theme: { system: 'システム', light: 'ライト', dark: 'ダーク', settingsTitle: 'テーマと配色', settingsDescription: 'コンパス型の色相環をドラッグしてテーマ色を選択します。表示モードと戦況画像にも反映されます。', appearance: '表示モード', hue: 'テーマ色相', hueFineTune: '色相の微調整', hueValue: '色相値', presets: 'クイックカラー', useHue: '色相 {hue} 度を使用', preview: 'ライブプレビュー', previewTitle: 'テーマカラーステージ', previewBody: 'バナーと主要操作が選択した色相に合わせて変化します。', previewAction: '主要操作' },
  setup: {
    eyebrow: '設定 / 01', title: 'ゲーム設定', subtitle: '司会者がプレイヤー・曲・今回のルールを準備します。', players: 'プレイヤーと順番', questions: '問題集', rules: '標準ルール · v1', collapse: 'ゲーム設定を折りたたむ', expand: 'ゲーム設定を展開',
    editLocked: 'ゲーム中は設定がロックされています。', unlock: '編集ロックを解除', noQuestions: '問題がありません。', sessionRules: '今回のルール',
    sessionRulesPlaceholder: '例：1ターン30秒、検索ツールは禁止…', sessionRulesHint: '結果画像の上部に表示されます。リセット時に消去するか選択できます。',
  },
  player: { name: 'プレイヤー名', placeholder: 'プレイヤー名を入力', status: { active: '生存', failed: '脱落', winner: '勝者' }, questionCount: '{count} 問' },
  question: {
    title: '問題名', titlePlaceholder: '例：オープニング曲', source: '曲の出典', sourcePlaceholder: '任意：アニメ・ゲーム・アルバム名', sourceUnknown: '出典未入力',
    answer: '曲名原文', answerPlaceholder: '256文字以内', author: '出題者', status: { active: '回答受付中', solved: '正解済み' },
  },
  rules: {
    allowSelf: '自分の問題への回答を許可', globalLetters: '開示した文字を回答可能な全問題に適用', targetLetters: '文字を開示するときに問題を指定',
    consumeMiss: '不正解でもターンを消費', disallowSelf: '自分の問題への回答を許可しない', keepTurnOnMiss: '不正解ではターンを消費しない', extraTurnOnCorrect: '曲名を正解したら追加ターンを獲得', noExtraTurnOnCorrect: '曲名を正解しても追加ターンを獲得しない',
    autoWinner: '最後の生存者を自動的に勝者にする', manualWinner: '最後の生存者を自動的に勝者にしない', rulesetVersion: 'standard-v{version}', localConfig: 'これらの設定はゲームと一緒に保存され、文字エンジンには固定されません。',
  },
  game: {
    title: 'ゲームステージ', currentTurn: '現在の回答者', nextPlayer: '次の回答者', waiting: '設定を完了して開始', finished: 'ゲーム終了', start: 'ゲーム開始',
    letter: '文字を開く', answer: '曲名を当てる', inputLetter: '1文字入力', target: '対象の問題', submitLetter: '文字を開く',
    answerIncorrect: '不正解', answerCorrect: '正解', plainIntro: '1文字入力すると、すべての問題で一致する位置が開きます。', allComplete: 'すべての問題が完了しました',
    turnBadge: 'ターン', endBadge: '終了', sharedBadge: '共有', playerStandings: 'プレイヤー状況',
  },
  board: {
    eyebrow: '司会者用ステータス', title: 'ステータス', subtitle: '司会者には曲名と出典を常に表示します。個別の文字タイルをクリックすると、自動・表示・非表示を切り替えられます。',
    empty: '問題を追加すると、ここに表示されます。', anonymousQuestion: '問題 {number}', controlAuto: '自動判定', controlShow: '強制表示', controlHide: '強制非表示',
    hidden: '未開示', chars: '{count} 文字', hideSolvedAfterNextAction: '正解済みの曲を次の操作後に戦況出力から非表示にし、ゲーム終了時にすべて再表示する',
  },
  history: {
    eyebrow: 'タイムライン', title: '操作履歴', guessedCharacters: '開示済み文字', noneGuessed: 'まだ文字は開示されていません', empty: 'まだ操作がありません。最初の操作を行ってください。',
    letter: '「{value}」を開示', answer: '曲名を回答', actor: '{name} · {action}', result: { hit: '一致', miss: '不一致', invalid: '無効', solved: '司会者が正解と判定' },
  },
  category: {
    eyebrow: 'カラーキー', title: '文字種の凡例', distinguish: '文字種を区別', latin: '英字', digit: '数字', 'ascii-symbol': '英語キーボード記号', kana: '日本語の仮名',
    hangul: '韓国語ハングル', cjk: 'CJK 漢字', 'other-letter': 'その他の文字', 'other-symbol': 'その他の記号',
  },
  actions: {
    gameActions: 'ゲーム操作', addPlayer: 'プレイヤー追加', addQuestion: '問題追加', randomPlayers: 'プレイヤーをシャッフル', randomQuestions: '問題をシャッフル',
    restorePlayers: 'プレイヤー順を戻す', restoreQuestions: '問題順を戻す', undo: '1手戻す', reset: 'リセット', status: '戦況を書き出す', statusMenu: '戦況出力メニューを開く', copyTextStatus: '文字戦況をコピー', copyCompatibleTextStatus: '互換文字をコピー', copyImage: '戦況画像をコピー', copyImageHint: '戦況画像をコピー', saveImage: '戦況画像を保存',
    export: 'JSONを書き出す', import: 'JSONを読み込む', delete: '削除', moveUp: '上へ', moveDown: '下へ', cancel: 'キャンセル', confirm: '確認', close: '閉じる', update: '今すぐ更新',
  },
  dialog: {
    resetTitle: '現在のモードをリセットしますか？', resetBody: 'プレイヤー・問題・回答・司会者の制御を消去します。別モードと全体設定は保持されます。', clearSessionRules: '司会者が入力した今回のルールも消去する',
    undoTitle: '直前のゲーム操作を取り消しますか？', undoBody: '問題・ターン・回答・制御を操作前の状態に戻します。',
    deletePlayerTitle: 'プレイヤーとその問題を削除しますか？', deletePlayerBody: 'このプレイヤーに関連する問題も削除されます。この操作は取り消せません。',
    importTitle: '読み込むと現在のデータが上書きされます', importBody: '必要なら先にバックアップを書き出してください。確認すると選択したファイルを読み込みます。',
    saveImageTitle: '戦況画像をこの端末に保存しますか？', saveImageBody: '現在の戦況画像を生成し、PNG ファイルとしてダウンロードします。',
  },
  help: {
    title: '司会者クイックガイド', intro: 'Caige は完全にローカルで動作する司会者用ツールです。アカウントもクラウド同期もなく、答えはこの端末だけに保存されます。',
    step1Title: '1 · 問題を準備', step1: '曲当てバトルロイヤルでは各プレイヤーが1問以上出題します。「文字をどうぞ」では問題だけを用意します。曲名原文と今回のルールを入力してください。出典は任意です。',
    step2Title: '2 · ゲームを進行', step2: '文字の開示は Excel の一方向 Alias 表に従って展開されます。曲名回答は司会者が正解または不正解を直接選択します。',
    step3Title: '3 · 司会者の操作', step3: '背景色は常に文字種を示します。文字タイルをクリックして強制表示・非表示を切り替えられます。誤操作は取り消せます。「戦況を書き出す」から文字・画像のコピーや画像保存ができます。',
    shortcuts: 'ショートカット', privacy: '戦況画像では未完了問題の答えを保護します。ブラウザーの保存領域や開発者ツールにアクセスできる人は元データを読める可能性があります。',
    keyG: '問題順をシャッフル', keyR: '問題順を戻す', keyC: 'ゲームをリセット', keyF: '戦況出力メニューを開く',
  },
  toast: {
    saved: 'この端末に保存しました', restored: '前回のゲームを復元しました', exported: 'バックアップをダウンロードしました', imported: 'バックアップを読み込みました', copied: '戦況画像をコピーしました', textCopied: '文字戦況をコピーしました', compatibleTextCopied: '互換文字をコピーしました', imageSaved: '戦況画像をこの端末に保存しました',
    downloaded: '画像クリップボードを利用できないため、PNGをダウンロードしました', reset: '現在のモードをリセットしました', undone: '直前のゲーム操作を取り消しました', shuffled: '問題順をシャッフルしました',
    restoredOrder: '問題の作成順に戻しました', update: '新しいバージョンがあります', invalid: '有効な1文字を入力してください', invalidTarget: '回答受付中の問題を選択してください',
    miss: '司会者が不正解と判定し、操作を記録しました', hit: '一致しました。ステータスを更新しました', solved: '司会者が正解と判定し、問題が完了しました', started: 'ゲームを開始しました',
  },
  errors: {
    generic: '操作を完了できませんでした。もう一度お試しください。', storage: '自動保存に失敗しました。メモリ内のゲームは続行できます。', import: '有効な Caige v1 バックアップではありません。',
    players: { min: '2人以上のプレイヤーが必要です。' }, player: { name: 'すべてのプレイヤーに名前が必要です。', question: '各プレイヤーに1問以上必要です。' },
    question: { required: '曲名原文を入力してください。', length: '曲名原文は256文字以内にしてください。', author: 'すべての問題を既存のプレイヤーに関連付けてください。', target: '問題指定モードには1問以上必要です。' },
  },
  screenshot: { rules: '今回のルール', appliedRules: '現在のルール設定', players: 'プレイヤー生存状況', categories: '文字種', guesses: '開示済み文字', guessOrder: 'A–Z / 0–9 / Unicode', history: '回答履歴', winnerQuestion: '勝者の問題', answerHistory: '曲 {number} を回答', answerResult: { correct: '正解', incorrect: '不正解' } },
  textStatus: { categories: '文字種', guessed: '回答済み', defaultCategory: 'その他の文字', disabledCategory: '文字種表示はオフ', rules: 'ルール', nextPlayer: '次', category: { latin: '英字', digit: '数字', 'ascii-symbol': '英語キーボード記号', kana: '仮名', hangul: 'ハングル', cjk: '漢字', 'other-letter': 'その他の文字', 'other-symbol': 'その他の記号' } },
  pwa: { offlineReady: 'Caige をオフラインで使用できます', updateAvailable: '新しいバージョンがあります。更新前に現在のゲームを保存します。', installReady: 'Caige をこの端末にインストール', installWaiting: 'PWA の準備中、またはこのブラウザーではインストール案内を利用できません', installPreparing: '開発用 Service Worker は有効です。一度再読み込みしてからインストールボタンを確認してください。', installUnavailable: 'このブラウザーではインストール案内を利用できません。ブラウザーメニューの「アプリをインストール」も使用できます。', installDismissed: 'インストールをキャンセルしました', installed: 'Caige をこの端末にインストールしました' },
})

export const messages: Record<Locale, Messages> = { 'zh-Hans': zhHans, 'zh-Hant': zhHant, 'en-US': enUS, 'ja-JP': jaJP }

export const i18n = createI18n({ legacy: false, locale: 'zh-Hans', fallbackLocale: 'zh-Hans', messages })
