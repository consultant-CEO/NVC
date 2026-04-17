export const translations = {
  zh: {
    appTitle: "非暴力溝通教練",
    appSubtitle: "AI 互動演練",
    introText: "運用馬歇爾·盧森堡博士的智慧，將衝突轉化為連結。系統現已支援五種溝通模式的辨識與演練。",
    startJourney: "開始練習",
    vocabCard: "感受詞彙表",
    learningSummary: "學習重點",
    aiTitle: "描述您的困擾",
    aiInstructions: "請輸入一個您最近遇到的衝突或困擾情境 (例如：伴侶總是遲到、同事推卸責任)。",
    aiPlaceholder: "請輸入文字敘述...",
    generateBtn: "生成演練情境",
    generating: "AI 正在分析並生成五種回應模式...",
    situation: "情境",
    trigger: "觸發事件",
    howToRespond: "您會選擇哪種回應?",
    yourResponse: "您的選擇",
    guideAnalysis: "教練分析",
    nvcAnalysis: "NVC 四要素拆解",
    observation: "觀察",
    feeling: "感受",
    need: "需要",
    request: "請求",
    tryAgain: "再試一次",
    backToList: "回到輸入",
    viewSummary: "查看總結",
    back: "返回",
    metNeeds: "需求滿足時",
    unmetNeeds: "需求未滿足時",
    genError: "生成失敗，請稍後再試。",
    summaryTitle: "非暴力溝通總結與提示",
    coreSpirit: "核心精神",
    coreText: "非暴力溝通（NVC）的目的不是為了改變別人以迎合我們，而是為了建立基於誠實與同理的連結。它幫助我們從「評判」轉向「連結」。",
    fourKeys: "四個關鍵要素",
    fourKeysList: [
      { t: "觀察 (Observation)", d: "區分觀察與評論。只說出客觀事實，不貼標籤。" },
      { t: "感受 (Feeling)", d: "區分感受與想法。表達內心的情緒，而非對他人的看法。" },
      { t: "需要 (Need)", d: "感受的根源在於我們自身的需要。不指責他人，而是確認自己看重什麼。" },
      { t: "請求 (Request)", d: "提出具體、正向、可執行的請求，而非命令。" }
    ],
    tipsTitle: "實用提示",
    tipsList: [
      "當你想說「我覺得你...」時，這通常是評判，試著改成「我覺得很傷心/生氣...」。",
      "請求要具體。不要只說「你要尊重我」，而要說「請在我說話時看著我的眼睛」。",
      "如果對方情緒激動，先同理對方（猜測對方的感受與需要），再表達自己。"
    ],
    listeningTip: "點擊聆聽分析"
  },
  en: {
    appTitle: "NVC Coach",
    appSubtitle: "AI Roleplay",
    introText: "Transform conflict into connection using Dr. Rosenberg's NVC principles.",
    startJourney: "Start",
    vocabCard: "Feelings",
    learningSummary: "Summary",
    aiTitle: "Describe Conflict",
    aiInstructions: "Describe a situation regarding a conflict you faced recently.",
    aiPlaceholder: "Type here...",
    generateBtn: "Generate Scenario",
    generating: "AI is generating 5 response types...",
    situation: "Situation",
    trigger: "Trigger",
    howToRespond: "How would you respond?",
    yourResponse: "Your Choice",
    guideAnalysis: "Analysis",
    nvcAnalysis: "4 Components",
    observation: "Obs",
    feeling: "Feel",
    need: "Need",
    request: "Req",
    tryAgain: "Retry",
    backToList: "New Input",
    viewSummary: "Summary",
    back: "Back",
    metNeeds: "Needs Met",
    unmetNeeds: "Needs Not Met",
    genError: "Generation failed.",
    summaryTitle: "Summary & Tips",
    coreSpirit: "Core Spirit",
    coreText: "NVC is about connection based on honesty and empathy, moving from judgment to connection.",
    fourKeys: "Four Components",
    fourKeysList: [
      { t: "Observation", d: "Facts without judgment." },
      { t: "Feeling", d: "Emotions, not thoughts." },
      { t: "Need", d: "Values/Longings behind feelings." },
      { t: "Request", d: "Specific, positive, doable action." }
    ],
    tipsTitle: "Practical Tips",
    tipsList: [
      "Change 'I feel that you...' to 'I feel sad/angry...'",
      "Be specific. Not 'Respect me', but 'Look at me'.",
      "Empathize first if they are emotional."
    ],
    listeningTip: "Listen to Analysis"
  }
};

