'use client'

interface ColorPaletteProps {
  colors: string[]
  selectedColor: string
  onSelectColor: (color: string) => void
  disabled?: boolean
}

export default function ColorPalette({
  colors,
  selectedColor,
  onSelectColor,
  disabled = false,
}: ColorPaletteProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-4">Select Color</h3>

      <div className="grid grid-cols-8 gap-2 mb-4">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => !disabled && onSelectColor(color)}
            disabled={disabled}
            className={`
              w-9 h-9 rounded-lg border-2 transition-all
              ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'}
              ${
                selectedColor === color
                  ? 'border-purple-500 ring-2 ring-purple-200 scale-110 shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current color:</span>
        <div
          className="w-7 h-7 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-xs text-gray-600 font-mono">{selectedColor}</span>
      </div>
    </div>
  )
}

