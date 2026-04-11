const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export default function Keyboard({ onKeyPress, letterStatuses }) {
  const getBgColor = (key) => {
    const status = letterStatuses[key];
    if (status === 'green') return 'bg-emerald-500 text-white';
    if (status === 'yellow') return 'bg-amber-500 text-white';
    if (status === 'grey') return 'bg-slate-400 text-white opacity-50';
    return 'bg-slate-200 text-slate-800 hover:bg-slate-300';
  };

  return (
    <div className="flex flex-col items-center gap-2 my-4 w-full max-w-2xl">
      {KEYS.map((row, i) => (
        <div key={i} className="flex gap-1 sm:gap-2 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key === 'ENTER' ? 'Enter' : key === 'BACKSPACE' ? 'Backspace' : key)}
              className={`px-2 py-3 sm:px-4 sm:py-4 font-bold rounded-md transition-colors ${getBgColor(key)} ${key.length > 1 ? 'text-xs sm:text-sm' : 'text-lg sm:text-xl'}`}
            >
              {key === 'BACKSPACE' ? '<-' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}