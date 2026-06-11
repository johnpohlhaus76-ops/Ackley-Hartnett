import { NextRequest, NextResponse } from 'next/server'

// Language codes supported
type LanguageCode = 'en' | 'zh' | 'ar' | 'fr' | 'de' | 'es' | 'ja' | 'ko' | 'pt' | 'ru' | 'it' | 'nl' | 'tr' | 'vi' | 'id' | 'th'

const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'zh': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'ar': 'Arabic',
  'fr': 'French',
  'de': 'German',
  'es': 'Spanish',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'it': 'Italian',
  'nl': 'Dutch',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'th': 'Thai'
}

// System prompts in multiple languages
const KYLE_SYSTEM_PROMPTS = {
  'en': `You are Kyle, Ackley Hartnett's Machine Selection Expert.
Your role: Help customers select the right Ackley machine for their needs.
Key Machines: Delta ($171,600, 50-70K pph), VIP ($161,260, 50-60K pph), Servo Drum ($404,560, 120K pph), Adjustable Ramp (800K pph)
Competitors: CMS (140K pph), Qualicaps, Enclony, Yenchen, Ceres
Always: Ask clarifying questions, recommend specific models, compare competitors, provide pricing.`,

  'zh': `你好！我是凯尔(Kyle)，艾克利哈特内特公司的机器选择专家。
我的角色：帮助客户为他们的需求选择合适的艾克利机器。
主要机器：Delta（$171,600，50-70K pph）、VIP（$161,260，50-60K pph）、Servo Drum（$404,560，120K pph）、Adjustable Ramp（800K pph）
竞争对手：CMS（140K pph）、Qualicaps、Enclony、Yenchen、Ceres
总是：提出澄清问题、推荐具体型号、比较竞争对手、提供定价。`,

  'ar': `مرحبا! أنا كايل (Kyle)، خبير اختيار الآلات في Ackley Hartnett.
دوري: مساعدة العملاء على اختيار آلة Ackley المناسبة لاحتياجاتهم.
الآلات الرئيسية: Delta ($171,600, 50-70K pph)، VIP ($161,260, 50-60K pph)، Servo Drum ($404,560, 120K pph)، Adjustable Ramp (800K pph)
المنافسون: CMS (140K pph)، Qualicaps، Enclony، Yenchen، Ceres
دائماً: اطرح أسئلة توضيحية، وصي بطرز محددة، قارن المنافسين، قدم التسعير.`,

  'fr': `Bonjour! Je suis Kyle, expert en sélection de machines chez Ackley Hartnett.
Mon rôle: Aider les clients à choisir la bonne machine Ackley pour leurs besoins.
Machines principales: Delta ($171,600, 50-70K pph), VIP ($161,260, 50-60K pph), Servo Drum ($404,560, 120K pph), Adjustable Ramp (800K pph)
Concurrents: CMS (140K pph), Qualicaps, Enclony, Yenchen, Ceres
Toujours: Poser des questions de clarification, recommander des modèles spécifiques, comparer les concurrents, fournir des prix.`,

  'de': `Hallo! Ich bin Kyle, Maschinenauswahlexperte bei Ackley Hartnett.
Meine Rolle: Kunden dabei helfen, die richtige Ackley-Maschine für ihre Anforderungen auszuwählen.
Hauptmaschinen: Delta ($171,600, 50-70K pph), VIP ($161,260, 50-60K pph), Servo Drum ($404,560, 120K pph), Adjustable Ramp (800K pph)
Konkurrenten: CMS (140K pph), Qualicaps, Enclony, Yenchen, Ceres
Immer: Klärungsfragen stellen, spezifische Modelle empfehlen, Konkurrenten vergleichen, Preise angeben.`,

  'es': `¡Hola! Soy Kyle, experto en selección de máquinas en Ackley Hartnett.
Mi rol: Ayudar a los clientes a seleccionar la máquina Ackley adecuada para sus necesidades.
Máquinas principales: Delta ($171,600, 50-70K pph), VIP ($161,260, 50-60K pph), Servo Drum ($404,560, 120K pph), Adjustable Ramp (800K pph)
Competidores: CMS (140K pph), Qualicaps, Enclony, Yenchen, Ceres
Siempre: Haga preguntas aclaratorias, recomiende modelos específicos, compare competidores, proporcione precios.`,

  'ja': `こんにちは！私はカイル（Kyle）です。Ackley Hartnettの機械選択専門家です。
私の役割：お客様が必要に合った適切なAckley機械を選択するお手伝いをします。
主要機械：Delta（$171,600、50-70K pph）、VIP（$161,260、50-60K pph）、Servo Drum（$404,560、120K pph）、Adjustable Ramp（800K pph）
競合他社：CMS（140K pph）、Qualicaps、Enclony、Yenchen、Ceres
常に：質問を明確にし、特定のモデルを推奨し、競合他社を比較し、価格を提供します。`,

  'ko': `안녕하세요! 저는 Kyle입니다. Ackley Hartnett의 기계 선택 전문가입니다.
제 역할: 고객이 그들의 필요에 맞는 올바른 Ackley 기계를 선택하도록 도와드립니다.
주요 기계: Delta ($171,600, 50-70K pph), VIP ($161,260, 50-60K pph), Servo Drum ($404,560, 120K pph), Adjustable Ramp (800K pph)
경쟁사: CMS (140K pph), Qualicaps, Enclony, Yenchen, Ceres
항상: 명확한 질문을 제기하고, 특정 모델을 권장하고, 경쟁사를 비교하고, 가격을 제공합니다.`
}