export const feelingsDatabase = {
  zh: {
    met: [
      "興奮", "喜悅", "欣喜", "甜蜜", "精力充沛", "興高采烈", "感激", "感動", 
      "樂觀", "自信", "振作", "振奮", "開心", "高興", "快樂", "愉快", 
      "幸福", "陶醉", "滿足", "欣慰", "心曠神怡", "喜出望外", "平靜", "自在", 
      "舒適", "放鬆", "踏實", "安全", "溫暖", "放心", "無憂無慮", "友善", 
      "親密", "平和", "沈著", "心滿意足", "安慰", "驚喜", "著迷", "神采奕奕",
      "光彩照人", "容光煥發", "活力四射", "熱情", "溫馨", "甜美", "解脫"
    ],
    notMet: [
      "害怕", "擔心", "焦慮", "憂慮", "著着急", "緊張", "心神不寧", "心煩意亂", 
      "憂傷", "沮喪", "灰心", "氣餒", "洩氣", "絕望", "傷感", "淒涼", 
      "悲傷", "惱怒", "憤怒", "煩惱", "苦惱", "生氣", "厭煩", "不滿", 
      "不快", "不耐煩", "不高興", "震驚", "失望", "困惑", "茫然", "寂寞", 
      "孤獨", "鬱悶", "難過", "悲觀", "沉重", "麻木", "精疲力盡", "萎靡不振", 
      "疲憊不堪", "昏昏欲睡", "無精打采", "尷尬", "慚愧", "內疚", "妒忌", "遺憾", 
      "不舒服", "不安", "心碎", "心痛", "無助", "軟弱", "疲倦", "筋疲力盡",
      "沉悶", "冷漠", "畏縮", "煩躁", "氣憤", "憤恨", "憎恨", "不信任", "懷疑",
      "猶豫", "困窘", "羞愧", "後悔", "厭惡", "反感", "痛苦"
    ]
  },
  en: {
    met: [
      "Excited", "Joyful", "Delighted", "Sweet", "Energetic", "Elated", "Grateful", "Moved",
      "Optimistic", "Confident", "Refreshed", "Exhilarated", "Happy", "Glad", "Cheerful", "Pleasant",
      "Blessed", "Enchanted", "Satisfied", "Relieved", "Refreshed", "Overjoyed", "Calm", "At Ease",
      "Comfortable", "Relaxed", "Grounded", "Safe", "Warm", "Reassured", "Carefree", "Friendly",
      "Close", "Peaceful", "Composed", "Content", "Comforted", "Surprised", "Fascinated", "Radiant",
      "Beaming", "Glowing", "Vibrant", "Passionate", "Cozy", "Mellow", "Free"
    ],
    notMet: [
      "Scared", "Worried", "Anxious", "Apprehensive", "Impatient", "Tense", "Restless", "Distraught",
      "Sad", "Depressed", "Discouraged", "Disheartened", "Deflated", "Hopeless", "Sentimental", "Desolate",
      "Grieved", "Irritated", "Angry", "Troubled", "Distressed", "Mad", "Annoyed", "Dissatisfied",
      "Unpleasant", "Impatient", "Unhappy", "Shocked", "Disappointed", "Confused", "Lost", "Lonely",
      "Isolated", "Gloomy", "Miserable", "Pessimistic", "Heavy", "Numb", "Exhausted", "Lethargic",
      "Burned out", "Sleepy", "Listless", "Embarrassed", "Ashamed", "Guilty", "Jealous", "Regretful",
      "Uncomfortable", "Uneasy", "Heartbroken", "Aching", "Helpless", "Weak", "Tired", "Depleted",
      "Bored", "Indifferent", "Withdrawn", "Fidgety", "Enraged", "Resentful", "Hateful", "Mistrustful",
      "Skeptical", "Hesitant", "Awkward", "Shameful", "Sorry", "Averse", "Repulsed", "Painful"
    ]
  }
};

export const RESULT_TITLES = {
  violent: { zh: "連結斷裂：指責與評判", en: "Disconnected: Blaming & Judging" },
  passive: { zh: "自我壓抑：退縮與忍耐", en: "Suppressed: Withdrawing" },
  comparison: { zh: "痛苦根源：比較心態", en: "Resentment: Comparison" },
  blackmail: { zh: "關係勒索：情緒操控", en: "Manipulation: Emotional Blackmail" },
  nvc: { zh: "真誠連結：非暴力溝通", en: "Connection: Nonviolent Communication" }
};
