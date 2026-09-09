import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import { X, Palette, Sparkles, Check, ArrowDown, RotateCcw } from 'lucide-react';

export const ColourReflectionModal: React.FC = () => {
  const { isColourReflectionOpen, setIsColourReflectionOpen } = useApp();

  // Soft pastel palette matching Picture 4 reference
  const palette = [
    { color: '#93C5FD', label: 'Sky Blue' },
    { color: '#C084FC', label: 'Soft Lilac' },
    { color: '#FDE047', label: 'Pastel Yellow' },
    { color: '#86EFAC', label: 'Soft Mint' },
    { color: '#FBCFE8', label: 'Blush Pink' },
    { color: '#FED7AA', label: 'Warm Apricot' }
  ];

  const [selectedColor, setSelectedColor] = useState('#93C5FD');

  // Exact Picture 4 sections - ALL WHITE by default (Requirement 2 & 6)
  const [sectionColors, setSectionColors] = useState<Record<string, string>>({
    centerOuter: '#FFFFFF',
    centerInner: '#FFFFFF',
    petalTop: '#FFFFFF',
    petalBottom: '#FFFFFF',
    petalLeft: '#FFFFFF',
    petalRight: '#FFFFFF',
    wingTopLeft: '#FFFFFF',
    wingTopRight: '#FFFFFF',
    wingBottomLeft: '#FFFFFF',
    wingBottomRight: '#FFFFFF',
  });

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isColourReflectionOpen) return null;

  const handleSectionClick = (id: string) => {
    setSectionColors(prev => ({ ...prev, [id]: selectedColor }));
  };

  // Calculate percentage of colored sections only
  const coloredEntries = Object.values(sectionColors).filter(c => c !== '#FFFFFF');
  const totalColored = coloredEntries.length || 1;
  const colorCounts: Record<string, number> = {};
  coloredEntries.forEach(c => {
    colorCounts[c] = (colorCounts[c] || 0) + 1;
  });

  const paletteStats = Object.entries(colorCounts).map(([col, count]) => {
    const percent = Math.round((count / totalColored) * 100);
    return { color: col, percent };
  }).sort((a, b) => b.percent - a.percent);

  const resetPattern = () => {
    setSectionColors({
      centerOuter: '#FFFFFF',
      centerInner: '#FFFFFF',
      petalTop: '#FFFFFF',
      petalBottom: '#FFFFFF',
      petalLeft: '#FFFFFF',
      petalRight: '#FFFFFF',
      wingTopLeft: '#FFFFFF',
      wingTopRight: '#FFFFFF',
      wingBottomLeft: '#FFFFFF',
      wingBottomRight: '#FFFFFF',
    });
    setIsAnalyzed(false);
    setIsSaved(false);
  };

  // Render SVG pattern based exactly on Picture 4
  const renderPatternSvg = (isThumbnail = false) => (
    <svg
      width={isThumbnail ? "180" : "240"}
      height={isThumbnail ? "170" : "230"}
      viewBox="0 0 240 230"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {/* 4 Diagonal Rounded Wings / Leaves (Background Layer) */}
      {/* Top Left Rounded Leaf */}
      <path
        d="M45,45 C20,75 25,120 70,122 C95,115 90,75 45,45 Z"
        fill={sectionColors.wingTopLeft}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('wingTopLeft')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Top Right Rounded Leaf */}
      <path
        d="M195,45 C220,75 215,120 170,122 C145,115 150,75 195,45 Z"
        fill={sectionColors.wingTopRight}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('wingTopRight')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Bottom Left Rounded Leaf */}
      <path
        d="M55,185 C30,155 35,110 80,108 C105,115 100,155 55,185 Z"
        fill={sectionColors.wingBottomLeft}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('wingBottomLeft')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Bottom Right Rounded Leaf */}
      <path
        d="M185,185 C210,155 205,110 160,108 C135,115 140,155 185,185 Z"
        fill={sectionColors.wingBottomRight}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('wingBottomRight')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* 4 Cardinal Pointed Petals (Foreground Cross Layer) */}
      {/* Top Pointed Petal */}
      <path
        d="M120,18 C102,60 105,95 120,100 C135,95 138,60 120,18 Z"
        fill={sectionColors.petalTop}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('petalTop')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Bottom Pointed Petal */}
      <path
        d="M120,212 C102,170 105,135 120,130 C135,135 138,170 120,212 Z"
        fill={sectionColors.petalBottom}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('petalBottom')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Left Pointed Petal */}
      <path
        d="M26,115 C68,97 103,100 108,115 C103,130 68,133 26,115 Z"
        fill={sectionColors.petalLeft}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('petalLeft')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Right Pointed Petal */}
      <path
        d="M214,115 C172,97 137,100 132,115 C137,130 172,133 214,115 Z"
        fill={sectionColors.petalRight}
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinejoin="round"
        onClick={() => !isThumbnail && handleSectionClick('petalRight')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Center Outer Circle */}
      <circle
        cx="120"
        cy="115"
        r="28"
        fill={sectionColors.centerOuter}
        stroke="#475569"
        strokeWidth="2.5"
        onClick={() => !isThumbnail && handleSectionClick('centerOuter')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />

      {/* Center Inner Core Circle */}
      <circle
        cx="120"
        cy="115"
        r="12"
        fill={sectionColors.centerInner}
        stroke="#475569"
        strokeWidth="2"
        onClick={() => !isThumbnail && handleSectionClick('centerInner')}
        style={{ cursor: isThumbnail ? 'default' : 'pointer', transition: 'fill 0.2s ease' }}
      />
    </svg>
  );

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
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 25px 60px rgba(139, 92, 246, 0.2)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={() => {
            setIsColourReflectionOpen(false);
            setIsAnalyzed(false);
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
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {!isAnalyzed ? (
          /* STEP 1: INTERACTIVE COLORING STAGE (ALL WHITE OUTLINE INITIALLY - Picture 4) */
          <>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                background: 'linear-gradient(135deg, rgba(221, 214, 254, 0.4) 0%, rgba(186, 230, 253, 0.4) 100%)',
                color: '#7C3AED',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                🎨 Colour Reflection
              </span>
              <h2 className="serif-title" style={{ fontSize: '22px', fontWeight: 600, color: Colors.textDark, marginTop: '6px' }}>
                Reflect Through Colour
              </h2>
              <p style={{ fontSize: '12px', color: Colors.textMuted, marginTop: '2px' }}>
                Choose a pastel color below, then tap any section of the pattern to color it.
              </p>
            </div>

            {/* Color Swatch Picker */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '4px' }}>
              {palette.map(p => (
                <div
                  key={p.color}
                  onClick={() => setSelectedColor(p.color)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: p.color,
                    cursor: 'pointer',
                    border: selectedColor === p.color ? '3px solid #1E293B' : '2px solid #FFFFFF',
                    boxShadow: selectedColor === p.color ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: selectedColor === p.color ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                  title={p.label}
                >
                  {selectedColor === p.color && <Check size={16} color="#FFFFFF" />}
                </div>
              ))}
            </div>

            {/* Interactive Blank Pattern Canvas (Exact Picture 4 Shape) */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, #F8F9FE 0%, #FFFDF8 100%)',
              borderRadius: '24px',
              padding: '16px 8px',
              border: '1.5px solid rgba(221, 214, 254, 0.6)'
            }}>
              {renderPatternSvg(false)}
            </div>

            {/* Action Button: Get AI Analysis */}
            <button
              onClick={() => setIsAnalyzed(true)}
              style={{
                background: 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)',
                color: '#166534',
                border: '1.2px solid rgba(187, 247, 208, 0.9)',
                borderRadius: '24px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(187, 247, 208, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={18} />
              <span>Reveal Emotional Color Insight</span>
            </button>
          </>
        ) : (
          /* STEP 2: EXACT PICTURE 2 RESULT CARD FORMAT */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            
            {/* The Main Framed Card with Sub-Sections */}
            <div style={{
              width: '100%',
              borderRadius: '24px',
              border: '2px solid rgba(203, 213, 225, 0.85)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}>

              {/* Sub-card 1: ✨ YOUR ARTWORK ✨ */}
              <div style={{
                padding: '18px 16px',
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(248, 250, 252, 0.5)'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', letterSpacing: '1px' }}>
                  ✨ YOUR ARTWORK ✨
                </div>
                
                {/* Scaled-down SVG art preview with user's actual colors */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scale(0.65)',
                  margin: '-15px 0'
                }}>
                  {renderPatternSvg(true)}
                </div>

                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  🎨 YOUR ART HERE
                </span>
              </div>

              {/* Sub-card 2: 🔮 POSSIBLE OBSERVATION */}
              <div style={{
                padding: '16px',
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔮</span>
                  <span>POSSIBLE OBSERVATION</span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.45' }}>
                  Your artwork uses soothing pastel tones, reflecting an innate desire for peace, harmonious clarity, and gentle decompression...
                </p>
              </div>

              {/* Sub-card 3: 🎨 COLOUR PALETTE */}
              <div style={{
                padding: '16px',
                borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎨</span>
                  <span>COLOUR PALETTE</span>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  {paletteStats.length > 0 ? (
                    paletteStats.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          display: 'inline-block',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                        }} />
                        <span>{item.percent}%</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Single tone composition</span>
                  )}
                </div>
              </div>

              {/* Sub-card 4: 🥰 AI'S COMPLIMENT */}
              <div style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🥰</span>
                  <span>AI'S COMPLIMENT</span>
                </div>
                <p style={{ fontSize: '13px', color: '#0F172A', fontStyle: 'italic', fontWeight: 600, lineHeight: '1.45' }}>
                  "Your colour combination gives the artwork a dreamy and peaceful feeling!"
                </p>
              </div>

            </div>

            {/* Bottom Row: Download Button on Right */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingRight: '8px' }}>
              <button
                onClick={() => {
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2000);
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSaved ? '#16A34A' : '#334155',
                  transition: 'all 0.15s ease'
                }}
                title={isSaved ? "Saved!" : "Download Artwork Card"}
              >
                {isSaved ? <Check size={20} /> : <ArrowDown size={20} />}
              </button>
            </div>

            {/* DISCLAIMER AT THE BOTTOM (Requirement 6 & Picture 2) */}
            <div style={{
              fontSize: '13px',
              color: '#64748B',
              fontWeight: 700,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '-4px'
            }}>
              <span>Just for fun!</span>
              <span>🌱</span>
            </div>

            {/* Color Again button */}
            <button
              onClick={resetPattern}
              style={{
                backgroundColor: 'rgba(237, 233, 254, 0.7)',
                color: '#7C3AED',
                border: '1px solid rgba(221, 214, 254, 0.8)',
                borderRadius: '18px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <RotateCcw size={14} /> Color Again
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
