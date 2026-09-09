import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import { X, Volume2, MessageSquare, Wind } from 'lucide-react';
import { TreeHoleAnimationView, LeafParticle } from './TreeHoleAnimationView';

export const TreeHoleModal: React.FC = () => {
  const { isTreeHoleOpen, setIsTreeHoleOpen, setActiveTab, sendChatMessage } = useApp();
  const [decibels, setDecibels] = useState(40);
  const [isListening, setIsListening] = useState(true);
  const [isShoutDetected, setIsShoutDetected] = useState(false);
  const [fallingLeaves, setFallingLeaves] = useState<LeafParticle[]>([]);

  // Web Audio refs for real microphone listening
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Leaf generator matching AI Dump Chat exactly
  const generateLeaves = () => {
    const newLeaves: LeafParticle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      startX: Math.random() * 50 + 25, // 25% - 75% on tree canopy
      startY: Math.random() * 40 + 35,  // 35px - 75px in foliage
      driftX: (Math.random() - 0.5) * 80,
      delay: Math.random() * 0.4,
      color: ['#86EFAC', '#4ADE80', '#FDE047', '#FDBA74', '#F472B6', '#C084FC', '#A78BFA'][Math.floor(Math.random() * 7)],
      size: Math.floor(Math.random() * 8) + 14,
      rotate: Math.floor(Math.random() * 360)
    }));
    setFallingLeaves(newLeaves);
  };

  useEffect(() => {
    if (!isTreeHoleOpen) {
      // Clean up audio
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    setIsListening(true);
    // Initial leaves flutter upon opening
    generateLeaves();

    let isMounted = true;
    let fallbackInterval: any = null;

    // Attempt real Web Audio API microphone stream
    const initMic = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          micStreamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudio = () => {
            if (!isMounted) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const db = Math.min(100, Math.floor(average * 0.7 + 30));
            setDecibels(db);

            if (db > 68) {
              setIsShoutDetected(true);
              generateLeaves();
            } else {
              setIsShoutDetected(false);
            }

            animFrameRef.current = requestAnimationFrame(checkAudio);
          };
          checkAudio();
        } else {
          throw new Error('No user media');
        }
      } catch (e) {
        // Fallback decibel simulation with spontaneous tree shaking and falling leaves
        fallbackInterval = setInterval(() => {
          if (!isMounted) return;
          const sim = Math.floor(Math.random() * 55) + 35;
          setDecibels(sim);
          if (sim > 68) {
            setIsShoutDetected(true);
            generateLeaves();
          } else if (sim > 52) {
            setIsShoutDetected(true);
          } else {
            setIsShoutDetected(false);
          }
        }, 320);
      }
    };

    initMic();

    return () => {
      isMounted = false;
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isTreeHoleOpen]);

  if (!isTreeHoleOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(30, 27, 24, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '410px',
        padding: '24px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '14px',
        boxShadow: '0 25px 60px rgba(139, 92, 246, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top-Right Close Button */}
        <button
          onClick={() => {
            setIsTreeHoleOpen(false);
          }}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            border: 'none',
            backgroundColor: 'rgba(241, 245, 249, 0.8)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: Colors.textMuted
          }}
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div>
          <span style={{
            background: 'linear-gradient(135deg, rgba(220, 252, 231, 0.9) 0%, rgba(187, 247, 208, 0.7) 100%)',
            color: '#15803D',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            🍃 Tree Hole Decompression
          </span>
          <h2 className="serif-title" style={{ fontSize: '22px', fontWeight: 600, color: Colors.textDark, marginTop: '6px' }}>
            Shout & Release Emotion
          </h2>
          <p style={{ fontSize: '12.5px', color: Colors.textMuted, marginTop: '2px' }}>
            Speak or shout to shake the tree and let leaves carry your stress away.
          </p>
        </div>

        {/* UNIFIED TREE HOLE ANIMATION (Same tree shaking & falling leaves as AI Dump Chat) */}
        <div style={{ width: '100%', position: 'relative' }}>
          <TreeHoleAnimationView
            isShaking={isShoutDetected || decibels > 55}
            fallingLeaves={fallingLeaves}
            statusBadge={
              isShoutDetected || decibels > 65
                ? '💥 Shouting detected • Leaves falling'
                : '🍃 Listening... Shout to shake tree'
            }
            height={230}
          />
        </div>

        {/* Action Button: Go to AI Chat */}
        <button
          type="button"
          onClick={() => {
            setIsTreeHoleOpen(false);
            setActiveTab('chat');
            sendChatMessage(`🌳 [Tree Hole Vent]: I shouted my stress into the tree hole. The leaves carried it away.`);
          }}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)',
            color: '#166534',
            border: '1.2px solid rgba(187, 247, 208, 0.9)',
            borderRadius: '24px',
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.18)',
            transition: 'all 0.15s ease',
            marginTop: '4px'
          }}
        >
          <MessageSquare size={17} />
          <span>Go to AI Chat</span>
        </button>
      </div>
    </div>
  );
};
