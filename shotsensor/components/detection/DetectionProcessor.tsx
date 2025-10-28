/**
 * Detection Processor Component
 * Shows progress during ball detection
 */

'use client';

import { useState, useEffect } from 'react';
import { DetectionResult, GameMode } from '@/types';
import { detectBalls } from '@/lib/detection/simpleBallDetector'; // Using simplified detector
import BallOverlay from './BallOverlay';

interface DetectionProcessorProps {
  imageDataUrl: string;
  gameMode: GameMode;
  onComplete: (result: DetectionResult) => void;
  onError: (error: string) => void;
}

export default function DetectionProcessor({
  imageDataUrl,
  gameMode,
  onComplete,
  onError,
}: DetectionProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const runDetection = async () => {
      try {
        const result = await detectBalls(
          imageDataUrl,
          gameMode,
          (prog, stg) => {
            if (!isCancelled) {
              setProgress(prog);
              setStage(stg);
            }
          }
        );

        if (!isCancelled) {
          setDetectionResult(result);
          setIsComplete(true);
          onComplete(result);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Detection failed';
          onError(message);
        }
      }
    };

    runDetection();

    return () => {
      isCancelled = true;
    };
  }, [imageDataUrl, gameMode, onComplete, onError]);

  if (isComplete && detectionResult) {
    return (
      <div className="space-y-6">
        <BallOverlay
          imageDataUrl={imageDataUrl}
          detectionResult={detectionResult}
        />

        {/* Detection Summary */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">Detection Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-300/70">Total Balls</p>
              <p className="text-white text-2xl font-bold">{detectionResult.balls.length}</p>
            </div>
            <div>
              <p className="text-blue-300/70">Processing Time</p>
              <p className="text-white text-2xl font-bold">
                {(detectionResult.processingTimeMs / 1000).toFixed(1)}s
              </p>
            </div>
          </div>

          {/* Ball Type Breakdown */}
          {detectionResult.balls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-500/20">
              <p className="text-blue-300/70 text-sm mb-2">Detected Ball Types:</p>
              <div className="space-y-1">
                {getBallTypeCounts(detectionResult).map(({ type, count, color }) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-blue-200 capitalize">{type}</span>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No balls detected warning */}
          {detectionResult.balls.length === 0 && (
            <div className="mt-4 pt-4 border-t border-yellow-500/20">
              <div className="flex items-start gap-2 text-yellow-300">
                <span>⚠️</span>
                <div className="text-sm">
                  <p className="font-semibold">No balls detected!</p>
                  <p className="text-yellow-300/70 mt-1">Try these tips:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1 text-xs">
                    <li>Use an overhead view of the table</li>
                    <li>Ensure good lighting</li>
                    <li>Make sure balls are clearly visible</li>
                    <li>Try a different image or angle</li>
                    <li>Check browser console for debug info</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Progress Circle */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-blue-900/30"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            className="text-blue-500 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Stage Indicator */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">{stage}</h3>
        <p className="text-blue-300/80 text-sm">This may take a few seconds...</p>
      </div>

      {/* Progress Steps */}
      <div className="w-full max-w-md space-y-2">
        <ProgressStep
          label="Loading image"
          isComplete={progress > 20}
          isCurrent={progress <= 20}
        />
        <ProgressStep
          label="Preprocessing"
          isComplete={progress > 40}
          isCurrent={progress > 20 && progress <= 40}
        />
        <ProgressStep
          label="Detecting circles"
          isComplete={progress > 60}
          isCurrent={progress > 40 && progress <= 60}
        />
        <ProgressStep
          label="Classifying colors"
          isComplete={progress > 90}
          isCurrent={progress > 60 && progress <= 90}
        />
        <ProgressStep
          label="Finalizing results"
          isComplete={progress >= 100}
          isCurrent={progress > 90}
        />
      </div>
    </div>
  );
}

interface ProgressStepProps {
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
}

function ProgressStep({ label, isComplete, isCurrent }: ProgressStepProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${
            isComplete
              ? 'bg-green-500 text-white'
              : isCurrent
              ? 'bg-blue-500 text-white animate-pulse'
              : 'bg-blue-900/30 text-blue-500'
          }`}
      >
        {isComplete ? '✓' : isCurrent ? '○' : '○'}
      </div>
      <span
        className={`text-sm transition-colors ${
          isComplete
            ? 'text-green-400'
            : isCurrent
            ? 'text-white font-medium'
            : 'text-blue-300/50'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Get ball type counts for summary
 */
function getBallTypeCounts(result: DetectionResult) {
  const counts = new Map<string, { count: number; color: string }>();

  result.balls.forEach((ball) => {
    const type = ball.ballType;
    const existing = counts.get(type);

    if (existing) {
      existing.count++;
    } else {
      counts.set(type, { count: 1, color: ball.color });
    }
  });

  return Array.from(counts.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.count - a.count);
}
