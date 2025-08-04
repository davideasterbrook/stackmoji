'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Language = {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
};

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

const INSTRUCTIONS = {
  en: {
    title: 'How to Play Stackmoji',
    steps: [
      'Try to guess the emojis that create the stack.',
      'Select emojis from the available options in the emoji grid.',
      'You have 3 attempts to guess the emojis used correctly, represented by ❤️ and 💔.',
      'Click the ❤️❤️❤️ button to submit your guess.',
      '🟩 - Correct emoji',
      '🟥 - Incorrect emoji',
      <div key="spacer1" className="h-4" />,
      'If you are stuck, you can click a correctly guessed emoji to "reveal" it toggling its visibility in the stack.',
      '🟧 - Revealed emoji',
      <div key="spacer2" className="h-4" />,
      'The game resets daily so make sure to play every day to grow your stackmoji streak!',
    ],
  },
  zh: {
    title: '如何玩 Stackmoji',
    steps: [
      '尝试猜测创建堆叠的表情符号。',
      '从表情符号网格中的可用选项中选择表情符号。',
      '您有3次机会正确猜测使用的表情符号，用❤️和💔表示。',
      '点击❤️❤️❤️按钮提交您的猜测。',
      '🟩 - 正确的表情符号',
      '🟥 - 错误的表情符号',
      <div key="spacer3" className="h-4" />,
      '如果您遇到困难，可以点击正确猜测的表情符号来"显示"它，切换其在堆叠中的可见性。',
      '🟧 - 显示的表情符号',
      <div key="spacer4" className="h-4" />,
      '游戏每天重置，所以请确保每天都玩以增加您的 stackmoji 连胜！',
    ],
  },
  hi: {
    title: 'Stackmoji कैसे खेलें',
    steps: [
      'स्टैक बनाने वाले इमोजी का अनुमान लगाने का प्रयास करें।',
      'इमोजी ग्रिड में उपलब्ध विकल्पों से इमोजी का चयन करें।',
      'आपके पास सही इमोजी का अनुमान लगाने के लिए 3 प्रयास हैं, जिन्हें ❤️ और 💔 से दर्शाया गया है।',
      'अपना अनुमान सबमिट करने के लिए ❤️❤️❤️ बटन पर क्लिक करें।',
      '🟩 - सही इमोजी',
      '🟥 - गलत इमोजी',
      <div key="spacer5" className="h-4" />,
      'यदि आप अटक गए हैं, तो सही अनुमान लगाए गए इमोजी पर क्लिक करके उसे स्टैक में "प्रकट" कर सकते हैं।',
      '🟧 - प्रकट किया गया इमोजी',
      <div key="spacer6" className="h-4" />,
      'गेम प्रतिदिन रीसेट होता है, इसलिए अपनी stackmoji स्ट्रीक बढ़ाने के लिए हर दिन खेलना सुनिश्चित करें!',
    ],
  },
  es: {
    title: 'Cómo jugar Stackmoji',
    steps: [
      'Intenta adivinar los emojis que crean la pila.',
      'Selecciona emojis de las opciones disponibles en la cuadrícula de emojis.',
      'Tienes 3 intentos para adivinar correctamente los emojis utilizados, representados por ❤️ y 💔.',
      'Haz clic en el botón ❤️❤️❤️ para enviar tu respuesta.',
      '🟩 - Emoji correcto',
      '🟥 - Emoji incorrecto',
      <div key="spacer7" className="h-4" />,
      'Si estás atascado, puedes hacer clic en un emoji correctamente adivinado para "revelarlo" alternando su visibilidad en la pila.',
      '🟧 - Emoji revelado',
      <div key="spacer8" className="h-4" />,
      '¡El juego se reinicia diariamente, así que asegúrate de jugar todos los días para aumentar tu racha de stackmoji!',
    ],
  },
  fr: {
    title: 'Comment jouer à Stackmoji',
    steps: [
      'Essayez de deviner les émojis qui créent la pile.',
      'Sélectionnez des émojis parmi les options disponibles dans la grille d\'émojis.',
      'Vous avez 3 tentatives pour deviner correctement les émojis utilisés, représentées par ❤️ et 💔.',
      'Cliquez sur le bouton ❤️❤️❤️ pour soumettre votre réponse.',
      '🟩 - Emoji correct',
      '🟥 - Emoji incorrect',
      <div key="spacer9" className="h-4" />,
      'Si vous êtes bloqué, vous pouvez cliquer sur un emoji correctement deviné pour le "révéler" en basculant sa visibilité dans la pile.',
      '🟧 - Emoji révélé',
      <div key="spacer10" className="h-4" />,
      'Le jeu se réinitialise quotidiennement, alors assurez-vous de jouer chaque jour pour augmenter votre série Stackmoji !',
    ],
  },
  ar: {
    title: 'كيفية لعب Stackmoji',
    steps: [
      'حاول تخمين الرموز التعبيرية التي تشكل المجموعة.',
      'اختر الرموز التعبيرية من الخيارات المتاحة في شبكة الرموز.',
      'لديك 3 محاولات لتخمين الرموز التعبيرية المستخدمة بشكل صحيح، ممثلة بـ ❤️ و 💔.',
      'انقر على زر ❤️❤️❤️ لتقديم تخمينك.',
      '🟩 - رمز تعبيري صحيح',
      '🟥 - رمز تعبيري خاطئ',
      <div key="spacer11" className="h-4" />,
      'إذا كنت عالقًا، يمكنك النقر على رمز تعبيري تم تخمينه بشكل صحيح لـ "كشفه" وتبديل ظهوره في المجموعة.',
      '🟧 - رمز تعبيري مكشوف',
      <div key="spacer12" className="h-4" />,
      'تتم إعادة تعيين اللعبة يوميًا، لذا تأكد من اللعب كل يوم لزيادة تتابع Stackmoji الخاص بك!',
    ],
  },
  bn: {
    title: 'কিভাবে Stackmoji খেলবেন',
    steps: [
      'স্ট্যাক তৈরি করে এমন ইমোজিগুলি অনুমান করার চেষ্টা করুন।',
      'ইমোজি গ্রিডে উপলব্ধ অপশন থেকে ইমোজি নির্বাচন করুন।',
      'আপনার কাছে সঠিকভাবে ইমোজি অনুমান করার জন্য ৩টি প্রচেষ্টা আছে, যা ❤️ এবং 💔 দ্বারা প্রদর্শিত হয়।',
      'আপনার অনুমান জমা দিতে ❤️❤️❤️ বোতামে ক্লিক করুন।',
      '🟩 - সঠিক ইমোজি',
      '🟥 - ভুল ইমোজি',
      <div key="spacer13" className="h-4" />,
      'যদি আপনি আটকে যান, আপনি সঠিকভাবে অনুমান করা ইমোজিতে ক্লিক করে এটি "প্রকাশ" করতে পারেন।',
      '🟧 - প্রকাশিত ইমোজি',
      <div key="spacer14" className="h-4" />,
      'গেমটি প্রতিদিন রিসেট হয়, তাই আপনার Stackmoji স্ট্রিক বাড়াতে প্রতিদিন খেলা নিশ্চিত করুন!',
    ],
  },
  pt: {
    title: 'Como jogar Stackmoji',
    steps: [
      'Tente adivinhar os emojis que criam a pilha.',
      'Selecione emojis das opções disponíveis na grade de emojis.',
      'Você tem 3 tentativas para adivinhar corretamente os emojis usados, representados por ❤️ e 💔.',
      'Clique no botão ❤️❤️❤️ para enviar sua tentativa.',
      '🟩 - Emoji correto',
      '🟥 - Emoji incorreto',
      <div key="spacer15" className="h-4" />,
      'Se você estiver preso, pode clicar em um emoji corretamente adivinhado para "revelá-lo" alternando sua visibilidade na pilha.',
      '🟧 - Emoji revelado',
      <div key="spacer16" className="h-4" />,
      'O jogo reinicia diariamente, então certifique-se de jogar todos os dias para aumentar sua sequência Stackmoji!',
    ],
  },
  ru: {
    title: 'Как играть в Stackmoji',
    steps: [
      'Попробуйте угадать эмодзи, создающие стек.',
      'Выберите эмодзи из доступных вариантов в сетке эмодзи.',
      'У вас есть 3 попытки правильно угадать используемые эмодзи, обозначенные ❤️ и 💔.',
      'Нажмите кнопку ❤️❤️❤️, чтобы отправить свою догадку.',
      '🟩 - Правильный эмодзи',
      '🟥 - Неправильный эмодзи',
      <div key="spacer17" className="h-4" />,
      'Если вы застряли, вы можете нажать на правильно угаданный эмодзи, чтобы "раскрыть" его, переключив его видимость в стеке.',
      '🟧 - Раскрытый эмодзи',
      <div key="spacer18" className="h-4" />,
      'Игра сбрасывается ежедневно, поэтому не забывайте играть каждый день, чтобы увеличить свою серию Stackmoji!',
    ],
  },
  ja: {
    title: 'Stackmojiの遊び方',
    steps: [
      'スタックを作成する絵文字を推測してみましょう。',
      '絵文字グリッドから利用可能なオプションを選択します。',
      '❤️と💔で表される正しい絵文字を推測するために3回の試行があります。',
      '❤️❤️❤️ボタンをクリックして推測を送信します。',
      '🟩 - 正しい絵文字',
      '🟥 - 間違った絵文字',
      <div key="spacer19" className="h-4" />,
      '行き詰まった場合は、正しく推測した絵文字をクリックしてスタック内での表示を切り替えることで「表示」できます。',
      '🟧 - 表示された絵文字',
      <div key="spacer20" className="h-4" />,
      'ゲームは毎日リセットされるので、Stackmojiストリークを伸ばすために毎日プレイすることを忘れずに！',
    ],
  },
  id: {
    title: 'Cara Bermain Stackmoji',
    steps: [
      'Cobalah menebak emoji yang membentuk tumpukan.',
      'Pilih emoji dari opsi yang tersedia di grid emoji.',
      'Anda memiliki 3 kesempatan untuk menebak emoji yang digunakan dengan benar, ditandai dengan ❤️ dan 💔.',
      'Klik tombol ❤️❤️❤️ untuk mengirimkan tebakan Anda.',
      '🟩 - Emoji benar',
      '🟥 - Emoji salah',
      <div key="spacer21" className="h-4" />,
      'Jika Anda kesulitan, Anda dapat mengklik emoji yang ditebak dengan benar untuk "mengungkapkannya" dengan mengalihkan visibilitasnya di tumpukan.',
      '🟧 - Emoji terungkap',
      <div key="spacer22" className="h-4" />,
      'Permainan direset setiap hari, jadi pastikan untuk bermain setiap hari untuk meningkatkan streak Stackmoji Anda!',
    ],
  },
  de: {
    title: 'Wie man Stackmoji spielt',
    steps: [
      'Versuche die Emojis zu erraten, die den Stapel bilden.',
      'Wähle Emojis aus den verfügbaren Optionen im Emoji-Raster.',
      'Du hast 3 Versuche, die verwendeten Emojis richtig zu erraten, dargestellt durch ❤️ und 💔.',
      'Klicke auf den ❤️❤️❤️ Button, um deinen Tipp abzugeben.',
      '🟩 - Richtiges Emoji',
      '🟥 - Falsches Emoji',
      <div key="spacer23" className="h-4" />,
      'Wenn du nicht weiterkommst, kannst du auf ein richtig erratenes Emoji klicken, um es zu "enthüllen" und seine Sichtbarkeit im Stapel umzuschalten.',
      '🟧 - Enthülltes Emoji',
      <div key="spacer24" className="h-4" />,
      'Das Spiel wird täglich zurückgesetzt, also spiele jeden Tag, um deine Stackmoji-Serie zu verlängern!',
    ],
  },
  it: {
    title: 'Come giocare a Stackmoji',
    steps: [
      'Prova a indovinare le emoji che creano lo stack.',
      'Seleziona le emoji dalle opzioni disponibili nella griglia.',
      'Hai 3 tentativi per indovinare correttamente le emoji utilizzate, rappresentati da ❤️ e 💔.',
      'Clicca il pulsante ❤️❤️❤️ per inviare il tuo tentativo.',
      '🟩 - Emoji corretta',
      '🟥 - Emoji sbagliata',
      <div key="spacer25" className="h-4" />,
      'Se sei bloccato, puoi cliccare su una emoji indovinata correttamente per "rivelarla" alternando la sua visibilità nello stack.',
      '🟧 - Emoji rivelata',
      <div key="spacer26" className="h-4" />,
      'Il gioco si resetta quotidianamente, quindi assicurati di giocare ogni giorno per aumentare la tua serie Stackmoji!',
    ],
  },
  pl: {
    title: 'Jak grać w Stackmoji',
    steps: [
      'Spróbuj odgadnąć emoji tworzące stos.',
      'Wybierz emoji z dostępnych opcji w siatce emoji.',
      'Masz 3 próby na poprawne odgadnięcie użytych emoji, reprezentowane przez ❤️ i 💔.',
      'Kliknij przycisk ❤️❤️❤️, aby przesłać swoją odpowiedź.',
      '🟩 - Poprawne emoji',
      '🟥 - Niepoprawne emoji',
      <div key="spacer27" className="h-4" />,
      'Jeśli utkniesz, możesz kliknąć poprawnie odgadnięte emoji, aby je "odkryć", przełączając jego widoczność w stosie.',
      '🟧 - Odkryte emoji',
      <div key="spacer28" className="h-4" />,
      'Gra resetuje się codziennie, więc pamiętaj, aby grać każdego dnia, aby zwiększyć swoją serię Stackmoji!',
    ],
  }
};

