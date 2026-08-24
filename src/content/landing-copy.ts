/**
 * All marketing copy for the redesigned landing page, kept separate from the app's
 * shared Dictionary so this page's content can evolve independently of the
 * dashboard/portal translation set.
 */

export interface LandingCopy {
  nav: { doctors: string; features: string; how: string; stories: string; faq: string; contact: string };
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    line3: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badgeAvailable: string;
    badgeVerified: string;
  };
  trust: { label: string; stat1: string; stat2: string; stat3: string; stat4: string };
  problem: {
    eyebrow: string;
    title: string;
    body: string;
    points: { title: string; desc: string }[];
  };
  concept: {
    eyebrow: string;
    title: string;
    body: string;
    points: { title: string; desc: string }[];
    cta: string;
  };
  features: { eyebrow: string; title: string; subtitle: string; items: { title: string; desc: string }[] };
  showcase: { eyebrow: string; title: string; body: string; cta: string; specialtiesLabel: string };
  how: { eyebrow: string; title: string; subtitle: string; steps: { title: string; desc: string }[] };
  visualBreak: { title1: string; title2: string; subtitle: string };
  benefits: { eyebrow: string; title: string; body: string };
  testimonials: { eyebrow: string; title: string; empty: string; verifiedPatient: string; reviewFor: string };
  finalCta: { eyebrow: string; title: string; subtitle: string; cta: string };
  footer: { tagline: string; quickLinks: string; contact: string; rights: (year: number) => string; staffLogin: string };
}

