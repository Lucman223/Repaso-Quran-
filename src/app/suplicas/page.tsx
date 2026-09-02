"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ChevronRight, CheckCircle2, Circle, ArrowDownUp, AlertCircle, Clock, History, CalendarDays, Languages } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { getTodayDateString } from "@/lib/dateUtils";

type Frequency = 'daily' | 'weekly' | 'occasional';
type UrgencyStatus = 'good' | 'warning' | 'urgent' | 'none';

type SuplicaSegment = {
  ar: string;
  es: string;
};

type Suplica = {
  id: string;
  title: string;
  note?: string;
  frequency: Frequency;
  segments: SuplicaSegment[];
};

const suplicas: Suplica[] = [
  {
    id: "sayyid-istighfar",
    title: "سَيِّدُ الاِسْتِغْفَارِ (Sayyid al-Istighfar)",
    note: "Leer 7 veces por la mañana y noche",
    frequency: "daily",
    segments: [
      { ar: "اَللّٰهُمَّ أَنْتَ الْمَلِكُ الْحَيُّ الَّذِي لَا إِلٰهَ إِلَّا أَنْتَ", es: "Oh Allah, Tú eres el Rey Viviente, no hay deidad digna de adoración excepto Tú." },
      { ar: "أَنْتَ رَبِّي خَلَقْتَنِي وَأَنَا عَبْدُكَ", es: "Tú eres mi Señor, me has creado y soy Tu siervo." },
      { ar: "وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", es: "Y me mantengo fiel a Tu pacto y a Tu promesa en la medida de mis capacidades." },
      { ar: "أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ", es: "Me refugio en Ti del mal de lo que he hecho." },
      { ar: "أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي", es: "Reconozco Tus favores sobre mí y reconozco mi pecado." },
      { ar: "فَاغْفِرْ لِي ذُنُوبِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.", es: "Así que perdona mis pecados, porque ciertamente nadie perdona los pecados excepto Tú." }
    ]
  },
  {
    id: "salawat-sharifah",
    title: "صَلَوَات شَرِيفَه (Salawat Sharifah)",
    frequency: "daily",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَنْفَاسِ الْمَخْلُوقَاتِ", es: "Oh Allah, bendice a nuestro maestro Muhammad en la cantidad de las respiraciones de toda la creación," },
      { ar: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَشْعَارِ الْمَوْجُودَاتِ", es: "y bendice a nuestro maestro Muhammad en la cantidad de todos los seres existentes," },
      { ar: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ سَوَاكِنِ الْأَرْضِ وَالسَّمَوَاتِ", es: "y bendice a nuestro maestro Muhammad en la cantidad de todo lo que habita en la tierra y en los cielos," },
      { ar: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ حُرُوفِ اللَّوْحِ وَالدَّعَوَاتِ", es: "y bendice a nuestro maestro Muhammad en la cantidad de las letras de la Tabla Preservada y de las súplicas," },
      { ar: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ كُلِّ الْمَعْدُودَاتِ وَالْمَعْلُومَاتِ", es: "y bendice a nuestro maestro Muhammad en la cantidad de todo lo numerable y cognoscible," },
      { ar: "مِنْ اَوَّلِ اَزَلِهِ وَاَوْسَطِ حَشْرِهِ وَاٰخِرِ بَقَائِهِ", es: "desde su primera eternidad, y en medio de su reunión, y hasta el final de su existencia," },
      { ar: "وَعَلَى اٰلِهِ وَصَحْبِهِ الطَّيِّبِينَ الطَّاهِرِينَ أَجْمَعِينَ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.", es: "y sobre su familia y sus nobles y puros compañeros en su totalidad. Por Tu misericordia, oh el más Misericordioso de los misericordiosos." }
    ]
  },
  {
    id: "salat-munjiyah",
    title: "صَلَاة مُنْجِيَه (Salat Munjiyah)",
    frequency: "daily",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِ سَيِّدِنَا مُحَمَّدٍ", es: "Oh Allah, envía Tus bendiciones sobre nuestro maestro Muhammad y sobre la familia de nuestro maestro Muhammad," },
      { ar: "صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْاٰفَاتِ", es: "una bendición mediante la cual nos salves de todos los terrores y aflicciones," },
      { ar: "وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ", es: "y mediante la cual satisfagas todas nuestras necesidades," },
      { ar: "وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ", es: "y nos purifiques de todos los males y pecados," },
      { ar: "وَتَرْفَعُنَا بِهَا عِنْدَكَ اَعْلَى الدَّرَجَاتِ", es: "y nos eleves ante Ti a los rangos más altos," },
      { ar: "وَتُبَلِّغُنَا بِهَا اَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ", es: "y nos hagas alcanzar mediante ella nuestras más altas aspiraciones y bienes en esta vida y después de la muerte." },
      { ar: "إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", es: "Ciertamente, Tú eres sobre toda cosa Poderoso." }
    ]
  },
  {
    id: "salat-nariyah",
    title: "صَلَاة نَارِيَه (Salat Nariyah)",
    frequency: "weekly",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ", es: "Oh Allah, concede una bendición completa y una paz perfecta a nuestro maestro Muhammad," },
      { ar: "الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ", es: "por medio del cual se desatan los nudos de las dificultades y se alivian las aflicciones," },
      { ar: "وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ", es: "y mediante el cual se satisfacen las necesidades, se obtienen los deseos y los buenos finales," },
      { ar: "وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ", es: "y se implora lluvia a las nubes por la gracia de su noble rostro," },
      { ar: "وَعَلَى اٰلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ.", es: "y (envía paz y bendición) sobre su familia y sus compañeros, en cada mirada y en cada respiro, en el número de todo lo que es conocido por Ti." }
    ]
  },
  {
    id: "salat-siddiq",
    title: "حَضْرَتِ صِدِّيقِكَ صَلَاتِي (Hazrat Siddiq Salati)",
    frequency: "weekly",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِ سَيِّدِنَا مُحَمَّدٍ وَبَارِكْ وَسَلِّمْ عَلَيْهِ وَعَلَيْهِمْ", es: "Oh Allah, bendice a nuestro maestro Muhammad y a la familia de nuestro maestro Muhammad, y concédeles bendición y paz." },
      { ar: "اَعُوذُ بِاللّٰهِ مِنَ الْهَمِّ وَالْحُزْنِ وَمِنَ الْجُبْنِ وَالْبُخْلِ وَمِنَ الْعَجْزِ وَالْكَسَلِ وَمِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.", es: "Me refugio en Allah de la preocupación y la tristeza, de la cobardía y la avaricia, de la incapacidad y la pereza, del peso de las deudas y del dominio de los hombres." }
    ]
  },
  {
    id: "salat-fathiyah",
    title: "صَلَاة فَتْحِيَه (Salat Fathiyah)",
    frequency: "weekly",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ ٱلْفَاتِحِ لِمَا أُغْلِقَ", es: "Oh Allah, bendice, saluda y concede gracia a nuestro maestro Muhammad, quien abre lo que estaba cerrado," },
      { ar: "وَالْخَاتِمِ لِمَا سَبَقَ نَاصِرِ الْحَقِّ بِالْحَقِّ", es: "quien es el sello de lo anterior, el defensor de la Verdad con la Verdad," },
      { ar: "وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيمِ", es: "y el guía hacia Tu camino recto," },
      { ar: "وَعَلَى اٰلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ.", es: "y sobre su familia, con el merecido valor de su grandioso rango." }
    ]
  },
  {
    id: "khatm-duasi",
    title: "خَتْم دُعَاسِي (Khatm Duasi)",
    frequency: "weekly",
    segments: [
      { ar: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِهِ وَصَحْبِهِ أَجْمَعِينَ", es: "Alabado sea Allah, Señor de los mundos. Y que la paz y las bendiciones sean sobre nuestro maestro Muhammad, y sobre toda su familia y compañeros." },
      { ar: "وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ", es: "Y perdónanos, discúlpanos y ten misericordia de nosotros; Tú eres nuestro Protector, y Tú eres el más Misericordioso." },
      { ar: "أَنْتَ مَوْلَانَا وَأَنْتَ أَكْرَمُ الْأَكْرَمِينَ أَنْتَ مَوْلَانَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ", es: "Tú eres nuestro Protector, y Tú eres el más Generoso. Tú eres nuestro Protector, y Tú eres el más Misericordioso." },
      { ar: "أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ.", es: "Tú eres nuestro Protector, concédenos pues la victoria sobre las gentes incrédulas." },
      { ar: "اَللّٰهُمَّ إِنَّا نَسْئَلُكَ رَحْمَةً مِنْ عِنْدِكَ تَهْدِي بِهَا رَوْعَنَا وَتَلُمُّ بِهَا شَعَثَنَا وَتَجْمَعُ بِهَا شَمْلَنَا وَتَشْفِي بِهَا مَرْضَانَا", es: "Oh Allah, Te pedimos una misericordia de Tu parte con la que guíes nuestros corazones, unas nuestra dispersión, reúnas a los nuestros y cures a nuestros enfermos." },
      { ar: "وَتُزَكِّي بِهَا أَعْمَالَنَا وَتُلْهِمُنَا بِهَا رُشْدَنَا يَا جَامِعَ النَّاسِ", es: "Que purifique nuestras acciones y nos inspire con recta guía. Oh Aquel que reúne a la humanidad." },
      { ar: "اَللّٰهُمَّ اجْمَعْ أُمَّةَ مُحَمَّدٍ عَلَى نُورِ هِدَايَتِكَ", es: "Oh Allah, reúne a la nación de Muhammad sobre la luz de Tu guía." },
      { ar: "اَللّٰهُمَّ اجْمَعْ أَوْلَادَ أُمَّةِ مُحَمَّدٍ إِلَى نُورِ هِدَايَتِكَ", es: "Oh Allah, reúne a los hijos de la nación de Muhammad hacia la luz de Tu guía." },
      { ar: "اَللّٰهُمَّ إِنَّا نَسْئَلُكَ بِصَمَدَانِيَّتِكَ وَبِوَحْدَانِيَّتِكَ وَبِفَرْدَانِيَّتِكَ وَبِعِزَّتِكَ الْبَاهِرَةِ وَبِرَحْمَتِكَ الْوَاسِعَةِ", es: "Oh Allah, Te pedimos por Tu cualidad de ser el Único en quien todos confían, por Tu Unicidad, por Tu Singularidad, por Tu Poder abrumador y por Tu inmensa Misericordia," },
      { ar: "أَنْ تَجْعَلَ لَنَا نُورًا فِي مَسَامِعِنَا وَنُورًا فِي أَعْيُنِنَا وَنُورًا فِي أَجْدَاثِنَا وَنُورًا فِي قُلُوبِنَا", es: "que nos pongas luz en nuestros oídos, luz en nuestros ojos, luz en nuestras tumbas y luz en nuestros corazones." },
      { ar: "اَللّٰهُمَّ اٰتِنَا نِعْمَةً ظَاهِرَةً وَنِعْمَةً بَاطِنَةً يَا قَوِيُّ يَا دَائِمُ يَا حَيُّ يَا بَاقِي", es: "Oh Allah, otórganos bendiciones aparentes y ocultas. Oh Fuerte, oh Eterno, oh Viviente, oh Permanente." },
      { ar: "حَسْبُنَا اللّٰهُ لِدِينِنَا حَسْبُنَا اللّٰهُ لِدُنْيَانَا حَسْبُنَا اللّٰهُ الْكَرِيمُ لِمَا أَهَمَّنَا", es: "Allah es suficiente para nuestra religión. Allah es suficiente para nuestros asuntos mundanales. Allah el Generoso es suficiente para lo que nos preocupa." },
      { ar: "حَسْبُنَا اللّٰهُ الْحَلِيمُ الْقَوِيُّ لِمَنْ بَغَى عَلَيْنَا حَسْبُنَا اللّٰهُ الشَّدِيدُ لِمَنْ كَادَنَا بِسُوءٍ", es: "Allah el Indulgente y Fuerte es suficiente contra quien nos oprime. Allah el Severo es suficiente contra quien trama el mal contra nosotros." },
      { ar: "حَسْبُنَا اللّٰهُ الرَّحِيمُ عِنْدَ السَّامِ حَسْبُنَا اللّٰهُ الرَّءُوفُ عِنْدَ الْمَسْئَلَةِ فِي الْجَدَثِ", es: "Allah el Misericordioso es suficiente en la muerte. Allah el Compasivo es suficiente durante el interrogatorio en la tumba." },
      { ar: "حَسْبُنَا اللّٰهُ اللَّطِيفُ عِنْدَ الْمِيزَانِ حَسْبُنَا اللّٰهُ الْقَدِيرُ عِنْدَ الصِّرَاطِ", es: "Allah el Sutil es suficiente en la Balanza. Allah el Poderoso es suficiente en el Puente (Sirat)." },
      { ar: "حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", es: "Me basta con Allah. No hay deidad sino Él. En Él confío y Él es el Señor del Trono Majestuoso." },
      { ar: "اَللّٰهُمَّ اجْعَلْ هٰذَا الْخَتْمَ الشَّرِيفَ وَالْفَاتِحَةَ الشَّرِيفَةَ وَالْإِخْلَاصَ الشَّرِيفَ وَالصَّلَوَاتِ الشَّرِيفَةَ", es: "Oh Allah, haz que la recompensa de este noble Khatm, de la Fatiha, de Al-Ikhlas y de las bendiciones (Salawat)," },
      { ar: "أَوَّلًا هَدِيَّةً وَاصِلَةً إِلَى رُوحِ نَبِيِّ الرَّحْمَةِ وَإِلَى أَرْوَاحِ أَهْلِ بَيْتِهِ وَاٰلِهِ وَأَزْوَاجِهِ وَأَصْحَابِهِ", es: "llegue primero como un regalo a la bendita alma del Profeta de la Misericordia, y a las almas de los miembros de su casa, su familia, sus esposas y sus compañeros," },
      { ar: "رِضْوَانُ اللّٰهِ تَعَالَى عَلَيْهِمْ أَجْمَعِينَ وَإِلَى أَرْوَاحِ جَمِيعِ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ", es: "que la complacencia de Allah Exaltado sea con todos ellos. Y a las almas de todos los profetas y mensajeros," },
      { ar: "وَإِلَى أَرْوَاحِ جَمِيعِ سَادَاتِنَا الْكِرَامِ ... وَإِلَى رُوحِ أُسْتَاذِنَا قَدَّسَ اللّٰهُ سِرَّهُ الْعَزِيزَ", es: "y a las almas de todos nuestros nobles maestros... y al alma de nuestro Sheikh, que Allah santifique su noble secreto." }
    ]
  },
  {
    id: "adhan-duasi",
    title: "اَذَان دُعَاسِي (Adhan Duasi)",
    frequency: "daily",
    segments: [
      { ar: "اَللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ", es: "Oh Allah, Señor de este llamado perfecto y de la oración que está a punto de establecerse," },
      { ar: "اٰتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ", es: "concédele a Muhammad la intercesión (Al-Wasilah) y la distinción, y resucítalo en la estación loable que le has prometido." },
      { ar: "اِنَّكَ لَا تُخْلِفُ الْمِيعَادَ.", es: "Ciertamente, Tú no faltas a Tu promesa." }
    ]
  },
  {
    id: "charshi-pazar",
    title: "چَارْشِي وَ پَازَارَه چِيقَارْكَنْ اُوقُونَاجَقْ دُعَا (Al mercado / Salir)",
    frequency: "daily",
    segments: [
      { ar: "بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ.", es: "En el nombre de Allah, confío en Allah. No hay poder ni fuerza sino en Allah, el Altísimo, el Grandioso." },
      { ar: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ", es: "No hay deidad digna de adoración excepto Allah, Único, sin copartícipes. Suyo es el reino y Suya es la alabanza." },
      { ar: "يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.", es: "Da la vida y da la muerte, y Él es el Viviente que no muere. En Su mano está el bien, y Él es Poderoso sobre todas las cosas." }
    ]
  },
  {
    id: "taam",
    title: "طَعَام دُعَاسِي (Comida)",
    frequency: "daily",
    segments: [
      { ar: "اَلْحَمْدُ لِلّٰهِ اَلْحَمْدُ لِلّٰهِ اَلْحَمْدُ لِلّٰهِ الَّذِي اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ", es: "Alabado sea Allah, alabado sea Allah, alabado sea Allah, Quien nos ha alimentado, nos ha dado de beber y nos ha hecho musulmanes." },
      { ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ أَنْوَاعِ الرِّزْقِ وَالْفُتُوحَاتِ", es: "Oh Allah, bendice a nuestro maestro Muhammad en la cantidad de todos los tipos de provisiones y conquistas." },
      { ar: "يَا بَاسِطُ الَّذِي يَبْسُطُ الرِّزْقَ لِمَنْ يَشَاءُ بِغَيْرِ حِسَابٍ", es: "Oh Aquel que expande el sustento para quien quiere sin medida," },
      { ar: "أُبْسُطْ عَلَيْنَا رِزْقًا وَاسِعًا مِنْ كُلِّ جِهَةٍ مِنْ خَزَائِنِ غَيْبِكَ", es: "expande sobre nosotros un sustento amplio desde todas las direcciones, de los tesoros de Tu conocimiento oculto." },
      { ar: "اَللّٰهُمَّ اغْفِرْ صَاحِبَ هٰذَا الطَّعَامِ وَالْآكِلِينَ", es: "Oh Allah, perdona al anfitrión de esta comida y a quienes la consumen." },
      { ar: "اَللّٰهُمَّ اجْعَلْ دَوْلَتَهُمْ دَائِمًا أَوْلَادَهُمْ عَالِمًا صَالِحًا وَلَا تُسَلِّطْ عَلَيْهِمْ ظَالِمًا", es: "Oh Allah, haz que su prosperidad sea permanente, que sus hijos sean eruditos y justos, y no des poder sobre ellos a ningún opresor." }
    ]
  },
  {
    id: "salawat-tas",
    title: "قُدْرَتْدَنْ طَاش اُوزَرِينَه يَازِيلَان صَلَوَات (Salawat de la Piedra)",
    frequency: "weekly",
    segments: [
      { ar: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بَحْرِ أَنْوَارِكَ وَمَعْدِنِ أَسْرَارِكَ", es: "Oh Allah, bendice a nuestro maestro Muhammad, el océano de Tus luces, la mina de Tus secretos," },
      { ar: "وَلِسَانِ حُجَّتِكَ وَعَرُوسِ مَمْلَكَتِكَ وَإِمَامِ حَضْرَتِكَ وَطِرَازِ مُلْكِكَ", es: "la lengua de Tu prueba, el adorno de Tu reino, el líder de Tu Presencia y el bordado de Tu dominio," },
      { ar: "وَخَزَائِنِ رَحْمَتِكَ وَطَرِيقِ شَرِيعَتِكَ الْمُتَلَذِّذِ بِتَوْحِيدِكَ", es: "los tesoros de Tu misericordia y el camino de Tu ley sagrada, aquel que se deleita en Tu Unidad," },
      { ar: "إِنْسَانِ عَيْنِ الْوُجُودِ وَالسَّبَبِ فِي كُلِّ مَوْجُودٍ", es: "la pupila del ojo de la existencia, y la razón de todo lo existente," },
      { ar: "عَيْنِ أَعْيَانِ خَلْقِكَ الْمُتَقَدِّمِ مِنْ نُورِ ضِيَائِكَ", es: "la esencia de las esencias de Tu creación, que precede de la luz de Tu resplandor," },
      { ar: "صَلَاةً تَدُومُ بِدَوَامِكَ وَتَبْقَى بِبَقَائِكَ لَا مُنْتَهَى لَهَا دُونَ عِلْمِكَ", es: "con una bendición que perdure con Tu eternidad y permanezca con Tu permanencia, que no tenga fin excepto en Tu conocimiento," },
      { ar: "صَلَاةً تُرْضِيكَ وَتُرْضِيهِ وَتَرْضَى بِهَا عَنَّا يَا رَبَّ الْعَالَمِينَ.", es: "una bendición que Te complazca, que le complazca a él, y mediante la cual estés complacido con nosotros, Oh Señor de los mundos." }
    ]
  },
  {
    id: "sabah-namazi",
    title: "صَبَاح نَمَازِينِك سُنَّتِي اِيلَه فَرْضِي آرَاسِنْدَه اُوقُونَاجَق دُعَا (Fajr)",
    frequency: "daily",
    segments: [
      { ar: "يَا حَيُّ يَا قَيُّومُ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", es: "Oh Viviente, oh Sustentador, oh Dueño de la Majestad y el Honor." },
      { ar: "اَسْئَلُكَ اَنْ تُحْيِيَ قَلْبِي بِنُورِ مَعْرِفَتِكَ اَبَدًا", es: "Te pido que des vida a mi corazón con la luz de Tu conocimiento, para siempre." },
      { ar: "يَا اَللّٰهُ يَا اَللّٰهُ يَا اَللّٰهُ يَا بَدِيعَ السَّمَوَاتِ وَالْأَرْضِ.", es: "¡Oh Allah! ¡Oh Allah! ¡Oh Allah! Oh Originador de los cielos y de la tierra." }
    ]
  },
  {
    id: "khalaya",
    title: "خَلَايَه كِيرَرْكَنْ اُوقُونَاجَقْ دُعَا (Al entrar al baño)",
    frequency: "daily",
    segments: [
      { ar: "اَعُوذُ بِاللّٰهِ مِنَ الْخُبُثِ وَالْخَبَائِثِ.", es: "Me refugio en Allah de la impureza y de los genios malignos (masculinos y femeninos)." }
    ]
  },
  {
    id: "khaladan",
    title: "خَلَادَنْ چِيقْدِقْدَنْ صُوكْرَه اُوقُونَاجَقْ دُعَا (Al salir del baño)",
    frequency: "daily",
    segments: [
      { ar: "اَلْحَمْدُ لِلّٰهِ الَّذِي أَذْهَبَ عَنَّا الْأَذَى وَعَافَانِي مِنْ ذٰلِكَ.", es: "Alabado sea Allah, Quien alejó de mí el daño y me concedió salud." }
    ]
  },
  {
    id: "nikah-duasi",
    title: "نِكَاح دُعَاسِي (Matrimonio)",
    frequency: "occasional",
    segments: [
      { ar: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِهِ وَصَحْبِهِ اَجْمَعِينَ", es: "Alabado sea Allah, Señor de los mundos, y que la paz y las bendiciones sean sobre nuestro maestro Muhammad, su familia y todos sus compañeros." },
      { ar: "اَللّٰهُمَّ اجْعَلْ هٰذَا الْعَقْدَ مَيْمُونًا مُبَارَكًا وَاجْعَلْ بَيْنَهُمَا أُلْفَةً وَمَحَبَّةً وَقَرَارًا", es: "Oh Allah, haz que este contrato matrimonial sea próspero y bendito. Pon entre ellos afecto, amor y estabilidad." },
      { ar: "وَلَا تَجْعَلْ بَيْنَهُمَا نَفْرَةً وَفِتْنَةً وَفِرَارًا", es: "Y no pongas entre ellos aversión, discordia ni separación." },
      { ar: "اَللّٰهُمَّ أَلِّفْ بَيْنَهُمَا كَمَا أَلَّفْتَ بَيْنَ أٰدَمَ عَلَيْهِ السَّلَامُ وَحَوَّاءَ رَضِيَ اللّٰهُ عَنْهَا", es: "Oh Allah, únelos en afecto tal como uniste a Adán (la paz sea con él) y a Eva (que Allah esté complacido con ella)." },
      { ar: "وَكَمَا أَلَّفْتَ بَيْنَ مُحَمَّدٍ ٱلْمُصْطَفَى صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ وَخَدِيجَةَ الْكُبْرَى رَضِيَ اللّٰهُ عَنْهَا", es: "Y tal como uniste a Muhammad el Elegido (la paz y las bendiciones de Allah sean con él) y a Jadiya la Grande." },
      { ar: "وَكَمَا أَلَّفْتَ بَيْنَ عَلِيٍّ كَرَّمَ اللّٰهُ تَعَالَى وَجْهَهُ وَفَاطِمَةَ الزَّهْرَاءِ رَضِيَ اللّٰهُ عَنْهَا", es: "Y tal como uniste a Alí (que Allah honre su rostro) y a Fátima la Resplandeciente." },
      { ar: "اَللّٰهُمَّ أَعْطِ لَهُمَا وَلَدًا عَالِمًا صَالِحًا وَعُمْرًا طَوِيلًا وَرِزْقًا حَلَالًا طَيِّبًا", es: "Oh Allah, concédeles descendencia erudita y justa, larga vida y provisión lícita y buena." },
      { ar: "اَللّٰهُمَّ رَبَّنَا اٰتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", es: "¡Oh Señor nuestro! Danos lo bueno en este mundo y lo bueno en la Otra Vida, y protégenos del castigo del Fuego." },
      { ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", es: "Señor nuestro, concédenos en nuestras esposas y descendencia el consuelo de nuestros ojos, y haznos líderes de los temerosos (de Allah)." }
    ]
  },
  {
    id: "janazah-duasi",
    title: "جَنَازَه دُعَاسِي (Funeral)",
    frequency: "occasional",
    segments: [
      { ar: "اَللّٰهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَكَبِيرِنَا وَصَغِيرِنَا وَذَكَرِنَا وَأُنْثَانَا", es: "Oh Allah, perdona a nuestros vivos y a nuestros muertos, a los presentes y a los ausentes, a nuestros ancianos y a nuestros jóvenes, a nuestros hombres y a nuestras mujeres." },
      { ar: "اَللّٰهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ", es: "Oh Allah, a quien des la vida de entre nosotros, haz que viva en el Islam; y a quien llames a la muerte de entre nosotros, haz que muera en la fe (Iman)." },
      { ar: "وَخُصَّ هٰذَا الْمَيِّتَ بِالرَّوْحِ وَالرَّاحَةِ وَالرَّحْمَةِ وَالْمَغْفِرَةِ وَالرِّضْوَانِ", es: "Y concede en especial a este difunto el descanso, la tranquilidad, la misericordia, el perdón y Tu complacencia." },
      { ar: "اَللّٰهُمَّ إِنْ كَانَ مُحْسِنًا فَزِدْ فِي إِحْسَانِهِ وَإِنْ كَانَ مُسِيئًا فَتَجَاوَزْ عَنْهُ", es: "Oh Allah, si era de los que hacían el bien, aumenta sus buenas acciones; y si era de los que hacían el mal, pasa por alto sus faltas." },
      { ar: "وَلَقِّهِ الْأَمْنَ وَالْبُشْرَى وَالْكَرَامَةَ وَالزُّلْفَى بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ.", es: "Y concédele la seguridad, las buenas nuevas, el honor y la cercanía a Ti. Por Tu misericordia, oh el más Misericordioso de los misericordiosos." }
    ]
  },
  {
    id: "ahzab-duasi",
    title: "اَحْزَاب دُعَاسِي (Ahzab Duasi)",
    frequency: "weekly",
    segments: [
      { ar: "اَللّٰهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اِهْزِمِ الْأَحْزَابَ", es: "Oh Allah, Revelador del Libro, Rápido en el ajuste de cuentas, derrota a los aliados (enemigos)." },
      { ar: "اَللّٰهُمَّ اِهْزِمْهُمْ وَانْصُرْنَا عَلَيْهِمْ وَزَلْزِلْهُمْ", es: "Oh Allah, derrótalos, concédenos la victoria sobre ellos y hazlos temblar." },
      { ar: "اَللّٰهُمَّ يَا مُجِيبَ الْمُضْطَرِّينَ، وَيَا صَرِيخَ الْمَكْرُوبِينَ، اِكْشِفْ عَنَّا هَمَّنَا وَغَمَّنَا وَكُرْبَتَنَا", es: "Oh Allah, Respondedor del necesitado, Socorro de los afligidos, alivia nuestra preocupación, nuestra pena y nuestra angustia." },
      { ar: "فَإِنَّكَ تَرَى مَا نَزَلَ بِنَا وَبِالْمُؤْمِنِينَ جَمِيعًا", es: "Pues Tú ves todo lo que ha descendido sobre nosotros y sobre todos los creyentes." },
      { ar: "اَللّٰهُمَّ اسْتُرْ عَوْرَاتِنَا، وَاٰمِنْ رَوْعَاتِنَا، يَا أَكْرَمَ الْأَكْرَمِينَ وَيَا أَرْحَمَ الرَّاحِمِينَ", es: "Oh Allah, oculta nuestros defectos y calma nuestros temores, oh el más Generoso, oh el más Misericordioso." },
      { ar: "بِحَقِّ اسْمِكَ الْعَظِيمِ الْأَعْظَمِ، وَبِمَعَاقِدِ الْعِزِّ مِنْ عَرْشِكَ، وَمُنْتَهَى الرَّحْمَةِ مِنْ كِتَابِكَ", es: "Por el derecho de Tu Nombre más Grandioso y Supremo, y por los nudos de honor de Tu Trono, y por el límite de la misericordia de Tu Libro." },
      { ar: "اَللّٰهُمَّ بِحُبِّ ذَاتِكَ تَحَصَّنَّا يَا اَللّٰهُ لَا إِلٰهَ إِلَّا اللّٰهُ سَيِّدُنَا مُحَمَّدٌ رَسُولُ اللّٰهِ حَقًّا وَصِدْقًا.", es: "Oh Allah, por el amor a Tu Esencia nos fortificamos. ¡Oh Allah! No hay deidad excepto Allah. Nuestro maestro Muhammad es el Mensajero de Allah en verdad y certeza." }
    ]
  },
  {
    id: "salawat-sharifah-2",
    title: "صَلَوَات شَرِيفَه (Segunda versión / Pág 32)",
    frequency: "weekly",
    segments: [
      { ar: "اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكُمْ يَا أَنْبِيَاءَ اللّٰهِ وَيَا رُسُلَ كِرَامِ اللّٰهِ", es: "Bendiciones y paz sean sobre vosotros en la medida del conocimiento de Allah, oh Profetas de Allah y oh nobles Mensajeros de Allah." },
      { ar: "اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكُمْ يَا أَوْلِيَاءَ اللّٰهِ وَيَا رِجَالَ الْغَيْبِ", es: "Bendiciones y paz sean sobre vosotros en la medida del conocimiento de Allah, oh Amigos (Awliya) de Allah y oh hombres de lo Oculto." },
      { ar: "أَغِيثُونِي بِغَوْثَةِ اللّٰهِ وَانْظُرُونِي بِنَظْرَةِ اللّٰهِ", es: "Socorredme con el socorro de Allah y miradme con la mirada de Allah." },
      { ar: "وَأَعِينُونِي بِعِنَايَةِ اللّٰهِ وَأَدْرِكُونِي سَرِيعًا بِرَحْمَةِ اللّٰهِ", es: "Y ayudadme con el cuidado de Allah, y alcanzadme rápidamente por la misericordia de Allah." },
      { ar: "اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكَ وَعَلَى اٰلِكَ وَأَصْحَابِكَ يَا سَيِّدِي يَا أَحْمَدِي يَا مُحَمَّدِي", es: "Bendición y paz en la medida del conocimiento de Allah sobre ti, tu familia y tus compañeros, oh mi maestro, oh mi Ahmad, oh mi Muhammad." },
      { ar: "خُذْ بِيَدِي قَلَّتْ حِيلَتِي أَدْرِكْنَا سَرِيعًا بِرَحْمَةِ اللّٰهِ", es: "Toma mi mano, mis medios se han agotado, sálvanos rápidamente por la misericordia de Allah." },
      { ar: "اَللّٰهُمَّ يَا لَطِيفُ أَدْرِكْنَا بِلُطْفِكَ الْخَفِيِّ نَحْنُ الْعَاجِزُونَ وَأَنْتَ الْغَنِيُّ الْعَزِيزُ", es: "Oh Allah, oh Sutil, alcánzanos con Tu bondad oculta; nosotros somos los incapaces y Tú eres el Rico, el Poderoso." },
      { ar: "يَا مَنْ عَنْكَ مَدَدِي وَعَلَيْكَ مُعْتَمَدِي عَجِّلْ فَرَجِي وَفَرَحَ إِخْوَانِي", es: "Oh Aquel de quien proviene mi apoyo y en quien confío, apresura mi alivio y la alegría de mis hermanos," },
      { ar: "بِحُرْمَةِ سَيِّدِنَا مُحَمَّدٍ الْعَرَبِيِّ بِحَقِّ اسْمِكَ الْعَظِيمِ الْأَعْظَمِ", es: "por el honor de nuestro maestro Muhammad, el árabe, y por el derecho de Tu Nombre Grandioso y Supremo." }
    ]
  }
];

function getDaysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const today = new Date();
  
  const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function getUrgency(daysSince: number, frequency: Frequency): UrgencyStatus {
  if (frequency === 'occasional') return 'none';
  if (daysSince === Infinity) return 'urgent';

  if (frequency === 'daily') {
    if (daysSince === 0) return 'good';
    if (daysSince === 1) return 'warning';
    return 'urgent';
  }
  
  if (frequency === 'weekly') {
    if (daysSince <= 7) return 'good';
    if (daysSince <= 10) return 'warning';
    return 'urgent';
  }

  return 'none';
}

const colorMap = {
  good: { border: 'border-emerald-200 hover:border-emerald-300', icon: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  warning: { border: 'border-orange-200 hover:border-orange-300', icon: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-600' },
  urgent: { border: 'border-rose-200 hover:border-rose-300', icon: 'text-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500', text: 'text-rose-600' },
  none: { border: 'border-slate-200 hover:border-slate-300', icon: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-400', text: 'text-slate-500' },
};

export default function SuplicasPage() {
  const suplicasHistory = useRepasaStore((state) => state.suplicasHistory);
  const markSuplicaStudied = useRepasaStore((state) => state.markSuplicaStudied);
  
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'book' | 'smart'>('book');
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [showTranslationFor, setShowTranslationFor] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  const sortedSuplicas = [...suplicas].sort((a, b) => {
    if (sortMode === 'book') return 0; 
    
    const historyA = suplicasHistory[a.id] || [];
    const historyB = suplicasHistory[b.id] || [];
    const daysA = getDaysSince(historyA[historyA.length - 1] || '');
    const daysB = getDaysSince(historyB[historyB.length - 1] || '');
    const urgencyA = getUrgency(daysA, a.frequency);
    const urgencyB = getUrgency(daysB, b.frequency);

    const score = { urgent: 3, warning: 2, good: 1, none: 0 };
    if (score[urgencyA] !== score[urgencyB]) {
      return score[urgencyB] - score[urgencyA];
    }
    return daysB - daysA;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--color-background)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-[var(--color-card)] transition-colors">
            <ChevronLeft className="w-6 h-6 text-[var(--color-primary)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)] font-amiri tracking-wider">
              Súplicas (Duas)
            </h1>
            <p className="text-xs opacity-60">Mavi Kitapçık</p>
          </div>
        </div>
        
        <button
          onClick={() => setSortMode(m => m === 'book' ? 'smart' : 'book')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 transition-all shadow-sm"
          title={sortMode === 'book' ? 'Cambiar a modo Inteligente' : 'Cambiar a orden del Libro'}
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
          {sortMode === 'book' ? 'Modo Libro' : 'Prioritarias'}
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {sortedSuplicas.map((suplica) => {
          const isOpen = openId === suplica.id;
          const history = suplicasHistory[suplica.id] || [];
          const isStudiedToday = history.includes(todayStr);
          const lastDate = history[history.length - 1];
          const daysSince = getDaysSince(lastDate);
          
          let urgencyStatus = getUrgency(daysSince, suplica.frequency);
          if (isStudiedToday && suplica.frequency !== 'occasional') urgencyStatus = 'good';
          
          const colors = colorMap[urgencyStatus];
          const showingHistory = showHistoryFor === suplica.id;
          const showingTranslation = showTranslationFor === suplica.id;

          let lastText = "Nunca";
          if (isStudiedToday) lastText = "Hoy";
          else if (daysSince === 1) lastText = "Ayer";
          else if (daysSince !== Infinity) lastText = `Hace ${daysSince} días`;

          return (
            <div 
              key={suplica.id} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${isOpen ? 'ring-2 ring-emerald-100 border-emerald-300' : colors.border}`}
            >
              <div
                className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={() => setOpenId(isOpen ? null : suplica.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full transition-colors ${colors.bg}`}>
                    {urgencyStatus === 'urgent' ? (
                      <AlertCircle className={`w-5 h-5 ${colors.icon}`} />
                    ) : urgencyStatus === 'warning' ? (
                      <Clock className={`w-5 h-5 ${colors.icon}`} />
                    ) : isStudiedToday ? (
                      <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
                    ) : (
                      <Circle className={`w-5 h-5 ${colors.icon} opacity-60`} />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <h2 className="text-base font-bold text-slate-800 font-amiri" dir="rtl">{suplica.title}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {suplica.frequency === 'daily' ? 'Diaria' : suplica.frequency === 'weekly' ? 'Semanal' : 'Ocasional'}
                      </span>
                      {suplica.frequency !== 'occasional' && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${colors.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                            Última vez: {lastText}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />}
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100">
                  
                  {/* Botones de acción (Historial y Traducción) */}
                  <div className="flex flex-wrap sm:flex-nowrap justify-end gap-2 mb-3">
                    <button
                      onClick={() => setShowTranslationFor(showingTranslation ? null : suplica.id)}
                      className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        showingTranslation 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      {showingTranslation ? "Ocultar Español" : "Ver Traducción"}
                    </button>
                    
                    <button
                      onClick={() => setShowHistoryFor(showingHistory ? null : suplica.id)}
                      className={`flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                        showingHistory 
                          ? "bg-slate-100 border-slate-300 text-slate-700" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Historial
                    </button>
                  </div>

                  {/* Contenedor del Texto */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4 max-h-[50vh] overflow-y-auto">
                    {suplica.segments.map((seg, idx) => (
                      <div key={idx} className={`mb-4 last:mb-0 ${showingTranslation ? 'border-b border-slate-200/60 pb-3 last:border-0 last:pb-0' : ''}`}>
                        <p dir="rtl" className="font-amiri text-2xl leading-[2.4] text-slate-800 break-words mb-1">
                          {seg.ar}
                        </p>
                        {showingTranslation && (
                          <p className="text-sm leading-relaxed text-indigo-800/80 font-medium bg-indigo-50/50 p-2 rounded-lg">
                            {seg.es}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Footer de la tarjeta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 italic">
                      {suplica.note && <span>Nota: {suplica.note}</span>}
                    </div>
                    
                    <button
                      onClick={() => markSuplicaStudied(suplica.id)}
                      disabled={isStudiedToday}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-center ${
                        isStudiedToday
                          ? "bg-emerald-100 text-emerald-600 cursor-default"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm"
                      }`}
                    >
                      {isStudiedToday ? "Completado hoy" : "Marcar Repaso"}
                    </button>
                  </div>

                  {/* Historial Desplegable */}
                  {showingHistory && (
                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Historial de Repasos ({history.length})
                      </h4>
                      {history.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {history.slice().reverse().map(date => (
                            <span key={date} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                              {date}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No hay registros de repaso todavía.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