export default function HowToPlayClient() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const instructions = INSTRUCTIONS[selectedLanguage as keyof typeof INSTRUCTIONS];
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
  const isRTL = currentLanguage?.rtl || false;

  // Sort languages alphabetically by their display names
  const sortedLanguages = [...SUPPORTED_LANGUAGES].sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return (
    <div className="min-h-screen theme-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 theme-panel border-b theme-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            ← Stackmoji
          </Link>
          
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="theme-button p-2 rounded-lg border theme-button-hover cursor-pointer"
              data-emoji="true"
            >
              {sortedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} data-emoji="true">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div dir={isRTL ? 'rtl' : 'ltr'} className="theme-panel rounded-2xl p-8">
          <h1 className={`text-4xl font-bold mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            {instructions.title}
          </h1>
          
          <div className="space-y-4">
            {instructions.steps.map((step, index) => {
              if (React.isValidElement(step)) {
                return step;
              }
              return (
                <div key={index} className={`text-lg leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                  {step}
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t theme-border">
            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
              <p className="text-lg mb-6">
                Start your daily emoji puzzle challenge and build your streak!
              </p>
              <Link 
                href="/"
                className="inline-block theme-button px-8 py-3 rounded-lg text-lg font-semibold hover:scale-105 transition-transform"
              >
                🎮 Play Stackmoji
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm opacity-60">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/privacy" className="hover:opacity-80 transition-opacity">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}