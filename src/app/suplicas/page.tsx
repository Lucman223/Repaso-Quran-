"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ChevronRight, CheckCircle2, Circle, ArrowDownUp, AlertCircle, Clock, History, CalendarDays } from "lucide-react";
import { useRepasaStore } from "@/store/useStore";
import { getTodayDateString } from "@/lib/dateUtils";

type Frequency = 'daily' | 'weekly' | 'occasional';
type UrgencyStatus = 'good' | 'warning' | 'urgent' | 'none';

type Suplica = {
  id: string;
  title: string;
  text: string;
  note?: string;
  frequency: Frequency;
};

const suplicas: Suplica[] = [
  {
    id: "sayyid-istighfar",
    title: "سَيِّدُ الاِسْتِغْفَارِ (Sayyid al-Istighfar)",
    note: "Leer 7 veces por la mañana y noche",
    frequency: "daily",
    text: "اَللّٰهُمَّ أَنْتَ الْمَلِكُ الْحَيُّ الَّذِي لَا إِلٰهَ إِلَّا أَنْتَ أَنْتَ رَبِّي خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي ذُنُوبِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ."
  },
  {
    id: "salawat-sharifah",
    title: "صَلَوَات شَرِيفَه (Salawat Sharifah)",
    frequency: "daily",
    text: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَنْفَاسِ الْمَخْلُوقَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَشْعَارِ الْمَوْجُودَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ سَوَاكِنِ الْأَرْضِ وَالسَّمَوَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ حُرُوفِ اللَّوْحِ وَالدَّعَوَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ كُلِّ الْمَعْدُودَاتِ وَالْمَعْلُومَاتِ مِنْ اَوَّلِ اَزَلِهِ وَاَوْسَطِ حَشْرِهِ وَاٰخِرِ بَقَائِهِ وَعَلَى اٰلِهِ وَصَحْبِهِ الطَّيِّبِينَ الطَّاهِرِينَ أَجْمَعِينَ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ."
  },
  {
    id: "salat-munjiyah",
    title: "صَلَاة مُنْجِيَه (Salat Munjiyah)",
    frequency: "daily",
    text: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِ سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْاٰفَاتِ وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ وَتَرْفَعُنَا بِهَا عِنْدَكَ اَعْلَى الدَّرَجَاتِ وَتُبَلِّغُنَا بِهَا اَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ."
  },
  {
    id: "salat-nariyah",
    title: "صَلَاة نَارِيَه (Salat Nariyah)",
    frequency: "weekly",
    text: "اَللّٰهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى اٰلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ."
  },
  {
    id: "salat-siddiq",
    title: "حَضْرَتِ صِدِّيقِكَ صَلَاتِي (Hazrat Siddiq Salati)",
    frequency: "weekly",
    text: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِ سَيِّدِنَا مُحَمَّدٍ وَبَارِكْ وَسَلِّمْ عَلَيْهِ وَعَلَيْهِمْ اَعُوذُ بِاللّٰهِ مِنَ الْهَمِّ وَالْحُزْنِ وَمِنَ الْجُبْنِ وَالْبُخْلِ وَمِنَ الْعَجْزِ وَالْكَسَلِ وَمِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ."
  },
  {
    id: "salat-fathiyah",
    title: "صَلَاة فَتْحِيَه (Salat Fathiyah)",
    frequency: "weekly",
    text: "اَللّٰهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ ٱلْفَاتِحِ لِمَا أُغْلِقَ وَالْخَاتِمِ لِمَا سَبَقَ نَاصِرِ الْحَقِّ بِالْحَقِّ وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيمِ وَعَلَى اٰلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ."
  },
  {
    id: "salawat-tas",
    title: "قُدْرَتْدَنْ طَاش اُوزَرِينَه يَازِيلَان صَلَوَات (Salawat de la Piedra)",
    frequency: "weekly",
    text: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بَحْرِ أَنْوَارِكَ وَمَعْدِنِ أَسْرَارِكَ وَلِسَانِ حُجَّتِكَ وَعَرُوسِ مَمْلَكَتِكَ وَإِمَامِ حَضْرَتِكَ وَطِرَازِ مُلْكِكَ وَخَزَائِنِ رَحْمَتِكَ وَطَرِيقِ شَرِيعَتِكَ الْمُتَلَذِّذِ بِتَوْحِيدِكَ إِنْسَانِ عَيْنِ الْوُجُودِ وَالسَّبَبِ فِي كُلِّ مَوْجُودٍ عَيْنِ أَعْيَانِ خَلْقِكَ الْمُتَقَدِّمِ مِنْ نُورِ ضِيَائِكَ صَلَاةً تَدُومُ بِدَوَامِكَ وَتَبْقَى بِبَقَائِكَ لَا مُنْتَهَى لَهَا دُونَ عِلْمِكَ صَلَاةً تُرْضِيكَ وَتُرْضِيهِ وَتَرْضَى بِهَا عَنَّا يَا رَبَّ الْعَالَمِينَ. اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَنْفَاسِ الْمَخْلُوقَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ اَشْعَارِ الْمَوْجُودَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ سَوَاكِنِ الْأَرْضِ وَالسَّمَوَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ حُرُوفِ اللَّوْحِ وَالدَّعَوَاتِ وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ كُلِّ الْمَعْدُودَاتِ وَالْمَعْلُومَاتِ مِنْ اَوَّلِ اَزَلِهِ وَاَوْسَطِ حَشْرِهِ وَاٰخِرِ بَقَائِهِ وَعَلَى اٰلِهِ وَصَحْبِهِ الطَّيِّبِينَ الطَّاهِرِينَ أَجْمَعِينَ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ."
  },
  {
    id: "khatm-duasi",
    title: "خَتْم دُعَاسِي (Khatm Duasi)",
    frequency: "weekly",
    text: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِهِ وَصَحْبِهِ أَجْمَعِينَ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ أَنْتَ مَوْلَانَا وَأَنْتَ أَكْرَمُ الْأَكْرَمِينَ أَنْتَ مَوْلَانَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ. اَللّٰهُمَّ إِنَّا نَسْئَلُكَ رَحْمَةً مِنْ عِنْدِكَ تَهْدِي بِهَا رَوْعَنَا وَتَلُمُّ بِهَا شَعَثَنَا وَتَجْمَعُ بِهَا شَمْلَنَا وَتَشْفِي بِهَا مَرْضَانَا وَتُزَكِّي بِهَا أَعْمَالَنَا وَتُلْهِمُنَا بِهَا رُشْدَنَا يَا جَامِعَ النَّاسِ اَللّٰهُمَّ اجْمَعْ أُمَّةَ مُحَمَّدٍ عَلَى نُورِ هِدَايَتِكَ يَا جَامِعَ النَّاسِ اَللّٰهُمَّ اجْمَعْ أَوْلَادَ أُمَّةِ مُحَمَّدٍ إِلَى نُورِ هِدَايَتِكَ اَللّٰهُمَّ إِنَّا نَسْئَلُكَ بِصَمَدَانِيَّتِكَ وَبِوَحْدَانِيَّتِكَ وَبِفَرْدَانِيَّتِكَ وَبِعِزَّتِكَ الْبَاهِرَةِ وَبِرَحْمَتِكَ الْوَاسِعَةِ أَنْ تَجْعَلَ لَنَا نُورًا فِي مَسَامِعِنَا وَنُورًا فِي أَعْيُنِنَا وَنُورًا فِي أَجْدَاثِنَا وَنُورًا فِي قُلُوبِنَا اَللّٰهُمَّ اٰتِنَا نِعْمَةً ظَاهِرَةً وَنِعْمَةً بَاطِنَةً يَا قَوِيُّ يَا دَائِمُ يَا حَيُّ يَا بَاقِي حَسْبُنَا اللّٰهُ لِدِينِنَا حَسْبُنَا اللّٰهُ لِدُنْيَانَا حَسْبُنَا اللّٰهُ الْكَرِيمُ لِمَا أَهَمَّنَا حَسْبُنَا اللّٰهُ الْحَلِيمُ الْقَوِيُّ لِمَنْ بَغَى عَلَيْنَا حَسْبُنَا اللّٰهُ الشَّدِيدُ لِمَنْ كَادَنَا بِسُوءٍ حَسْبُنَا اللّٰهُ الرَّحِيمُ عِنْدَ السَّامِ حَسْبُنَا اللّٰهُ الرَّءُوفُ عِنْدَ الْمَسْئَلَةِ فِي الْجَدَثِ حَسْبُنَا اللّٰهُ اللَّطِيفُ عِنْدَ الْمِيزَانِ حَسْبُنَا اللّٰهُ الْقَدِيرُ عِنْدَ الصِّرَاطِ حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ. يَا رَحْمٰنَ الدُّنْيَا وَ يَا رَحِيمَ الْآخِرَةِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ. اَللّٰهُمَّ اجْعَلْ هٰذَا الْخَتْمَ الشَّرِيفَ وَالْفَاتِحَةَ الشَّرِيفَةَ وَالْإِخْلَاصَ الشَّرِيفَ وَالصَّلَوَاتِ الشَّرِيفَةَ أَوَّلًا هَدِيَّةً وَاصِلَةً إِلَى رُوحِ نَبِيِّ الرَّحْمَةِ وَإِلَى أَرْوَاحِ أَهْلِ بَيْتِهِ وَاٰلِهِ وَأَزْوَاجِهِ وَأَصْحَابِهِ رِضْوَانُ اللّٰهِ تَعَالَى عَلَيْهِمْ أَجْمَعِينَ وَإِلَى أَرْوَاحِ جَمِيعِ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَإِلَى أَرْوَاحِ جَمِيعِ سَادَاتِنَا الْكِرَامِ رِضْوَانُ اللّٰهِ تَعَالَى عَلَيْهِمْ أَجْمَعِينَ وَإِلَى رُوحِ أُسْتَاذِنَا قَدَّسَ اللّٰهُ سِرَّهُ الْعَزِيزَ اَللّٰهُمَّ اجْعَلْ هٰذَا جُزْءًا مِنْ جُزْءِ صَدَقَاتِ نَبِيِّكَ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ اَللّٰهُمَّ اجْعَلْ هٰذَا جُزْءًا مِنْ جُزْءِ هَدِيَّاتِ النَّبِيِّ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ إِلَى أَرْوَاحِنَا إِلَى مَقَامِ أَرْوَاحِنَا وَإِلَى أَرْوَاحِ أٰبَائِنَا وَأُمَّهَاتِنَا وَأَقْرِبَائِنَا وَتَعَلُّقَاتِنَا خَاصَّةً إِلَى هِدَايَةِ أُمَّةِ مُحَمَّدٍ خَاصَّةً إِلَى هِدَايَةِ أَوْلَادِ أُمَّةِ مُحَمَّدٍ اَللّٰهُمَّ انْصُرْ مَنْ نَصَرَ الدِّينَ وَاخْذُلْ مَنْ خَذَلَ الْمُسْلِمِينَ اَللّٰهُمَّ مُنْزِلَ الْكِتَابِ سَرِيعَ الْحِسَابِ اِهْزِمِ الْأَحْزَابَ اَللّٰهُمَّ اِهْزِمْهُمْ وَانْصُرْنَا عَلَيْهِمْ وَزَلْزِلْهُمْ اَللّٰهُمَّ يَا مُجِيبَ الْمُضْطَرِّينَ وَيَا صَرِيخَ الْمَكْرُوبِينَ اِكْشِفْ عَنَّا هَمَّنَا وَغَمَّنَا وَكُرْبَتَنَا فَإِنَّكَ تَرَى مَا نَزَلَ بِنَا وَبِالْمُؤْمِنِينَ جَمِيعًا اَللّٰهُمَّ اسْتُرْ عَوْرَاتِنَا وَأٰمِنْ رَوْعَاتِنَا يَا أَكْرَمَ الْأَكْرَمِينَ وَيَا أَرْحَمَ الرَّاحِمِينَ بِحَقِّ اسْمِكَ الْعَظِيمِ الْأَعْظَمِ وَبِمَعَاقِدِ الْعِزِّ مِنْ عَرْشِكَ وَمُنْتَهَى الرَّحْمَةِ مِنْ كِتَابِكَ وَمُنْتَهَى الْفَضْلِ فِي نَبِيِّكَ الرَّحْمَةِ (وَمُنْتَهَى الْفَضْلِ فِي شَهْرِ رَمَضَانَ وَمُنْتَهَى الْفَضْلِ فِي لَيْلَةِ الْقَدْرِ وَمُنْتَهَى الْفَضْلِ فِي نُورِ لَيْلَةِ الْقَدْرِ) يَا أَرْحَمَ الرَّاحِمِينَ وَيَا أَكْرَمَ الْأَكْرَمِينَ اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ فِي الْأَوَّلِينَ وَصَلِّ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ فِي الْآخِرِينَ وَصَلِّ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ فِي الْمَلَإِ الْأَعْلَى إِلَى يَوْمِ الدِّينِ وَصَلِّ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ فِي كُلِّ وَقْتٍ وَحِينٍ وَصَلِّ عَلَى جَمِيعِ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَعَلَى مَلَائِكَتِكَ الْمُقَرَّبِينَ وَعَلَى عِبَادِكَ الصَّالِحِينَ وَعَلَى أَهْلِ طَاعَتِكَ أَجْمَعِينَ وَاغْفِرْ لَنَا وَارْحَمْنَا وَاحْشُرْنَا مَعَهُمْ بِمَغْفِرَتِكَ وَبِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ وَاغْفِرْ لَنَا وَارْحَمْنَا وَاحْشُرْنَا مَعَهُمْ بِمَغْفِرَتِكَ وَبِرَحْمَتِكَ وَبِفَضْلِكَ يَا أَرْحَمَ الرَّاحِمِينَ إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ."
  },
  {
    id: "adhan-duasi",
    title: "اَذَان دُعَاسِي (Adhan Duasi)",
    frequency: "daily",
    text: "اَللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ اٰتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ اِنَّكَ لَا تُخْلِفُ الْمِيعَادَ."
  },
  {
    id: "sabah-namazi",
    title: "صَبَاح نَمَازِينِك سُنَّتِي اِيلَه فَرْضِي آرَاسِنْدَه اُوقُونَاجَق دُعَا (Fajr)",
    frequency: "daily",
    text: "يَا حَيُّ يَا قَيُّومُ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ اَسْئَلُكَ اَنْ تُحْيِيَ قَلْبِي بِنُورِ مَعْرِفَتِكَ اَبَدًا يَا اَللّٰهُ يَا اَللّٰهُ يَا اَللّٰهُ يَا بَدِيعَ السَّمَوَاتِ وَالْأَرْضِ."
  },
  {
    id: "charshi-pazar",
    title: "چَارْشِي وَ پَازَارَه چِيقَارْكَنْ اُوقُونَاجَقْ دُعَا (Al mercado)",
    frequency: "daily",
    text: "بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ. لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ."
  },
  {
    id: "khalaya",
    title: "خَلَايَه كِيرَرْكَنْ اُوقُونَاجَقْ دُعَا (Al entrar al baño)",
    frequency: "daily",
    text: "اَعُوذُ بِاللّٰهِ مِنَ الْخُبُثِ وَالْخَبَائِثِ."
  },
  {
    id: "khaladan",
    title: "خَلَادَنْ چِيقْدِقْدَنْ صُوكْرَه اُوقُونَاجَقْ دُعَا (Al salir del baño)",
    frequency: "daily",
    text: "اَلْحَمْدُ لِلّٰهِ الَّذِي أَذْهَبَ عَنَّا الْأَذَى وَعَافَانِي مِنْ ذٰلِكَ."
  },
  {
    id: "taam",
    title: "طَعَام دُعَاسِي (Comida)",
    frequency: "daily",
    text: "اَلْحَمْدُ لِلّٰهِ اَلْحَمْدُ لِلّٰهِ اَلْحَمْدُ لِلّٰهِ الَّذِي اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِهِ وَصَحْبِهِ أَجْمَعِينَ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بِعَدَدِ أَنْوَاعِ الرِّزْقِ وَالْفُتُوحَاتِ يَا بَاسِطُ الَّذِي يَبْسُطُ الرِّزْقَ لِمَنْ يَشَاءُ بِغَيْرِ حِسَابٍ أُبْسُطْ عَلَيْنَا رِزْقًا وَاسِعًا مِنْ كُلِّ جِهَةٍ مِنْ خَزَائِنِ غَيْبِكَ بِغَيْرِ مِنَّةِ مَخْلُوقٍ بِمَحْضِ فَضْلِ كَرَمِكَ بِغَيْرِ حِسَابٍ يَا أَكْرَمَ الْأَكْرَمِينَ وَيَا أَرْحَمَ الرَّاحِمِينَ اِفْتَحِ الْبَابَ يَا اَللّٰهُ اِفْتَحِ الْبَابَ يَا اَللّٰهُ اِفْتَحِ الْبَابَ يَا اَللّٰهُ يَا كَافِي يَا فَتَّاحُ يَا مُفَتِّحُ فَتِّحْ بِالْخَيْرِ اَللّٰهُمَّ اغْفِرْ صَاحِبَ هٰذَا الطَّعَامِ وَالْآكِلِينَ اَللّٰهُمَّ اجْعَلْ دَوْلَتَهُمْ دَائِمًا أَوْلَادَهُمْ عَالِمًا صَالِحًا وَلَا تُسَلِّطْ عَلَيْهِمْ ظَالِمًا اَللّٰهُمَّ زِدْ وَلَا تَنْقُصْ نِعْمَةً كَثِيرَةً بِحُرْمَةِ الْفَاتِحَةِ."
  },
  {
    id: "nikah-duasi",
    title: "نِكَاح دُعَاسِي (Matrimonio)",
    frequency: "occasional",
    text: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى اٰلِهِ وَصَحْبِهِ اَجْمَعِينَ اَللّٰهُمَّ اجْعَلْ هٰذَا الْعَقْدَ مَيْمُونًا مُبَارَكًا وَاجْعَلْ بَيْنَهُمَا أُلْفَةً وَمَحَبَّةً وَقَرَارًا وَلَا تَجْعَلْ بَيْنَهُمَا نَفْرَةً وَفِتْنَةً وَفِرَارًا اَللّٰهُمَّ أَلِّفْ بَيْنَهُمَا كَمَا أَلَّفْتَ بَيْنَ أٰدَمَ عَلَيْهِ السَّلَامُ وَحَوَّاءَ رَضِيَ اللّٰهُ عَنْهَا وَكَمَا أَلَّفْتَ بَيْنَ مُحَمَّدٍ ٱلْمُصْطَفَى صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ وَخَدِيجَةَ الْكُبْرَى رَضِيَ اللّٰهُ عَنْهَا وَكَمَا أَلَّفْتَ بَيْنَ عَلِيٍّ كَرَّمَ اللّٰهُ تَعَالَى وَجْهَهُ وَفَاطِمَةَ الزَّهْرَاءِ رَضِيَ اللّٰهُ عَنْهَا اَللّٰهُمَّ أَعْطِ لَهُمَا وَلَدًا عَالِمًا صَالِحًا وَعُمْرًا طَوِيلًا وَرِزْقًا حَلَالًا طَيِّبًا اَللّٰهُمَّ رَبَّنَا اٰتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ وَالْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ."
  },
  {
    id: "janazah-duasi",
    title: "جَنَازَه دُعَاسِي (Funeral)",
    frequency: "occasional",
    text: "اَللّٰهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَكَبِيرِنَا وَصَغِيرِنَا وَذَكَرِنَا وَأُنْثَانَا اَللّٰهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ وَخُصَّ هٰذَا الْمَيِّتَ بِالرَّوْحِ وَالرَّاحَةِ وَالرَّحْمَةِ وَالْمَغْفِرَةِ وَالرِّضْوَانِ اَللّٰهُمَّ إِنْ كَانَ مُحْسِنًا فَزِدْ فِي إِحْسَانِهِ وَإِنْ كَانَ مُسِيئًا فَتَجَاوَزْ عَنْهُ وَلَقِّهِ الْأَمْنَ وَالْبُشْرَى وَالْكَرَامَةَ وَالزُّلْفَى بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ."
  },
  {
    id: "ahzab-duasi",
    title: "اَحْزَاب دُعَاسِي (Ahzab Duasi)",
    frequency: "weekly",
    text: "اَللّٰهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اِهْزِمِ الْأَحْزَابَ، اَللّٰهُمَّ اِهْزِمْهُمْ وَانْصُرْنَا عَلَيْهِمْ وَزَلْزِلْهُمْ، اَللّٰهُمَّ يَا مُجِيبَ الْمُضْطَرِّينَ، وَيَا صَرِيخَ الْمَكْرُوبِينَ، اِكْشِفْ عَنَّا هَمَّنَا وَغَمَّنَا وَكُرْبَتَنَا، فَإِنَّكَ تَرَى مَا نَزَلَ بِنَا وَبِالْمُؤْمِنِينَ جَمِيعًا، اَللّٰهُمَّ اسْتُرْ عَوْرَاتِنَا، وَاٰمِنْ رَوْعَاتِنَا، يَا أَكْرَمَ الْأَكْرَمِينَ وَيَا أَرْحَمَ الرَّاحِمِينَ، بِحَقِّ اسْمِكَ الْعَظِيمِ الْأَعْظَمِ، وَبِمَعَاقِدِ الْعِزِّ مِنْ عَرْشِكَ، وَمُنْتَهَى الرَّحْمَةِ مِنْ كِتَابِكَ، وَمُنْتَهَى الْفَضْلِ فِي نَبِيِّكَ الرَّحْمَةِ، وَبِحَقِّ حُبِّ ذَاتِكَ، اَللّٰهُمَّ بِحُبِّ ذَاتِكَ تَحَصَّنَّا يَا اَللّٰهُ لَا إِلٰهَ إِلَّا اللّٰهُ سَيِّدُنَا مُحَمَّدٌ رَسُولُ اللّٰهِ حَقًّا وَصِدْقًا، اَللّٰهُمَّ شَفِّعْهُ فِينَا بِجَاهِهِ عِنْدَكَ، إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ."
  },
  {
    id: "salawat-sharifah-2",
    title: "صَلَوَات شَرِيفَه (Segunda versión / Pág 32)",
    frequency: "weekly",
    text: "اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكُمْ يَا أَنْبِيَاءَ اللّٰهِ وَيَا رُسُلَ كِرَامِ اللّٰهِ اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكُمْ يَا أَوْلِيَاءَ اللّٰهِ وَيَا رِجَالَ الْغَيْبِ وَيَا أَرْوَاحَ الْمُقَدَّسَةِ أَغِيثُونِي بِغَوْثَةِ اللّٰهِ وَانْظُرُونِي بِنَظْرَةِ اللّٰهِ وَأَعِينُونِي بِعِنَايَةِ اللّٰهِ وَأَدْرِكُونِي سَرِيعًا بِرَحْمَةِ اللّٰهِ اَلصَّلٰوةُ وَالسَّلَامُ بِعَدَدِ عِلْمِ اللّٰهِ عَلَيْكَ وَعَلَى اٰلِكَ وَأَصْحَابِكَ يَا سَيِّدِي يَا أَحْمَدِي يَا مُحَمَّدِي يَا وَسِيلَتِي يَا نُورِي يَا هِدَايَتِي إِلَى اللّٰهِ خُذْ بِيَدِي قَلَّتْ حِيلَتِي أَدْرِكْنَا سَرِيعًا بِرَحْمَةِ اللّٰهِ أَدْرِكْ أَبَا الْقَاسِمِ إِنِّي مُنْحَصِرٌ سَيِّدِي مُحَمَّدُ بْنُ عَبْدِ اللّٰهِ بْنِ عَبْدِ الْمُطَّلِبِ هُوَ النُّورُ اَللّٰهُمَّ يَا لَطِيفُ أَدْرِكْنَا بِلُطْفِكَ الْخَفِيِّ نَحْنُ الْعَاجِزُونَ وَأَنْتَ الْغَنِيُّ الْعَزِيزُ يَا رَحْمٰنُ يَا رَحِيمُ يَا اَللّٰهُ جَلَّ جَلَالُهُ يَا أَحَدُ يَا صَمَدُ يَا مَنْ عَنْكَ مَدَدِي وَعَلَيْكَ مُعْتَمَدِي عَجِّلْ فَرَجِي وَفَرَحَ إِخْوَانِي بِحُرْمَةِ سَيِّدِنَا مُحَمَّدٍ الْعَرَبِيِّ بِحَقِّ اسْمِكَ الْعَظِيمِ الْأَعْظَمِ وَبِمَعَاقِدِ الْعِزِّ مِنْ عَرْشِكَ وَمُنْتَهَى الرَّحْمَةِ مِنْ كِتَابِكَ وَمُنْتَهَى الْفَضْلِ فِي نَبِيِّكَ الرَّحْمَةِ وَمُنْتَهَى الْإِحْسَانِ مِنْ حُبِّ ذَاتِكَ اَللّٰهُمَّ بِحُبِّ ذَاتِكَ تَحَصَّنَّا يَا اَللّٰهُ لَا إِلٰهَ إِلَّا اللّٰهُ سَيِّدُنَا مُحَمَّدٌ رَسُولُ اللّٰهِ حَقًّا وَصِدْقًا."
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

  const todayStr = getTodayDateString();

  const sortedSuplicas = [...suplicas].sort((a, b) => {
    if (sortMode === 'book') return 0; // Maintain original order
    
    const historyA = suplicasHistory[a.id] || [];
    const historyB = suplicasHistory[b.id] || [];
    const daysA = getDaysSince(historyA[historyA.length - 1] || '');
    const daysB = getDaysSince(historyB[historyB.length - 1] || '');
    const urgencyA = getUrgency(daysA, a.frequency);
    const urgencyB = getUrgency(daysB, b.frequency);

    const score = { urgent: 3, warning: 2, good: 1, none: 0 };
    if (score[urgencyA] !== score[urgencyB]) {
      return score[urgencyB] - score[urgencyA]; // Higher score (urgent) first
    }
    return daysB - daysA; // Secondary sort: more days since last review first
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
          if (isStudiedToday && suplica.frequency !== 'occasional') urgencyStatus = 'good'; // Force green if done today
          
          const colors = colorMap[urgencyStatus];
          const showingHistory = showHistoryFor === suplica.id;

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
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4 max-h-[50vh] overflow-y-auto mt-4 relative">
                    <p dir="rtl" className="font-amiri text-2xl leading-[2.6] text-slate-800 break-words">
                      {suplica.text}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 italic">
                      {suplica.note && <span>Nota: {suplica.note}</span>}
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setShowHistoryFor(showingHistory ? null : suplica.id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <History className="w-4 h-4" />
                        Historial
                      </button>
                      
                      <button
                        onClick={() => markSuplicaStudied(suplica.id)}
                        disabled={isStudiedToday}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 sm:flex-none text-center ${
                          isStudiedToday
                            ? "bg-emerald-100 text-emerald-600 cursor-default"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-sm"
                        }`}
                      >
                        {isStudiedToday ? "Completado hoy" : "Marcar Repaso"}
                      </button>
                    </div>
                  </div>

                  {/* Modal / Sección de historial desplegable */}
                  {showingHistory && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Historial de Repasos ({history.length})
                      </h4>
                      {history.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {history.slice().reverse().map(date => (
                            <span key={date} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm">
                              {date}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No hay registros de repaso para esta súplica todavía.</p>
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
