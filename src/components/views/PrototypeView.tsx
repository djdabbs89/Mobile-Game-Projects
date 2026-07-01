import React, { useState, useEffect, useRef } from 'react';
import { PageHeader, DocSection, Callout } from '../ui/DocKit';
import { Wallet, ShieldAlert, BadgeDollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { audio } from '../../lib/audio';

export function PrototypeView() {
  const [progress, setProgress] = useState(0);
  const [awareness, setAwareness] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'stealing' | 'caught' | 'success'>('idle');
  
  const isHolding = useRef(false);

  // Stealing loop
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (gameState === 'caught' || gameState === 'success') return;

      if (isHolding.current) {
        // Increment progress when holding
        setProgress(p => {
          const baseSpeed = 45; // % per second
          const np = p + baseSpeed * dt;
          if (np >= 100) {
            setGameState('success');
            return 100;
          }
          return np;
        });

        // Awareness rises while holding
        setAwareness(a => {
          const awarenessBaseRate = 55; // % per second
          const newA = a + awarenessBaseRate * dt;
          if (newA > 80) {
            setGameState('caught');
          }
          return Math.min(100, newA);
        });
      } else {
        // Awareness drops quickly when not holding
        setAwareness(a => Math.max(0, a - 80 * dt));
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState]);

  const handlePointerDown = () => {
    if (gameState === 'caught' || gameState === 'success') return;
    audio.init();
    setGameState('stealing');
    isHolding.current = true;
  };

  const handlePointerUp = () => {
    if (gameState === 'caught' || gameState === 'success') return;
    setGameState('idle');
    isHolding.current = false;
  };

  const resetGame = () => {
    audio.playClick();
    setProgress(0);
    setAwareness(0);
    setGameState('idle');
    isHolding.current = false;
  };

  useEffect(() => {
     switch(gameState) {
         case 'stealing':
             audio.playStealStart();
             break;
         case 'caught':
             audio.playCaught();
             break;
         case 'success':
             audio.playStealSuccess();
             break;
     }
  }, [gameState]);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader 
        title="Interactive Prototype" 
        subtitle="HTML5 representation of the core 'Hold' minigame risk/reward loop."
      />

      <Callout title="How to play" type="info">
        Press and <strong>Hold</strong> the <span className="text-cyan-400 px-1 rounded text-xs font-bold uppercase tracking-widest">STEAL</span> button below. Both Loot and Awareness will rise while holding. If Awareness passes 80%, you lose! Release the button to pause your steal and let Awareness rapidly drop. Fill the Loot bar to win.
      </Callout>

      <div className="mt-8 flex flex-col items-center w-full max-w-[432px] mx-auto bg-[#1a1c20] rounded-[40px] border-[8px] border-[#2a2d35] shadow-2xl relative overflow-hidden p-6 aspect-[432/740]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#2a2d35_0%,_#08090A_100%)] opacity-40 -z-10"></div>
        
        {/* Mockup Header */}
        <div className="flex justify-between items-center z-10 w-full mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold">Current District</span>
            <span className="text-lg text-white font-black italic">NEON MARKET</span>
          </div>
          <div className="flex gap-3">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-xs font-mono text-yellow-400">$1,240</span>
            </div>
          </div>
        </div>

        {/* Game Area Wrapper (matching cutout shape) */}
        <div className="relative flex-1 flex flex-col w-full mb-6 rounded-2xl overflow-hidden border border-white/5 bg-[#14161a] p-6 shadow-inner">

          {/* Game Area */}
          <div className="w-full flex-1 flex justify-between items-end relative z-10">
            
            {/* Loot Bar */}
            <div className="flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-1 mb-1"><BadgeDollarSign className="w-3 h-3" /> LOOT</span>
              <div className="w-8 flex-1 bg-black/60 rounded-full border border-white/10 flex flex-col justify-end overflow-hidden backdrop-blur-md">
                <motion.div 
                  className="w-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  animate={{ height: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-slate-400 text-xs font-mono">{Math.floor(progress)}%</span>
            </div>

            {/* Character visual proxy */}
            <div className="flex flex-col items-center justify-end h-full mb-4 px-4 pb-12">
               {gameState === 'caught' && <div className="text-rose-500 font-black text-2xl italic tracking-wider animate-bounce mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">CAUGHT</div>}
               {gameState === 'success' && <div className="text-cyan-400 font-black text-2xl italic tracking-wider animate-bounce mb-4 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">STOLEN</div>}
               <div className={`w-20 h-20 rounded-full border border-white/20 flex items-center justify-center transition-colors ${gameState === 'caught' ? 'bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : gameState === 'success' ? 'bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-black/60 backdrop-blur-md'}`}>
                  <Wallet className={`w-8 h-8 ${gameState === 'success' ? 'text-cyan-400' : gameState === 'caught' ? 'text-rose-500' : 'text-slate-400'}`} />
               </div>
            </div>

            {/* Awareness Bar */}
            <div className="flex flex-col items-center gap-2 h-full justify-end">
               <span className="text-rose-400 font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-1 mb-1">AWARE <ShieldAlert className="w-3 h-3"/></span>
               <div className="w-8 flex-1 bg-black/60 rounded-full border border-white/10 flex flex-col justify-end overflow-hidden relative backdrop-blur-md">
                  <div className="absolute top-[20%] w-full h-[2px] bg-white/40 z-10"></div> {/* 80% mark threshold */}
                  <motion.div 
                    className={`w-full rounded-full transition-colors ${awareness > 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`}
                    animate={{ height: `${awareness}%` }}
                    transition={{ duration: 0.2 }}
                  />
               </div>
               <span className="text-slate-400 text-xs font-mono">{Math.floor(awareness)}%</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        {gameState === 'idle' || gameState === 'stealing' ? (
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`w-full py-6 rounded-2xl font-black text-xl tracking-widest transition-all select-none touch-none border ${
              gameState === 'stealing' 
                ? 'bg-gradient-to-b from-cyan-700 to-cyan-900 border-cyan-400/30 scale-[0.98] origin-bottom' 
                : 'bg-gradient-to-b from-cyan-600 to-cyan-800 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
            } text-white uppercase italic`}
          >
            Hold to Steal
          </button>
        ) : (
          <button
            onClick={resetGame}
            className="w-full py-6 rounded-2xl font-black text-xl tracking-widest transition-all select-none touch-none border bg-gradient-to-b from-[#2a2d35] to-[#1a1c20] border-white/10 hover:border-white/20 text-[#64748b] hover:text-white uppercase italic"
          >
            Play Again
          </button>
        )}
      </div>

    </div>
  );
}
