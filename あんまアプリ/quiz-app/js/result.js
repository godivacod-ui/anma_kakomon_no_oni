// ===========================
// 結果・復習画面ロジック
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const state = loadQuizState();
  if (!state || state.results.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  const { results, correctCount } = state;
  const total = results.length;
  const pct   = Math.round((correctCount / total) * 100);

  // --- スコア円グラフ ---
  const circleEl = document.getElementById('scoreCircle');
  if (circleEl) {
    // conic-gradientをJSで設定（CSS変数経由）
    circleEl.style.setProperty('--pct', pct + '%');
  }
  document.getElementById('scorePct').textContent   = pct + '%';
  document.getElementById('scoreDetail').innerHTML  =
    `<strong>${correctCount}</strong> / ${total} 問正解`;

  // グレード
  const gradeEl = document.getElementById('resultGrade');
  if (pct >= 90)      { gradeEl.textContent = 'S ランク'; gradeEl.className = 'result-grade grade-s'; }
  else if (pct >= 75) { gradeEl.textContent = 'A ランク'; gradeEl.className = 'result-grade grade-a'; }
  else if (pct >= 60) { gradeEl.textContent = 'B ランク'; gradeEl.className = 'result-grade grade-b'; }
  else if (pct >= 40) { gradeEl.textContent = 'C ランク'; gradeEl.className = 'result-grade grade-c'; }
  else                { gradeEl.textContent = 'D ランク'; gradeEl.className = 'result-grade grade-d'; }

  // --- ジャンル別成績 ---
  const genreMap = {};
  for (const r of results) {
    if (!genreMap[r.genre]) genreMap[r.genre] = { correct: 0, total: 0 };
    genreMap[r.genre].total++;
    if (r.correct) genreMap[r.genre].correct++;
  }

  const genreResultsEl = document.getElementById('genreResults');
  // GENRE_ORDERに沿って表示（出題されたジャンルのみ）
  GENRE_ORDER.forEach(genre => {
    const g = genreMap[genre];
    if (!g) return;
    const gPct = Math.round((g.correct / g.total) * 100);
    const barClass = gPct >= 75 ? 'bar-good' : gPct >= 50 ? 'bar-mid' : 'bar-bad';

    const row = document.createElement('div');
    row.className = 'genre-result-row';
    row.innerHTML = `
      <div class="genre-result-label">
        <span class="genre-result-name">${genre}</span>
        <span class="genre-result-score">${g.correct}/${g.total}問 (${gPct}%)</span>
      </div>
      <div class="genre-bar">
        <div class="genre-bar-fill ${barClass}" style="width:0%"
             data-width="${gPct}%"></div>
      </div>`;
    genreResultsEl.appendChild(row);
  });

  // バーのアニメーション
  setTimeout(() => {
    document.querySelectorAll('.genre-bar-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 150);

  // --- 間違えた問題一覧 ---
  const wrongResults = results.filter(r => !r.correct);
  const wrongSection = document.getElementById('wrongSection');
  const wrongListEl  = document.getElementById('wrongList');
  const reviewBtn    = document.getElementById('reviewBtn');

  if (wrongResults.length === 0) {
    wrongSection.classList.add('hidden');
    reviewBtn.classList.add('hidden');
  } else {
    document.getElementById('wrongCount').textContent = wrongResults.length;

    wrongResults.forEach(r => {
      const myAns      = r.choices[r.userAnswer];
      // answer_alt は数値・配列どちらでも対応
      const altIdxList = r.answer_alt !== undefined
        ? (Array.isArray(r.answer_alt) ? r.answer_alt : [r.answer_alt])
        : [];
      const allCorrectIdx = [r.answer, ...altIdxList];
      const correctNote = allCorrectIdx.map(i => r.choices[i]).join(' または ');

      const item = document.createElement('div');
      item.className = 'wrong-item';
      item.innerHTML = `
        <div class="wrong-item-header">
          <span class="wrong-q-num">問${r.id}</span>
          <span class="wrong-genre-tag">${r.genre}</span>
          <span class="exam-tag">${r.exam || ''}</span>
        </div>
        <div class="wrong-q-text">${r.question.replace(/「([^」]+)」/, '<br>「$1」')}</div>
        <div class="wrong-answers">
          <div class="wrong-ans-row">
            <span class="wrong-ans-label my-ans">あなた:</span>
            <span>${myAns}</span>
          </div>
          <div class="wrong-ans-row">
            <span class="wrong-ans-label correct-ans">正解:</span>
            <span>${correctNote}</span>
          </div>
          ${r.explanation ? `<div class="wrong-ans-row" style="margin-top:4px;color:var(--text-muted);font-size:0.82rem;">${r.explanation}</div>` : ''}
        </div>`;
      wrongListEl.appendChild(item);
    });

    // 苦手問題復習ボタン
    reviewBtn.addEventListener('click', () => {
      const reviewQs = getAllQuestions().filter(q =>
        wrongResults.some(r => r.id === q.id)
      );
      saveQuizState({
        mode: 'review',
        questions: shuffle(reviewQs),
        currentIndex: 0,
        correctCount: 0,
        results: [],
      });
      window.location.href = 'quiz.html';
    });
  }

  // --- もう一度同じ問題 ---
  document.getElementById('retryBtn').addEventListener('click', () => {
    const sameQs = getAllQuestions().filter(q =>
      results.some(r => r.id === q.id)
    );
    saveQuizState({
      mode: state.mode,
      questions: shuffle(sameQs),
      currentIndex: 0,
      correctCount: 0,
      results: [],
    });
    window.location.href = 'quiz.html';
  });

  // --- トップに戻る ---
  document.getElementById('topBtn').addEventListener('click', () => {
    clearQuizState();
    window.location.href = 'index.html';
  });
});
