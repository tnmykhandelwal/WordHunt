# 🕵️‍♂️ WordHunt

WordHunt is a fast-paced, terminal-inspired word guessing game built with **React**. It challenges players to find hidden words across different difficulty levels while managing a countdown timer and earning points based on character rarity.

## 🚀 Features

* **Difficulty Levels**: Choose between Easy (5 letters), Medium (6 letters), and Hard (7 letters).
* **Dynamic Timer**: Each level has a specific time limit. Don't let it hit zero!
* **Scrabble-Style Scoring**: Points are calculated based on individual letter difficulty (e.g., 'Q' is worth 10 points).
* **Multiplier Bonus**: Successfully guessing a word without revealing the hint doubles your score for that round.
* **Interactive Keyboard**: A custom-built on-screen keyboard that tracks letter status (Correct, Present, or Absent).
* **Dictionary Validation**: Real-time API checks to ensure your guesses are valid English words.
* **Persistent Scoring**: Track your total score across multiple rounds until a loss or manual reset occurs.

## 🛠️ Tech Stack

* **Frontend**: React.js
* **Styling**: Tailwind CSS
* **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
* **APIs**:
    * [Datamuse API](https://www.datamuse.com/api/) (Word Generation)
    * [Free Dictionary API](https://dictionaryapi.dev/) (Definitions & Validation)

## 🎮 How to Play

1.  **Select Difficulty**: Pick a level from the main menu.
2.  **Guess the Word**: Type using your physical keyboard or the on-screen UI.
3.  **Check Colors**:
    * 🟩 **Green**: Letter is in the correct spot.
    * 🟨 **Yellow**: Letter is in the word but the wrong spot.
    * ⬜ **Grey**: Letter is not in the word.
4.  **Win/Loss**: Guess the word within 6 tries to keep your score. If time runs out or you run out of tries, the game ends and your score resets.