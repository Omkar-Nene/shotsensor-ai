/**
 * Player Type Selector for Pool
 * User selects whether they're playing Stripes or Solids
 */

'use client';

import { PoolBallType } from '@/types';

interface PlayerTypeSelectorProps {
  selectedType: PoolBallType | null;
  onSelect: (type: PoolBallType) => void;
  onContinue: () => void;
}

export default function PlayerTypeSelector({
  selectedType,
  onSelect,
  onContinue,
}: PlayerTypeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Pool (8-Ball)</h2>
          <p className="text-blue-200 text-lg">
            Which balls are you playing?
          </p>
          <p className="text-blue-300/80 text-sm">
            Select your ball type so we can recommend the best shots
          </p>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Stripes Option */}
          <button
            onClick={() => onSelect('stripes')}
            className={`w-full rounded-2xl p-6 shadow-2xl transition-all duration-300
                       hover:scale-105 active:scale-95
                       focus:outline-none focus:ring-4 focus:ring-orange-300
                       ${
                         selectedType === 'stripes'
                           ? 'bg-gradient-to-r from-orange-500 to-red-500 ring-4 ring-orange-400 scale-105'
                           : 'bg-gradient-to-r from-orange-600/70 to-red-600/70 hover:from-orange-600 hover:to-red-600'
                       }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="text-left flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {selectedType === 'stripes' ? '✓ ' : ''}Stripes
                </h3>
                <p className="text-sm text-white/90">
                  Balls 9-15 (striped pattern)
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Orange, Purple, Green, Maroon, Blue, Pink, Yellow
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {/* Stripe ball representations */}
                <div className="w-14 h-14 bg-white rounded-full border-2 border-black relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-1/3 bg-orange-500"></div>
                    <div className="h-1/3 bg-white"></div>
                    <div className="h-1/3 bg-orange-500"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-black font-bold text-lg">9</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Solids Option */}
          <button
            onClick={() => onSelect('solids')}
            className={`w-full rounded-2xl p-6 shadow-2xl transition-all duration-300
                       hover:scale-105 active:scale-95
                       focus:outline-none focus:ring-4 focus:ring-blue-300
                       ${
                         selectedType === 'solids'
                           ? 'bg-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-blue-400 scale-105'
                           : 'bg-gradient-to-r from-blue-600/70 to-purple-600/70 hover:from-blue-600 hover:to-purple-600'
                       }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="text-left flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  {selectedType === 'solids' ? '✓ ' : ''}Solids
                </h3>
                <p className="text-sm text-white/90">
                  Balls 1-7 (solid colors)
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Yellow, Blue, Red, Purple, Orange, Green, Maroon
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {/* Solid ball representations */}
                <div className="w-14 h-14 bg-blue-600 rounded-full border-2 border-black relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            onClick={onContinue}
            disabled={!selectedType}
            className={`w-full rounded-xl py-4 px-8 text-lg font-bold
                       transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-green-300
                       ${
                         selectedType
                           ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg hover:shadow-green-500/50'
                           : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                       }`}
          >
            {selectedType ? 'Continue to Camera →' : 'Select Your Ball Type'}
          </button>
        </div>

        {/* Info Note */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            <span className="font-semibold">💡 Note:</span> You can change this
            later if needed. The AI will identify all balls, but will prioritize
            shots for your selected type.
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()} // TODO: Better navigation
            className="text-blue-200 hover:text-white underline text-sm transition-colors"
          >
            ← Back to Game Selection
          </button>
        </div>
      </div>
    </div>
  );
}
