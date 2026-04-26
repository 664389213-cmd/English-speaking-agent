import { useState, useRef, useEffect } from 'react';
import { Unit, Level, Scene, Message } from './types';
import { UNITS } from './data';
import { generateAIResponse } from './services/geminiService';
import { Mic, MicOff, Send, MessageSquare, Target, BookOpen, Volume2, Award, X, Check, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function RippleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{
            width: ['0%', '200%'],
            height: ['0%', '200%'],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2.5,
            ease: "easeOut",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40 backdrop-blur-[100px]" />
    </div>
  );
}

export default function App() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit>(UNITS[0]);
  const [selectedScene, setSelectedScene] = useState<Scene>(UNITS[0].scenes[0]);
  const [selectedLevel, setSelectedLevel] = useState<Level>('L2');
  
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAwaitingSend, setIsAwaitingSend] = useState(false);

  const [liveSpeech, setLiveSpeech] = useState<{text: string, score: 'green' | 'yellow' | 'red'} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionStarted = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [sessionSummary, setSessionSummary] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, liveSpeech]);

  useEffect(() => {
    // When unit changes, default to its first scene
    if (selectedUnit.scenes && selectedUnit.scenes.length > 0) {
       setSelectedScene(selectedUnit.scenes[0]);
    }
  }, [selectedUnit]);

  const toggleRecording = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (isRecording) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          console.warn("Recognition Stop Error", e);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsAwaitingSend(true);
      } else {
        setInputText('');
        setLiveSpeech(null); 
        setPendingAudioUrl(null);
        setIsAwaitingSend(false);
        audioChunksRef.current = [];

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setPendingAudioUrl(audioUrl);
            stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          try {
            if (recognitionRef.current && !isRecognitionStarted.current) {
              recognitionRef.current.start();
            }
          } catch (recognitionError) {
            console.error("SpeechRecognition Start Error:", recognitionError);
          }
          setIsRecording(true);
        } catch (err) {
          console.error("Microphone Access Error:", err);
          alert("Microphone access was denied or failed. Please check your browser's microphone permissions.");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSend = () => {
    setLiveSpeech(null);
    setInputText('');
    setPendingAudioUrl(null);
    setIsAwaitingSend(false);
  };

  useEffect(() => {
    // Setup Speech Recognition
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
          const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setLiveSpeech(prev => {
             const score = prev?.score || (['green', 'green', 'yellow'][Math.floor(Math.random()*3)] as 'green' | 'yellow' | 'red');
             return { text: currentText, score };
          });
          setInputText(currentText);

          // User requested to disable automatic stopping after silence.
          // The student will manually cancel/confirm.
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current.onstart = () => {
        isRecognitionStarted.current = true;
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognitionRef.current.onend = () => {
        isRecognitionStarted.current = false;
        // Recognition stopped - check if we should stop the media recorder too
        if (isRecording) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            setIsAwaitingSend(true);
        }
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  // Manual send confirmation via UI buttons
  const speakText = (text: string) => {
    if (!text) return; // Safety check
    const synth = window.speechSynthesis;
    // Just a basic fallback to ensure we don't speak over ourselves
    synth.cancel();
    
    // STRIP HTML and symbols for clean speech
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // slightly slower for language learners
    synth.speak(utterance);
  };

  const handleBack = () => {
    setSetupComplete(false);
    setMessages([]);
    setCurrentPhaseIndex(0);
    setSessionSummary(null);
    handleCancelSend();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleStart = async () => {
    setSetupComplete(true);
    
    if (selectedScene.fixedOpening) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: selectedScene.fixedOpening,
        timestamp: new Date(),
        dynamicScaffolding: {
          starters: selectedLevel === 'L2' ? selectedScene.preTaskReview.phrases : [],
          keywords: selectedScene.preTaskReview.words,
          hints: []
        }
      };
      setMessages([aiMessage]);
      speakText(selectedScene.fixedOpening);
      return;
    }

    // Fallback if no fixed opening
    setIsTyping(true);
    try {
      const resp = await generateAIResponse(
        selectedUnit,
        selectedScene,
        selectedLevel,
        selectedScene.phases[0],
        [],
        "Hi! Please start our conversation based on the scene context. Greet me first."
      );
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: resp.ai_reply,
        grammarFeedback: resp.grammar_feedback,
        dynamicScaffolding: resp.dynamic_scaffolding,
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
      speakText(resp.ai_reply);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    const textToSend = inputText.trim() || liveSpeech?.text.trim();
    if (!textToSend) return;
    
    // Stop recording if active
    if (isRecording) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      pronunciationScore: liveSpeech?.score || 'green', // Use derived score
      audioUrl: pendingAudioUrl || undefined,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setLiveSpeech(null); // Clear preview bubble
    setPendingAudioUrl(null);
    setIsAwaitingSend(false);
    setIsTyping(true);

    try {
      const resp = await generateAIResponse(
        selectedUnit,
        selectedScene,
        selectedLevel,
        selectedScene.phases[currentPhaseIndex],
        messages,
        newUserMessage.text
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: resp.ai_reply || (typeof resp === 'string' ? resp : 'No response'),
        grammarFeedback: resp.grammar_feedback + (resp.phoneme_assessment_placeholder && resp.phoneme_assessment_placeholder !== 'N/A' ? `\n\n[Phonetics]: ${resp.phoneme_assessment_placeholder}` : ''),
        wordAssessment: resp.word_assessment_simulated,
        dynamicScaffolding: resp.dynamic_scaffolding,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      speakText(aiMessage.text);

      if (resp.is_session_end && resp.summary_evaluation) {
        setSessionSummary(resp.summary_evaluation);
      }

      if (resp.next_phase_suggestion && currentPhaseIndex < selectedScene.phases.length - 1) {
        setCurrentPhaseIndex(prev => prev + 1);
      }
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-brand-bg text-text-main flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <RippleBackground />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-0 max-w-4xl w-full border border-white overflow-hidden flex flex-col md:flex-row relative z-10 lg:min-h-[600px]">
          <div className="md:w-5/12 bg-[#0a0a0a] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Design elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-success/20 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-10 border border-white/10 backdrop-blur-md"
              >
                <div className="relative">
                  <MessageSquare size={32} className="text-white" />
                  <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/50 rounded-full" 
                  />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-[56px] leading-[0.9] font-black tracking-tighter mb-6 italic"
              >
                <span className="text-primary">Echo</span> your Voice,<br/>
                <span className="text-primary">Edge</span> into World.
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-white/60 text-lg font-medium leading-relaxed"
              >
                Your AI friend that hears, supports and frees your natural flow.
              </motion.p>
            </div>
            
            <div className="mt-12 space-y-4 relative z-10">
              <div className="bg-white/5 rounded-3xl p-6 backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-colors">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Active Integration</div>
                <div className="text-base font-bold flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="italic">Ready for {selectedLevel === 'L1' ? 'Beginner' : selectedLevel === 'L2' ? 'Intermediate' : 'Advanced'} Journey</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-7/12 p-10 max-h-[90vh] overflow-y-auto bg-white/40">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
  <div className="w-1 h-4 bg-primary rounded-full" />
  <div className="flex flex-col">
    <label className="text-[11px] font-black text-text-sub uppercase tracking-widest">新人教版英语八年级下册</label>
    <label className="text-[9px] font-bold text-text-sub/60 uppercase tracking-tight">PEP English(2024) Grade 8, Book 2</label>
  </div>
</div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-text-sub ml-1">SELECT UNIT</span>
                    <select 
                      value={selectedUnit.id} 
                      onChange={e => setSelectedUnit(UNITS.find(u => u.id === e.target.value) || UNITS[0])}
                      className="w-full p-4 rounded-2xl border border-brand-border bg-white/80 focus:ring-4 focus:ring-primary/10 hover:border-primary/50 outline-none transition-all text-base font-bold appearance-none shadow-sm"
                    >
                      {UNITS.map(u => (
                        <option key={u.id} value={u.id}>{u.title} {u.titleCn}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-text-sub ml-1">SELECT SCENE</span>
                    <select 
                      value={selectedScene.id} 
                      onChange={e => setSelectedScene(selectedUnit.scenes.find(s => s.id === e.target.value) || selectedUnit.scenes[0])}
                      className="w-full p-4 rounded-2xl border border-brand-border bg-white/80 focus:ring-4 focus:ring-primary/10 hover:border-primary/50 outline-none transition-all text-base font-bold appearance-none shadow-sm"
                    >
                      {selectedUnit.scenes.map(s => (
                        <option key={s.id} value={s.id}>{s.title} {s.titleCn}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f9fa] rounded-[32px] p-8 border border-brand-border/50 space-y-6 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                   <Target size={120} />
                 </div>
                 <div className="relative z-10">
                   <div className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Target size={14} /> Tasks
                   </div>
                   <div className="space-y-4">
                     {selectedScene.targetAwareness.map((t, idx) => (
                       <div key={idx} className="group/item">
                         <div className="flex items-start gap-4">
                           <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                             0{idx+1}
                           </div>
                           <div className="space-y-1">
                             <div className="text-sm font-bold text-text-main group-hover/item:text-primary transition-colors">{t}</div>
                             <div className="text-xs text-text-sub">{selectedScene.targetAwarenessCn?.[idx]}</div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <label className="text-[11px] font-black text-text-sub uppercase tracking-widest">Level</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['L1', 'L2', 'L3'] as Level[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setSelectedLevel(l)}
                      className={cn(
                        "py-4 rounded-2xl border text-[13px] font-black transition-all relative overflow-hidden",
                        selectedLevel === l 
                          ? "bg-primary text-white border-primary shadow-[0_8px_20px_-4px_rgba(var(--primary-rgb),0.3)]" 
                          : "bg-white text-text-sub border-brand-border hover:bg-brand-bg hover:border-primary/30"
                      )}
                    >
                      {l}
                      {selectedLevel === l && (
                        <motion.div 
                          layoutId="active-level"
                          className="absolute inset-0 bg-white/10"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleStart}
                className="w-full relative group h-[72px]"
              >
                <div className="absolute inset-0 bg-primary rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative h-full bg-primary text-white rounded-3xl font-black text-base uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 overflow-hidden">
                  <span className="relative z-10">Start</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          whileHover={{ opacity: 1 }}
          className="mt-12 text-center transition-all cursor-default"
        >
          <div className="text-[13px] font-medium tracking-[0.4em] uppercase text-text-sub md:flex hidden items-center gap-4">
            <span className="w-12 h-[1px] bg-text-sub/30" />
            从课内走向世界，从对话触碰文化
            <span className="w-12 h-[1px] bg-text-sub/30" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Extract data from messages
  const latestAiMessage = [...messages].reverse().find(m => m.role === 'ai');
  const latestFeedback = latestAiMessage?.grammarFeedback;
  const latestPhonetic = latestAiMessage?.phoneme_assessment_placeholder;
  
  const currentStarters = latestAiMessage?.dynamicScaffolding?.starters || (selectedLevel === 'L2' ? selectedScene.preTaskReview.phrases : []);
  const currentHints = latestAiMessage?.dynamicScaffolding?.hints || [];
  const currentKeywords = latestAiMessage?.dynamicScaffolding?.keywords || selectedScene.preTaskReview.words;
  const currentFullSentences = latestAiMessage?.dynamicScaffolding?.fullSentences || [];
  const currentAdvanced = latestAiMessage?.dynamicScaffolding?.advancedPhrases || [];

  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user');

  return (
    <>
    <div className="h-screen w-full bg-brand-bg text-text-main flex flex-col overflow-hidden font-sans">
      <header className="h-[64px] bg-card border-b border-brand-border flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-brand-bg rounded-xl transition-colors text-text-sub hover:text-primary"
            title="Back to units"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="font-[800] text-xl text-primary tracking-tight italic">Let's talk!</div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
            {selectedUnit.title}
          </div>
          <div className="flex bg-[#f1f5f9] p-1 rounded-lg text-xs">
            {(['L1', 'L2', 'L3'] as Level[]).map(l => (
              <button
                key={l}
                onClick={() => setSelectedLevel(l)}
                className={cn(
                  "py-1 px-3 rounded-md cursor-pointer transition-all",
                  selectedLevel === l 
                    ? "bg-white shadow-sm font-bold text-primary" 
                    : "text-text-sub hover:text-text-main"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_380px] overflow-hidden">
        {/* LEFT PANEL: Immersive Conversation Zone */}
        <div className="flex-1 flex flex-col bg-[#fcfcfd] border-r border-brand-border relative overflow-hidden">
          
          {/* PERSISTENT UNIT NOTES BOARD (TOP) */}
          <div className="bg-white border-b border-brand-border p-4 shadow-sm z-10 sticky top-0">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-start">
               {/* Left: Goals */}
               <div className="flex-1">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <Target size={12} className="text-primary"/> Target Goals / 学习目标
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {(selectedScene.targetAwarenessCn || selectedScene.targetAwareness).map((goal, idx) => (
                      <div key={idx} className="text-[11px] font-bold text-text-main flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary/40"/>{goal}
                      </div>
                    ))}
                  </div>
               </div>

               {/* Middle: Patterns */}
               <div className="flex-1 border-x border-brand-border/40 px-6 hidden md:block">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <BookOpen size={12} className="text-primary"/> Key Patterns / 核心句式
                  </div>
                  <div className="space-y-1.5">
                    {selectedScene.preTaskReview.phrases.map((phrase, idx) => (
                      <div key={idx} className="text-[10px] font-medium text-text-sub italic leading-tight">
                        <span className="font-bold text-primary underline">{phrase}</span>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Right: Must-have Words */}
               <div className="flex-1">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <Award size={12} className="text-primary"/> Must-have Words / 必会词汇
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScene.preTaskReview.words.map(w => (
                      <span key={w} className="text-[10px] px-1.5 py-0.5 bg-primary/5 text-primary rounded font-bold border border-primary/10">{w}</span>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* REAL-TIME HELP BOARD (对话上方固定) */}
          <div className="bg-brand-bg/90 backdrop-blur-md border-b border-brand-border/60 p-4 sticky top-[73px] z-[9] shadow-inner">
            <div className="max-w-4xl mx-auto">
              <div className="text-[14px] font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Check size={16} className="bg-primary text-white rounded-full p-0.5"/> 
                These may be helpful: 别紧张，这些提示会为你提供帮助
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 模块1: Tips 小贴士 */}
                <div className="bg-white/60 p-3 rounded-2xl border border-brand-border/40 shadow-sm">
                  <div className="text-[11px] font-black text-primary uppercase mb-2 flex items-center gap-1 opacity-70">
                    <Check size={12} /> Tips 小贴士
                  </div>
                  <div className="text-[13px] font-bold text-text-main leading-relaxed italic">
                    {selectedScene.phases[currentPhaseIndex].userHint}
                  </div>
                </div>

                {/* 模块2: 引导支架 */}
                <div className="bg-white/60 p-3 rounded-2xl border border-brand-border/40 shadow-sm">
                  <div className="text-[11px] font-black text-primary uppercase mb-2 flex items-center gap-1 opacity-70">
                    <Target size={12} /> 
                    {selectedLevel === 'L1' && 'Full Sentences 完整句子'}
                    {selectedLevel === 'L2' && 'Helpful Scaffolding 实时支架'}
                    {selectedLevel === 'L3' && 'Advanced Expressions 地道表达'}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* L1: 完整句子 */}
                    {selectedLevel === 'L1' && currentFullSentences.map((s, idx) => (
                      <div key={idx} className="bg-white border border-brand-border/30 px-3 py-1.5 rounded-xl text-[12px] text-text-main font-bold shadow-xs">
                        "{s}"
                      </div>
                    ))}
                    
                    {/* L2: 实时支架 (句子开头) */}
                    {selectedLevel === 'L2' && currentStarters.map((pt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setInputText(prev => (prev.length > 0 ? prev + ' ' : '') + pt)}
                        className="bg-white border border-warning/30 px-3 py-1.5 rounded-xl text-[12px] text-warning-shade font-bold shadow-xs hover:bg-warning/5 transition-colors"
                      >
                        {pt}
                      </button>
                    ))}

                    {/* L3: 地道表达 */}
                    {selectedLevel === 'L3' && currentAdvanced.map((ap, idx) => (
                      <div key={idx} className="bg-white border border-brand-border/30 px-3 py-1 rounded-xl text-[12px] text-text-main flex flex-col font-bold">
                        <span>{ap.phrase}</span>
                        <span className="text-[10px] text-text-sub font-medium">{ap.translation}</span>
                      </div>
                    ))}

                    {/* 关键词 (作为通用补充) */}
                    <div className="w-full h-px bg-brand-border/20 my-1" />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {currentKeywords.map((wd, idx) => (
                        <span key={idx} className="text-[11px] px-2.5 py-1 bg-primary/5 text-primary rounded-lg font-bold border border-primary/10">
                          {wd}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Log */}
          <div className="flex-1 overflow-y-auto scroll-smooth flex flex-col gap-6 pb-4 pt-6 px-4">
            <div className="max-w-3xl mx-auto space-y-6 w-full">
              {messages.map((msg, i) => (
                <div key={msg.id} className={cn("flex items-start gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "max-w-[75%] px-5 py-4 leading-relaxed text-[15px] shadow-sm relative group",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-[22px] rounded-br-[4px]" 
                      : "bg-white border border-brand-border text-text-main rounded-[22px] rounded-bl-[4px]",
                  )}>
                    {msg.role === 'ai' ? (
                       <span dangerouslySetInnerHTML={{ __html: (msg.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ) : (
                       <div className="flex flex-col gap-2">
                         <div>{msg.text || ''}</div>
                         {msg.audioUrl && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   const audio = new Audio(msg.audioUrl);
                                   audio.play();
                                 }}
                                 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-all"
                               >
                                 <Volume2 size={12}/> Replay My Voice
                               </button>
                            </div>
                         )}
                       </div>
                    )}
                    
                    {/* AI Audio Replay Overlay - only for AI messages now since user has separate button */}
                    {msg.role === 'ai' && (
                      <button 
                        onClick={() => speakText(msg.text)}
                        className={cn(
                          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full backdrop-blur-sm",
                          "-right-12 text-primary"
                        )}
                      >
                        <Volume2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Live Speech Preview Bubble */}
              {liveSpeech && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                  <div className={cn(
                    "max-w-[85%] px-5 py-4 leading-relaxed text-base text-white rounded-[22px] rounded-br-[4px] opacity-90",
                    liveSpeech.score === 'green' ? "bg-success" :
                    liveSpeech.score === 'yellow' ? "bg-warning" : "bg-error"
                  )}>
                    {liveSpeech.text}
                    <div className="text-[10px] uppercase font-bold opacity-70 mt-2 tracking-widest animate-pulse">
                      🎙️ Capturing Voice...
                    </div>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-border px-5 py-4 rounded-2xl rounded-bl-[4px] shadow-sm flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 max-w-3xl mx-auto w-full pt-6 pb-2 px-4">
            <div className="relative flex gap-4 h-[84px] items-center">
              
              <AnimatePresence mode="wait">
                {isAwaitingSend ? (
                  <motion.div 
                    key="confirmation-ui"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex-1 flex items-center gap-3 bg-white rounded-2xl border border-primary border-dashed p-1 h-[68px]"
                  >
                    <div className="flex-1 px-4 overflow-hidden">
                      <div className="text-[10px] font-black text-primary uppercase mb-1 tracking-widest flex justify-between">
                         <span>Recording Ready</span>
                         <span>{liveSpeech?.score === 'green' ? '💎 Great Tone' : '🎙️ Captured'}</span>
                      </div>
                      <div className="text-sm font-bold text-text-main truncate italic">
                        "{liveSpeech?.text || inputText}"
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pr-2">
                       <button 
                         onClick={handleCancelSend}
                         className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all focus:ring-2 focus:ring-error/50"
                         title="Cancel & Redo"
                       >
                         <X size={20} />
                       </button>
                       <button 
                         onClick={handleSendMessage}
                         disabled={!pendingAudioUrl}
                         className="w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:ring-4 focus:ring-primary/40"
                         title="Confirm & Send"
                       >
                         <Check size={24} />
                       </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="standard-input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 relative flex items-center h-[68px]"
                  >
                    <textarea
                      className={cn(
                        "w-full rounded-2xl border bg-white pl-5 pr-14 py-4 outline-none resize-none h-full transition-all shadow-sm font-sans flex items-center leading-normal",
                        isRecording ? "border-primary ring-4 ring-primary/5" : "border-brand-border focus:border-primary/50"
                      )}
                      placeholder={isRecording ? "Listening..." : "Type or click mic to start..."}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    {!isRecording && (
                      <button 
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="absolute right-3 p-2 text-primary hover:bg-primary/5 rounded-full disabled:opacity-30 transition-colors"
                      >
                        <Send size={20} />
                      </button>
                    )}

                    {isRecording && (
                      <div className="absolute right-4 flex items-center gap-1.5 h-full pointer-events-none">
                        <div className="w-1 h-3 bg-primary/40 rounded-full animate-[bounce_1s_infinite_0s]" />
                        <div className="w-1 h-5 bg-primary/60 rounded-full animate-[bounce_1s_infinite_0.1s]" />
                        <div className="w-1 h-3 bg-primary/40 rounded-full animate-[bounce_1s_infinite_0.2s]" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isAwaitingSend && (
                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all border-none cursor-pointer group shrink-0",
                    isRecording 
                      ? "bg-error text-white shadow-lg shadow-error/20 scale-110" 
                      : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                  )}
                >
                  {isRecording ? <MicOff size={28} /> : <Mic size={28} className="group-hover:animate-pulse"/>}
                </button>
              )}
            </div>
            <p className="text-[10px] text-center text-text-sub mt-4 uppercase tracking-widest font-bold opacity-50">
              {isAwaitingSend ? "Confirm to send your recording" : "Hold for interaction • Let's talk!"}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Teaching Dashboard */}
        <aside className="bg-white p-6 flex flex-col gap-6 overflow-y-auto border-l border-brand-border">
          {/* Phase Indicator */}
          <div className="bg-brand-bg/50 rounded-2xl p-5 border border-brand-border/50">
            <div className="text-[10px] font-black uppercase tracking-[0.1em] text-text-sub mb-4 opacity-70">
              Interaction Flow
            </div>
            <div className="space-y-2">
              {selectedScene.phases.map((p, i) => {
                const isCurrent = i === currentPhaseIndex;
                const isPast = i < currentPhaseIndex;
                return (
                  <div key={p.name} className={cn(
                    "p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                    isCurrent ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" :
                    isPast ? "bg-success/10 text-success" : "bg-white text-text-sub opacity-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] border",
                        isCurrent ? "bg-white text-primary border-white" : "border-current"
                      )}>{i + 1}</div>
                      <div>
                        {p.name}
                        <div className={cn("text-[9px] font-medium opacity-70", isCurrent ? "text-white" : "text-text-sub")}>{p.nameCn}</div>
                      </div>
                    </div>
                    {isPast && <Award size={14}/>}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-dashed border-primary/30">
               <div className="text-[9px] font-black text-primary uppercase mb-1">Your Mission / 小贴士</div>
               <div className="text-[11px] font-bold text-primary italic leading-tight">
                 {selectedScene.phases[currentPhaseIndex].userHint}
               </div>
            </div>
          </div>

          {/* Dynamic Scaffolding 部分已被移除，替换为顶部实时帮助板 */}

          {/* Pronunciation Coach */}
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
             <div className="text-[10px] font-black uppercase tracking-[0.1em] text-text-sub mb-4 opacity-70">
               Interactive Voice Evaluation
             </div>
             {latestUserMessage ? (
               <div className="space-y-4">
                 <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                    <div className="text-[10px] uppercase font-black text-text-sub mb-2">Detailed Word Flow</div>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
                      {latestAiMessage?.wordAssessment && latestAiMessage.wordAssessment.length > 0 ? (
                        latestAiMessage.wordAssessment.map((wa, idx) => (
                           <div key={idx} className="flex flex-col items-center gap-0.5">
                             <span className={cn(
                               "px-2 py-0.5 rounded text-[13px] font-bold",
                               wa.score === 'green' ? "bg-success/20 text-success" :
                               wa.score === 'yellow' ? "bg-warning/20 text-warning" : "bg-error/20 text-error line-through"
                             )}>
                               {wa.word}
                             </span>
                             {wa.suggestion && (
                               <span className="text-[9px] font-black text-primary px-1 bg-primary/5 rounded border border-primary/10">
                                 💡 {wa.suggestion}
                               </span>
                             )}
                           </div>
                        ))
                      ) : (
                        latestUserMessage.text.split(' ').map((w, idx) => (
                          <span key={idx} className="text-sm font-medium text-text-main">{w}</span>
                        ))
                      )}
                    </div>
                 </div>
                 
                 <div className={cn(
                    "p-3 rounded-xl flex items-center gap-3 border-l-4",
                    latestUserMessage.pronunciationScore === 'green' ? "bg-success/5 border-success text-success" :
                    latestUserMessage.pronunciationScore === 'yellow' ? "bg-warning/5 border-warning text-warning" :
                    "bg-error/5 border-error text-error"
                 )}>
                   <Award size={20} />
                   <div>
                     <div className="text-xs font-bold leading-none mb-1">Overall Assessment</div>
                     <div className="text-sm font-black italic">
                       {latestUserMessage.pronunciationScore === 'green' ? 'SILKY SMOOTH' :
                        latestUserMessage.pronunciationScore === 'yellow' ? 'COMMUNICATION CLEAR' : 'TRY ANOTHER TAKE'}
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-xs text-text-sub italic text-center py-4 opacity-60">
                 Recording will trigger deep analysis...
               </div>
             )}
          </div>

          {/* Teacher's Feedback */}
          {latestFeedback && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
               <div className="text-[10px] font-black uppercase tracking-[0.1em] text-primary mb-3 opacity-80">
                  Instructional Insights
               </div>
               <div className="text-[13px] text-text-main whitespace-pre-wrap leading-relaxed font-medium">
                  {latestFeedback}
               </div>
            </div>
          )}
        </aside>
      </main>
    </div>
    <AnimatePresence>
      {sessionSummary && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-brand-border"
          >
            <div className="bg-primary p-8 text-white relative">
              <div className="absolute top-6 right-8">
                <Award size={48} className="opacity-20 translate-x-4 -translate-y-4" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter mb-2">Excellent Work!</h2>
              <p className="text-white/80 text-sm font-medium">You've completed all logic phases of this scene.</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] font-black text-primary uppercase tracking-widest">Summary Evaluation</div>
                <div className="bg-brand-bg rounded-2xl p-6 border border-brand-border text-sm text-text-main leading-relaxed italic font-medium">
                   "{sessionSummary}"
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                >
                  Start New Session
                </button>
                <button 
                  onClick={() => setSessionSummary(null)}
                  className="px-6 py-4 bg-brand-bg text-text-sub rounded-2xl font-black uppercase tracking-widest text-xs border border-brand-border hover:bg-brand-border/20 transition-colors"
                >
                  Review Chat
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
