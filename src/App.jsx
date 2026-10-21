import { useState, useEffect, useRef } from 'react';

const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥑', '🍉', '🥕'];
const LEADERBOARD_KEY = 'memory-leaderboard';
const LEADERBOARD_MAX = 5;

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const pairs = [...EMOJIS, ...EMOJIS];
  return shuffle(pairs).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

function loadLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function App() {
  const [deck, setDeck] = useState(buildDeck);
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);
  const tickRef = useRef(null);

  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  useEffect(() => {
    if (picked.length !== 2) return;
    const [a, b] = picked;
    if (deck[a].emoji === deck[b].emoji) {
      setDeck((d) =>
        d.map((card, i) =>
          i === a || i === b ? { ...card, matched: true, flipped: false } : card
        )
      );
      setPicked([]);
    } else {
      const t = setTimeout(() => {
        setDeck((d) =>
          d.map((card, i) =>
            i === a || i === b ? { ...card, flipped: false } : card
          )
        );
        setPicked([]);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [picked, deck]);

  // Win handling
  const pairs = deck.filter((c) => c.matched).length / 2;
  const won = pairs === EMOJIS.length;
  useEffect(() => {
    if (!won) return;
    setRunning(false);
    const entry = { moves, seconds, id: Date.now() };
    const next = [...leaderboard, entry]
      .sort((a, b) => a.moves - b.moves || a.seconds - b.seconds)
      .slice(0, LEADERBOARD_MAX);
    setLeaderboard(next);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  function flip(i) {
    if (picked.length === 2) return;
    if (deck[i].flipped || deck[i].matched) return;
    if (!running) setRunning(true);
    setDeck((d) => d.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setPicked([...picked, i]);
    setMoves((m) => m + 1);
  }

  function restart() {
    setDeck(buildDeck());
    setPicked([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }

  return (
    <div>
      <h1>🧠 Memory App</h1>
      <div className="info">
        <div>Moves: <b>{moves}</b></div>
        <div>Pairs: <b>{pairs}</b> / {EMOJIS.length}</div>
        <div>Time: <b>{formatTime(seconds)}</b></div>
      </div>
      <div className="board">
        {deck.map((card, i) => (
          <button
            key={card.id}
            className={
              'card' +
              (card.flipped ? ' flipped' : '') +
              (card.matched ? ' matched' : '')
            }
            onClick={() => flip(i)}
          >
            {card.flipped || card.matched ? card.emoji : ''}
          </button>
        ))}
      </div>
      <button className="restart" onClick={restart}>New Game</button>
      {won && <div className="win">🎉 You won in {moves} moves and {formatTime(seconds)}!</div>}

      <div className="leaderboard">
        <h2>🏆 Best Runs (fewest moves)</h2>
        {leaderboard.length === 0 ? (
          <p className="empty">No records yet — win a game to set one!</p>
        ) : (
          <ol>
            {leaderboard.map((e) => (
              <li key={e.id}>
                <b>{e.moves}</b> moves · {formatTime(e.seconds)}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}