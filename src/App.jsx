import { useState, useEffect, use } from 'react'
import './App.css'
import useRandomWord from '../hooks/UseRandomWord';

const word_length=5;
const tries=6;
function App() {
  const [gameCount, setGameCount]= useState(0)
  const {word, clue } = useRandomWord(gameCount)
  const [turn, setTurn]= useState(0)
  const [gameOver, setGameOver]= useState(false)
  const [message, setMessage]= useState("Fetching a word...")
  const [guesses, setGuesses]= useState(Array(tries).fill(""));
  const [currentGuess, setCurrentGuess]= useState("");

  useEffect(()=> {
    if(word){ setCurrentGuess("");
    setTurn(0);
    setGameOver(false)
    setGuesses(Array(tries).fill(""));
    setMessage("New Word Loaded!!");}
  }, [word]);

  const submitGuess= async ()=> {
    const res= await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess}`);
    if(res.status===404)
      {setMessage("Not a Valid Word :[");
       return;
      }
    const newGuesses=[...guesses];
    newGuesses[turn]= currentGuess;
    setGuesses(newGuesses);
    setTurn(turn+1);
    setCurrentGuess("");

    if(currentGuess === word){
      setGameOver(true)
      setMessage("YOU WON !!");
    }
    else if(turn=== tries-1){
      setGameOver(true);
      setMessage(`Game Over! The word was ${word}`);
    }
  }
  
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (gameOver || !word) return;
      if (e.key === 'Enter') {
        if (currentGuess.length !== word_length) return;
        submitGuess();
      }
      if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      }
      if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < word_length) {
        setCurrentGuess(prev => (prev + e.key).toUpperCase());
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [currentGuess, gameOver, word]);

  const getStyle = (guess, index, isCurrentRow) => {
    const baseStyle = "w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase rounded-md transition-all duration-300 ";
    
    if (isCurrentRow || !guess) return baseStyle + "border-slate-300 bg-white text-slate-800";
    
    const char = guess[index];
    if (word[index] === char) return baseStyle + "bg-emerald-500 border-emerald-500 text-white shadow-sm";
    if (word.includes(char)) return baseStyle + "bg-amber-500 border-amber-500 text-white shadow-sm";
    return baseStyle + "bg-slate-500 border-slate-500 text-white shadow-sm";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans selection:bg-indigo-200">
      
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-indigo-600">
        WordHunt
      </h1>
      
      <div className="bg-indigo-100 text-indigo-900 px-5 py-3 rounded-xl mb-6 max-w-md text-center shadow-sm border border-indigo-200">
        <strong className="font-bold mr-1">HINT:</strong> 
        <span className="italic">{clue || "Loading clue..."}</span>
      </div>

      <p className="text-2xl font-semibold h-8 mb-4 text-slate-700 ">
        {message}
      </p>
      
      <div className="flex flex-col gap-2 mb-8">
  {Array.isArray(guesses) && guesses.map((guess, i) => (
    <div key={i} className="flex gap-2">
      {Array.from({ length: word_length }).map((_, j) => (
        <div key={j} className={getStyle(guess, j, i === turn)}>
          {i === turn ? currentGuess[j] : guess[j]}
        </div>
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <button 
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 active:scale-95 transition-all cursor-pointer"
          onClick={() => {
            setMessage("Fetching a word :)");
            setGameCount(c => c + 1);
          }}
        >
          Play Again
        </button>
      )}
      {!(gameOver) && <button className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:ring-4 focus:ring-red-300 active:scale-95 transition-all cursor-pointer" 
      onClick={(e)=>{
        setMessage("Fetching a word :)");
        setGameCount(c => c + 1);
        e.target.blur();
             }}>Restart</button>}
    </div>
  );
}

export default App
