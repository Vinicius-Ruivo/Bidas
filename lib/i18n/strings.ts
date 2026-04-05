export type Locale = "pt-BR" | "en";

export type MessageKey = keyof typeof stringsPtBR;

/** Textos em português do Brasil (idioma padrão da interface). */
export const stringsPtBR = {
  "locale.pt": "Português (Brasil)",
  "locale.en": "English",

  "dashboard.brand": "VetAnest.IA",
  "dashboard.title": "Bidas — Co-piloto de Anestesiologia Veterinária",
  "dashboard.description":
    "Cadastro de pacientes, cálculo de doses por peso e assistente conversacional para apoio à decisão clínica.",
  "dashboard.language": "Idioma da interface",
  "dashboard.badge": "Centro cirúrgico — modo escuro",
  "dashboard.activePatientTitle": "Paciente ativo para cálculo",
  "dashboard.weight": "Peso:",
  "dashboard.breed": "Raça:",
  "dashboard.breedUnknown": "Não informada",
  "dashboard.age": "Idade:",
  "dashboard.ageYears": "anos",
  "dashboard.selectPatient": "Selecione um paciente para sincronizar o peso na calculadora.",
  "dashboard.chatAria": "Chat com o Bidas",
  "dashboard.emergency": "EMERGÊNCIA",

  "patientForm.title": "Cadastro de Paciente",
  "patientForm.description": "Registrar dados base para cálculo de doses e plano anestésico.",
  "patientForm.nameLabel": "Nome do paciente",
  "patientForm.namePh": "Ex.: Thor",
  "patientForm.speciesLabel": "Espécie",
  "patientForm.speciesDog": "Cão",
  "patientForm.speciesCat": "Gato",
  "patientForm.speciesHorse": "Equino",
  "patientForm.speciesOther": "Outro",
  "patientForm.breedLabel": "Raça",
  "patientForm.breedPh": "Ex.: Labrador",
  "patientForm.weightLabel": "Peso (kg)",
  "patientForm.weightPh": "Ex.: 18,7",
  "patientForm.ageLabel": "Idade (anos)",
  "patientForm.agePh": "Ex.: 4",
  "patientForm.historyLabel": "Histórico clínico",
  "patientForm.historyPh": "Ex.: histórico de sopro cardíaco, alergias, medicações em uso…",
  "patientForm.footerEmpty": "Preencha nome e peso para habilitar o cálculo.",
  "patientForm.footerSaved": "Paciente ativo: {{name}} ({{kg}} kg)",
  "patientForm.saving": "Salvando…",
  "patientForm.save": "Salvar paciente",

  "patientList.title": "Pacientes cadastrados",
  "patientList.descSupabase": "Dados sincronizados com Supabase.",
  "patientList.descLocal": "Modo local ativo (sem credenciais Supabase).",
  "patientList.loading": "Carregando pacientes…",
  "patientList.empty": "Nenhum paciente cadastrado ainda.",
  "patientList.weight": "Peso:",
  "patientList.registered": "Cadastro:",
  "patientList.dataSource": "Fonte de dados ativa:",
  "patientList.sourceSupabase": "Supabase",
  "patientList.sourceLocal": "LocalStorage",
  "patientList.newProcedure": "Novo procedimento (próximo passo)",

  "dose.title": "Calculadora de doses",
  "dose.description":
    "Motor inicial por peso com fórmula visível e confirmação obrigatória para administração.",
  "dose.weightLabel": "Peso do paciente (kg)",
  "dose.weightPh": "Informe o peso para calcular",
  "dose.alertTitle": "Confirmação obrigatória antes de registrar administração.",
  "dose.alertBody":
    "Os cálculos são suporte à decisão e devem ser validados pelo anestesiologista responsável.",
  "dose.confirmCheck":
    "Confirmo que revisei fórmula, concentração e condição clínica antes da administração.",
  "dose.noWeight": "Insira um peso válido para gerar recomendações de dose.",
  "dose.target": "Dose alvo:",
  "dose.range": "Faixa:",
  "dose.formula": "Fórmula:",
  "dose.note": "Nota:",
  "dose.logBlocked": "Registrar administração (bloqueado sem confirmação)",

  "category.MPA": "MPA",
  "category.INDUCAO": "INDUÇÃO",
  "category.EMERGENCIA": "EMERGÊNCIA",

  "chat.title": "Conversar com o Bidas",
  "chat.description.before":
    "Fale ou digite — o assistente responde em texto e pode ler em voz alta. Ative ",
  "chat.description.strong": "Modo conversa",
  "chat.description.after":
    " para ouvir e falar em sequência. Enquanto o Bidas lê a resposta em voz, o microfone fica em pausa para não confundir a voz do alto-falante com a sua; use o botão Interromper ou fones de ouvido.",
  "chat.contextOn": "Contexto automático:",
  "chat.contextOff":
    "Nenhum paciente selecionado — o chat funciona mesmo assim, com menos contexto.",
  "chat.voiceMode": "Modo conversa",
  "chat.voiceModeActive": "Modo conversa ativo",
  "chat.voiceModeBanner":
    "Ouvindo você — pausa curta (~0,5 s) envia. A voz começa na 1ª frase pronta, sem esperar o texto todo.",
  "chat.interruptSpeech": "Interromper fala",
  "chat.interruptSpeechTitle": "Parar a leitura em voz e voltar a ouvir",
  "chat.speakReplies": "Ouvir respostas em voz alta (no modo conversa fica sempre ligado)",
  "chat.ttsEngine": "Motor da leitura",
  "chat.ttsEngineAria": "Motor de texto em voz",
  "chat.ttsGemini": "Gemini — voz natural (API, como no app Google)",
  "chat.ttsBrowser": "Navegador — voz do sistema (offline)",
  "chat.geminiVoice": "Voz Gemini (pré-definida)",
  "chat.geminiVoiceAria": "Voz Gemini para leitura",
  "chat.geminiHelp":
    "Usa o modelo TTS do Gemini no servidor (consome cota da sua GEMINI_API_KEY). Pré-ouça vozes no Google AI Studio.",
  "chat.browserVoice": "Voz do navegador / Windows",
  "chat.browserVoiceAria": "Voz para ler as respostas",
  "chat.browserDefault": "Padrão — melhor português disponível",
  "chat.browserLocal": " · local",
  "chat.browserHelp":
    "Som mais “robótico”, sem custo de API. Mais vozes em Configurações → Hora e idioma → Voz no Windows.",
  "chat.emptyHint":
    "Use o modo conversa, o microfone ou digite. Ex.: “Quais pontos checar antes de pré-medicação em felino idoso?”",
  "chat.you": "Você",
  "chat.bidas": "Bidas",
  "chat.listenThis": "Ouvir esta resposta",
  "chat.generating": "Gerando…",
  "chat.send": "Enviar",
  "chat.placeholderVoice": "Ouvindo… (pausa curta envia)",
  "chat.placeholderListening": "Ouvindo… fale agora",
  "chat.placeholderType": "Digite ou use Modo conversa / Falar…",
  "chat.btnStop": "Parar",
  "chat.btnSpeak": "Falar",
  "chat.titleVoiceMode": "Desative o modo conversa para usar só o botão Falar",
  "chat.titleMicListen": "Parar de ouvir",
  "chat.titleMicSpeak": "Falar",
  "chat.titleMicUnsupported": "Reconhecimento de voz não suportado neste navegador",
  "chat.titleSendAuto": "No modo conversa o envio é automático após pausa na fala",
  "chat.micStrong": "Microfone:",
  "chat.micNoteBefore":
    "o áudio é transcrito na nuvem (Google). Se aparecer erro de rede, copie a URL do terminal (ex.: ",
  "chat.micNoteAfter":
    ") e abra no Chrome ou Edge instalado no Windows — não use apenas o navegador embutido do Cursor.",
  "chat.unsupportedBrowser":
    "Este navegador não expõe reconhecimento de voz. Tente Chrome ou Edge em HTTPS ou localhost.",

  "chat.errorVoice": "Erro ao reproduzir voz.",
  "chat.errorChat": "Erro ao conversar.",
  "chat.errorResponse": "Falha na resposta ({{status}})",
  "chat.errorNoBody": "Resposta sem corpo.",
  "chat.micStartFail": "Não foi possível iniciar o microfone.",
  "chat.voice.notAllowed":
    "Permissão do microfone negada. Verifique as permissões do site para o microfone.",
  "chat.voice.audioCapture": "Microfone não disponível ou em uso por outro app.",
  "chat.voice.network":
    "Reconhecimento de voz precisa de internet: o Chrome/Edge enviam o áudio aos servidores do Google. Abra esta mesma URL (localhost) no Chrome ou Edge em uma janela normal — o navegador dentro do Cursor costuma falhar com “rede”. Se já estiver no Chrome: confira Wi‑Fi, tente sem VPN ou firewall bloqueando Google.",
  "chat.voice.fallback": "Voz: {{code}}",
  "chat.voice.notAllowedShort": "Permissão do microfone negada.",
  "chat.voice.audioCaptureShort": "Microfone não disponível.",
  "chat.voice.networkShort":
    "Reconhecimento de voz precisa de internet. Use Chrome ou Edge em janela normal (não o preview do Cursor).",
} as const;

