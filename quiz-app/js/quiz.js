// ===========================
// クイズ画面ロジック
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const state = loadQuizState();
  if (!state || state.questions.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  // --- DOM要素 ---
  const progressFill   = document.getElementById('progressFill');
  const progressText   = document.getElementById('progressText');
  const progressScore  = document.getElementById('progressScore');
  const genreTagEl     = document.getElementById('genreTag');
  const examTagEl      = document.getElementById('examTag');
  const questionTextEl = document.getElementById('questionText');
  const choicesListEl  = document.getElementById('choicesList');
  const feedbackEl     = document.getElementById('feedback');
  const feedbackTitle  = document.getElementById('feedbackTitle');
  const feedbackExpl   = document.getElementById('feedbackExplanation');
  const nextBtnWrap    = document.getElementById('nextBtnWrap');
  const nextBtn        = document.getElementById('nextBtn');
  const quitBtn        = document.getElementById('quitBtn');

  let answered = false;

  // --- 現在の問題を表示 ---
  function renderQuestion() {
    answered = false;
    const { questions, currentIndex, correctCount } = state;
    const q = questions[currentIndex];
    const total = questions.length;

    // 進捗
    const pct = Math.round((currentIndex / total) * 100);
    progressFill.style.width = pct + '%';
    progressText.textContent = `${currentIndex + 1} / ${total}`;
    progressScore.textContent = `正解 ${correctCount}`;

    // タグ
    genreTagEl.textContent = q.genre;
    examTagEl.textContent  = q.exam || '';

    // 問題文（症例文「〜」を別スタイルで表示）
    questionTextEl.innerHTML = formatQuestionText(q.question);

    // 選択肢
    choicesListEl.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-num">${idx + 1}</span><span>${choice}</span>`;
      btn.addEventListener('click', () => handleAnswer(idx));
      choicesListEl.appendChild(btn);
    });

    // フィードバック・次へボタンを隠す
    feedbackEl.className = 'feedback';
    nextBtnWrap.className = 'next-btn-wrap';

    // 最後の問題なら「結果を見る」
    nextBtn.textContent = currentIndex + 1 >= total ? '結果を見る' : '次の問題';

    // フェードイン
    document.querySelector('.card').classList.add('fade-in');
    setTimeout(() => document.querySelector('.card').classList.remove('fade-in'), 300);
  }

  // 問題文フォーマット（「 」で囲まれた症例文を強調）
  function formatQuestionText(text) {
    // 「〜」 or 「〜。」の症例文を検出
    const casePattern = /「([^」]+)」/g;
    if (casePattern.test(text)) {
      return text.replace(/「([^」]+)」/g, (_, inner) =>
        `<div class="case-text">「${inner}」</div>`
      );
    }
    return text;
  }

  // --- 回答処理 ---
  function handleAnswer(selectedIdx) {
    if (answered) return;
    answered = true;

    const q = state.questions[state.currentIndex];
    const correctIdx     = q.answer;
    const correctAltIdx  = q.answer_alt !== undefined ? q.answer_alt : null;

    const isCorrect = selectedIdx === correctIdx ||
                      (correctAltIdx !== null && selectedIdx === correctAltIdx);

    // ボタンに正解/不正解スタイルを適用
    const btns = choicesListEl.querySelectorAll('.choice-btn');
    btns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIdx || idx === correctAltIdx) {
        btn.classList.add(idx === selectedIdx ? 'correct' : 'highlight-correct');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // スコア更新
    if (isCorrect) {
      state.correctCount++;
      progressScore.textContent = `正解 ${state.correctCount}`;
      removeWeakId(q.id);
    } else {
      addWeakId(q.id);
    }

    // 結果を記録
    state.results.push({
      id:           q.id,
      question:     q.question,
      choices:      q.choices,
      answer:       q.answer,
      answer_alt:   q.answer_alt,
      genre:        q.genre,
      exam:         q.exam,
      userAnswer:   selectedIdx,
      correct:      isCorrect,
      explanation:  q.explanation || '',
    });

    // 状態保存
    saveQuizState(state);

    // フィードバック表示
    const correctLabel = q.choices[correctIdx];
    if (isCorrect) {
      feedbackEl.className = 'feedback correct-feedback show';
      feedbackTitle.textContent = '正解！';
      feedbackExpl.textContent = q.explanation || '';
      feedbackExpl.style.display = q.explanation ? 'block' : 'none';
    } else {
      feedbackEl.className = 'feedback wrong-feedback show';
      const altNote = correctAltIdx !== null
        ? `または「${q.choices[correctAltIdx]}」`
        : '';
      feedbackTitle.textContent = `不正解　正解：${correctLabel}${altNote}`;
      feedbackExpl.textContent = q.explanation || '';
      feedbackExpl.style.display = q.explanation ? 'block' : 'none';
    }

    // 次へボタン表示
    nextBtnWrap.className = 'next-btn-wrap show';

    // スクロール
    setTimeout(() => feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }

  // --- 次の問題 / 結果へ ---
  nextBtn.addEventListener('click', () => {
    state.currentIndex++;
    saveQuizState(state);

    if (state.currentIndex >= state.questions.length) {
      window.location.href = 'result.html';
    } else {
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // --- 中断してトップへ ---
  quitBtn.addEventListener('click', () => {
    if (confirm('中断してトップに戻りますか？\n（途中の結果は保存されません）')) {
      clearQuizState();
      window.location.href = 'index.html';
    }
  });

  // --- 初期表示 ---
  renderQuestion();
});
