import { createI18n } from 'vue-i18n'
import type { Locale } from '../domain/game'

const zhHans = {
  brand: { name: 'CAIGE', tagline: '把猜歌局，变成一场好看的游戏' },
  mode: { label: '游戏模式', battle: '猜歌吃鸡', plain: '出你字母', battleNote: '轮流出招 · 全题失守即失败', plainNote: '无玩家 · 共享字符竞猜' },
  toolbar: { local: '仅保存在此设备', saved: '已自动保存', saving: '正在保存', help: '帮助', backup: '备份', theme: '主题', language: '语言', install: '安装应用' },
  theme: { system: '跟随系统', light: '亮色', dark: '暗色' },
  setup: { title: '开局设置', subtitle: '先把人和题摆好，开局后答案会收起。', players: '玩家与顺序', questions: '题库', rules: '标准规则 · v1', editLocked: '对局进行中，设置已锁定。', unlock: '解锁编辑', noQuestions: '还没有题目。' },
  player: { name: '玩家名', placeholder: '输入玩家名', status: { active: '存活', failed: '失败', winner: '胜者' }, questionCount: '{count} 道题' },
  question: { title: '题目名', titlePlaceholder: '例如：片头曲', answer: '答案', answerPlaceholder: '最多 100 个字符', author: '出题者', status: { active: '竞猜中', solved: '已猜出' }, hostControl: '题目状态', showAnswer: '显示答案', hideAnswer: '隐藏答案' },
  rules: { allowSelf: '允许猜自己的题', globalLetters: '猜字母作用于全部可猜题目', targetLetters: '猜字母时指定题目', consumeMiss: '猜错也消耗回合', autoWinner: '最后一位存活者自动获胜', localConfig: '这些选择随存档保存，不会写死在字符引擎里。' },
  game: { title: '对局舞台', currentTurn: '现在轮到', waiting: '完成设置后开始对局', finished: '对局已结束', start: '开始对局', letter: '猜一个字母', answer: '直接猜答案', inputLetter: '输入 1 个字符', inputAnswer: '输入完整答案', target: '目标题目', allTargets: '全部可猜题目', submit: '提交行动', plainIntro: '输入一个字符，所有题目会同步揭示命中的位置。', allComplete: '所有题目都已完成' },
  board: { title: '状态板', subtitle: '点击字符格可切换：自动 → 显示 → 隐藏', empty: '先添加题目，状态板就会出现在这里。', overallAuto: '自动判定', markSolved: '标为已猜出', bulkAuto: '全部自动', bulkShow: '全部显示', bulkHide: '全部隐藏', hidden: '未揭示', chars: '{count} 字符' },
  history: { title: '行动记录', empty: '还没有行动。第一步等你来。', letter: '猜字母「{value}」', answer: '直猜「{value}」', actor: '{name} · {action}', result: { hit: '命中', miss: '未命中', invalid: '无效输入', solved: '猜中答案' } },
  category: { title: '字符图例', distinguish: '区分字符类型', latin: '英语字母', digit: '数字', 'ascii-symbol': 'ASCII 符号', kana: '日语假名', hangul: '韩语谚文', cjk: 'CJK 汉字', 'other-letter': '其他字母', 'other-symbol': '其他符号' },
  actions: { addPlayer: '添加玩家', addQuestion: '添加题目', randomPlayers: '随机玩家', randomQuestions: '随机题目', restorePlayers: '恢复玩家顺序', restoreQuestions: '恢复题目顺序', reset: '重置本局', copyImage: '复制战况图', export: '导出 JSON', import: '导入 JSON', delete: '删除', moveUp: '上移', moveDown: '下移', cancel: '取消', confirm: '确认', close: '关闭', update: '立即更新' },
  dialog: { resetTitle: '重置当前模式？', resetBody: '玩家、题目、猜测与主持人控制会被清空；另一个模式和全局偏好会保留。', deletePlayerTitle: '删除玩家及其题目？', deletePlayerBody: '该玩家关联的题目也会一并删除，此操作不能撤销。', importTitle: '导入会覆盖当前数据', importBody: '建议先导出备份。确认后将载入所选文件。' },
  help: { title: '主持人快速指南', intro: 'Caige 是一款完全本地运行的猜歌与字符竞猜工具。没有账号、没有云同步，答案只保存在当前设备。', step1Title: '1 · 准备题目', step1: '猜歌吃鸡中，每位玩家至少出 1 道题；出你字母则只需要题目。答案最多 100 个 Unicode 码点。', step2Title: '2 · 推进对局', step2: '猜一个字母，或选择题目直接猜完整答案。字符会按等价表匹配，英文字母不区分大小写。', step3Title: '3 · 主持人控制', step3: '点击字符格可强制显示或隐藏；强制隐藏优先于自动命中。题目也可直接标记为已猜出。', shortcuts: '快捷键', privacy: '隐藏答案只是界面保护。能访问浏览器存储或开发者工具的人仍可能读取答案。', keyG: '随机顺序', keyR: '恢复顺序', keyC: '重置本局', keyF: '复制战况图' },
  toast: { saved: '已保存到此设备', restored: '已恢复上次对局', exported: '备份已下载', imported: '备份已导入', copied: '战况图已复制', downloaded: '浏览器不支持图片剪贴板，已下载 PNG', reset: '当前模式已重置', shuffled: '顺序已随机', restoredOrder: '已恢复创建顺序', update: '有新版本可用', invalid: '请输入 1 个有效字符', miss: '没有命中，但行动已记录', hit: '命中！状态板已更新', solved: '猜中了！题目已完成', started: '对局开始' },
  errors: { generic: '操作没有完成，请重试。', storage: '自动保存失败；当前内存中的对局仍可继续。', import: '文件不是有效的 Caige v1 备份。', 'players.min': '至少需要 2 位玩家。', 'player.name': '每位玩家都需要名字。', 'player.question': '每位玩家至少需要 1 道题。', 'question.required': '题目名和答案不能为空。', 'question.length': '答案不能超过 100 个字符。', 'question.author': '每道题都必须关联现有玩家。', 'question.target': '指定题目玩法至少需要 1 道题。' },
  pwa: { offlineReady: 'Caige 已可离线使用', updateAvailable: '有新版本。更新前会先保存当前对局。' },
}

