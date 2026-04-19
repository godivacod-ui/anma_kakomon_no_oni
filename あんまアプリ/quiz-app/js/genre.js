// ===========================
// ジャンル選択画面ロジック
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const questions = getAllQuestions();
  const countMap  = countByGenre(questions);
  const weakIds   = getWeakIds();

  // --- DOM要素 ---
  const genreListEl   = document.getElementById('genreList');
  const selectAllBtn  = document.getElementById('selectAll');
  const clearAllBtn   = document.getElementById('clearAll');
  const countInput    = document.getElementById('questionCount');
  const countMinusBtn = document.getElementById('countMinus');
  const countPlusBtn  = document.getElementById('countPlus');
  const countMaxEl    = document.getElementById('countMax');
  const startBtn      = document.getElementById('startBtn');
  const weakModeBtn   = document.getElementById('weakModeBtn');
  const weakCountEl   = document.getElementById('weakCount');

  // --- 苦手問題モードボタン ---
  if (weakModeBtn) {
    if (weakIds.length > 0) {
      weakCountEl.textContent = weakIds.length;
      weakModeBtn.classList.remove('hidden');
    }
  }

  // --- ジャンルリスト描画 ---
  GENRE_ORDER.forEach(genre => {
    const cnt = countMap[genre] || 0;
    if (cnt === 0) return;

    const item = document.createElement('label');
    item.className = 'genre-item';
    item.dataset.genre = genre;
    item.innerHTML = `
      <input type="checkbox" value="${genre}">
      <span class="genre-checkbox"></span>
      <span class="genre-name">${genre}</span>
      <span class="genre-count">${cnt}問</span>
    `;
    item.addEventListener('click', () => {
      const cb = item.querySelector('input');
      // labelのデフォルト動作でcheckboxが変わった後に発火
      setTimeout(() => {
        item.classList.toggle('selected', cb.checked);
        updateUI();
      }, 0);
    });
    genreListEl.appendChild(item);
  });

  // --- 全選択 / 全解除 ---
  selectAllBtn.addEventListener('click', () => setAllChecked(true));
  clearAllBtn.addEventListener('click',  () => setAllChecked(false));

  function setAllChecked(checked) {
    document.querySelectorAll('.genre-item').forEach(item => {
      item.querySelector('input').checked = checked;
      item.classList.toggle('selected', checked);
    });
    updateUI();
  }

  // --- 出題数の増減 ---
  countMinusBtn.addEventListener('click', () => changeCount(-5));
  countPlusBtn.addEventListener('click',  () => changeCount(+5));
  countInput.addEventListener('change', () => {
    let v = parseInt(countInput.value) || 10;
    v = Math.max(1, Math.min(v, getMaxCount()));
    countInput.value = v;
    updateUI();
  });

  function changeCount(delta) {
    let v = parseInt(countInput.value) + delta;
    v = Math.max(1, Math.min(v, getMaxCount()));
    countInput.value = v;
    updateUI();
  }

  // --- 選択ジャンルから利用可能な最大問題数を返す ---
  function getMaxCount() {
    return getSelectedQuestions().length || 1;
  }

  function getSelectedGenres() {
    return [...document.querySelectorAll('.genre-item input:checked')]
      .map(cb => cb.value);
  }

  function getSelectedQuestions() {
    const genres = getSelectedGenres();
    return questions.filter(q => genres.includes(q.genre));
  }

  // --- UI更新 ---
  function updateUI() {
    const max = getMaxCount();
    countMaxEl.textContent = `最大 ${max} 問`;

    let v = parseInt(countInput.value) || 10;
    if (v > max) {
      countInput.value = max;
      v = max;
    }

    countMinusBtn.disabled = v <= 1;
    countPlusBtn.disabled  = v >= max;

    const hasGenre = getSelectedGenres().length > 0;
    startBtn.disabled = !hasGenre;
  }

  // 初期状態
  updateUI();

  // --- 出題開始 ---
  startBtn.addEventListener('click', () => {
    const selectedQuestions = shuffle(getSelectedQuestions());
    const count = Math.min(parseInt(countInput.value), selectedQuestions.length);
    const picked = selectedQuestions.slice(0, count);

    saveQuizState({
      mode: 'normal',
      questions: picked,
      currentIndex: 0,
      correctCount: 0,
      results: [],
    });

    window.location.href = 'quiz.html';
  });

  // --- 苦手問題モード ---
  if (weakModeBtn) {
    weakModeBtn.addEventListener('click', () => {
      const weakQs = shuffle(questions.filter(q => weakIds.includes(q.id)));
      if (weakQs.length === 0) {
        alert('苦手問題が登録されていません。');
        return;
      }
      saveQuizState({
        mode: 'weak',
        questions: weakQs,
        currentIndex: 0,
        correctCount: 0,
        results: [],
      });
      window.location.href = 'quiz.html';
    });
  }
});