// Detect language from user message
function detectLanguage(text: string): LanguageCode {
  // Chinese characters
  if (/[一-鿿]/.test(text)) return 'zh'
  // Arabic characters
  if (/[؀-ۿ]/.test(text)) return 'ar'
  // Japanese hiragana/katakana
  if (/[぀-ゟ゠-ヿ]/.test(text)) return 'ja'
  // Korean hangul
  if (/[가-힯]/.test(text)) return 'ko'
  // Cyrillic (Russian)
  if (/[Ѐ-ӿ]/.test(text)) return 'ru'
  // Thai
  if (/[฀-๿]/.test(text)) return 'th'

  // Default to English
  return 'en'
}

// Translate response to target language
async function translateResponse(text: string, targetLanguage: LanguageCode): Promise<string> {
  if (targetLanguage === 'en') return text

  // Map language code to language name for translation prompt
  const languageNames: Record<LanguageCode, string> = {
    'en': 'English',
    'zh': 'Simplified Chinese',
    'ar': 'Arabic',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'it': 'Italian',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'th': 'Thai'
  }

  // For production, this would call a translation API (Google Translate, Claude API, etc.)
  // For now, return a placeholder that indicates the response should be translated
  return `[Response in ${languageNames[targetLanguage]}]\n\n${text}`
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, language } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Detect language from message if not provided
    const detectedLanguage = language || detectLanguage(message)

    // Generate Kyle's response
    const response = generateKyleResponse(message, conversationHistory)

    // Translate response to target language if not English
    const translatedResponse = await translateResponse(response, detectedLanguage)

    return NextResponse.json({
      response: translatedResponse,
      language: detectedLanguage,
      availableLanguages: Object.keys(SUPPORTED_LANGUAGES)
    })
  } catch (error) {
    console.error('Kyle Multi-Language API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateKyleResponse(message: string, history: string): string {
  // Same logic as before, but AI should respond in detected language
  const lower = message.toLowerCase()

  if (lower.includes('500') || lower.includes('high') || lower.includes('volume')) {
    return `For high-volume production (500K+ tablets/hour):

1. **Adjustable Ramp** - 800,000 pph (fastest!)
2. **Model C** - 300,000 pph
3. **IBM/Model B** - 250,000-300,000 pph

What is your specific application? (printing, marking, drilling?)`
  }

  // Return in detected language when translation API is integrated
  return `Great question! To help you select the right machine, I need to understand your requirements:

1. **Production volume:** How many tablets/hour?
2. **Technology:** Ink printing, laser marking, laser drilling, or integrated?
3. **Product type:** Tablets, capsules, softgels?
4. **Budget/Timeline:** Rough budget range?

Tell me more about your needs and I'll recommend the perfect Ackley machine!`
}
