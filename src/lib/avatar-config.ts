// Avatar Configuration for Virtual Showroom
// Chinese Female Avatar, 20s, Professional

export const AVATAR_CONFIG = {
  name: "Wei Lin",
  description: "Professional Sales Representative",
  appearance: {
    ethnicity: "Chinese",
    ageRange: "20s",
    style: "Professional Business Casual",
    features: {
      hairColor: "Black",
      hairStyle: "Professional Long Hair",
      skinTone: "East Asian",
      outfit: "Modern Business Suit with Ackley Hartnett Branding",
    },
  },
  personality: {
    tone: "Professional yet Friendly",
    expertise: "Pharmaceutical Machinery Expert",
    languages: [
      "English",
      "Mandarin Chinese",
      "Japanese",
      "Korean",
      "Spanish",
      "German",
      "Thai",
      "Vietnamese",
      "Italian",
      "Portuguese",
      "Swiss German",
    ],
  },
  voice: {
    provider: "ElevenLabs",
    voiceId: {
      english: "rachel", // Professional female English voice
      chinese: "yan", // Native Mandarin speaker
      japanese: "yuki", // Native Japanese speaker
      korean: "hyun", // Native Korean speaker
      spanish: "isabella", // Spanish speaker
      german: "anna", // German speaker
      thai: "niran", // Thai speaker
      vietnamese: "linh", // Vietnamese speaker
      italian: "giulia", // Italian speaker
      portuguese: "lucia", // Portuguese speaker
      "swiss-german": "anna", // Use German voice
    },
    settings: {
      stability: 0.5,
      similarityBoost: 0.75,
      speakingRate: 1.0,
    },
  },
  animations: {
    gestures: [
      "welcome_wave",
      "listening",
      "thinking",
      "pointing_to_screen",
      "product_demo",
      "thank_you",
    ],
    eyeContact: true,
    facialExpressions: true,
    bodyLanguage: true,
  },
  greeting: {
    english: "Welcome to Ackley Hartnett! I'm Wei Lin. How can I help you today?",
    chinese: "欢迎来到Ackley Hartnett！我是韦林。今天我能如何帮助您？",
    japanese: "Ackley Hartnettへようこそ！ウェイ・リンです。今日はどのようにお手伝いできますか？",
    korean: "Ackley Hartnett에 오신 것을 환영합니다! 저는 웨이 린입니다. 오늘 어떻게 도와드릴까요?",
    spanish: "¡Bienvenido a Ackley Hartnett! Soy Wei Lin. ¿Cómo puedo ayudarte hoy?",
    german: "Willkommen bei Ackley Hartnett! Ich bin Wei Lin. Wie kann ich dir heute helfen?",
    thai: "ยินดีต้อนรับสู่ Ackley Hartnett! ฉันคือเวย์ลิน วันนี้ฉันสามารถช่วยคุณได้อย่างไร?",
    vietnamese: "Chào mừng bạn đến với Ackley Hartnett! Tôi là Wei Lin. Hôm nay tôi có thể giúp bạn như thế nào?",
    italian: "Benvenuto ad Ackley Hartnett! Sono Wei Lin. Come posso aiutarti oggi?",
    portuguese: "Bem-vindo à Ackley Hartnett! Sou Wei Lin. Como posso ajudá-lo hoje?",
    "swiss-german": "Willkommen bei Ackley Hartnett! Ich bin Wei Lin. Wie kann ich dir heute helfen?",
  },
};

export const SHOWROOM_CONFIG = {
  environment: {
    style: "Modern High-Tech Showroom",
    lighting: "Professional Studio Lighting",
    background: "Virtual High-Tech Pharmaceutical Lab",
    flooring: "Polished Concrete with Accent Lighting",
    layout: "Avatar Left, Screen Right for Product Display",
  },
  screens: {
    primary: "4K Product Display Screen",
    secondary: "Machine Specification Panel",
    tertiary: "Video Carousel",
  },
};
