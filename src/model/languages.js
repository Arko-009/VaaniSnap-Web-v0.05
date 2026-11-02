// Scalable vector flags for cross-platform visual brilliance (resolves Windows emoji flag limitations)
export const SVG_FLAGS = {
  "EN": `<svg viewBox="0 0 640 480" class="flag-icon"><g fill-rule="evenodd"><path fill="#bd3d44" d="M0 0h640v480H0z"/><path stroke="#fff" stroke-width="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"/><path fill="#192f5d" d="M0 0h260v260H0z"/><circle cx="130" cy="130" r="15" fill="#fff"/></g></svg>`,
  "HI": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#f93" d="M0 0h640v160H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#128807" d="M0 320h640v160H0z"/><circle cx="320" cy="240" r="45" fill="none" stroke="#008" stroke-width="8"/><circle cx="320" cy="240" r="8" fill="#008"/></svg>`,
  "BN": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#f93" d="M0 0h640v160H0z"/><path fill="#fff" d="M0 160h640v160H0z"/><path fill="#128807" d="M0 320h640v160H0z"/><circle cx="320" cy="240" r="45" fill="none" stroke="#008" stroke-width="8"/><circle cx="320" cy="240" r="8" fill="#008"/></svg>`,
  "ES": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#c60b1e" d="M0 0h640v480H0z"/><path fill="#ffc400" d="M0 120h640v240H0z"/></svg>`,
  "FR": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#002395" d="M0 0h213.3v480H0z"/><path fill="#fff" d="M213.3 0h213.4v480H213.3z"/><path fill="#ed2939" d="M426.7 0H640v480H426.7z"/></svg>`,
  "JA": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#fff" d="M0 0h640v480H0z"/><circle cx="320" cy="240" r="120" fill="#bc002d"/></svg>`,
  "AR": `<svg viewBox="0 0 640 480" class="flag-icon"><path fill="#006c35" d="M0 0h640v480H0z"/><path fill="#fff" d="M180 230h280v20H180z"/></svg>`
};

// Supported Languages in VaaniSnap matching com.vaanisnap.app.model.AppLanguage
export const SUPPORTED_LANGUAGES = [
  {
    name: "English",
    region: "United States",
    code: "EN",
    locale: "en-US",
    flag: "🇺🇸",
    sampleSentence: "Hey, could you tell me where the nearest train station is?"
  },
  {
    name: "Hindi",
    region: "India",
    code: "HI",
    locale: "hi-IN",
    flag: "🇮🇳",
    sampleSentence: "नमस्ते, क्या आप मुझे बता सकते हैं कि सबसे पास का रेलवे स्टेशन कहाँ है?"
  },
  {
    name: "Bengali",
    region: "India / BD",
    code: "BN",
    locale: "bn-IN",
    flag: "🇮🇳",
    sampleSentence: "নমস্কার, আপনি কি বলতে পারেন সবচেয়ে কাছের ট্রেন স্টেশনটি কোথায়?"
  },
  {
    name: "Spanish",
    region: "Spain",
    code: "ES",
    locale: "es-ES",
    flag: "🇪🇸",
    sampleSentence: "Hola, ¿podrías decirme dónde está la estación de tren más cercana?"
  },
  {
    name: "French",
    region: "France",
    code: "FR",
    locale: "fr-FR",
    flag: "🇫🇷",
    sampleSentence: "Bonjour, pourriez-vous me dire où se trouve la gare la plus proche ?"
  },
  {
    name: "Japanese",
    region: "Japan",
    code: "JA",
    locale: "ja-JP",
    flag: "🇯🇵",
    sampleSentence: "こんにちは、一番近い駅はどこにあるか教えていただけますか？"
  },
  {
    name: "Arabic",
    region: "Saudi Arabia",
    code: "AR",
    locale: "ar-SA",
    flag: "🇸🇦",
    sampleSentence: "مرحباً، هل يمكنك إخباري أين توجد أقرب محطة قطار؟"
  }
];

