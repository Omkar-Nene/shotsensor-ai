/**
 * ShotSensor - AI Pool/Snooker Shot Recommender
 * Main application page with state management
 */

'use client';

import { useState } from 'react';
import { GameMode, PoolBallType, AppState, DetectionResult } from '@/types';
import GameModeSelector from '@/components/ui/GameModeSelector';
import PlayerTypeSelector from '@/components/ui/PlayerTypeSelector';
import CameraCapture from '@/components/camera/CameraCapture';
import DetectionProcessor from '@/components/detection/DetectionProcessor';

export default function Home() {
  // Application state
  const [appState, setAppState] = useState<AppState>({
    currentStep: 'mode-select',
    gameMode: null,
    playerBallType: null,
    capturedImage: null,
    detectionResult: null,
    gameState: null,
    recommendations: [],
    isProcessing: false,
    error: null,
  });

  // Handle game mode selection
  const handleGameModeSelect = (mode: GameMode) => {
    setAppState({
      ...appState,
      gameMode: mode,
      currentStep: mode === 'pool' ? 'player-select' : 'capture',
    });
  };

  // Handle player type selection (Pool only)
  const handlePlayerTypeSelect = (type: PoolBallType) => {
    setAppState({
      ...appState,
      playerBallType: type,
    });
  };

  // Continue to camera after player type selection
  const handleContinueToCamera = () => {
    if (!appState.playerBallType) return;
    setAppState({
      ...appState,
      currentStep: 'capture',
    });
  };

  // Handle image capture
  const handleImageCapture = (imageData: string) => {
    console.log('Image captured, starting detection...');
    setAppState({
      ...appState,
      capturedImage: imageData,
      currentStep: 'detection',
      isProcessing: true,
    });
  };

  // Handle detection complete
  const handleDetectionComplete = (result: DetectionResult) => {
    console.log('Detection complete:', result);
    setAppState({
      ...appState,
      detectionResult: result,
      isProcessing: false,
      currentStep: 'recommendations',
    });
  };

  // Handle errors
  const handleError = (error: string) => {
    console.error('Error:', error);
    setAppState({
      ...appState,
      error,
    });
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (appState.currentStep) {
      case 'mode-select':
        return <GameModeSelector onSelect={handleGameModeSelect} />;

      case 'player-select':
        return (
          <PlayerTypeSelector
            selectedType={appState.playerBallType}
            onSelect={handlePlayerTypeSelect}
            onContinue={handleContinueToCamera}
          />
        );

      case 'capture':
        return (
          <CameraCapture onCapture={handleImageCapture} onError={handleError} />
        );

      case 'detection':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-4xl w-full">
              {appState.capturedImage && appState.gameMode && (
                <DetectionProcessor
                  imageDataUrl={appState.capturedImage}
                  gameMode={appState.gameMode}
                  onComplete={handleDetectionComplete}
                  onError={handleError}
                />
              )}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-4xl w-full space-y-6">
              {/* Show detection result */}
              {appState.capturedImage && appState.detectionResult && (
                <>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">
                      ✓ Detection Complete!
                    </h2>
                    <p className="text-blue-200">
                      Found {appState.detectionResult.balls.length} balls on the table
                    </p>
                  </div>

                  {/* Import and show BallOverlay */}
                  <div className="space-y-4">
                    <img
                      src={appState.capturedImage}
                      alt="Detected table"
                      className="w-full rounded-lg shadow-2xl"
                    />

                    {/* Ball list */}
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">Detected Balls:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {appState.detectionResult.balls.map((ball, index) => (
                          <div
                            key={ball.id}
                            className="flex items-center gap-2 bg-blue-900/20 rounded-lg p-2"
                          >
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white"
                              style={{ backgroundColor: ball.color }}
                            />
                            <div className="text-sm">
                              <p className="text-white font-medium capitalize">{ball.ballType}</p>
                              <p className="text-blue-300/70 text-xs">
                                {Math.round(ball.confidence * 100)}% confident
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setAppState({
                          ...appState,
                          currentStep: 'capture',
                          capturedImage: null,
                          detectionResult: null,
                        })
                      }
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                    >
                      📷 Analyze Another Table
                    </button>
                    <button
                      onClick={() =>
                        setAppState({
                          ...appState,
                          currentStep: 'mode-select',
                          gameMode: null,
                          playerBallType: null,
                          capturedImage: null,
                          detectionResult: null,
                        })
                      }
                      className="px-6 py-3 bg-blue-600/50 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      ← Start Over
                    </button>
                  </div>

                  {/* Coming soon notice */}
                  <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-yellow-200 font-semibold">🎯 Shot Recommendations Coming in Phase 3!</p>
                    <p className="text-yellow-300/70 text-sm mt-1">
                      We'll calculate the best shots based on detected ball positions
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      {renderCurrentStep()}

      {/* Error Display */}
      {appState.error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-4 rounded-xl shadow-lg z-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{appState.error}</p>
            </div>
            <button
              onClick={() => setAppState({ ...appState, error: null })}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
