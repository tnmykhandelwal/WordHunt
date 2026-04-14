import { useState, useEffect, useCallback } from 'react'
import './App.css'
import useRandomWord from '../hooks/UseRandomWord';
import useTimer from '../hooks/UseTimer';
import Keyboard from '../hooks/Keyboard';
import { evaluateGuess, getWordScore } from '../hooks/gameScore';

const tries = 6;
const level_settings = {
  easy: { time: 300 },
  medium: { time: 210 },
  hard: { time: 180 }
};

function App() {
  const [gameState, setGameState] = useState('MENU');
  const [level, setLevel] = useState('easy');
  const [totalScore, setTotalScore] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(0);
  const { word, clue, isLoading } = useRandomWord(triggerFetch, level)
  const [turn, setTurn] = useState(0)
  const [message, setMessage] = useState("SYSTEM STANDBY...")
  const [guesses, setGuesses] = useState([]);
  const [guessColors, setGuessColors] = useState([]);
  const [showClue, setShowClue] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [letterStatuses, setLetterStatuses] = useState({});

  const handleTimeOut = useCallback(() => {
    setMessage(
      <div className="flex flex-col items-center py-2">
        <span className="text-rose-500 font-bold">TIMED OUT. TARGET WAS: {word}</span>
        <span className="text-slate-300 text-lg">FINAL SCORE: {totalScore}</span>
      </div>
    );
    setTotalScore(0);
    setGameState('SUMMARY');
  }, [word, totalScore]);

  const { timeLeft, setTimeLeft, isActive, setIsActive } = useTimer(0, handleTimeOut);

  useEffect(() => {
    if (word && gameState === 'PLAYING') {
      setCurrentGuess("");
      setTurn(0);
      setGuesses(Array(tries).fill(""));
      setGuessColors(Array(tries).fill([]));
      setLetterStatuses({});
      setShowClue(false);
      setMessage("> UPLINK ESTABLISHED. BEGIN DECRYPTION.");
      setTimeLeft(level_settings[level].time);
      setIsActive(true);
    }
  }, [word, level, gameState, setTimeLeft, setIsActive]);

  const handleInput = useCallback((key) => {
    if (gameState !== 'PLAYING' || !word) return;
    if (key === 'Enter') {
      if (currentGuess.length !== word.length) {
        setMessage(`> ERROR: INPUT MUST BE ${word.length} BYTES!`);
        return;
      }
      submitGuess();
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < word.length) {
      setCurrentGuess(prev => (prev + key).toUpperCase());
    }
  }, [currentGuess, word, gameState]);

  useEffect(() => {
    const handleKeyUp = (e) => handleInput(e.key);
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [handleInput]);

  const submitGuess = async () => {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess}`);
    if (res.status === 404) {
      setMessage("> ERROR: INVALID SYNTAX [NOT A WORD]");
      return;
    }

    const colors = evaluateGuess(currentGuess, word);
    const newGuesses = [...guesses];
    newGuesses[turn] = currentGuess;
    setGuesses(newGuesses);
    for (let i = 0; i < turn; i++) {
      if (currentGuess === newGuesses[i]) {
        setMessage(`> WARNING: DATA ALREADY SUBMITTED.`);
        return;
      }
    }
    const newColors = [...guessColors];
    newColors[turn] = colors;
    setGuessColors(newColors);

    const newLetterStatuses = { ...letterStatuses };
    currentGuess.split('').forEach((char, i) => {
      const color = colors[i];
      if (newLetterStatuses[char] !== 'green') {
        newLetterStatuses[char] = color;
      }
    });
    setLetterStatuses(newLetterStatuses);

    setTurn(turn + 1);
    setCurrentGuess("");

    if (currentGuess === word) {
      setIsActive(false);
      let earnedScore = getWordScore(word);
      if (!showClue) earnedScore *= 2;

      setTotalScore(prev => prev + earnedScore);
      setMessage(`> DECRYPTION SUCCESSFUL! +${earnedScore} PTS`);
      setGameState('SUMMARY');
    }
    else if (turn === tries - 1) {
      setIsActive(false);
      setMessage(
        <div className="flex flex-col items-center py-2">
          <span className="text-slate-300 text-lg">SYSTEM FAILURE! TARGET: {word}. SCORE: {totalScore}</span>
        </div>
      );
      setTotalScore(0);
      setGameState('SUMMARY');
    }
  };

  const startGame = (selectedLevel) => {
    setLevel(selectedLevel);
    setGameState('PLAYING');
    setTriggerFetch(c => c + 1);
  };

  const handleQuit = () => {
    setIsActive(false);
    setMessage(
      <div className="flex flex-col items-center py-2">
        <span className="text-slate-300 text-lg">CONNECTION SEVERED. TARGET: {word}. SCORE: {totalScore}</span>
      </div>
    );
    setTotalScore(0);
    setGameState('SUMMARY');
  };

  return (
    <div className="flex flex-col items-center justify-start pt-10 min-h-screen bg-slate-950 p-4 font-mono text-slate-300 selection:bg-emerald-900 selection:text-emerald-400">
      
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-5xl font-pixel text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] tracking-widest">
          WORDHUNT
        </h1>
        <div className="text-2xl font-pixel text-emerald-500">
          SCORE:{totalScore.toString().padStart(4, '0')}
        </div>
      </div>

      {gameState === 'MENU' && (
        <div className="flex flex-col w-full max-w-3xl bg-slate-900 p-6 sm:p-10 rounded-none border-2 border-slate-700 shadow-[8px_8px_0px_rgba(0,0,0,1)] gap-8">
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-pixel text-emerald-400 uppercase tracking-widest">System Boot...</h2>
            <p className="text-slate-400 text-lg">
              [ TERMINAL PROTOCOL INITIATED ]<br/>
              Decrypt the hidden target string before the countdown expires. Precision is mandatory.
            </p>
          </div>

          <div className="bg-slate-950 p-6 border border-slate-800 relative">
            <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 px-2 py-1 text-xs font-bold uppercase">Manual</div>
            <h3 className="text-2xl font-pixel text-slate-200 mt-2 mb-4 uppercase tracking-wider text-center">Parameters</h3>
            <ul className="text-slate-400 space-y-2 list-none mb-6 text-sm sm:text-base">
              <li>&gt; Input a valid sequence and press <strong>[ENTER]</strong>.</li>
              <li>&gt; <span className="text-emerald-500">REVEAL CLUE</span> bypasses encryption but halves score yield.</li>
              <li>&gt; Tile diagnostics output:</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row justify-around gap-4 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white font-bold text-xl border-2 border-emerald-400">W</div>
                <span className="text-sm text-slate-400">Valid Byte & Index</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-amber-600 text-white font-bold text-xl border-2 border-amber-400">O</div>
                <span className="text-sm text-slate-400">Invalid Index</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-700 text-slate-300 font-bold text-xl border-2 border-slate-600">R</div>
                <span className="text-sm text-slate-400">Corrupt Byte</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mt-2">
            <h3 className="text-xl font-pixel text-slate-300 animate-pulse">_SELECT_DIFFICULTY_</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => startGame('easy')} 
                className="flex-1 py-4 bg-slate-800 text-emerald-400 font-bold border-2 border-emerald-500 hover:bg-emerald-900 transition-colors active:scale-95 text-lg uppercase font-pixel tracking-wider"
              >
                [ Easy: 5 ]
              </button>
              <button 
                onClick={() => startGame('medium')} 
                className="flex-1 py-4 bg-slate-800 text-amber-400 font-bold border-2 border-amber-500 hover:bg-amber-900 transition-colors active:scale-95 text-lg uppercase font-pixel tracking-wider"
              >
                [ Mid: 6 ]
              </button>
              <button 
                onClick={() => startGame('hard')} 
                className="flex-1 py-4 bg-slate-800 text-rose-400 font-bold border-2 border-rose-500 hover:bg-rose-900 transition-colors active:scale-95 text-lg uppercase font-pixel tracking-wider"
              >
                [ Hard: 7 ]
              </button>
            </div>
          </div>
          
        </div>
      )}

      {(gameState === 'PLAYING' || gameState === 'SUMMARY') && (
        <>
          <div className="flex w-full max-w-md justify-between items-center mb-4 px-2 font-pixel text-xl">
            <span className={`tracking-widest ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
              T-MINUS: {timeLeft.toString().padStart(3, '0')}s
            </span>
            <span className="text-slate-500 uppercase tracking-widest border border-slate-700 px-2 py-1 bg-slate-900">MODE:{level}</span>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-md items-center mb-4">
            {!showClue && gameState === 'PLAYING' ? (
              <button 
                onClick={() => setShowClue(true)} 
                className="w-full text-sm bg-slate-900 text-emerald-500 border border-emerald-900 px-4 py-3 font-bold hover:bg-emerald-950 transition uppercase tracking-widest"
              >
                &gt; Execute Hint.exe (-50% Score)
              </button>
            ) : (
              <div className="w-full bg-slate-900 text-emerald-400 px-5 py-3 text-center border-l-4 border-emerald-600 font-mono text-sm">
                <strong className="font-bold mr-2 text-slate-200">DATABANK:</strong> 
                <span>{isLoading ? "Querying..." : clue || "No intel available."}</span>
              </div>
            )}

            {gameState === 'PLAYING' && (
              <button 
               onClick={handleQuit}
              className="mt-4 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest underline decoration-rose-900 underline-offset-4"
              >
                Abort Mission
              </button>
            )}
          </div>

          <p className="text-lg font-pixel h-8 mb-4 text-emerald-300 text-center uppercase tracking-wider">{message}</p>
          
          <div className="flex flex-col gap-2 mb-6">
            {guesses.map((guess, i) => (
              <div key={i} className="flex gap-2 justify-center">
                {Array.from({ length: word?.length || 5 }).map((_, j) => {
                  const isCurrentRow = i === turn;
                  const char = isCurrentRow ? currentGuess[j] : guess[j];
                  const color = guessColors[i] ? guessColors[i][j] : 'grey';
                  
                  let bgStyle = "border-slate-700 bg-slate-900 text-slate-500";
                  if (!isCurrentRow && guess) {
                    if (color === 'green') bgStyle = "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_rgba(52,211,153,0.3)]";
                    else if (color === 'yellow') bgStyle = "bg-amber-600 border-amber-400 text-white";
                    else bgStyle = "bg-slate-800 border-slate-600 text-slate-400 opacity-60";
                  }

                  return (
                    <div key={j} className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-3xl font-pixel uppercase transition-all duration-300 ${bgStyle}`}>
                      {char}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Keyboard onKeyPress={handleInput} letterStatuses={letterStatuses} />

          {gameState === 'SUMMARY' && (
            <div className="flex gap-4 mt-4 font-pixel tracking-widest">
              <button 
                className="px-6 py-4 bg-emerald-600 text-slate-950 font-bold border-b-4 border-emerald-800 hover:bg-emerald-500 hover:translate-y-1 hover:border-b-0 transition-all uppercase text-lg"
                onClick={() => startGame(level)}
              >
                {totalScore === 0 ? "REBOOT" : "NEXT TARGET"}
              </button>
              <button 
                className="px-6 py-4 bg-slate-700 text-slate-200 font-bold border-b-4 border-slate-900 hover:bg-slate-600 hover:translate-y-1 hover:border-b-0 transition-all uppercase text-lg"
                onClick={() => {
                  setGameState('MENU');
                  setTotalScore(0);
                  setMessage("");
                }}
              >
                MAIN MENU
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;