// Curated phrase bank for instant testing & robust zero-cost translation fallback
export const QUICK_PHRASES = [
  {
    text: "Where is the nearest train station?",
    label: "Train Station",
    icon: "🚆"
  },
  {
    text: "Hello! Nice to meet you, what is your name?",
    label: "Greetings",
    icon: "👋"
  },
  {
    text: "Can you help me please? I am looking for a doctor.",
    label: "Medical Help",
    icon: "🏥"
  },
  {
    text: "How much does this cost?",
    label: "Shopping",
    icon: "🏷️"
  },
  {
    text: "Thank you so much for your kind help!",
    label: "Gratitude",
    icon: "🙏"
  },
  {
    text: "The food here is delicious. What do you recommend?",
    label: "Restaurant",
    icon: "🍲"
  }
];

// Offline translation lookup cache for travel & daily communication
export const OFFLINE_TRANSLATION_BANK = {
  // Train station
  "where is the nearest train station?": {
    "HI": "सबसे पास का रेलवे स्टेशन कहाँ है?",
    "BN": "সবচেয়ে কাছের ট্রেন স্টেশনটি কোথায়?",
    "ES": "¿Dónde está la estación de tren más cercana?",
    "FR": "Où se trouve la gare la plus proche ?",
    "JA": "一番近い駅はどこですか？",
    "AR": "أين توجد أقرب محطة قطار؟",
    "EN": "Where is the nearest train station?"
  },
  // Greetings
  "hello! nice to meet you, what is your name?": {
    "HI": "नमस्ते! आपसे मिलकर खुशी हुई, आपका नाम क्या है?",
    "BN": "নমস্কার! আপনার সাথে দেখা করে ভালো লাগলো, আপনার নাম কি?",
    "ES": "¡Hola! Mucho gusto, ¿cómo te llamas?",
    "FR": "Bonjour ! Ravi de vous rencontrer, comment vous vous appelez ?",
    "JA": "こんにちは！お会いできて嬉しいです、お名前は何ですか？",
    "AR": "مرحباً! تشرفت بلقائك، ما هو اسمك؟",
    "EN": "Hello! Nice to meet you, what is your name?"
  },
  // Medical
  "can you help me please? i am looking for a doctor.": {
    "HI": "क्या आप मेरी मदद कर सकते हैं? मैं एक डॉक्टर को ढूंढ रहा हूँ।",
    "BN": "আপনি কি আমাকে সাহায্য করতে পারেন? আমি একজন ডাক্তার খুঁজছি।",
    "ES": "¿Podría ayudarme por favor? Estoy buscando un médico.",
    "FR": "Pouvez-vous m'aider s'il vous plaît ? Je cherche un médecin.",
    "JA": "手伝っていただけますか？医者を探しています。",
    "AR": "هل يمكنك مساعدتي من فضلك؟ أنا أبحث عن طبيب.",
    "EN": "Can you help me please? I am looking for a doctor."
  },
  // Cost
  "how much does this cost?": {
    "HI": "इसकी कीमत क्या है?",
    "BN": "এটার দাম কত?",
    "ES": "¿Cuánto cuesta esto?",
    "FR": "Combien cela coûte-t-il ?",
    "JA": "これはいくらですか？",
    "AR": "كم يكلف هذا؟",
    "EN": "How much does this cost?"
  },
  // Thank you
  "thank you so much for your kind help!": {
    "HI": "आपकी उदार मदद के लिए बहुत-बहुत धन्यवाद!",
    "BN": "আপনার আন্তরিক সাহায্যের জন্য অনেক ধন্যবাদ!",
    "ES": "¡Muchas gracias por su amable ayuda!",
    "FR": "Merci beaucoup pour votre aimable aide !",
    "JA": "親切なご協力、本当にありがとうございます！",
    "AR": "شكراً جزيلاً لك على مساعدتك الكريمة!",
    "EN": "Thank you so much for your kind help!"
  },
  // Food
  "the food here is delicious. what do you recommend?": {
    "HI": "यहाँ का खाना बहुत स्वादिष्ट है। आप क्या सलाह देते हैं?",
    "BN": "এখানে খাবার খুব সুস্বাদু। আপনি কি সুপারিশ করেন?",
    "ES": "La comida aquí es deliciosa. ¿Qué recomiendas?",
    "FR": "La nourriture ici est délicieuse. Que recommandez-vous ?",
    "JA": "ここの料理はとても美味しいです。おすすめは何ですか？",
    "AR": "الطعام هنا لذيذ جداً. ما الذي تنصح به؟",
    "EN": "The food here is delicious. What do you recommend?"
  }
};
