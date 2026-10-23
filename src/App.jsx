import { useState, useEffect } from 'react';
import Login from './Login';

const EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥑', '🍉', '🥕'];

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

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('memory_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [deck, setDeck] = useState(buildDeck);
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);

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

  function flip(i) {
    if (picked.length === 2) return;
    if (deck[i].flipped || deck[i].matched) return;
    setDeck((d) => d.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setPicked([...picked, i]);
    setMoves((m) => m + 1);
  }

  function restart() {
    setDeck(buildDeck());
    setPicked([]);
    setMoves(0);
  }

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    if (loggedInUser.rememberMe) {
      localStorage.setItem('memory_user', JSON.stringify(loggedInUser));
    }
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('memory_user');
    restart();
  }

  if (!user) {
    return (
      <main className="login-container">
        <Login onLogin={handleLogin} />
      </main>
    );
  }

  const pairs = deck.filter((c) => c.matched).length / 2;
  const won = pairs === EMOJIS.length;

  return (
    <main className="game-container">
      <header className="game-header">
        <h1>🧠 Memory App Not</h1>
        <div className="user-bar">
          <span className="user-greeting">
            Player: <strong>{user.username}</strong>
          </span>
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="info" role="status" aria-live="polite">
        <div>
          Moves: <b>{moves}</b>
        </div>
        <div>
          Pairs: <b>{pairs}</b> / {EMOJIS.length}
        </div>
      </div>

      <div className="board" role="region" aria-label="Memory Game Board">
        {deck.map((card, i) => (
          <button
            key={card.id}
            className={
              'card' +
              (card.flipped ? ' flipped' : '') +
              (card.matched ? ' matched' : '')
            }
            onClick={() => flip(i)}
            aria-label={
              card.flipped || card.matched
                ? `Card at position ${i + 1}, ${card.emoji}`
                : `Card at position ${i + 1}, hidden`
            }
            disabled={card.matched}
          >
            {card.flipped || card.matched ? card.emoji : ''}
          </button>
        ))}
      </div>

      <button className="restart" onClick={restart}>
        New Game
      </button>

      {won && (
        <div className="win" role="alert" aria-live="assertive">
          🎉 You won in {moves} moves!
        </div>
      )}
    </main>
  );
}