type Messages = typeof zhHans
function deepMerge(base: Messages, override: Record<string, unknown>): Messages {
  const result = structuredClone(base) as Record<string, unknown>
  const merge = (target: Record<string, unknown>, source: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] && typeof target[key] === 'object' ? target[key] : {}
        merge(target[key] as Record<string, unknown>, value as Record<string, unknown>)
      } else target[key] = value
    }
  }
  merge(result, override)
  return result as Messages
}

const zhHant = deepMerge(zhHans, {
  brand: { tagline: '把猜歌局，變成一場好看的遊戲' },
  mode: { label: '遊戲模式', battle: '猜歌吃雞', plain: '出你字母', battleNote: '輪流出招 · 全題失守即失敗', plainNote: '無玩家 · 共享字元競猜' },
  toolbar: { local: '僅儲存在此裝置', saved: '已自動儲存', saving: '正在儲存', help: '說明', backup: '備份', theme: '主題', language: '語言' },
  setup: { title: '開局設定', subtitle: '先把人和題擺好，開局後答案會收起。', players: '玩家與順序', questions: '題庫', editLocked: '對局進行中，設定已鎖定。', unlock: '解鎖編輯' },
  game: { title: '對局舞台', currentTurn: '現在輪到', waiting: '完成設定後開始對局', finished: '對局已結束', start: '開始對局', letter: '猜一個字母', answer: '直接猜答案', inputLetter: '輸入 1 個字元', inputAnswer: '輸入完整答案', target: '目標題目', submit: '提交行動' },
  board: { title: '狀態板', subtitle: '點擊字元格可切換：自動 → 顯示 → 隱藏', empty: '先新增題目，狀態板就會出現在這裡。' },
  actions: { addPlayer: '新增玩家', addQuestion: '新增題目', reset: '重設本局', copyImage: '複製戰況圖', export: '匯出 JSON', import: '匯入 JSON', delete: '刪除', cancel: '取消', confirm: '確認', close: '關閉' },
})

