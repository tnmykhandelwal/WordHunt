import { useState, useEffect, useCallback } from 'react'
import './App.css'
import useRandomWord from '../hooks/UseRandomWord';
import useTimer from '../hooks/UseTimer';
import Keyboard from '../hooks/Keyboard';
import { evaluateGuess, getWordScore } from '../hooks/gameScore';

const tries=6;
const level_settings = {
  easy: { time: 300 },
  medium: { time: 180 },
  hard: { time: 120 }
};
function App() {
  const [gameState, setGameState] = useState('MENU');
  const [level, setLevel] = useState('easy');
  const [totalScore, setTotalScore] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(0);
  const {word, clue, isLoading} = useRandomWord(triggerFetch, level)
  const [turn, setTurn]= useState(0)
  const [message, setMessage]= useState("Fetching a word...")
  const [guesses, setGuesses]= useState([]);
  const [guessColors, setGuessColors] = useState([]);
  const [showClue, setShowClue] = useState(false);
  const [currentGuess, setCurrentGuess]= useState("");
  const [letterStatuses, setLetterStatuses] = useState({});

  const handleTimeOut = useCallback(() => {
  setMessage(
    <div className="flex flex-col items-center py-2">
      <span className="text-red-600 font-bold">Time's up! The word was {word}</span>
      <span className="text-slate-800 text-lg">Final Score: {totalScore}</span>
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
      setMessage("Game Started! Good luck.");
      setTimeLeft(level_settings[level].time);
      setIsActive(true);
    }
  }, [word, level, gameState, setTimeLeft, setIsActive]);

  const handleInput = useCallback((key) => {
    if (gameState !== 'PLAYING' || !word) return;
    if (key === 'Enter') {
      if (currentGuess.length !== word.length) {
        setMessage(`Word must be ${word.length} letters!`);
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

  const submitGuess= async ()=> {
    const res= await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess}`);
    if(res.status===404)
      {setMessage("Not a Valid Word :[");
       return;
      }
      
      const colors = evaluateGuess(currentGuess, word);
    const newGuesses=[...guesses];
    newGuesses[turn]= currentGuess;
    setGuesses(newGuesses);
    for(let i=0;i<turn; i++){
      if (currentGuess === newGuesses[i])
        setMessage(`Already Guessed! Try a new word.`);
      return;
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

    setTurn(turn+1);
    setCurrentGuess("");

    if (currentGuess === word) {
      setIsActive(false);
      let earnedScore = getWordScore(word);
      if (!showClue) earnedScore *= 2;
      
      setTotalScore(prev => prev + earnedScore);
      setMessage(`YOU WON! +${earnedScore} pts`);
      setGameState('SUMMARY');
    }
    else if (turn === tries - 1) {
  setIsActive(false);
  setMessage(
    <div className="flex flex-col items-center py-2">
      <span className="text-slate-800 text-lg">Game Over! It was {word}. Final Score: {totalScore}</span>
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
      <span className="text-slate-800 text-lg">Game Quit. The word was {word}. Final Score: {totalScore}</span>
    </div>
  );
  setTotalScore(0);
  setGameState('SUMMARY');
};

  return (
    <div className="flex flex-col items-center justify-start pt-10 min-h-screen bg-slate-50 p-4 font-sans selection:bg-indigo-200">
      
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-600">WordHunt</h1>
        <div className="text-xl font-bold text-slate-700">Score: {totalScore}</div>
      </div>

      {gameState === 'MENU' && (
        <div className="flex flex-col gap-4 items-center bg-white p-8 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Select Difficulty</h2>
          <button onClick={() => startGame('easy')} className="w-48 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600">Easy (5 Letters)</button>
          <button onClick={() => startGame('medium')} className="w-48 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600">Medium (6 Letters)</button>
          <button onClick={() => startGame('hard')} className="w-48 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Hard (7 Letters)</button>
        </div>
      )}

      {(gameState === 'PLAYING' || gameState === 'SUMMARY') && (
        <>
          <div className="flex w-full max-w-md justify-between items-center mb-4 px-2">
            <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
              Time: {timeLeft}s
            </span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{level} Mode</span>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-md items-center mb-4">
            {!showClue && gameState === 'PLAYING' ? (
              <button 
                onClick={() => setShowClue(true)} 
                className="w-full text-sm bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-200 transition"
              >
                Reveal Clue (Loses 2x Bonus)
              </button>
            ) : (
              <div className="w-full bg-indigo-100 text-indigo-900 px-5 py-3 rounded-xl text-center shadow-sm border border-indigo-200">
                <strong className="font-bold mr-1">HINT:</strong> 
                <span className="italic">{isLoading ? "Loading..." : clue || "No clue available."}</span>
              </div>
            )}

            {gameState === 'PLAYING' && (
              <button 
               onClick={handleQuit}
              className="mt-4 text-xs font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
              >
                Quit Game
              </button>
            )}
          </div>

          <p className="text-xl font-semibold h-8 mb-4 text-slate-700 text-center">{message}</p>
          
          <div className="flex flex-col gap-2 mb-6">
            {guesses.map((guess, i) => (
              <div key={i} className="flex gap-2 justify-center">
                {Array.from({ length: word?.length || 5 }).map((_, j) => {
                  const isCurrentRow = i === turn;
                  const char = isCurrentRow ? currentGuess[j] : guess[j];
                  const color = guessColors[i] ? guessColors[i][j] : 'grey';
                  
                  let bgStyle = "border-slate-300 bg-white text-slate-800";
                  if (!isCurrentRow && guess) {
                    if (color === 'green') bgStyle = "bg-emerald-500 border-emerald-500 text-white shadow-sm";
                    else if (color === 'yellow') bgStyle = "bg-amber-500 border-amber-500 text-white shadow-sm";
                    else bgStyle = "bg-slate-500 border-slate-500 text-white shadow-sm opacity-60";
                  }

                  return (
                    <div key={j} className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase rounded-md transition-all duration-300 ${bgStyle}`}>
                      {char}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Keyboard onKeyPress={handleInput} letterStatuses={letterStatuses} />

          {gameState === 'SUMMARY' && (
            <div className="flex gap-4 mt-4">
              <button 
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                onClick={() => startGame(level)}
              >
                {totalScore === 0 ? "Start New Game" : "Next Word"}
              </button>
              <button 
                className="px-6 py-3 bg-slate-600 text-white font-bold rounded-lg shadow-md hover:bg-slate-700 active:scale-95 transition-all"
                onClick={() => {
                  setGameState('MENU');
                  setTotalScore(0);
                  setMessage("");
                }}
              >
                Return to Menu
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App