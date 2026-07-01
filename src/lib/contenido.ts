// Contenido motivacional y didáctico sobre la hifz (memorización del Corán).
//
// IMPORTANTE: el texto turco proviene LITERALMENTE de los documentos de sohbet
// "174 - Hafızlık" y "Kürsü Senindir-4" (fuentes ya verificadas con sus
// referencias). El texto religioso (ayet/hadiz) no debe alterarse. El campo
// `es` (español) queda vacío a propósito: lo rellena el usuario, ya que no se
// debe traducir Corán/hadiz automáticamente. La UI muestra siempre el árabe
// (donde lo hay) y el turco; la traducción al español aparece debajo solo si
// existe y el idioma activo es español (ver helper `traduccion`).

export type TipoCita = "ayet" | "hadis" | "soz"; // versículo, hadiz, frase célebre

export interface Cita {
  id: string;
  tipo: TipoCita;
  ar?: string; // texto árabe original (sagrado). En versículos viene de quran.com;
  //             en hadices/frases queda vacío hasta tener una fuente fiable.
  tr: string; // texto en turco (literal de los PDFs)
  es: string; // traducción de apoyo al español
  kaynak: string; // fuente/referencia (común a todos los idiomas)
}

// Devuelve la traducción al español SOLO si el locale es español y existe.
// El texto turco original (literal de los PDFs) se muestra siempre; esta
// traducción es un apoyo que aparece debajo, nunca lo sustituye.
export function traduccion(
  texto: { es: string },
  locale: string
): string | null {
  if (locale === "es" && texto.es.trim()) return texto.es;
  return null;
}

