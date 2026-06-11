import { NextRequest, NextResponse } from 'next/server'

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

// Tim's system prompts in multiple languages
const TIM_SYSTEM_PROMPTS = {
  'en': `You are Tim, Ackley Hartnett's Technical Support Expert.
Your role: Provide technical specifications, maintenance guidance, and compliance support.
Specialties: NIR Spectroscopy, Laser Drilling, Vision Inspection, Pharmaceutical Validation, 21 CFR Part 11
Key Technologies: OROS drilling (60K pph, ±0.05mm precision), NIR membrane verification, 360° vision inspection
Always: Explain the "why" behind design choices, reference innovations, connect to compliance needs.`,

  'zh': `你好！我是蒂姆(Tim)，艾克利哈特内特公司的技术支持专家。
我的角色：提供技术规格、维护指导和合规支持。
专业领域：NIR光谱学、激光钻孔、视觉检查、药学验证、21 CFR第11部分
关键技术：OROS钻孔（60K pph，±0.05mm精度）、NIR膜完整性验证、360°视觉检查
总是：解释设计选择背后的"原因"、引用创新、连接合规需求。`,

  'ar': `مرحبا! أنا تيم (Tim)، خبير الدعم الفني في Ackley Hartnett.
دوري: تقديم المواصفات الفنية والتوجيه الصيانة ودعم الامتثال.
التخصصات: مطيافية NIR، الحفر بالليزر، فحص الرؤية، التحقق الدوائي، 21 CFR الجزء 11
التقنيات الرئيسية: حفر OROS (60K pph، ± 0.05 ملم)، التحقق من سلامة الغشاء NIR، فحص الرؤية 360 درجة
دائماً: شرح "لماذا" وراء خيارات التصميم، الاستشهاد بالابتكارات، الربط باحتياجات الامتثال.`,

  'fr': `Bonjour! Je suis Tim, expert en support technique chez Ackley Hartnett.
Mon rôle: Fournir des spécifications techniques, des conseils de maintenance et un support de conformité.
Spécialités: Spectroscopie NIR, perçage au laser, inspection visuelle, validation pharmaceutique, 21 CFR Partie 11
Technologies clés: Perçage OROS (60K pph, ±0,05 mm), vérification de l'intégrité de la membrane NIR, inspection visuelle 360°
Toujours: Expliquer le "pourquoi" des choix de conception, citer les innovations, connecter les besoins de conformité.`,

  'de': `Hallo! Ich bin Tim, technischer Support-Experte bei Ackley Hartnett.
Meine Rolle: Technische Spezifikationen, Wartungsanleitungen und Compliance-Support bereitstellen.
Spezialgebiete: NIR-Spektroskopie, Laserbohren, Sichtprüfung, pharmazeutische Validierung, 21 CFR Teil 11
Schlüsseltechnologien: OROS-Bohren (60K pph, ±0,05 mm Genauigkeit), NIR-Membranintegritätsprüfung, 360°-Sichtprüfung
Immer: Erklären Sie das "Warum" hinter Designentscheidungen, zitieren Sie Innovationen, verbinden Sie Compliance-Anforderungen.`,

  'es': `¡Hola! Soy Tim, experto en soporte técnico en Ackley Hartnett.
Mi rol: Proporcionar especificaciones técnicas, orientación de mantenimiento y apoyo de cumplimiento.
Especialidades: Espectroscopía NIR, perforación con láser, inspección visual, validación farmacéutica, 21 CFR Parte 11
Tecnologías clave: Perforación OROS (60K pph, ±0,05 mm de precisión), verificación de integridad de membrana NIR, inspección visual 360°
Siempre: Explique el "por qué" detrás de las opciones de diseño, cite innovaciones, conecte necesidades de cumplimiento.`,

  'ja': `こんにちは！私はティム（Tim）です。Ackley Hartnettの技術サポート専門家です。
私の役割：技術仕様、メンテナンスガイダンス、およびコンプライアンスサポートを提供します。
専門分野：NIR分光法、レーザー穿孔、ビジョン検査、医薬品検証、21 CFR第11部
主要技術：OROS穿孔（60K pph、±0.05mm精度）、NIR膜完全性検証、360°ビジョン検査
常に：設計選択の「理由」を説明し、革新を引用し、コンプライアンスニーズを接続します。`,

  'ko': `안녕하세요! 저는 Tim입니다. Ackley Hartnett의 기술 지원 전문가입니다.
제 역할: 기술 사양, 유지보수 지침 및 준수 지원을 제공합니다.
전문 분야: NIR 분광법, 레이저 드릴링, 비전 검사, 제약 검증, 21 CFR 제11부
주요 기술: OROS 드릴링 (60K pph, ±0.05mm 정확도), NIR 막 무결성 검증, 360° 비전 검사
항상: 설계 선택의 "이유"를 설명하고, 혁신을 인용하고, 규정 준수 필요사항을 연결합니다.`
}