export const landingCopy: { en: LandingCopy; ar: LandingCopy } = {
  en: {
    nav: { doctors: 'Doctors', features: 'Why us', how: 'How it works', stories: 'Stories', faq: 'FAQ', contact: 'Contact' },
    hero: {
      eyebrow: 'Now booking online',
      line1: 'Healthcare,',
      line2: 'finally on',
      line3: 'your time.',
      subtitle:
        'Skip the phone queue. See real availability, pick a licensed doctor, and confirm your visit in under a minute.',
      ctaPrimary: 'Book an appointment',
      ctaSecondary: 'Meet our doctors',
      badgeAvailable: 'Next slot',
      badgeVerified: 'Verified clinic',
    },
    trust: {
      label: 'Trusted by patients across every specialty we offer',
      stat1: 'Average rating',
      stat2: 'Specialist doctors',
      stat3: 'Patients cared for',
      stat4: 'Years in practice',
    },
    problem: {
      eyebrow: 'The old way',
      title: 'Booking a doctor shouldn’t feel like a second job.',
      body: 'Busy signals. Being put on hold. Turning up to find your doctor is running two hours late. Traditional clinics were built around the clinic’s schedule — not yours.',
      points: [
        { title: 'Phone-tag booking', desc: 'Calling during work hours, hoping someone picks up before the line closes.' },
        { title: 'No real visibility', desc: 'You never actually see what’s free — you just take whatever slot you’re given.' },
        { title: 'Paper trails', desc: 'Your history lives in a folder somewhere, not with you when you need it.' },
      ],
    },
    concept: {
      eyebrow: 'Our approach',
      title: 'One clinic, fully online — without losing the personal touch.',
      body: 'We rebuilt the visit from the ground up: real-time schedules, verified doctors with real patient ratings, and a record of every visit that’s always yours to see.',
      points: [
        { title: 'Live availability', desc: 'What you see on screen is exactly what’s open — no double-booking, no guesswork.' },
        { title: 'Verified & rated', desc: 'Every doctor on this page is licensed and reviewed by patients who actually visited.' },
        { title: 'Records that follow you', desc: 'Visit notes, prescriptions and documents, always a login away.' },
      ],
      cta: 'See how it works',
    },
    features: {
      eyebrow: 'Built for patients',
      title: 'Everything a modern visit needs.',
      subtitle: 'Scroll to explore — each one solves a specific piece of the old, clunky booking experience.',
      items: [
        { title: 'Real-time booking', desc: 'Live calendars per doctor, no phone calls, no waiting for a callback.' },
        { title: 'Verified doctors', desc: 'Licensed specialists with transparent, patient-written reviews.' },
        { title: 'Digital records', desc: 'Every visit, prescription and document kept securely in one place.' },
        { title: 'Smart reminders', desc: 'Email and SMS nudges so you never miss a confirmed slot.' },
        { title: 'Private by design', desc: 'Your medical history is encrypted and visible only to you and your doctor.' },
        { title: 'Multi-specialty care', desc: 'From general consultations to pediatrics, all under one roof.' },
      ],
    },
    showcase: {
      eyebrow: 'The doctors',
      title: 'Pick a specialist, see real availability, book in seconds.',
      body: 'This is the actual booking screen our patients use — no mockup. Every rating below comes from a completed visit.',
      cta: 'Book now',
      specialtiesLabel: 'Specialties available',
    },
    how: {
      eyebrow: 'The journey',
      title: 'From search to confirmed visit.',
      subtitle: 'Four steps, no phone calls.',
      steps: [
        { title: 'Find your doctor', desc: 'Filter by specialty, read real reviews, compare consultation prices.' },
        { title: 'Pick a real slot', desc: 'See the doctor’s actual live calendar and choose what works for you.' },
        { title: 'Instant confirmation', desc: 'Get confirmed immediately by email and SMS — no waiting to hear back.' },
        { title: 'Your visit, on record', desc: 'Notes, prescriptions and documents land straight in your patient portal.' },
      ],
    },
    visualBreak: {
      title1: 'Care that moves',
      title2: 'at your pace.',
      subtitle: 'No queues. No guesswork. Just the next available doctor, whenever you need one.',
    },
    benefits: {
      eyebrow: 'The results',
      title: 'What changes when booking actually works.',
      body: 'Patients spend less time chasing appointments and more time being seen — and our doctors spend less time on the phone and more time practicing medicine.',
    },
    testimonials: {
      eyebrow: 'Patient voices',
      title: 'Real visits. Real feedback.',
      empty: 'Be the first to share your experience after your next visit.',
      verifiedPatient: 'Verified patient',
      reviewFor: 'Review for',
    },
    finalCta: {
      eyebrow: 'Ready when you are',
      title: 'Your next appointment is a minute away.',
      subtitle: 'No account required to browse. Just pick a doctor and go.',
      cta: 'Book your visit',
    },
    footer: {
      tagline: 'Modern healthcare, made simple.',
      quickLinks: 'Quick links',
      contact: 'Contact',
      rights: (year) => `© ${year} All rights reserved.`,
      staffLogin: 'Staff login',
    },
  },
  ar: {
    nav: { doctors: 'الأطباء', features: 'لماذا نحن', how: 'كيف تعمل', stories: 'الآراء', faq: 'الأسئلة', contact: 'تواصل' },
    hero: {
      eyebrow: 'الحجز الإلكتروني متاح الآن',
      line1: 'رعاية صحية،',
      line2: 'أخيرًا حسب',
      line3: 'وقتك أنت.',
      subtitle: 'بدون انتظار على الهاتف. شاهد المواعيد المتاحة فعليًا، اختر طبيبًا مرخّصًا، وأكّد زيارتك في أقل من دقيقة.',
      ctaPrimary: 'احجز موعدًا',
      ctaSecondary: 'تعرّف على أطبائنا',
      badgeAvailable: 'أقرب موعد',
      badgeVerified: 'عيادة موثّقة',
    },
    trust: {
      label: 'موثوق به من المرضى في كل تخصص نقدّمه',
      stat1: 'متوسط التقييم',
      stat2: 'طبيب متخصص',
      stat3: 'مريض تمت رعايته',
      stat4: 'سنوات من الخدمة',
    },
    problem: {
      eyebrow: 'الطريقة القديمة',
      title: 'حجز موعد طبيب لا يجب أن يكون مهمة إضافية.',
      body: 'خطوط مشغولة. الانتظار على الهاتف. الوصول لتجد أن طبيبك متأخر ساعتين. العيادات التقليدية بُنيت حول جدول العيادة — لا جدولك أنت.',
      points: [
        { title: 'حجز عبر الهاتف', desc: 'الاتصال أثناء ساعات العمل على أمل أن يرد أحد قبل إغلاق الخط.' },
        { title: 'لا رؤية حقيقية', desc: 'لا ترى فعليًا ما هو متاح — فقط تأخذ أي موعد يُعطى لك.' },
        { title: 'سجلات ورقية', desc: 'سجلك الطبي في ملف بمكان ما، وليس معك عند الحاجة إليه.' },
      ],
    },
    concept: {
      eyebrow: 'نهجنا',
      title: 'عيادة واحدة، إلكترونية بالكامل — دون فقدان اللمسة الشخصية.',
      body: 'أعدنا بناء تجربة الزيارة من الصفر: جداول فعلية في الوقت الحقيقي، أطباء موثّقون بتقييمات حقيقية من المرضى، وسجل لكل زيارة يبقى في متناولك دائمًا.',
      points: [
        { title: 'مواعيد حقيقية فعلية', desc: 'ما تراه على الشاشة هو بالضبط ما هو متاح — بدون تعارض حجوزات أو تخمين.' },
        { title: 'موثّقون ومُقيَّمون', desc: 'كل طبيب هنا مرخّص ومُقيَّم من مرضى زاروه فعليًا.' },
        { title: 'سجلات تلازمك', desc: 'ملاحظات الزيارة والوصفات والمستندات، على بُعد تسجيل دخول واحد فقط.' },
      ],
      cta: 'شاهد كيف تعمل',
    },
    features: {
      eyebrow: 'مصمم من أجل المرضى',
      title: 'كل ما تحتاجه زيارة عصرية.',
      subtitle: 'مرّر لاستكشاف كل ميزة — كل واحدة تحل جزءًا محددًا من تجربة الحجز القديمة المرهقة.',
      items: [
        { title: 'حجز فوري وفعلي', desc: 'جداول حية لكل طبيب، بدون مكالمات هاتفية أو انتظار رد.' },
        { title: 'أطباء موثّقون', desc: 'متخصصون مرخّصون بتقييمات شفافة مكتوبة من المرضى.' },
        { title: 'سجلات رقمية', desc: 'كل زيارة ووصفة ومستند محفوظ بأمان في مكان واحد.' },
        { title: 'تذكيرات ذكية', desc: 'تنبيهات بالبريد والرسائل النصية حتى لا تفوّت موعدًا مؤكدًا.' },
        { title: 'خصوصية بالتصميم', desc: 'سجلك الطبي مشفّر ومرئي فقط لك ولطبيبك.' },
        { title: 'رعاية متعددة التخصصات', desc: 'من الاستشارات العامة إلى طب الأطفال، تحت سقف واحد.' },
      ],
    },
    showcase: {
      eyebrow: 'الأطباء',
      title: 'اختر متخصصًا، شاهد المواعيد الفعلية، احجز في ثوانٍ.',
      body: 'هذه هي شاشة الحجز الفعلية التي يستخدمها مرضانا — وليست نموذجًا. كل تقييم أدناه من زيارة مكتملة فعليًا.',
      cta: 'احجز الآن',
      specialtiesLabel: 'التخصصات المتاحة',
    },
    how: {
      eyebrow: 'الرحلة',
      title: 'من البحث إلى الزيارة المؤكدة.',
      subtitle: 'أربع خطوات، بدون أي مكالمة هاتفية.',
      steps: [
        { title: 'اعثر على طبيبك', desc: 'صفّي حسب التخصص، اقرأ تقييمات حقيقية، قارن أسعار الاستشارة.' },
        { title: 'اختر موعدًا فعليًا', desc: 'شاهد الجدول الفعلي الحي للطبيب واختر ما يناسبك.' },
        { title: 'تأكيد فوري', desc: 'تصلك رسالة تأكيد فورية بالبريد والرسائل النصية — بدون انتظار رد.' },
        { title: 'زيارتك، مُسجّلة', desc: 'الملاحظات والوصفات والمستندات تصل مباشرة إلى بوابة المريض الخاصة بك.' },
      ],
    },
    visualBreak: {
      title1: 'رعاية تتحرك',
      title2: 'بوتيرتك أنت.',
      subtitle: 'بدون طوابير. بدون تخمين. فقط أقرب طبيب متاح، وقتما احتجت إليه.',
    },
    benefits: {
      eyebrow: 'النتائج',
      title: 'ما الذي يتغيّر عندما ينجح الحجز فعليًا.',
      body: 'يقضي المرضى وقتًا أقل في ملاحقة المواعيد ووقتًا أطول في تلقي الرعاية — ويقضي أطباؤنا وقتًا أقل على الهاتف ووقتًا أطول في ممارسة الطب.',
    },
    testimonials: {
      eyebrow: 'آراء المرضى',
      title: 'زيارات حقيقية. آراء حقيقية.',
      empty: 'كن أول من يشارك تجربته بعد زيارتك القادمة.',
      verifiedPatient: 'مريض موثّق',
      reviewFor: 'تقييم لـ',
    },
    finalCta: {
      eyebrow: 'جاهزون متى كنت جاهزًا',
      title: 'موعدك القادم على بُعد دقيقة واحدة.',
      subtitle: 'لا حاجة لحساب لتصفح الأطباء. فقط اختر طبيبًا وابدأ.',
      cta: 'احجز زيارتك',
    },
    footer: {
      tagline: 'رعاية صحية عصرية، بكل بساطة.',
      quickLinks: 'روابط سريعة',
      contact: 'تواصل معنا',
      rights: (year) => `© ${year} جميع الحقوق محفوظة.`,
      staffLogin: 'دخول الموظفين',
    },
  },
};
