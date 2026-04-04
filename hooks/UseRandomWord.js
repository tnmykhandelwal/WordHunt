import { useEffect, useState } from "react";

function useRandomWord(trigger) {
  const [word, setWord]= useState("")
  const [clue, setClue]= useState("")
  useEffect(()=>{
    const fetchWord= async ()=> {
        const res= await fetch(`https://api.datamuse.com/words?sp=?????&max=50`)
        const wordsArray= await res.json();
        const selectWord= wordsArray[Math.floor(Math.random() * wordsArray.length)].word.toUpperCase();
            
        const dictRes= await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectWord}`)
        const dictData= await dictRes.json();
        let definition = "No definition available.";
        if (Array.isArray(dictData)) {
            definition = dictData[0]?.meanings[0]?.definitions[0]?.definition || definition;
        }
        
        setWord(selectWord)
        setClue(definition)
    }
    fetchWord();
  },[trigger])
    return {word, clue};
}

export default useRandomWord