// Detect language from user message
function detectLanguage(text: string): LanguageCode {
  if (/[一-鿿]/.test(text)) return 'zh'
  if (/[؀-ۿ]/.test(text)) return 'ar'
  if (/[぀-ゟ゠-ヿ]/.test(text)) return 'ja'
  if (/[가-힯]/.test(text)) return 'ko'
  if (/[Ѐ-ӿ]/.test(text)) return 'ru'
  if (/[฀-๿]/.test(text)) return 'th'
  return 'en'
}

// Translate response to target language
async function translateResponse(text: string, targetLanguage: LanguageCode): Promise<string> {
  if (targetLanguage === 'en') return text

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

  // For production, connect to translation API
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

    // Detect language from message
    const detectedLanguage = language || detectLanguage(message)

    // Generate Tim's response
    const response = generateTimResponse(message, conversationHistory)

    // Translate if needed
    const translatedResponse = await translateResponse(response, detectedLanguage)

    return NextResponse.json({
      response: translatedResponse,
      language: detectedLanguage,
      availableLanguages: Object.keys(SUPPORTED_LANGUAGES)
    })
  } catch (error) {
    console.error('Tim Multi-Language API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function generateTimResponse(message: string, history: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('nir') || lower.includes('spectroscopy')) {
    return `NIR (Near-Infrared) Spectroscopy is Ackley's Proprietary Innovation:

**How it Works:**
- Dual NIR spectrometers scan each tablet BEFORE drilling
- Verifies osmotic membrane integrity at the micron level
- Rejects defective tablets automatically

**Why It Matters:**
- Prevents catastrophic batch failures
- Saves millions in validation rework
- ONLY Ackley system with this technology

**Competitive Advantage:**
- Scantech: No NIR capability
- CMS: No NIR capability
- Yenchen: No NIR capability
- Qualicaps: New QUALIS-Pro has 3D inspection but different technology

**Award Recognition:**
- 2020 Medicine Maker Innovation Award finalist
- Patent-protected process

This is why pharmaceutical companies choose Ackley for OROS applications.`
  }

  if (lower.includes('spec') || lower.includes('specification')) {
    return `**VIP Laser Drill + NIR Technical Specifications:**

**Drilling Performance:**
- Output: Up to 60,000 tablets/hour
- Aperture Size: 0.4mm - 1.2mm diameter
- Tolerance: ±0.05mm (extremely precise)
- Depth Control: Through coating only

**Verification Technology:**
- NIR Spectrometers: Dual units
- Detection: Osmotic membrane integrity
- Process: Pre-drilling verification

**Vision Inspection:**
- Cameras: 5+ megapixel
- Coverage: 360° inspection
- Verification: 100% aperture check
- Rejection: Automatic defect removal

**Compliance & Data:**
- 21 CFR Part 11 compliant
- Real-time SPC monitoring
- Recipe-driven operation
- Full IQ/OQ/PQ packages

What specific aspect would you like details on?`
  }

  // Default multi-language response
  return `Great question! I can help with technical details.

I can answer questions about:
- Machine specifications
- NIR spectroscopy technology
- Maintenance schedules
- 21 CFR Part 11 compliance
- GAMP 5 validation
- Troubleshooting procedures
- Competitor technical comparison

What would you like to know?`
}
