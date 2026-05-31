export interface AyahItem {
  id: string;
  reference: string;
  arabic: string;
  english: string;
  urdu: string;
}

export interface HadithItem {
  id: string;
  reference: string;
  english: string;
  urdu: string;
}

export const QURANIC_AYAS: AyahItem[] = [
  {
    id: "ayah_1",
    reference: "Al-Baqarah 2:152",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    urdu: "تم مجھے یاد رکھو، میں تمہیں یاد رکھوں گا، اور میرا شکر ادا کرو اور میری ناشکری نہ کرو۔"
  },
  {
    id: "ayah_2",
    reference: "Al-Baqarah 2:186",
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    english: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    urdu: "اور جب میرے بندے آپ سے میرے بارے میں سوال کریں تو یقیناً میں قریب ہوں، میں پکارنے والے کی پکار کا جواب دیتا ہوں جب وہ مجھے پکارتا ہے۔"
  },
  {
    id: "ayah_3",
    reference: "Ar-Ra'd 13:28",
    arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    english: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
    urdu: "جو لوگ ایمان لائے ان کے دل اللہ کے ذکر سے مطمئن ہوتے ہیں۔ یاد رکھو، اللہ کے ذکر ہی سے دلوں کو اطمینان ملتا ہے۔"
  },
  {
    id: "ayah_4",
    reference: "Az-Zumar 39:53",
    arabic: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    english: "Say, 'O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.'",
    urdu: "کہہ دیجیے کہ اے میرے بندو جنہوں نے اپنی جانوں پر زیادتی کی ہے، اللہ کی رحمت سے مایوس نہ ہو، یقیناً اللہ تمام گناہ معاف کر دیتا ہے۔"
  },
  {
    id: "ayah_5",
    reference: "Ash-Sharh 94:5-6",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    english: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
    urdu: "پس یقیناً مشکل کے ساتھ آسانی ہے، یقیناً مشکل کے ساتھ آسانی ہے۔"
  },
  {
    id: "ayah_6",
    reference: "Al-Imran 3:159",
    arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    english: "Indeed, Allah loves those who rely [upon Him].",
    urdu: "بیشک اللہ توکل کرنے والوں سے محبت کرتا ہے۔"
  },
  {
    id: "ayah_7",
    reference: "Al-Anfal 8:2",
    arabic: "إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ",
    english: "The believers are only those who, when Allah is mentioned, their hearts feel fear.",
    urdu: "سچے مومن تو وہ ہیں کہ جب اللہ کا ذکر کیا جائے تو ان کے دل ڈر جاتے ہیں۔"
  },
  {
    id: "ayah_8",
    reference: "Al-Baqarah 2:286",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    english: "Allah does not burden a soul beyond that it can bear.",
    urdu: "اللہ کسی جان پر اس کی طاقت سے زیادہ بوجھ نہیں ڈالتا۔"
  },
  {
    id: "ayah_9",
    reference: "Ghafir 40:60",
    arabic: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    english: "And your Lord says, 'Call upon Me; I will respond to you.'",
    urdu: "اور تمہارے رب نے فرمایا: مجھے پکارو، میں تمہاری دعا قبول کروں گا۔"
  },
  {
    id: "ayah_10",
    reference: "Taha 20:114",
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    english: "O My Lord, increase me in knowledge.",
    urdu: "اے میرے پروردگار! میرے علم میں اضافہ فرما۔"
  }
];

export const PROPHETIC_HADITHS: HadithItem[] = [
  {
    id: "hadith_1",
    reference: "Sahih al-Bukhari 5027",
    english: "The Prophet (ﷺ) said: 'The best among you are those who learn the Qur'an and teach it.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'تم میں سے بہترین شخص وہ ہے جو قرآن سیکھے اور اسے دوسروں کو سکھائے۔'"
  },
  {
    id: "hadith_2",
    reference: "Sahih Muslim 223",
    english: "The Prophet (ﷺ) said: 'Purity (cleanliness) is half of faith.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'پاکیزگی اور صفائی نصف ایمان ہے۔'"
  },
  {
    id: "hadith_3",
    reference: "Sahih al-Bukhari 10",
    english: "The Prophet (ﷺ) said: 'A Muslim is the one from whose tongue and hand other Muslims are safe.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔'"
  },
  {
    id: "hadith_4",
    reference: "Sahih al-Bukhari 6412",
    english: "The Prophet (ﷺ) said: 'There are two blessings which many people lose: health and free time.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'دو نعمتیں ایسی ہیں جن کے بارے میں بہت سے لوگ خسارے میں ہیں: صحت اور فراغت۔'"
  },
  {
    id: "hadith_5",
    reference: "Sahih Muslim 2564",
    english: "The Prophet (ﷺ) said: 'Allah does not look at your appearances or your wealth, but He looks at your hearts and your deeds.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'بے شک اللہ تمہاری صورتوں اور تمہارے مال کو نہیں دیکھتا، بلکہ وہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔'"
  },
  {
    id: "hadith_6",
    reference: "Riyad as-Salihin 1415",
    english: "The Prophet (ﷺ) said: 'He who sends one blessing upon me, Allah will send ten blessings upon him.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'جو مجھ پر ایک مرتبہ درود بھیجے گا، اللہ تعالیٰ اس پر دس رحمتیں نازل فرمائے گا۔'"
  },
  {
    id: "hadith_7",
    reference: "Sunan Ibn Majah 224",
    english: "The Prophet (ﷺ) said: 'Seeking knowledge is a duty upon every Muslim.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'علم حاصل کرنا ہر مسلمان پر فرض ہے۔'"
  },
  {
    id: "hadith_8",
    reference: "Sahih al-Bukhari 6407",
    english: "The Prophet (ﷺ) said: 'Commandments for invoking: “Verily, the likeness of one who remembers his Lord and one who does not is like the living and the dead.”'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'اپنے رب کا ذکر کرنے والے اور نہ کرنے والے کی مثال زندہ اور مردہ جیسی ہے۔'"
  },
  {
    id: "hadith_9",
    reference: "Sahih al-Bukhari 1",
    english: "The Prophet (ﷺ) said: 'Actions are judged by motives (intentions), and each person will be rewarded according to what they intended.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی ہے۔'"
  },
  {
    id: "hadith_10",
    reference: "Sunan At-Tirmidhi 2516",
    english: "The Prophet (ﷺ) said: 'Be mindful of Allah and Allah will protect you. Be mindful of Allah and you will find Him in front of you.'",
    urdu: "نبی کریم صلی اللہ علیہ وسلم نے فرمایا: 'تم اللہ کے احکام کی حفاظت کرو، اللہ تمہاری حفاظت کرے گا۔ تم اللہ کو یاد رکھو، تم اسے اپنے سامنے پاؤ گے۔'"
  }
];

export function getDailyAyah(seedOffset: number = 0): AyahItem {
  const dayOfYear = Math.floor((Date.now() + seedOffset) / 86400000);
  const idx = dayOfYear % QURANIC_AYAS.length;
  return QURANIC_AYAS[idx];
}

export function getDailyHadith(seedOffset: number = 0): HadithItem {
  const dayOfYear = Math.floor((Date.now() + seedOffset) / 86400000);
  const idx = dayOfYear % PROPHETIC_HADITHS.length;
  return PROPHETIC_HADITHS[idx];
}