const stringsEn: Record<MessageKey, string> = {
  "locale.pt": "Portuguese (Brazil)",
  "locale.en": "English",

  "dashboard.brand": "VetAnest.IA",
  "dashboard.title": "Bidas — Veterinary Anesthesiology Co-pilot",
  "dashboard.description":
    "Patient registration, weight-based dose calculation, and a conversational assistant for clinical decision support.",
  "dashboard.language": "Interface language",
  "dashboard.badge": "Surgical suite — dark mode",
  "dashboard.activePatientTitle": "Active patient for calculation",
  "dashboard.weight": "Weight:",
  "dashboard.breed": "Breed:",
  "dashboard.breedUnknown": "Not provided",
  "dashboard.age": "Age:",
  "dashboard.ageYears": "years",
  "dashboard.selectPatient": "Select a patient to sync weight with the calculator.",
  "dashboard.chatAria": "Chat with Bidas",
  "dashboard.emergency": "EMERGENCY",

  "patientForm.title": "Patient registration",
  "patientForm.description": "Record baseline data for dose calculation and anesthetic planning.",
  "patientForm.nameLabel": "Patient name",
  "patientForm.namePh": "e.g. Thor",
  "patientForm.speciesLabel": "Species",
  "patientForm.speciesDog": "Dog",
  "patientForm.speciesCat": "Cat",
  "patientForm.speciesHorse": "Horse",
  "patientForm.speciesOther": "Other",
  "patientForm.breedLabel": "Breed",
  "patientForm.breedPh": "e.g. Labrador",
  "patientForm.weightLabel": "Weight (kg)",
  "patientForm.weightPh": "e.g. 18.7",
  "patientForm.ageLabel": "Age (years)",
  "patientForm.agePh": "e.g. 4",
  "patientForm.historyLabel": "Clinical history",
  "patientForm.historyPh": "e.g. heart murmur history, allergies, current medications…",
  "patientForm.footerEmpty": "Enter name and weight to enable calculation.",
  "patientForm.footerSaved": "Active patient: {{name}} ({{kg}} kg)",
  "patientForm.saving": "Saving…",
  "patientForm.save": "Save patient",

  "patientList.title": "Registered patients",
  "patientList.descSupabase": "Data synced with Supabase.",
  "patientList.descLocal": "Local mode active (no Supabase credentials).",
  "patientList.loading": "Loading patients…",
  "patientList.empty": "No patients registered yet.",
  "patientList.weight": "Weight:",
  "patientList.registered": "Registered:",
  "patientList.dataSource": "Active data source:",
  "patientList.sourceSupabase": "Supabase",
  "patientList.sourceLocal": "LocalStorage",
  "patientList.newProcedure": "New procedure (next step)",

  "dose.title": "Dose calculator",
  "dose.description": "Weight-based engine with visible formula and mandatory confirmation before administration.",
  "dose.weightLabel": "Patient weight (kg)",
  "dose.weightPh": "Enter weight to calculate",
  "dose.alertTitle": "Mandatory confirmation before logging administration.",
  "dose.alertBody":
    "Calculations are decision support only and must be validated by the responsible anesthesiologist.",
  "dose.confirmCheck":
    "I confirm I reviewed formula, concentration, and clinical condition before administration.",
  "dose.noWeight": "Enter a valid weight to generate dose recommendations.",
  "dose.target": "Target dose:",
  "dose.range": "Range:",
  "dose.formula": "Formula:",
  "dose.note": "Note:",
  "dose.logBlocked": "Log administration (blocked without confirmation)",

  "category.MPA": "PREMED",
  "category.INDUCAO": "INDUCTION",
  "category.EMERGENCIA": "EMERGENCY",

  "chat.title": "Chat with Bidas",
  "chat.description.before":
    "Speak or type — the assistant replies in text and can read aloud. Turn on ",
  "chat.description.strong": "Conversation mode",
  "chat.description.after":
    " to listen and speak in turn. While Bidas reads the reply aloud, the mic is paused so the speaker audio isn’t mistaken for your voice; use Interrupt or headphones.",
  "chat.contextOn": "Automatic context:",
  "chat.contextOff": "No patient selected — chat still works with less context.",
  "chat.voiceMode": "Conversation mode",
  "chat.voiceModeActive": "Conversation mode on",
  "chat.voiceModeBanner":
    "Listening to you — short pause (~0.5 s) sends. Speech starts on the first complete sentence.",
  "chat.interruptSpeech": "Interrupt speech",
  "chat.interruptSpeechTitle": "Stop read-aloud and listen again",
  "chat.speakReplies": "Read replies aloud (always on in conversation mode)",
  "chat.ttsEngine": "Read-aloud engine",
  "chat.ttsEngineAria": "Text-to-speech engine",
  "chat.ttsGemini": "Gemini — natural voice (API, like the Google app)",
  "chat.ttsBrowser": "Browser — system voice (offline)",
  "chat.geminiVoice": "Gemini voice (preset)",
  "chat.geminiVoiceAria": "Gemini voice for read-aloud",
  "chat.geminiHelp":
    "Uses Gemini TTS on the server (uses your GEMINI_API_KEY quota). Preview voices in Google AI Studio.",
  "chat.browserVoice": "Browser / Windows voice",
  "chat.browserVoiceAria": "Voice for reading replies",
  "chat.browserDefault": "Default — best Portuguese available",
  "chat.browserLocal": " · local",
  "chat.browserHelp":
    "More robotic sound, no API cost. More voices: Settings → Time & language → Speech on Windows.",
  "chat.emptyHint":
    "Use conversation mode, the mic, or type. e.g. “What to check before premedication in a senior cat?”",
  "chat.you": "You",
  "chat.bidas": "Bidas",
  "chat.listenThis": "Listen to this reply",
  "chat.generating": "Generating…",
  "chat.send": "Send",
  "chat.placeholderVoice": "Listening… (short pause sends)",
  "chat.placeholderListening": "Listening… speak now",
  "chat.placeholderType": "Type or use Conversation mode / Speak…",
  "chat.btnStop": "Stop",
  "chat.btnSpeak": "Speak",
  "chat.titleVoiceMode": "Turn off conversation mode to use the Speak button only",
  "chat.titleMicListen": "Stop listening",
  "chat.titleMicSpeak": "Speak",
  "chat.titleMicUnsupported": "Speech recognition not supported in this browser",
  "chat.titleSendAuto": "In conversation mode, sending is automatic after a pause in speech",
  "chat.micStrong": "Microphone:",
  "chat.micNoteBefore":
    "audio is transcribed in the cloud (Google). If you see a network error, copy the URL from the terminal (e.g. ",
  "chat.micNoteAfter":
    ") and open it in Chrome or Edge on Windows — don’t rely only on the embedded Cursor browser.",
  "chat.unsupportedBrowser":
    "This browser does not expose speech recognition. Try Chrome or Edge on HTTPS or localhost.",

  "chat.errorVoice": "Error playing voice.",
  "chat.errorChat": "Error while chatting.",
  "chat.errorResponse": "Request failed ({{status}})",
  "chat.errorNoBody": "Empty response body.",
  "chat.micStartFail": "Could not start the microphone.",
  "chat.voice.notAllowed": "Microphone permission denied. Check site permissions for the microphone.",
  "chat.voice.audioCapture": "Microphone unavailable or in use by another app.",
  "chat.voice.network":
    "Speech recognition needs internet: Chrome/Edge send audio to Google servers. Open this same URL (localhost) in Chrome or Edge in a normal window — the browser inside Cursor often fails with “network”. If already on Chrome: check Wi‑Fi, try without VPN or firewall blocking Google.",
  "chat.voice.fallback": "Voice: {{code}}",
  "chat.voice.notAllowedShort": "Microphone permission denied.",
  "chat.voice.audioCaptureShort": "Microphone unavailable.",
  "chat.voice.networkShort":
    "Speech recognition needs internet. Use Chrome or Edge in a normal window (not the Cursor preview).",
};

export const STRINGS: Record<Locale, Record<MessageKey, string>> = {
  "pt-BR": stringsPtBR as unknown as Record<MessageKey, string>,
  en: stringsEn,
};

export const BIDAS_LOCALE_STORAGE_KEY = "BIDAS_LOCALE";
