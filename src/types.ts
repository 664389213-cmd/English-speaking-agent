export type Level = 'L1' | 'L2' | 'L3';

export interface Phase {
  name: string;
  nameCn?: string;
  aiGoal?: string;
  userHint?: string; // Guidance for the student on what to say
}

export interface Scene {
  id: string;
  title: string;
  titleCn?: string;
  context: string;
  contextCn?: string;
  targetAwareness: string[];
  targetAwarenessCn?: string[];
  preTaskReview: {
    words: string[];
    phrases: string[];
  };
  fixedOpening?: string;
  phases: Phase[];
}

export interface Unit {
  id: string;
  title: string;
  titleCn?: string;
  scenes: Scene[];
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  textCn?: string; // Chinese translation for AI messages
  grammarFeedback?: string;
  pronunciationScore?: 'green' | 'yellow' | 'red';
  wordAssessment?: { word: string; score: 'green' | 'yellow' | 'red'; suggestion?: string }[];
  audioUrl?: string; // Local blob URL for user recordings
  timestamp: Date;
  summaryEvaluation?: string; // Stored if session ends on this message
  dynamicScaffolding?: {
    starters?: string[];
    hints?: string[];
    keywords?: string[];
    fullSentences?: string[];
    advancedPhrases?: { phrase: string; translation: string }[];
  };
}

export interface AIReply {
  ai_reply: string;
  ai_reply_cn?: string; // Chinese translation of ai_reply
  grammar_feedback: string;
  next_phase_suggestion: boolean;
  is_session_end?: boolean;
  summary_evaluation?: string;
  phoneme_assessment_placeholder?: string;
  word_assessment_simulated?: { word: string; score: 'green' | 'yellow' | 'red'; suggestion?: string }[];
  dynamic_scaffolding: {
    starters?: string[];
    hints?: string[];
    keywords?: string[];
    fullSentences?: string[];
    advancedPhrases?: { phrase: string; translation: string }[];
  };
}
