const grid = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['X', 'Y', 'Z', 'A', 'B', 'C'],
  ['D', 'E', 'F', 'G', 'H', 'I'],
]

export default function Home() {
  return (
    <div className="grid auto-cols-auto auto-rows-auto w-fit m-auto select-none">
      {grid.map((row, y) => row.map((cell, x) => (
        <div
          key={`${x}:${y}`}
          className="size-8 text-center leading-8"
          style={{ gridRow: y + 1, gridColumn: x + 1 }}
        >
          {cell}
        </div>
      )))}
    </div>
  );
}