// ─── Citas: ayet-i kerime, hadis-i şerif, özlü söz ───────────────────────────
export const CITAS: Cita[] = [
  {
    id: "ummetin-shic-serefli",
    tipo: "hadis",
    tr: "Ümmetimin en şereflileri Kur’ân’ı ezberleyenlerdir.",
    es: "Los más nobles de mi comunidad son quienes memorizan el Corán.",
    kaynak: "Feyzü’l-kadîr, 1/522",
  },
  {
    id: "okuyun-sefaatci",
    tipo: "hadis",
    tr: "Kur’ân-ı Kerîm’i okuyun, zira o kıyamet günü ehline ne güzel şefaatçidir.",
    es: "Recitad el Corán, pues el día de la Resurrección será un excelente intercesor para quienes lo recitan.",
    kaynak: "Fedâilü’l-Kur’ân",
  },
  {
    id: "tac-giydirilir",
    tipo: "hadis",
    tr: "Evladına Kur’ân-ı Kerîm’i öğreten anne-babaya kıyamet günü cennette taç giydirilir.",
    es: "A los padres que enseñan el Corán a su hijo se les coronará en el Paraíso el día de la Resurrección.",
    kaynak: "el-İtkân, IV, 104",
  },
  {
    id: "ezberleyen-kalbe-azab",
    tipo: "hadis",
    tr: "Kur’ân’ı okuyun ve ezberleyin. Muhakkak Allah Kur’ân’ı ezberleyen kalbe azab etmez.",
    es: "Recitad y memorizad el Corán. En verdad, Allah no castiga al corazón que ha memorizado el Corán.",
    kaynak: "Sünen-i İbn-i Mâce, 1/78",
  },
  {
    id: "harap-ev",
    tipo: "hadis",
    tr: "İçerisinde Kur’ân’dan bir şey bulunmayan kimse, harap olmuş ev gibidir.",
    es: "Quien no tiene nada del Corán en su interior es como una casa en ruinas.",
    kaynak: "Tirmizî",
  },
  {
    id: "genclikte-ogrenirse",
    tipo: "hadis",
    tr: "Kim gençliğinde Kur’ân’ı öğrenirse, Kur’ân onun etine ve kanına karışır.",
    es: "Quien aprende el Corán en su juventud, el Corán se mezcla con su carne y su sangre.",
    kaynak: "Hadis-i Şerif",
  },
  {
    id: "oku-yuksel",
    tipo: "hadis",
    tr: "Oku, yüksel ve tertîl üzere oku; dünyada nasıl tertîl ile okuyorsan öyle oku. Çünkü senin derecen, okuduğun son âyete kadar olacaktır.",
    es: "Recita, asciende y recita con tartil (pausadamente); recita como lo hacías en el mundo. Pues tu rango llegará hasta el último versículo que recites.",
    kaynak: "Riyâzü’s-Sâlihîn, 1001",
  },
  {
    id: "maharetle-okuyan",
    tipo: "hadis",
    tr: "Kur’ân’ı maharetle okuyan kişi, şerefli ve iyilik sahibi meleklerle (sefere-i kirâm ile) beraberdir. Kur’ân’ı zorlanarak okuyana ise iki ecir vardır.",
    es: "Quien recita el Corán con maestría está con los ángeles nobles y virtuosos. Y quien lo recita con dificultad tiene doble recompensa.",
    kaynak: "Sahîhu’l-Câmi, 6670",
  },
  {
    id: "saffat-171",
    tipo: "ayet",
    ar: "وَلَقَدْ سَبَقَتْ كَلِمَتُنَا لِعِبَادِنَا ٱلْمُرْسَلِينَ ۝ إِنَّهُمْ لَهُمُ ٱلْمَنصُورُونَ ۝ وَإِنَّ جُندَنَا لَهُمُ ٱلْغَـٰلِبُونَ",
    tr: "Andolsun ki, peygamber kullarımıza söz vermişizdir. Onlar mutlaka zafere ulaşacaklardır. Bizim ordumuz şüphesiz üstün gelecektir.",
    es: "En verdad, ya dimos Nuestra palabra a Nuestros siervos los enviados: que ellos serían los auxiliados, y que Nuestro ejército sería el vencedor.",
    kaynak: "Sâffât sûresi, 171-173",
  },
  {
    id: "enfal-2",
    tipo: "ayet",
    ar: "إِنَّمَا ٱلْمُؤْمِنُونَ ٱلَّذِينَ إِذَا ذُكِرَ ٱللَّهُ وَجِلَتْ قُلُوبُهُمْ وَإِذَا تُلِيَتْ عَلَيْهِمْ ءَايَـٰتُهُۥ زَادَتْهُمْ إِيمَـٰنًا وَعَلَىٰ رَبِّهِمْ يَتَوَكَّلُونَ",
    tr: "Hakiki mü’minler ancak o kimselerdir ki, Allah anıldığı vakit kalpleri ürperir. Karşılarında ayetler okunduğu vakit, imanlarını artırır ve yalnız Rablerine tevekkül ederler.",
    es: "Los verdaderos creyentes son solo aquellos cuyos corazones se estremecen cuando se menciona a Allah, y cuando se les recitan Sus versículos, les aumenta la fe, y solo en su Señor confían.",
    kaynak: "Enfâl sûresi, 2",
  },
  {
    id: "kehf-13",
    tipo: "ayet",
    ar: "نَّحْنُ نَقُصُّ عَلَيْكَ نَبَأَهُم بِٱلْحَقِّ ۚ إِنَّهُمْ فِتْيَةٌ ءَامَنُوا۟ بِرَبِّهِمْ وَزِدْنَـٰهُمْ هُدًى",
    tr: "Biz sana onların haberini hakkıyla anlatıyoruz. Şüphesiz ki onlar, Rablerine îmân etmiş gençlerdi; ve biz onların hidâyetlerini artırdık.",
    es: "Te narramos su historia con la verdad. En verdad eran unos jóvenes que creyeron en su Señor, y les acrecentamos en guía.",
    kaynak: "Kehf sûresi, 13",
  },
  {
    id: "soz-ebubekir",
    tipo: "soz",
    tr: "Dünya işiyle ahiret işi yan yana geldiğinde ahireti tercih edin. Dünya işiniz de yoluna girer.",
    es: "Cuando el asunto de este mundo y el de la otra vida se presenten juntos, elegid la otra vida. Vuestro asunto mundano también se encauzará.",
    kaynak: "Hz. Ebu Bekir (r.a)",
  },
  {
    id: "soz-ali-zeka",
    tipo: "soz",
    tr: "Üç şey insanın zekâsını arttırır: misvak kullanmak, oruç tutmak, Kur’ân-ı Kerîm okumak.",
    es: "Tres cosas aumentan la inteligencia del ser humano: usar el siwak, ayunar y recitar el Corán.",
    kaynak: "Hz. Ali (r.a)",
  },
  {
    id: "soz-osman",
    tipo: "soz",
    tr: "Kur’ân’ı çok okumak, öğrenmek ve ezberlemek istediğim gibi, çok incelemek de isterim.",
    es: "Así como deseo recitar, aprender y memorizar mucho el Corán, también deseo estudiarlo en profundidad.",
    kaynak: "Hz. Osman (r.a)",
  },
  {
    id: "gokyuzu-yildizlar",
    tipo: "soz",
    tr: "Gök yüzünü yıldızlar, yer yüzünü hâfızlar süsler.",
    es: "Las estrellas adornan el cielo; los háfizes adornan la tierra.",
    kaynak: "Özlü Söz",
  },
];

