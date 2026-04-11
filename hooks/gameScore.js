export const scores = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 1
};

export const getWordScore = (word) => {
  return word.split('').reduce((acc, char) => acc + (scores[char] || 0), 0);
};
export const evaluateGuess = (guess, target) => {
  const result = Array(guess.length).fill('grey');
  const targetCounts = {};

  for (let char of target) {
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'green';
      targetCounts[guess[i]]--;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== 'green' && targetCounts[guess[i]] > 0) {
      result[i] = 'yellow';
      targetCounts[guess[i]]--;
    }
  }

  return result; 
};