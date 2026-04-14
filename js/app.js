// ===========================
// 共通ユーティリティ
// ===========================

const QUIZ_STATE_KEY = 'anma_quiz_state';
const WEAK_IDS_KEY   = 'anma_weak_ids';

// --- 状態管理（sessionStorage） ---
function saveQuizState(state) {
  sessionStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
}

function loadQuizState() {
  const s = sessionStorage.getItem(QUIZ_STATE_KEY);
  return s ? JSON.parse(s) : null;
}

function clearQuizState() {
  sessionStorage.removeItem(QUIZ_STATE_KEY);
}

// --- 苦手問題（localStorage） ---
function getWeakIds() {
  const s = localStorage.getItem(WEAK_IDS_KEY);
  return s ? JSON.parse(s) : [];
}

function addWeakId(id) {
  const ids = getWeakIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(WEAK_IDS_KEY, JSON.stringify(ids));
  }
}

function removeWeakId(id) {
  const ids = getWeakIds().filter(x => x !== id);
  localStorage.setItem(WEAK_IDS_KEY, JSON.stringify(ids));
}

// --- 配列シャッフル ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- ジャンル別問題数を集計 ---
function countByGenre(questions) {
  const map = {};
  for (const q of questions) {
    map[q.genre] = (map[q.genre] || 0) + 1;
  }
  return map;
}

// --- 問題データへのアクセス ---
// QUESTIONS_DATA は data/questions.js で定義されたグローバル変数
function getAllQuestions() {
  if (typeof QUESTIONS_DATA === 'undefined') {
    alert('問題データが読み込まれていません。\nファイルが正しい場所にあるか確認してください。');
    return [];
  }
  return QUESTIONS_DATA;
}

// ジャンルリスト（表示順を固定）
const GENRE_ORDER = [
  '社会医学',
  '衛生学・公衆衛生学',
  '関係法規',
  '解剖学',
  '生理学',
  '臨床医学各論',
  'リハビリテーション医学',
  '東洋医学概論',
  '経絡経穴概論',
  '東洋医学臨床論',
  'あん摩マッサージ指圧理論',
];
