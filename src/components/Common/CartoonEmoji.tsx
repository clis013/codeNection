import React from 'react';

export type MoodType = 'Great' | 'All Good' | 'Normal' | 'Tense' | 'Little Stressed' | 'Overwhelmed' | 'Unchecked';

interface CartoonEmojiProps {
  mood: MoodType | string;
  size?: number;
}

export const CartoonEmoji: React.FC<CartoonEmojiProps> = ({ mood, size = 32 }) => {
  switch (mood) {
    case 'Great':
      // Very Cute, Light Pastel Baby Yellow Grinning Kawaii Face
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shallow Light Butter Circle */}
          <circle cx="18" cy="18" r="16" fill="#FEF9C3" stroke="#FDE047" strokeWidth="1.2" />
          {/* Happy Closed Arc Eyes */}
          <path d="M10.5 14C11.5 11.8 14 11.8 15 14" stroke="#854D0E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M21 14C22 11.8 24.5 11.8 25.5 14" stroke="#854D0E" strokeWidth="1.8" strokeLinecap="round" />
          {/* Adorable Sweet Smile */}
          <path d="M13 18.5C13 22 15 24 18 24C21 24 23 22 23 18.5" stroke="#854D0E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14.5 19.5C15.5 22 17 22.5 18 22.5C19 22.5 20.5 22 21.5 19.5" fill="#FDA4AF" opacity="0.8" />
          {/* Soft Cheerful Pink Blush */}
          <ellipse cx="9" cy="18" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.45" />
          <ellipse cx="27" cy="18" rx="2.5" ry="1.5" fill="#F472B6" opacity="0.45" />
          {/* Tiny sparkle on forehead */}
          <circle cx="18" cy="8.5" r="1" fill="#F59E0B" opacity="0.7" />
        </svg>
      );

    case 'All Good':
      // Calm, Cute Shallow Light Mint Kawaii Smile
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shallow Light Mint Circle */}
          <circle cx="18" cy="18" r="16" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.2" />
          {/* Twinkling Shiny Dot Eyes */}
          <circle cx="12.5" cy="14" r="2.2" fill="#166534" />
          <circle cx="23.5" cy="14" r="2.2" fill="#166534" />
          <circle cx="13.2" cy="13.2" r="0.8" fill="#FFFFFF" />
          <circle cx="24.2" cy="13.2" r="0.8" fill="#FFFFFF" />
          {/* Gentle Sweet Curved Smile */}
          <path d="M14 19.5C15.5 22 20.5 22 22 19.5" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" />
          {/* Soft Peach Blush */}
          <ellipse cx="9" cy="17.5" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.5" />
          <ellipse cx="27" cy="17.5" rx="2.5" ry="1.5" fill="#FCA5A5" opacity="0.5" />
        </svg>
      );

    case 'Normal':
      // Peaceful, Shallow Light Lilac Kawaii Face
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shallow Light Lilac Circle */}
          <circle cx="18" cy="18" r="16" fill="#F3E8FF" stroke="#DDD6FE" strokeWidth="1.2" />
          {/* Relaxed Happy Slanted Eyes */}
          <path d="M11 14.5C12.5 13 14.5 13 15.5 14.5" stroke="#6B21A8" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20.5 14.5C21.5 13 23.5 13 25 14.5" stroke="#6B21A8" strokeWidth="1.8" strokeLinecap="round" />
          {/* Soft Content Smile */}
          <path d="M14.5 20C16 21.2 20 21.2 21.5 20" stroke="#6B21A8" strokeWidth="1.8" strokeLinecap="round" />
          {/* Soft Violet Blush */}
          <ellipse cx="9" cy="18" rx="2.5" ry="1.5" fill="#C084FC" opacity="0.4" />
          <ellipse cx="27" cy="18" rx="2.5" ry="1.5" fill="#C084FC" opacity="0.4" />
        </svg>
      );

    case 'Tense':
    case 'Little Stressed':
      // Cute Shallow Light Peach Pensive Face with Tiny Teardrop
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shallow Light Peach Circle */}
          <circle cx="18" cy="18" r="16" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1.2" />
          {/* Slanted Mild Concern Eyebrows & Round Eyes */}
          <path d="M11 11.5L14.5 12.8" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M25 11.5L21.5 12.8" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="13" cy="15" r="2" fill="#9A3412" />
          <circle cx="23" cy="15" r="2" fill="#9A3412" />
          <circle cx="13.6" cy="14.4" r="0.7" fill="#FFFFFF" />
          <circle cx="23.6" cy="14.4" r="0.7" fill="#FFFFFF" />
          {/* Slight Wavy Pout Mouth */}
          <path d="M14 20.5C16 19.5 20 21.5 22 20.5" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
          {/* Cute Soft Blue Sweat Drop */}
          <path d="M27.5 9.5C27.5 10.8 26.2 12 26.2 12C26.2 12 25 10.8 25 9.5C25 8.7 25.6 8 26.2 8C27 8 27.5 8.7 27.5 9.5Z" fill="#7DD3FC" />
          {/* Light Cheek Tint */}
          <ellipse cx="9.5" cy="18.5" rx="2.2" ry="1.3" fill="#FDBA74" opacity="0.4" />
          <ellipse cx="26.5" cy="18.5" rx="2.2" ry="1.3" fill="#FDBA74" opacity="0.4" />
        </svg>
      );

    case 'Overwhelmed':
      // Cute Shallow Light Rose Dizzy Face with Swirls
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shallow Light Rose Circle */}
          <circle cx="18" cy="18" r="16" fill="#FFE4E6" stroke="#FECDD3" strokeWidth="1.2" />
          {/* Cute Cross/Spiral Eyes */}
          <path d="M11 13L15 17M15 13L11 17" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M21 13L25 17M25 13L21 17" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />
          {/* Wobbly Cute Squiggly Mouth */}
          <path d="M13 21.5C14.5 20.2 16.5 22.8 18 21.5C19.5 20.2 21.5 22.8 23 21.5" stroke="#BE123C" strokeWidth="1.8" strokeLinecap="round" />
          {/* Two Cute Sky Drops */}
          <path d="M7.5 9C7.5 10.2 6.5 11.2 6.5 11.2C6.5 11.2 5.5 10.2 5.5 9C5.5 8.2 6 7.5 6.5 7.5C7.2 7.5 7.5 8.2 7.5 9Z" fill="#7DD3FC" />
          <path d="M29.5 9C29.5 10.2 28.5 11.2 28.5 11.2C28.5 11.2 27.5 10.2 27.5 9C27.5 8.2 28 7.5 28.5 7.5C29.2 7.5 29.5 8.2 29.5 9Z" fill="#7DD3FC" />
        </svg>
      );

    case 'Unchecked':
    default:
      // Shallow Soft Cloud-White Dashed Circle with Waiting Face
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Cute Inquisitive Dot Eyes */}
          <circle cx="13" cy="15" r="1.6" fill="#94A3B8" />
          <circle cx="23" cy="15" r="1.6" fill="#94A3B8" />
          <path d="M15 21H21" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
      );
  }
};