// ─── Consejos prácticos de memorización (de los PDFs) ────────────────────────
export interface Consejo {
  id: string;
  tr: string;
  es: string;
}

export const CONSEJOS: Consejo[] = [
  {
    id: "yuze-okuma",
    tr: "Ezberlemeden önce sayfayı yüzüne çok dikkatli okuyun. Doğru bakamayan talebe doğru göremez, ezberi eksik veya yanlış olur.",
    es: "Antes de memorizar, lee la página mirándola con mucha atención. El estudiante que no mira bien no ve bien, y su memorización queda incompleta o errónea.",
  },
  {
    id: "15-kez",
    tr: "Ezberlenecek ilk beş satırı, mahreç ve tecvid kaidelerine uyarak en az 15 kez okuyun. Önce tertil (yavaş), sonra tedvir (orta), gerekirse hadr (hızlı).",
    es: "Lee las primeras cinco líneas a memorizar al menos 15 veces, respetando los puntos de articulación y las reglas del teyvid. Primero con tartil (lento), luego con tedvir (medio) y, si hace falta, con hadr (rápido).",
  },
  {
    id: "beser-satir",
    tr: "Satırları beşer beşer ezberleyin. İlk 5 satır iyice oturmadan ikinci 5 satıra geçmeyin; sonra birleştirin.",
    es: "Memoriza las líneas de cinco en cinco. No pases a las segundas 5 líneas sin asentar bien las primeras 5; luego únelas.",
  },
  {
    id: "bolmeyin",
    tr: "Ezberlenecek satırları ikiye bölmeyin; bu gözleri tembelleştirir. En az 5 satırı tam ezberleyerek devam edin.",
    es: "No dividas en dos las líneas a memorizar; eso vuelve perezosos a los ojos. Continúa memorizando al menos 5 líneas completas.",
  },
  {
    id: "tekrar-eski",
    tr: "Her turda daha önce yaptığınız ezberleri tekrar edin. Böylece önceki ezberler kuvvetlenir.",
    es: "En cada vuelta repasa lo que ya habías memorizado. Así se refuerza lo aprendido antes.",
  },
  {
    id: "aksamdan-hazirla",
    tr: "Yarın ezberlenecek sayfayı bir gün önceden akşamdan 5-10 defa yüzünden okuyun. Dersi akşam olmadan hazır hale getirin.",
    es: "La página que memorizarás mañana, léela mirándola 5-10 veces la noche anterior. Ten la lección lista antes del anochecer.",
  },
];

// ─── Pasos del método otomano (Osmanlı usulü) ────────────────────────────────
export interface PasoMetodo {
  id: string;
  tituloTr: string;
  tituloEs: string;
  tr: string;
  es: string;
}

