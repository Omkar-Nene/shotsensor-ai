/**
 * Game Mode Selector Component
 * Allows user to choose between Pool (8-ball) and Snooker
 */

'use client';

import { GameMode } from '@/types';
import Button from './Button';

interface GameModeSelectorProps {
  onSelect: (mode: GameMode) => void;
}

export default function GameModeSelector({ onSelect }: GameModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full" />
            <h1 className="text-4xl font-bold text-white">ShotSensor</h1>
          </div>
          <p className="text-blue-200 text-lg">
            AI-Powered Shot Recommender
          </p>
          <p className="text-blue-300 text-sm">
            Upload a photo and get expert shot recommendations
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Choose Your Game
          </h2>

          {/* Pool Card */}
          <button
            onClick={() => onSelect('pool')}
            className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600
                     text-white rounded-2xl p-6 shadow-2xl transition-all duration-300
                     hover:scale-105 hover:shadow-red-500/50 active:scale-95
                     focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">🎱 Pool (8-Ball)</h3>
                <p className="text-sm text-white/90">
                  Stripes, solids, and the 8-ball
                </p>
                <p className="text-xs text-white/70 mt-1">
                  15 numbered balls + cue ball
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {/* Visual ball representation */}
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-white rounded-full border-2 border-black" />
                  <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-black" />
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-black" />
                  <div className="w-6 h-6 bg-black rounded-full border-2 border-white" />
                </div>
              </div>
            </div>
          </button>

          {/* Snooker Card */}
          <button
            onClick={() => onSelect('snooker')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                     text-white rounded-2xl p-6 shadow-2xl transition-all duration-300
                     hover:scale-105 hover:shadow-green-500/50 active:scale-95
                     focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2">🎯 Snooker</h3>
                <p className="text-sm text-white/90">
                  Reds and colors with point values
                </p>
                <p className="text-xs text-white/70 mt-1">
                  15 reds + 6 colored balls
                </p>
              </div>
              <div className="flex flex-col gap-1">
                {/* Visual ball representation */}
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-black" />
                  <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-black" />
                </div>
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-pink-500 rounded-full border-2 border-black" />
                  <div className="w-6 h-6 bg-black rounded-full border-2 border-white" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Demo Mode Link */}
        <div className="text-center pt-4">
          <button
            className="text-blue-200 hover:text-white underline text-sm transition-colors"
            onClick={() => {
              // TODO: Implement demo mode
              alert('Demo mode coming soon! Use sample images to test the app.');
            }}
          >
            Try Demo Mode (No camera needed)
          </button>
        </div>

        {/* Info Footer */}
        <div className="text-center pt-6 space-y-2">
          <p className="text-blue-300/60 text-xs">
            Works best with clear table photos in good lighting
          </p>
          <p className="text-blue-300/60 text-xs">
            Camera access required for live shots
          </p>
        </div>
      </div>
    </div>
  );
}
