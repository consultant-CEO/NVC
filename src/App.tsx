import React, { useState, useEffect } from 'react';
// Version: 1.0.1 - Added Presentation & Asset Management
import { 
  Heart, BookOpen, ArrowRight, RefreshCw, 
  CheckCircle2, AlertCircle, Loader2, List, Globe, ArrowLeft, 
  ShieldAlert, Scale, PlayCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateNVCScenario, NVCScenario, NVCChoice } from './services/gemini';
import { translations, feelingsDatabase, RESULT_TITLES } from './constants/nvcData';
import { Button, Card } from './components/common/UI';
import { TTS } from './components/common/TTS';

type Screen = 'home' | 'input' | 'game' | 'result' | 'vocab' | 'summary' | 'presentation';

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [screen, setScreen] = useState<Screen>('home');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scenario, setScenario] = useState<NVCScenario | null>(null);
  const [choice, setChoice] = useState<NVCChoice | null>(null);
  const [vocabType, setVocabType] = useState<'met' | 'notMet'>('notMet');
  const [slideIndex, setSlideIndex] = useState(1);
  const [showSlideUI, setShowSlideUI] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+U, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 's' || e.key === 'u' || e.key === 'p' || e.key === 'i' || e.key === 'j')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setErrorMsg('');
  }, [screen]);

  const checkRateLimit = () => {
    const LIMIT = 10;
    const DURATION = 3600000; // 1 hour
    const now = Date.now();
    const history = JSON.parse(localStorage.getItem('nvc_usage') || '[]');
    const recentHistory = history.filter((t: number) => now - t < DURATION);

    if (recentHistory.length >= LIMIT) {
      const oldest = recentHistory[0];
      const waitMs = DURATION - (now - oldest);
      const minutes = Math.ceil(waitMs / 60000);
      return { exceeded: true, minutes };
    }

    return { exceeded: false, history: recentHistory };
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const limitCheck = checkRateLimit();
    if (limitCheck.exceeded) {
      const msg = lang === 'zh' 
        ? `您已達到每小時 ${10} 次的限制。請等待約 ${limitCheck.minutes} 分鐘後再試。`
        : `You've reached the limit of 10 uses per hour. Please wait about ${limitCheck.minutes} minute(s).`;
      setErrorMsg(msg);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await generateNVCScenario(input, lang);
      
      // Record usage only on success
      const history = limitCheck.history || [];
      localStorage.setItem('nvc_usage', JSON.stringify([...history, Date.now()]));
      
      setScenario(result);
      setScreen('game');
      setChoice(null);
    } catch (e: any) {
      setErrorMsg((t.genError || "Error") + "\n" + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => (
    <div className="w-full max-w-md mx-auto space-y-6 fade-in py-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} 
          className="text-xs bg-white px-4 py-1.5 rounded-full border shadow-sm flex gap-2 items-center hover:bg-stone-50 transition"
        >
          <Globe className="w-3 h-3"/> {lang === 'zh' ? 'English' : '中文'}
        </button>
      </div>
      <Card className="p-8 text-center space-y-8 relative overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600 ring-4 ring-teal-50/50">
          <Heart className="w-12 h-12" fill="currentColor" fillOpacity={0.2}/>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">{t.appTitle}</h1>
          <p className="text-teal-600 font-medium text-lg">{t.appSubtitle}</p>
        </div>
        <div className="flex items-start gap-2 justify-center">
          <p className="text-stone-500 leading-relaxed max-w-[85%]">{t.introText}</p>
          <TTS text={t.introText} lang={lang}/>
        </div>
        <Button onClick={() => setScreen('input')} className="w-full text-lg shadow-teal-200">
          {t.startJourney} <ArrowRight className="w-5 h-5"/>
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setScreen('vocab')} 
            className="p-3 bg-stone-50 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition flex flex-col items-center gap-2"
          >
            <BookOpen className="w-5 h-5 text-teal-500"/> {t.vocabCard}
          </button>
          <button 
            onClick={() => setScreen('summary')} 
            className="p-3 bg-stone-50 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition flex flex-col items-center gap-2"
          >
            <List className="w-5 h-5 text-teal-500"/> {t.learningSummary}
          </button>
        </div>
        <button 
          onClick={() => { setSlideIndex(1); setScreen('presentation'); }} 
          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 font-bold hover:bg-teal-100 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <PlayCircle className="w-5 h-5" /> {t.presentation}
        </button>
        <div className="pt-2">
          <span className="text-[10px] font-mono font-bold text-stone-300 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
            V1.3.6
          </span>
          {/* Re-sync Lock: Asset-Refetch-0307 */}
        </div>
      </Card>
    </div>
  );

  const renderInput = () => (
    <div className="w-full max-w-md mx-auto fade-in flex flex-col min-h-[600px] py-8">
      <button onClick={() => setScreen('home')} className="mb-6 text-stone-400 hover:text-stone-600 flex items-center gap-2 transition">
        <ArrowLeft className="w-5 h-5"/> {t.back}
      </button>
      <Card className="p-6 space-y-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-stone-800">{t.aiTitle}</h2>
            <p className="text-stone-500 text-sm mt-1">{t.aiInstructions}</p>
          </div>
          <TTS text={t.aiInstructions} lang={lang}/>
        </div>
        <textarea 
          className="w-full flex-1 p-4 border-2 border-stone-100 rounded-xl resize-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition text-lg leading-relaxed min-h-[200px]" 
          placeholder={t.aiPlaceholder} 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          disabled={loading}
        />
        
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 whitespace-pre-wrap">{errorMsg}</span>
          </div>
        )}
        
        <Button 
          variant="ai" 
          onClick={handleGenerate} 
          disabled={loading || !input.trim()} 
          className="w-full py-4 mt-auto"
        >
          {loading ? (
            <><Loader2 className="animate-spin w-5 h-5"/> {t.generating}</>
          ) : (
            <span className="flex items-center gap-2">✨ {t.generateBtn}</span>
          )}
        </Button>
      </Card>
    </div>
  );

  const renderGame = () => {
    if (!scenario) return null;
    return (
      <div className="w-full max-w-xl mx-auto space-y-6 fade-in py-8">
        <div className="flex justify-between items-center text-sm font-medium text-stone-400">
          <span className="text-teal-600 truncate max-w-[200px] font-serif">{scenario.title}</span>
          <button onClick={() => setScreen('input')} className="hover:text-stone-600">{t.backToList}</button>
        </div>
        <Card className="p-6 bg-gradient-to-br from-white to-teal-50/30 border-teal-100 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-100 px-2 py-1 rounded">{t.situation}</h3>
            <TTS text={scenario.situation} lang={lang}/>
          </div>
          <p className="text-stone-800 text-lg leading-relaxed mb-6 font-medium">{scenario.situation}</p>
          <div className="relative pl-4 border-l-4 border-rose-400">
            <h3 className="text-xs font-bold text-rose-500 uppercase mb-1">{t.trigger}</h3>
            <p className="text-rose-900 text-lg italic font-serif">"{scenario.trigger}"</p>
          </div>
        </Card>
        <div className="space-y-4">
          <h3 className="text-stone-500 font-bold ml-1 flex items-center gap-2 text-sm uppercase tracking-wide">
            {t.howToRespond} <ArrowRight className="w-4 h-4"/>
          </h3>
          <div className="grid gap-3">
            {scenario.choices.map((c, i) => (
              <button 
                key={i} 
                onClick={() => { setChoice(c); setScreen('result'); }} 
                className="w-full text-left p-4 bg-white border-2 border-stone-100 rounded-xl hover:border-teal-500 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
              >
                <div className="flex gap-4 items-center relative z-10">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-stone-700 font-medium group-hover:text-stone-900 leading-snug">
                    {c.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!choice || !scenario) return null;
    const displayTitle = (RESULT_TITLES as any)[choice.type]?.[lang] || choice.resultTitle;
    return (
      <div className="w-full max-w-xl mx-auto space-y-6 fade-in py-8">
        <div className="text-center space-y-4 pt-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm ${choice.isNVC ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
            {choice.isNVC ? (
              <CheckCircle2 className="w-10 h-10"/>
            ) : (
              choice.type === 'comparison' ? <Scale className="w-10 h-10"/> : 
              choice.type === 'blackmail' ? <ShieldAlert className="w-10 h-10"/> : 
              <AlertCircle className="w-10 h-10"/>
            )}
          </div>
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${choice.isNVC ? 'text-teal-700' : 'text-rose-700'}`}>
              {displayTitle}
            </h2>
            <div className="inline-flex items-center gap-2 bg-stone-50 px-3 py-1 rounded-full text-sm text-stone-500">
              <TTS text={choice.feedback} lang={lang}/>
              <span>{t.listeningTip}</span>
            </div>
          </div>
        </div>
        
        <Card className="p-6 space-y-5 border-t-4 border-stone-600 shadow-md">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.yourResponse}</span>
            <p className="text-stone-800 font-medium mt-1 text-lg">"{choice.text}"</p>
          </div>
          <div>
            <h3 className="font-bold text-stone-700 mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4"/> {t.guideAnalysis}
            </h3>
            <p className="text-stone-600 leading-loose text-justify italic">{choice.feedback}</p>
          </div>
        </Card>

        {choice.isNVC && (
          <Card className="p-5 bg-teal-50 border-teal-200 shadow-inner">
            <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2 border-b border-teal-200 pb-2">
              <BookOpen className="w-5 h-5"/> {t.nvcAnalysis}
            </h3>
            <ul className="space-y-3 text-sm text-teal-900">
              <li className="flex gap-2">
                <span className="font-bold text-teal-700 min-w-[3.5rem] text-right shrink-0">{t.observation}:</span>
                <span>{scenario.nvcAnalysis.observation}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-700 min-w-[3.5rem] text-right shrink-0">{t.feeling}:</span>
                <span>{scenario.nvcAnalysis.feeling}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-700 min-w-[3.5rem] text-right shrink-0">{t.need}:</span>
                <span>{scenario.nvcAnalysis.need}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-700 min-w-[3.5rem] text-right shrink-0">{t.request}:</span>
                <span>{scenario.nvcAnalysis.request}</span>
              </li>
            </ul>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="secondary" onClick={() => setScreen('game')}>{t.tryAgain}</Button>
          <Button onClick={() => setScreen('input')}>{t.backToList}</Button>
        </div>
      </div>
    );
  };

  const renderVocab = () => {
    const list = (feelingsDatabase as any)[lang][vocabType];
    const fullText = (vocabType === 'met' ? t.metNeeds : t.unmetNeeds) + "。" + list.join("、");
    return (
      <div className="w-full max-w-lg mx-auto fade-in py-8 px-4">
        <button onClick={() => setScreen('home')} className="mb-4 text-stone-500 hover:text-stone-800 flex items-center gap-2 transition">
          <ArrowLeft className="w-5 h-5"/> {t.back}
        </button>
        <Card className="p-6 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone-800">{t.vocabCard}</h2>
            <TTS text={fullText} lang={lang}/>
          </div>
          <div className="flex bg-stone-100 rounded-lg p-1 mb-4">
            <button 
              onClick={() => setVocabType('met')} 
              className={`flex-1 py-2 rounded-md text-sm font-bold transition ${vocabType === 'met' ? 'bg-white text-teal-600 shadow-sm' : 'text-stone-400'}`}
            >
              {t.metNeeds}
            </button>
            <button 
              onClick={() => setVocabType('notMet')} 
              className={`flex-1 py-2 rounded-md text-sm font-bold transition ${vocabType !== 'met' ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-400'}`}
            >
              {t.unmetNeeds}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 content-start">
            {list.map((w: string, i: number) => (
              <span 
                key={i} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-default hover:scale-105 ${vocabType === 'met' ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
              >
                {w}
              </span>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderSummary = () => {
    const summaryText = [t.summaryTitle, t.coreSpirit, t.coreText, t.fourKeys, ...(t.fourKeysList || []).map(k => `${k.t}，${k.d}`), t.tipsTitle, ...(t.tipsList || [])].join("。");
    return (
      <div className="w-full max-w-lg mx-auto fade-in py-8 px-4">
        <button onClick={() => setScreen('home')} className="mb-4 text-stone-500 hover:text-stone-800 flex items-center gap-2 transition">
          <ArrowLeft className="w-5 h-5"/> {t.back}
        </button>
        <Card className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-stone-800">{t.summaryTitle}</h2>
            <TTS text={summaryText} lang={lang}/>
          </div>
          <section>
            <h3 className="font-bold text-teal-700 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4"/> {t.coreSpirit}
            </h3>
            <p className="text-stone-600 leading-relaxed text-sm text-justify">
              {t.coreText}
            </p>
          </section>
          <section className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <h3 className="font-bold text-stone-800 mb-3">{t.fourKeys}</h3>
            <ul className="space-y-3">
              {t.fourKeysList && t.fourKeysList.map((k, i) => (
                <li key={i} className="text-sm">
                  <span className="font-bold text-teal-700 block">{k.t}</span>
                  <span className="text-stone-600">{k.d}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-teal-50 p-4 rounded-xl border border-teal-100">
            <h3 className="font-bold text-teal-800 mb-3">{t.tipsTitle}</h3>
            <ul className="space-y-2">
              {t.tipsList && t.tipsList.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-teal-900 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="pt-6 border-t text-stone-400 text-xs text-center font-mono">
            Based on "Nonviolent Communication" by Marshall B. Rosenberg
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white select-none pointer-events-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {screen === 'home' && renderHome()}
          {screen === 'input' && renderInput()}
          {screen === 'game' && renderGame()}
          {screen === 'result' && renderResult()}
          {screen === 'vocab' && renderVocab()}
          {screen === 'summary' && renderSummary()}
          {screen === 'presentation' && (
            <Presentation 
              t={t} 
              lang={lang} 
              screen={screen} 
              setScreen={setScreen} 
              slideIndex={slideIndex} 
              setSlideIndex={setSlideIndex}
              showSlideUI={showSlideUI}
              setShowSlideUI={setShowSlideUI}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Separate Component to prevent re-render flickers
function Presentation({ 
  t, lang, screen, setScreen, slideIndex, setSlideIndex, showSlideUI, setShowSlideUI 
}: any) {
  const totalSlides = 10;
  const baseUrl = 'https://consultant-ceo.github.io/NVC/pic/';
  const rawUrl = 'https://raw.githubusercontent.com/consultant-CEO/NVC/main/pic/';
  
  // Auto-hide UI timer - Updated to 5 seconds
  useEffect(() => {
    if (screen !== 'presentation') return;
    
    const timer = setTimeout(() => {
      setShowSlideUI(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [slideIndex, showSlideUI, screen, setShowSlideUI]);

  const handleInteraction = () => {
    setShowSlideUI(true);
  };

  // Helper to get image URL from different sources
  const getImgUrl = (index: number, ext: string, source: 'pages' | 'raw' = 'pages') => {
    const fileName = `${String(index).padStart(3, '0')}.${ext}`;
    return source === 'pages' ? `${baseUrl}${fileName}` : `${rawUrl}${fileName}`;
  };

  const nextSlide = () => {
    handleInteraction();
    if (slideIndex < totalSlides) setSlideIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    handleInteraction();
    if (slideIndex > 1) setSlideIndex(prev => prev - 1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none cursor-none shadow-2xl"
      style={{ cursor: showSlideUI ? 'auto' : 'none' }}
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Header Overlay */}
      <AnimatePresence>
        {showSlideUI && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-[60] bg-gradient-to-b from-black/90 to-transparent pointer-events-none"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setScreen('home'); }} 
              className="text-white hover:text-teal-400 transition flex items-center gap-2 pointer-events-auto bg-black/60 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl active:scale-95"
            >
              <ArrowLeft className="w-5 h-5"/> {t.back}
            </button>
            <div className="text-sm font-mono tracking-widest text-white bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-xl border border-white/10 shadow-xl">
              {slideIndex} / {totalSlides}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container */}
      <div className="flex-1 relative flex items-center justify-center bg-stone-950">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -100) nextSlide();
            else if (info.offset.x > 100) prevSlide();
          }}
          className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <img 
            src={getImgUrl(slideIndex, 'JPG', 'pages')} 
            alt={`Slide ${slideIndex}`} 
            className="max-w-full max-h-full object-contain pointer-events-none"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;
              
              if (currentSrc.includes(baseUrl)) {
                if (currentSrc.endsWith('.JPG')) {
                  target.src = getImgUrl(slideIndex, 'jpg', 'pages');
                } else {
                  target.src = getImgUrl(slideIndex, 'JPG', 'raw');
                }
              } else if (currentSrc.includes(rawUrl)) {
                if (currentSrc.endsWith('.JPG')) {
                  target.src = getImgUrl(slideIndex, 'jpg', 'raw');
                }
              }
            }}
          />
        </motion.div>

        {/* Nav Controls Overlay */}
        <AnimatePresence>
          {showSlideUI && (
            <>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start pl-8 z-[55] pointer-events-none"
              >
                {slideIndex > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }} 
                    className="p-5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-xl transition shadow-3xl border border-white/20 active:scale-90 pointer-events-auto"
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </button>
                )}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-8 z-[55] pointer-events-none"
              >
                {slideIndex < totalSlides && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }} 
                    className="p-5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-xl transition shadow-3xl border border-white/20 active:scale-90 pointer-events-auto"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5 z-[60]">
        <motion.div 
          className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]"
          initial={false}
          animate={{ 
            width: `${(slideIndex / totalSlides) * 100}%`,
            opacity: showSlideUI ? 1 : 0.2
          }}
        />
      </div>
    </div>
  );
}