export const METODO_PASOS: PasoMetodo[] = [
  {
    id: "son-sayfadan",
    tituloTr: "Son sayfadan başla",
    tituloEs: "Empieza por la última página",
    tr: "Osmanlı usulüne göre ezberlemeye her cüz’ün son sayfasından başlanır. Tüm cüzlerin son sayfaları bitince birinci tur (şavt) tamamlanmış olur.",
    es: "Según el método otomano, la memorización empieza por la última página de cada juz. Cuando se terminan las últimas páginas de todos los juz, se completa la primera vuelta (şavt).",
  },
  {
    id: "turlar",
    tituloTr: "Turlar (şavt) ile ilerle",
    tituloEs: "Avanza por vueltas (şavt)",
    tr: "İkinci turda sondan ikinci sayfa, üçüncü turda sondan üçüncü sayfa ezberlenir. Yirmi turu bitiren hâfız olur.",
    es: "En la segunda vuelta se memoriza la penúltima página; en la tercera, la antepenúltima. Quien completa veinte vueltas se convierte en háfiz.",
  },
  {
    id: "esit-tesvik",
    tituloTr: "Her cüzden eşit ezber",
    tituloEs: "Memorización equilibrada de cada juz",
    tr: "Bu sistemde Kur’ân’ın tamamı eşit görünür; çünkü her cüzden ezberlenmiş sayfalar vardır. Bu, hâfızı sürekli ileriye teşvik eder, şevkini artırır.",
    es: "En este sistema todo el Corán parece equilibrado, porque hay páginas memorizadas de cada juz. Esto anima al háfiz a seguir avanzando y aumenta su entusiasmo.",
  },
  {
    id: "kodlama",
    tituloTr: "Sayfa kodlaması",
    tituloEs: "Codificación de las páginas",
    tr: "Ecdadımız bu sistemle hafıza tekniğini kullanıp sayfaları kodlamıştır. Hâfızlar hangi ayetin nerede olduğunu kolayca bulur. 600 sayfa yerine 30 tane 20 sayfa.",
    es: "Nuestros antepasados, con este sistema, usaron una técnica de memoria y codificaron las páginas. Los háfizes encuentran con facilidad dónde está cada versículo. En lugar de 600 páginas, 30 bloques de 20 páginas.",
  },
];

// Términos técnicos del método de memorización.
export interface Termino {
  id: string;
  terminoTr: string;
  terminoEs: string;
  tr: string;
  es: string;
}

export const TERMINOS: Termino[] = [
  {
    id: "ham",
    terminoTr: "Ham (çiğ)",
    terminoEs: "Ham (crudo)",
    tr: "İlk defa ezberlenecek sayfa.",
    es: "La página que se va a memorizar por primera vez.",
  },
  {
    id: "has",
    terminoTr: "Has (pişmiş)",
    terminoEs: "Has (cocido)",
    tr: "Daha önce ezberlenmiş sayfalar.",
    es: "Las páginas ya memorizadas anteriormente.",
  },
  {
    id: "haslama",
    terminoTr: "Haslama",
    terminoEs: "Haslama",
    tr: "Ezberleri kuvvetlendirmek için yapılan tekrar.",
    es: "El repaso que se hace para reforzar lo memorizado.",
  },
  {
    id: "galat",
    terminoTr: "Galat",
    terminoEs: "Galat",
    tr: "Yanlış ezberlenmiş kelime, harf veya harekeye denir.",
    es: "Se llama así a una palabra, letra o vocal memorizada incorrectamente.",
  },
];

// Cita "del día": rota cada 3 minutos, alternando entre aleya, hadiz y frase.
// Permite un offset para avance manual.
export function citaDelDia(fecha = new Date(), offset = 0): Cita {
  // 3 minutos = 180,000 milisegundos
  const intervalId = Math.floor(fecha.getTime() / 180_000) + offset;
  
  // Para evitar índices negativos al restar en el offset, sumamos un múltiplo muy grande antes del módulo:
  const safeIntervalId = intervalId < 0 ? intervalId + 3000000 : intervalId;
  
  // El orden de rotación será: 0 -> ayet, 1 -> hadis, 2 -> soz
  const tipos: TipoCita[] = ["ayet", "hadis", "soz"];
  const tipo = tipos[safeIntervalId % 3];

  // Filtrar citas por el tipo correspondiente
  const citasDelTipo = CITAS.filter(c => c.tipo === tipo);
  
  if (citasDelTipo.length > 0) {
    // Para que cada tipo avance secuencialmente, dividimos el ID entre 3
    const subIndex = Math.floor(safeIntervalId / 3) % citasDelTipo.length;
    return citasDelTipo[subIndex];
  }
  
  // Fallback
  return CITAS[safeIntervalId % CITAS.length];
}