const enUS = deepMerge(zhHans, {
  brand: { tagline: 'Turn a guessing round into a great-looking game' },
  mode: { label: 'Game mode', battle: 'Song Battle Royale', plain: 'Give Your Letters', battleNote: 'Take turns · Lose when every song falls', plainNote: 'No players · Shared letter guesses' },
  toolbar: { local: 'Stored on this device only', saved: 'Autosaved', saving: 'Saving', help: 'Help', backup: 'Backup', theme: 'Theme', language: 'Language', install: 'Install app' },
  theme: { system: 'System', light: 'Light', dark: 'Dark' },
  setup: { title: 'Game setup', subtitle: 'Arrange players and questions. Answers hide when the game starts.', players: 'Players & order', questions: 'Question bank', rules: 'Standard rules · v1', editLocked: 'Setup is locked while the game is active.', unlock: 'Unlock setup', noQuestions: 'No questions yet.' },
  player: { name: 'Player name', placeholder: 'Enter a player name', status: { active: 'Alive', failed: 'Failed', winner: 'Winner' }, questionCount: '{count} questions' },
  question: { title: 'Prompt', titlePlaceholder: 'e.g. Opening theme', answer: 'Answer', answerPlaceholder: 'Up to 100 characters', author: 'Author', status: { active: 'In play', solved: 'Solved' }, hostControl: 'Question state' },
  rules: { allowSelf: 'Allow players to target their own questions', globalLetters: 'Letters apply to all eligible questions', targetLetters: 'Choose a target for each letter', consumeMiss: 'A miss consumes the turn', autoWinner: 'Last active player wins automatically', localConfig: 'These choices are saved with the game, not hard-coded into the character engine.' },
  game: { title: 'Game stage', currentTurn: 'Up now', waiting: 'Finish setup to start', finished: 'Game finished', start: 'Start game', letter: 'Guess a letter', answer: 'Guess an answer', inputLetter: 'Enter 1 character', inputAnswer: 'Enter the full answer', target: 'Target question', allTargets: 'All eligible questions', submit: 'Submit action', plainIntro: 'Enter one character to reveal every matching position.', allComplete: 'Every question is complete' },
  board: { title: 'Status board', subtitle: 'Click a character tile: auto → show → hide', empty: 'Add a question and the status board will appear here.', overallAuto: 'Automatic', markSolved: 'Mark solved', bulkAuto: 'All auto', bulkShow: 'Show all', bulkHide: 'Hide all', hidden: 'Hidden', chars: '{count} chars' },
  history: { title: 'Action history', empty: 'No actions yet. Make the first move.', letter: 'guessed “{value}”', answer: 'answered “{value}”', actor: '{name} · {action}', result: { hit: 'Hit', miss: 'Miss', invalid: 'Invalid', solved: 'Solved' } },
  actions: { addPlayer: 'Add player', addQuestion: 'Add question', randomPlayers: 'Shuffle players', randomQuestions: 'Shuffle questions', restorePlayers: 'Restore player order', restoreQuestions: 'Restore question order', reset: 'Reset game', copyImage: 'Copy game image', export: 'Export JSON', import: 'Import JSON', delete: 'Delete', moveUp: 'Move up', moveDown: 'Move down', cancel: 'Cancel', confirm: 'Confirm', close: 'Close', update: 'Update now' },
})

const jaJP = deepMerge(zhHans, {
  brand: { tagline: '曲当てゲームを、もっと見やすく楽しく' },
  mode: { label: 'ゲームモード', battle: '曲当てバトルロイヤル', plain: '文字をどうぞ', battleNote: '順番に回答 · 全問正解されたら脱落', plainNote: 'プレイヤーなし · 文字を共有' },
  toolbar: { local: 'この端末のみに保存', saved: '自動保存済み', saving: '保存中', help: 'ヘルプ', backup: 'バックアップ', theme: 'テーマ', language: '言語', install: 'アプリをインストール' },
  theme: { system: 'システム', light: 'ライト', dark: 'ダーク' },
  setup: { title: 'ゲーム設定', subtitle: '参加者と問題を準備します。開始後は答えが隠れます。', players: 'プレイヤーと順番', questions: '問題集', rules: '標準ルール · v1', editLocked: 'ゲーム中は設定がロックされています。', unlock: '編集を解除', noQuestions: '問題がありません。' },
  game: { title: 'ゲームステージ', currentTurn: '現在の回答者', waiting: '設定を完了して開始', finished: 'ゲーム終了', start: 'ゲーム開始', letter: '1文字を当てる', answer: '答えを当てる', inputLetter: '1文字入力', inputAnswer: '答えを入力', target: '対象の問題', submit: '回答する', plainIntro: '1文字入力すると、すべての問題の一致箇所が開きます。' },
  board: { title: 'ステータス', subtitle: '文字をクリック：自動 → 表示 → 非表示', empty: '問題を追加すると、ここに表示されます。' },
  actions: { addPlayer: 'プレイヤー追加', addQuestion: '問題追加', reset: 'リセット', copyImage: '画像をコピー', export: 'JSONを書き出す', import: 'JSONを読み込む', delete: '削除', cancel: 'キャンセル', confirm: '確認', close: '閉じる' },
})

export const messages: Record<Locale, Messages> = { 'zh-Hans': zhHans, 'zh-Hant': zhHant, 'en-US': enUS, 'ja-JP': jaJP }

export const i18n = createI18n({ legacy: false, locale: 'zh-Hans', fallbackLocale: 'zh-Hans', messages })
