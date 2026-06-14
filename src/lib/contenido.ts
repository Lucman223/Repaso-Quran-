// Contenido motivacional y didáctico sobre la hifz (memorización del Corán).
//
// IMPORTANTE: el texto turco proviene LITERALMENTE de los documentos de sohbet
// "174 - Hafızlık" y "Kürsü Senindir-4" (fuentes ya verificadas con sus
// referencias). El texto religioso (ayet/hadiz) no debe alterarse. El campo
// `es` (español) queda vacío a propósito: lo rellena el usuario, ya que no se
// debe traducir Corán/hadiz automáticamente. La UI cae al turco cuando el
// español está vacío (ver helper `pick`).

export type TipoCita = "ayet" | "hadis" | "soz"; // versículo, hadiz, frase célebre

export interface Cita {
  id: string;
  tipo: TipoCita;
  tr: string; // texto en turco (literal de los PDFs)
  es: string; // traducción al español (la rellena el usuario)
  kaynak: string; // fuente/referencia (común a ambos idiomas)
}

// Selecciona el idioma con fallback: si falta el español, usa el turco.
export function pick(texto: { tr: string; es: string }, locale: string): string {
  if (locale === "es" && texto.es.trim()) return texto.es;
  return texto.tr;
}

// ─── Citas: ayet-i kerime, hadis-i şerif, özlü söz ───────────────────────────
export const CITAS: Cita[] = [
  {
    id: "ummetin-shic-serefli",
    tipo: "hadis",
    tr: "Ümmetimin en şereflileri Kur’ân’ı ezberleyenlerdir.",
    es: "",
    kaynak: "Feyzü’l-kadîr, 1/522",
  },
  {
    id: "okuyun-sefaatci",
    tipo: "hadis",
    tr: "Kur’ân-ı Kerîm’i okuyun, zira o kıyamet günü ehline ne güzel şefaatçidir.",
    es: "",
    kaynak: "Fedâilü’l-Kur’ân",
  },
  {
    id: "tac-giydirilir",
    tipo: "hadis",
    tr: "Evladına Kur’ân-ı Kerîm’i öğreten anne-babaya kıyamet günü cennette taç giydirilir.",
    es: "",
    kaynak: "el-İtkân, IV, 104",
  },
  {
    id: "ezberleyen-kalbe-azab",
    tipo: "hadis",
    tr: "Kur’ân’ı okuyun ve ezberleyin. Muhakkak Allah Kur’ân’ı ezberleyen kalbe azab etmez.",
    es: "",
    kaynak: "Sünen-i İbn-i Mâce, 1/78",
  },
  {
    id: "harap-ev",
    tipo: "hadis",
    tr: "İçerisinde Kur’ân’dan bir şey bulunmayan kimse, harap olmuş ev gibidir.",
    es: "",
    kaynak: "Tirmizî",
  },
  {
    id: "genclikte-ogrenirse",
    tipo: "hadis",
    tr: "Kim gençliğinde Kur’ân’ı öğrenirse, Kur’ân onun etine ve kanına karışır.",
    es: "",
    kaynak: "Hadis-i Şerif",
  },
  {
    id: "oku-yuksel",
    tipo: "hadis",
    tr: "Oku, yüksel ve tertîl üzere oku; dünyada nasıl tertîl ile okuyorsan öyle oku. Çünkü senin derecen, okuduğun son âyete kadar olacaktır.",
    es: "",
    kaynak: "Riyâzü’s-Sâlihîn, 1001",
  },
  {
    id: "maharetle-okuyan",
    tipo: "hadis",
    tr: "Kur’ân’ı maharetle okuyan kişi, şerefli ve iyilik sahibi meleklerle (sefere-i kirâm ile) beraberdir. Kur’ân’ı zorlanarak okuyana ise iki ecir vardır.",
    es: "",
    kaynak: "Sahîhu’l-Câmi, 6670",
  },
  {
    id: "saffat-171",
    tipo: "ayet",
    tr: "Andolsun ki, peygamber kullarımıza söz vermişizdir. Onlar mutlaka zafere ulaşacaklardır. Bizim ordumuz şüphesiz üstün gelecektir.",
    es: "",
    kaynak: "Sâffât sûresi, 171-173",
  },
  {
    id: "enfal-2",
    tipo: "ayet",
    tr: "Hakiki mü’minler ancak o kimselerdir ki, Allah anıldığı vakit kalpleri ürperir. Karşılarında ayetler okunduğu vakit, imanlarını artırır ve yalnız Rablerine tevekkül ederler.",
    es: "",
    kaynak: "Enfâl sûresi, 2",
  },
  {
    id: "kehf-13",
    tipo: "ayet",
    tr: "Biz sana onların haberini hakkıyla anlatıyoruz. Şüphesiz ki onlar, Rablerine îmân etmiş gençlerdi; ve biz onların hidâyetlerini artırdık.",
    es: "",
    kaynak: "Kehf sûresi, 13",
  },
  {
    id: "soz-ebubekir",
    tipo: "soz",
    tr: "Dünya işiyle ahiret işi yan yana geldiğinde ahireti tercih edin. Dünya işiniz de yoluna girer.",
    es: "",
    kaynak: "Hz. Ebu Bekir (r.a)",
  },
  {
    id: "soz-ali-zeka",
    tipo: "soz",
    tr: "Üç şey insanın zekâsını arttırır: misvak kullanmak, oruç tutmak, Kur’ân-ı Kerîm okumak.",
    es: "",
    kaynak: "Hz. Ali (r.a)",
  },
  {
    id: "soz-osman",
    tipo: "soz",
    tr: "Kur’ân’ı çok okumak, öğrenmek ve ezberlemek istediğim gibi, çok incelemek de isterim.",
    es: "",
    kaynak: "Hz. Osman (r.a)",
  },
  {
    id: "gokyuzu-yildizlar",
    tipo: "soz",
    tr: "Gök yüzünü yıldızlar, yer yüzünü hâfızlar süsler.",
    es: "",
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
    es: "",
  },
  {
    id: "15-kez",
    tr: "Ezberlenecek ilk beş satırı, mahreç ve tecvid kaidelerine uyarak en az 15 kez okuyun. Önce tertil (yavaş), sonra tedvir (orta), gerekirse hadr (hızlı).",
    es: "",
  },
  {
    id: "beser-satir",
    tr: "Satırları beşer beşer ezberleyin. İlk 5 satır iyice oturmadan ikinci 5 satıra geçmeyin; sonra birleştirin.",
    es: "",
  },
  {
    id: "bolmeyin",
    tr: "Ezberlenecek satırları ikiye bölmeyin; bu gözleri tembelleştirir. En az 5 satırı tam ezberleyerek devam edin.",
    es: "",
  },
  {
    id: "tekrar-eski",
    tr: "Her turda daha önce yaptığınız ezberleri tekrar edin. Böylece önceki ezberler kuvvetlenir.",
    es: "",
  },
  {
    id: "aksamdan-hazirla",
    tr: "Yarın ezberlenecek sayfayı bir gün önceden akşamdan 5-10 defa yüzünden okuyun. Dersi akşam olmadan hazır hale getirin.",
    es: "",
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
    tituloEs: "",
    tr: "Osmanlı usulüne göre ezberlemeye her cüz’ün son sayfasından başlanır. Tüm cüzlerin son sayfaları bitince birinci tur (şavt) tamamlanmış olur.",
    es: "",
  },
  {
    id: "turlar",
    tituloTr: "Turlar (şavt) ile ilerle",
    tituloEs: "",
    tr: "İkinci turda sondan ikinci sayfa, üçüncü turda sondan üçüncü sayfa ezberlenir. Yirmi turu bitiren hâfız olur.",
    es: "",
  },
  {
    id: "esit-tesvik",
    tituloTr: "Her cüzden eşit ezber",
    tituloEs: "",
    tr: "Bu sistemde Kur’ân’ın tamamı eşit görünür; çünkü her cüzden ezberlenmiş sayfalar vardır. Bu, hâfızı sürekli ileriye teşvik eder, şevkini artırır.",
    es: "",
  },
  {
    id: "kodlama",
    tituloTr: "Sayfa kodlaması",
    tituloEs: "",
    tr: "Ecdadımız bu sistemle hafıza tekniğini kullanıp sayfaları kodlamıştır. Hâfızlar hangi ayetin nerede olduğunu kolayca bulur. 600 sayfa yerine 30 tane 20 sayfa.",
    es: "",
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
    terminoEs: "",
    tr: "İlk defa ezberlenecek sayfa.",
    es: "",
  },
  {
    id: "has",
    terminoTr: "Has (pişmiş)",
    terminoEs: "",
    tr: "Daha önce ezberlenmiş sayfalar.",
    es: "",
  },
  {
    id: "haslama",
    terminoTr: "Haslama",
    terminoEs: "",
    tr: "Ezberleri kuvvetlendirmek için yapılan tekrar.",
    es: "",
  },
  {
    id: "galat",
    terminoTr: "Galat",
    terminoEs: "",
    tr: "Yanlış ezberlenmiş kelime, harf veya harekeye denir.",
    es: "",
  },
];

// Cita "del día": determinista por fecha, para que toda la sesión vea la misma
// y cambie cada día. No aleatoria pura (evita parpadeos entre renders).
export function citaDelDia(fecha = new Date()): Cita {
  const dias = Math.floor(fecha.getTime() / 86_400_000);
  return CITAS[dias % CITAS.length];
}
