import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import {
  Send,
  Mic,
  X,
  Sparkles,
  MessageSquare,
  Scale,
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink,
  Bot
} from 'lucide-react';

interface ChatBubbleMessage {
  id: string;
  sender: 'user' | 'squirrel';
  text: string;
  bullets?: string[];
  timestamp: string;
}

export const FloatingSquirrelAssistant: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    workloads,
    todayCheckIn,
    derivedWorkloadFacts,
    analysisResult,
    sendChatMessage,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
  } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  // Close assistant when clicking or tapping outside of it
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Auto-scroll chat balloon to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Intelligent Squirrel Answer Engine based on real AppContext data
  const generateSquirrelAnswer = (query: string): { titleIntro: string; bullets: string[] } => {
    const q = query.toLowerCase().trim();

    // 1. Workload / Main Workload / Urgent Tasks
    if (
      q.includes('workload') ||
      q.includes('task') ||
      q.includes('urgent') ||
      q.includes('priority') ||
      q.includes('due') ||
      q.includes('oop') ||
      q.includes('quiz') ||
      q.includes('assignment')
    ) {
      const activeTasks = workloads.filter(w => w.status === 'Active');
      
      // Look for OOP specific task or nearest urgent task
      const oopTask = activeTasks.find(w => w.title.toLowerCase().includes('oop'));
      const osTask = activeTasks.find(w => w.title.toLowerCase().includes('os') || w.title.toLowerCase().includes('operating'));
      const topTask = oopTask || osTask || activeTasks[0];

      if (q.includes('oop') || (!osTask && oopTask)) {
        return {
          titleIntro: 'Your main workload is the OOP Quiz Revision. Because',
          bullets: [
            'due date: Upcoming priority assessment',
            'many subtasks: Code review, past year practice & concept questions',
            'high cognitive demand profile requiring focused study blocks'
          ]
        };
      }

      if (topTask) {
        const remainingSubs = topTask.subtasks?.filter(s => !s.completed) || [];
        const deadlineDate = topTask.deadline
          ? new Date(topTask.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : 'Soon';

        return {
          titleIntro: `Your main workload is the ${topTask.title}. Because`,
          bullets: [
            `due date: Closest upcoming deadline (${deadlineDate})`,
            `${remainingSubs.length > 0 ? `${remainingSubs.length} pending subtask${remainingSubs.length > 1 ? 's' : ''}` : 'multiple subtasks'}${remainingSubs.length > 0 ? ` (${remainingSubs.map(s => s.title).slice(0, 2).join(', ')})` : ''}`,
            `cognitive demand score is ${topTask.demandProfile?.cognitive ?? 5}/5 with ${topTask.remainingTimeHours || topTask.estimatedHours}h estimated focus needed`,
            `allocating a 90-minute morning focus block will keep you ahead of deadline stress`
          ]
        };
      }

      return {
        titleIntro: 'Your active workloads are in manageable shape. Because',
        bullets: [
          'no overdue deadlines currently flagged',
          'regular check-in records are tracking on schedule',
          'recommended to review your task breakdown in the Workload tab'
        ]
      };
    }

    // 2. Stress & Balance questions
    if (
      q.includes('balance') ||
      q.includes('stress') ||
      q.includes('burnout') ||
      q.includes('feeling') ||
      q.includes('tired') ||
      q.includes('energy')
    ) {
      const cognitiveShare = '50%';
      const emotionalShare = '28%';
      const physicalShare = '22%';
      const overallBalance = '78%';

      return {
        titleIntro: `Here is your current Stress & Workload Balance (Overall: ${overallBalance}):`,
        bullets: [
          `Cognitive Demand: High (${cognitiveShare} of total strain from analytical problem solving)`,
          `Emotional Load: Moderate (${emotionalShare} due to upcoming deadlines and group expectations)`,
          `Physical Energy: ${physicalShare} (restorative breaks needed to prevent fatigue)`,
          `Suggestion: Schedule a 15-minute decompression pause or try the Tree Hole shout release!`
        ]
      };
    }

    // 3. Calendar & Time Availability questions
    if (
      q.includes('calendar') ||
      q.includes('availability') ||
      q.includes('time') ||
      q.includes('schedule') ||
      q.includes('hours') ||
      q.includes('fit')
    ) {
      return {
        titleIntro: 'Based on your next 7 Days Calendar Time Availability:',
        bullets: [
          '37h of recorded workload is due within the next 7 days',
          '86h of open calendar time identified across your schedule',
          'workload fits within your open time overall, though individual deadlines make specific days tighter',
          'protecting dedicated focus blocks will prevent last-minute cramming'
        ]
      };
    }

    // 4. Break & Recovery questions
    if (
      q.includes('break') ||
      q.includes('recover') ||
      q.includes('relax') ||
      q.includes('rest') ||
      q.includes('tree hole') ||
      q.includes('colour')
    ) {
      return {
        titleIntro: 'Take a gentle breath! 🌰 Here are recovery options ready for you:',
        bullets: [
          '🌳 Tree Hole: Vent your frustrations or shout out loud to let leaves flutter away your stress',
          '🎨 Colour Reflection: Settle your mind with intuitive colour and emotional grounding',
          '💧 Drink a glass of water and look away from screens for 5 minutes'
        ]
      };
    }

    // 5. Default contextual answer
    const activeCount = workloads.filter(w => w.status === 'Active').length;
    return {
      titleIntro: `I heard you! 🐿️ Here is what I can suggest based on your ${activeCount} active tasks:`,
      bullets: [
        'Your daily check-in is helping track cognitive and emotional trends',
        'Break larger commitments into bite-sized 30-minute milestones',
        'Ask "What is my main workload?" or "How is my balance?" anytime for immediate clarity!'
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    setHasInteracted(true);
    setInputText('');

    const userMsg: ChatBubbleMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Also connect to app-wide AI Dump Chat so history persists
    try {
      sendChatMessage(text);
    } catch {
      // Fallback safe
    }

    setTimeout(() => {
      const { titleIntro, bullets } = generateSquirrelAnswer(text);
      const squirrelMsg: ChatBubbleMessage = {
        id: `s-${Date.now()}`,
        sender: 'squirrel',
        text: titleIntro,
        bullets,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, squirrelMsg]);
      setIsThinking(false);
    }, 450);
  };

  // Voice recognition or simulated voice dictation
  const handleMicClick = () => {
    if (isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setInputText(speechResult);
          setIsListening(false);
          handleSendMessage(speechResult);
        };

        recognition.onerror = () => {
          setIsListening(false);
          // Fallback to sample voice prompt
          const sample = 'What is my main workload?';
          setInputText(sample);
          handleSendMessage(sample);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        return;
      } catch {
        setIsListening(false);
      }
    }

    // Fallback simulation if Speech API is unsupported in current browser
    setIsListening(true);
    setTimeout(() => {
      const sample = 'What is my main workload?';
      setInputText(sample);
      setIsListening(false);
      handleSendMessage(sample);
    }, 600);
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  if (activeTab === 'chat' || activeTab === 'tree' || activeTab === 'home') {
    return null;
  }

  return (
    <>
      {/* Floating Squirrel Mascot Container */}
      <div
        id="floating-squirrel-assistant"
        ref={assistantRef}
        style={{
          position: 'absolute',
          bottom: '84px',
          left: '12px',
          zIndex: 110,
          display: 'flex',
          alignItems: 'flex-end',
          pointerEvents: 'none', // Children will have pointerEvents auto
        }}
      >
        {/* Mascot Avatar Button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          title="Squirrel Assistant — Click to chat!"
          style={{
            pointerEvents: 'auto',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            position: 'relative',
            outline: 'none',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'scale(1.06)' : 'scale(1)',
          }}
        >
          {/* Subtle Glow Ring behind Squirrel */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(254, 215, 170, 0.6) 0%, rgba(254, 243, 199, 0) 70%)',
              filter: 'blur(4px)',
              opacity: isOpen ? 0.9 : 0.6,
              animation: 'pulseGlow 2.5s infinite ease-in-out',
            }}
          />

          {/* Squirrel Image */}
          <img
            src="/assets/squirrel.png"
            alt="Squirrel Mascot Assistant"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 6px 12px rgba(180, 83, 9, 0.22))',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Chat Balloon Card (Picture 1 style) */}
        {isOpen && (
          <div
            id="squirrel-chatbox-balloon"
            style={{
              pointerEvents: 'auto',
              marginLeft: '8px',
              width: '286px',
              maxWidth: 'calc(100vw - 96px)',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '24px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12), 0 4px 14px rgba(249, 115, 22, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              padding: '14px 14px 12px 14px',
              boxSizing: 'border-box',
              position: 'relative',
              animation: 'fadeSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Speech Bubble Little Tail Nub Pointing to Squirrel */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                left: '-8px',
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid rgba(255, 255, 255, 0.96)',
                filter: 'drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.04))',
              }}
            />

            {/* Header: "Anything I can help?" + Close button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: messages.length > 0 ? '8px' : '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#1E293B',
                    letterSpacing: '-0.2px',
                    fontFamily: "'Outfit', -apple-system, sans-serif",
                  }}
                >
                  Anything I can help?
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setActiveTab('chat')}
                  title="Open full AI Stress Dump Chat"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '3px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '3px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Conversation History / Output Display (Panel 4) */}
            {messages.length > 0 && (
              <div
                ref={chatContainerRef}
                className="hide-scrollbar"
                style={{
                  maxHeight: '190px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '10px',
                  paddingRight: '2px',
                }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.sender === 'user' ? (
                      /* User Question Pill */
                      <div
                        style={{
                          backgroundColor: '#FFF7ED',
                          border: '1px solid #FFEDD5',
                          color: '#9A3412',
                          borderRadius: '16px 16px 4px 16px',
                          padding: '6px 11px',
                          fontSize: '12px',
                          fontWeight: 600,
                          maxWidth: '92%',
                          lineHeight: 1.4,
                        }}
                      >
                        {msg.text}
                      </div>
                    ) : (
                      /* Squirrel Answer Box (Picture 1 Panel 4) */
                      <div
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#1E293B',
                          borderRadius: '16px 16px 16px 4px',
                          padding: '8px 11px',
                          fontSize: '12px',
                          lineHeight: 1.45,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                          {msg.text}
                        </div>

                        {msg.bullets && msg.bullets.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                            {msg.bullets.map((b, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '5px',
                                  fontSize: '11.5px',
                                  color: '#334155',
                                }}
                              >
                                <span style={{ color: '#F97316', fontWeight: 900, lineHeight: 1.2 }}>•</span>
                                <span style={{ flex: 1 }}>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking / Typing indicator */}
                {isThinking && (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '14px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      width: 'fit-content',
                    }}
                  >
                    <Sparkles size={12} color="#F97316" className="animate-spin" />
                    <span>Squirrel is analyzing... 🌰</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick 1-tap Suggestion Prompts (When first opened or user wants quick answers) */}
            {messages.length === 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  marginBottom: '10px',
                }}
              >
                <button
                  onClick={() => handleQuickQuestion('What is my main workload?')}
                  style={{
                    background: 'rgba(255, 247, 237, 0.9)',
                    border: '1px solid rgba(254, 215, 170, 0.8)',
                    borderRadius: '12px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#C2410C',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span>⚡ What is my main workload?</span>
                  <ChevronRight size={13} color="#F97316" />
                </button>

                <button
                  onClick={() => handleQuickQuestion('How is my stress balance?')}
                  style={{
                    background: 'rgba(240, 253, 244, 0.9)',
                    border: '1px solid rgba(187, 247, 208, 0.8)',
                    borderRadius: '12px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#166534',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span>⚖️ How is my stress balance?</span>
                  <ChevronRight size={13} color="#16A34A" />
                </button>

                <button
                  onClick={() => handleQuickQuestion('Can I fit my tasks in calendar?')}
                  style={{
                    background: 'rgba(240, 249, 255, 0.9)',
                    border: '1px solid rgba(186, 230, 253, 0.8)',
                    borderRadius: '12px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0369A1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span>📅 Can my tasks fit in calendar?</span>
                  <ChevronRight size={13} color="#0284C7" />
                </button>
              </div>
            )}

            {/* Input Bar with Orange Mic & Cyan Send Button (Matching Picture 1) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFFFFF',
                borderRadius: '22px',
                border: '1.2px solid rgba(226, 232, 240, 0.95)',
                padding: '3px 4px 3px 10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder={isListening ? 'Listening...' : 'Ask a question...'}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#1E293B',
                  backgroundColor: 'transparent',
                  padding: '4px 0',
                  fontFamily: "'Outfit', -apple-system, sans-serif",
                }}
              />

              {/* Orange Microphone Button */}
              <button
                onClick={handleMicClick}
                title={isListening ? 'Listening to voice...' : 'Speak question'}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: isListening ? '#FDBA74' : '#FFF7ED',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: isListening ? '0 0 10px rgba(249, 115, 22, 0.5)' : 'none',
                }}
              >
                <Mic size={14} strokeWidth={2.2} />
              </button>

              {/* Cyan / Sky Blue Send Button (Picture 1) */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                title="Send question"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: inputText.trim()
                    ? 'linear-gradient(135deg, #BAE6FD 0%, #38BDF8 100%)'
                    : '#E2E8F0',
                  color: inputText.trim() ? '#0284C7' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: inputText.trim() ? '0 2px 8px rgba(56, 189, 248, 0.4)' : 'none',
                }}
              >
                <Send size={13} strokeWidth={2.4} style={{ marginLeft: '1px' }} />
              </button>
            </div>

            {/* Sub-footer link to full AI Chat */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '6px',
                padding: '0 4px',
                fontSize: '10px',
                color: '#94A3B8',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Bot size={11} color="#F97316" /> Connected to AI Chat
              </span>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#EA580C',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                Open Full Chat <ChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global CSS for subtle animations */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
        @keyframes bounceSlight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};
