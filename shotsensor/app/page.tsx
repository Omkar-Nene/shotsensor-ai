/**
 * ShotSensor - AI Pool/Snooker Shot Recommender
 * Main application page with state management
 */

'use client';

import { useState } from 'react';
import { GameMode, PoolBallType, AppState } from '@/types';
import GameModeSelector from '@/components/ui/GameModeSelector';
import PlayerTypeSelector from '@/components/ui/PlayerTypeSelector';
import CameraCapture from '@/components/camera/CameraCapture';

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

    // TODO: Trigger ball detection
    // For now, just simulate processing
    setTimeout(() => {
      setAppState((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: 'recommendations',
      }));
    }, 2000);
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
            <div className="text-center space-y-6">
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <h2 className="text-2xl font-bold text-white">
                Analyzing Table...
              </h2>
              <p className="text-blue-200">Detecting balls and calculating shots</p>
              <div className="space-y-2 text-sm text-blue-300/80">
                <p>✓ Image processed</p>
                <p className="animate-pulse">⟳ Detecting balls...</p>
                <p className="text-blue-300/50">○ Classifying colors</p>
                <p className="text-blue-300/50">○ Calculating trajectories</p>
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="text-center space-y-6">
              <div className="text-6xl">🎱</div>
              <h2 className="text-2xl font-bold text-white">
                Detection Complete!
              </h2>
              <p className="text-blue-200">
                Shot recommendations coming soon...
              </p>
              <button
                onClick={() =>
                  setAppState({
                    ...appState,
                    currentStep: 'mode-select',
                    capturedImage: null,
                    detectionResult: null,
                  })
                }
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Start Over
              </button>
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
