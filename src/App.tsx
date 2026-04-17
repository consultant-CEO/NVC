import React, { useState, useEffect } from 'react';
import { 
  Heart, BookOpen, ArrowRight, RefreshCw, 
  CheckCircle2, AlertCircle, Loader2, List, Globe, ArrowLeft, 
  ShieldAlert, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateNVCScenario, NVCScenario, NVCChoice } from './services/gemini';
import { translations, feelingsDatabase, RESULT_TITLES } from './constants/nvcData';
import { Button, Card } from './components/common/UI';
import { TTS } from './components/common/TTS';

type Screen = 'home' | 'input' | 'game' | 'result' | 'vocab' | 'summary';

export default function App() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [screen, setScreen] = useState<Screen>('home');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scenario, setScenario] = useState<NVCScenario | null>(null);
  const [choice, setChoice] = useState<NVCChoice | null>(null);
  const [vocabType, setVocabType] = useState<'met' | 'notMet'>('notMet');

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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
