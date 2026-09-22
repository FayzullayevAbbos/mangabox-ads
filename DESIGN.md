---
name: Volar
description: O'zbekiston developerlari uchun monetizatsiya va billing platformasi
colors:
  primary: "#793aaf"
  primary-foreground: "#f7f2fe"
  background: "#fcfcfd"
  foreground: "#1a1a1c"
  card: "#fcfcfd"
  card-foreground: "#1a1a1c"
  muted: "#f6f6f8"
  muted-foreground: "#6e6e77"
  accent: "#f6f6f8"
  accent-foreground: "#28282c"
  destructive: "#d93838"
  border: "#ebebef"
  input: "#ebebef"
  ring: "#a1a1aa"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components: []
---

# Design System: Volar

## Overview

**Creative North Star: "Ishonchli Raqamli Poydevor"**

Volar interfeysi Stripe va Vercel kabi dunyo standartidagi mahsulotlar darajasida qurilgan, lekin O'zbekiston bozori kontekstida. Dizayn pul oqimlari bilan ishlaydigan developer uchun mo'ljallangan — har bir piksel ishonch va aniqlik uyg'otishi kerak.

Tizim toza, havodor, dekorativ elementlardan xoli. Bezash emas, funksiya va ma'lumot birinchi o'rinda. Binafsha primary rang ishonch va professionallik ramzi sifatida — haddan tashqari yorqin emas, balki o'ziga ishongan va bosiq. Neytrallar sovuq kulrang emas, balki biroz binafsha tusli — issiqroq va insoniyroq.

Bu dizayn tizimi ochiqdan-ochiq rad etadi: an'anaviy O'zbek bank ilovalarining eskirgan, og'ir interfeyslarini; kripto dashboard'larning neon va qora fonlarini; generik SaaS shablonlarning bir xil formatdagi UI'larini; foydalanuvchini chalkashtiradigan xunuk UX qarorlarini.

**Key Characteristics:**
- Havodor zichlik: elementlar nafas oladi, ma'lumot zichligi o'rtacha
- Ma'lumot markazida: sonlar, jadvallar, holatlar — aniq va darhol tushunarli
- Bezaksiz: hech qanday gradient matn, shisha effekti, yoki keraksiz bezaklar
- Binafsha primary: bitta ishonchli aksent, 5-10% sirt maydonida
- O'zbek tili birinchi: shriftlar lotin va kirill alifbosida yaxshi o'qiladi

## Colors

Binafsha-biyaz neytral palitrasi. Primary binafsha ishonch va professionallik ramzi; neytrallar biroz binafsha tusli bo'lib, sovuq kulrangdan ko'ra insoniyroq va issiqroq.

### Primary
- **Ishonchli Binafsha** (`oklch(0.491 0.27 292.581)` / `#793aaf`): Tugmalar, faol holatlar, tanlangan elementlar, havolalar. Yagona aksent rangi — kam, lekin aniq ishlatiladi.

### Neutral
- **Sutli Oq** (`oklch(0.985 0.004 290)` / `#fcfcfd`): Asosiy fon — sahifa va karta sirtlari.
- **Soya Matni** (`oklch(0.18 0.004 290)` / `#1a1a1c`): Asosiy matn rangi. Qora emas, biroz binafsha tusli.
- **Yumshoq Fon** (`oklch(0.965 0.004 290)` / `#f6f6f8`): Ikkilamchi sirtlar — sidebar, muted kartalar, ajratilgan qatorlar.
- **O'chgan Matn** (`oklch(0.57 0.01 290)` / `#6e6e77`): Ikkinchi darajali matn, yordamchi izohlar, placeholder'lar.
- **Ingichka Chiziq** (`oklch(0.91 0.005 290)` / `#ebebef`): Chegara chiziqlari, ajratgichlar, input ramkalari.
- **Fokus Halqasi** (`oklch(0.72 0.01 290)` / `#a1a1aa`): Fokus va loading holatlari uchun halqa.

### Destructive
- **Xatolik Qizili** (`oklch(0.577 0.245 27.325)` / `#d93838`): O'chirish tugmalari, xatolik xabarlari, bloklangan holatlar.

### Named Rules
**Yagona Aksent Qoidasi.** Binafsha primary rang har qanday ekranda sirt maydonining 10% dan ko'p bo'lmagan qismida ishlatiladi. Uning kuchi kam ishlatilishida.

**Tusli Neytrallar Qoidasi.** Neytrallar hech qachon sof kulrang (`oklch(l 0 0)`) bo'lmasligi kerak. Har bir neytral binafsha tus oladi (chroma 0.004–0.01) — bu sovuq va jonsiz ko'rinishdan saqlaydi. Faqat `ring` va input border'lari chromasiz bo'lishi mumkin.

**Oq emas, Qora emas Qoidasi.** Fon `oklch(1 0 0)` emas; matn `oklch(0 0 0)` emas. Eng yorug' fon ham 0.004 chroma oladi, eng qora matn ham 0.18 lightness'dan pastga tushmaydi.

## Typography

**Display Font:** Outfit (sans-serif, geometrik, biroz yumaloq)
**Body Font:** Geist (sans-serif, toza, Vercel tomonidan ishlab chiqilgan)
**Mono Font:** Geist Mono (kod, sonlar, tranzaksiya ID'lari uchun)

**Character:** Outfit yumshoq va do'stona bosh sarlavhalar uchun; Geist professional va o'qiluvchan asosiy matn uchun. Ikkisi ham lotin va kirill alifbosida yaxshi ishlaydi — O'zbek va Rus tillari uchun mos. Juftlik zamonaviy, lekin agressiv emas.

### Hierarchy
- **Display** (600, `clamp(1.75rem, 4vw, 2.5rem)`, 1.15): Dashboard sarlavhalari, sahifa boshi. Faqat bitta ekranda bitta display.
- **Title** (600, `1.25rem`, 1.3): Seksiya sarlavhalari, karta sarlavhalari, modal boshlari.
- **Body** (400, `0.9375rem`, 1.6): Asosiy matn, forma label'lari, jadval kataklari. Maksimal qator uzunligi 70ch.
- **Label** (500, `0.8125rem`, 1.4, letter-spacing: 0.01em): Kichik sarlavhalar, forma yordamchi matnlari, chip'lar, status ko'rsatkichlari.
- **Mono** (400, `0.875rem`, 1.5): Kod bloklari, tranzaksiya ID'lari, API kalitlari, sonli ma'lumotlar.

### Named Rules
**1.25 Qadam Qoidasi.** Har bir tipografiya qadami orasida kamida 1.25:1 shrift o'lchami nisbati bo'lishi kerak. Masalan, body 15px bo'lsa, title kamida 19px. Bir xil o'lchamdagi shriftlar iyerarxiya yaratmaydi.

## Elevation

Volar tekis dizayn falsafasiga amal qiladi. Soyali kartochkalar va qatlamli interfeyslar o'rniga, chuqurlik rang kontrasti va chegaralar orqali ko'rsatiladi. Bu Stripe Dashboard uslubiga mos — interfeys "qog'oz" emas, "ma'lumot" kabi his qilinadi.

Soyalar faqat ikkita holatda ishlatiladi: popover/dropdown komponentlari (ular sirt ustida suzishi kerak) va hover holatidagi kartochkalar (nozik ko'tarilish). Asosiy sirtlar — sidebar, kontent maydoni, jadvallar — har doim tekis.

### Shadow Vocabulary
- **Dropdown Soyasi** (`0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)`): Popover, dropdown menyu, select variantlari.
- **Hover Ko'tarilishi** (`0 2px 8px rgba(0,0,0,0.06)`): Faqat interaktiv kartochkalarda hover holatida.

### Named Rules
**Tekis-Sukutda Qoidasi.** Barcha sirtlar sukut bo'yicha tekis. Soyalar faqat suzuvchi elementlarga (popover, dropdown) yoki hover kabi holat javoblariga beriladi. Statik kontent hech qachon soyaga ega bo'lmasligi kerak.

## Components

Volar shadcn/ui komponentlar kutubxonasiga asoslangan (`radix-vega` uslubi, `neutral` asos rang). Barcha komponentlar shadcn CLI orqali qo'shiladi va loyiha token'lari bilan ishlaydi.

### Tugmalar (Buttons)
- **Shakl:** Barcha tugmalar `0.625rem` radius — yumshoq, lekin dumaloq emas. Tabletka shaklidagi tugmalar yo'q.
- **Primary:** `bg-primary text-primary-foreground`; hover'da lightness 8% qorayadi. Padding: `0.5rem 1rem` (default), `0.625rem 1.25rem` (lg).
- **Secondary:** `bg-secondary text-secondary-foreground`; hover'da `bg-muted`. Asosiy harakat emas, qo'shimcha variantlar uchun.
- **Ghost:** Fon yo'q, faqat hover'da `bg-accent`. Toolbar va inline harakatlar uchun.
- **Destructive:** `bg-destructive text-primary-foreground`. O'chirish va qaytarib bo'lmas harakatlar uchun.
- **Fokus:** `ring-2 ring-ring ring-offset-2` — har doim ko'rinadigan fokus halqasi.

### Input'lar (Form Fields)
- **Shakl:** `0.625rem` radius, `border-input` chegarasi, `bg-background` foni.
- **Fokus:** `ring-2 ring-ring border-primary` — chegara rangi primary ga o'tadi, tashqi halqa qo'shiladi.
- **Xatolik:** `border-destructive` — chegara qizil rangga o'tadi, ostida xatolik matni.
- **Disabled:** `opacity-50 cursor-not-allowed`. O'chirilgan input'lar orqali ko'rinadigan, lekin interaktiv emas.
- **Placeholder:** `text-muted-foreground`, body shriftida.

### Kartochkalar (Cards)
- **Shakl:** `0.625rem` radius, `border-border` chegarasi, `bg-card` foni.
- **Padding:** `1.5rem` (barcha tomon). Karta ichidagi seksiyalar `border-t` bilan ajratiladi.
- **Soya:** Yo'q (Tekis-Sukutda Qoidasi). Interaktiv kartochkalarda hover holatida nozik ko'tarilish (`0 2px 8px rgba(0,0,0,0.06)`).
- **Sarlavha:** Karta ichida `Title` shriftida sarlavha, pastida `Label` shriftida tavsif.

### Chip'lar / Status Ko'rsatkichlari
- **Shakl:** `0.375rem` radius (sm), ichki padding `0.125rem 0.625rem`.
- **Default:** `bg-muted text-muted-foreground`.
- **Faol/Muvaffaqiyatli:** `bg-primary/10 text-primary` — binafsha fon, binafsha matn.
- **Xatolik/Bekor qilingan:** `bg-destructive/10 text-destructive`.
- **Shrift:** Label shrifti (500, 0.8125rem, 0.01em letter-spacing).

### Navigatsiya (Sidebar)
- **Fon:** `bg-background`, o'ng tomonda `border-r` ajratgich.
- **Aktiv holat:** `bg-muted text-primary` — yumshoq fon + primary matn.
- **Hover:** `bg-accent` — aktiv bo'lmagan elementlar uchun.
- **Shrift:** Body shrifti, 500 weight aktiv holatda.
- **Collapsed:** Faqat ikonkalar, kengaytirilganda matn ko'rinadi.

## Do's and Don'ts

### Do:
- **Do** bitta ekranda primary binafsha rangni 10% dan kam sirt maydonida ishlating — aksent kuchi uning kam ishlatilishida.
- **Do** neytrallarni binafsha tuslang (chroma 0.004–0.01). Sof kulrang (`oklch(l 0 0)`) sovuq va jonsiz.
- **Do** ma'lumotlarni aniq iyerarxiya bilan ko'rsating: sarlavha → asosiy son → yordamchi matn. Har bir ekranda bitta asosiy ma'lumot nuqtasi.
- **Do** interfeys O'zbek tilida bo'lganda shriftlar lotin va kirill alifbosida yaxshi o'qilishini tekshiring.
- **Do** komponentlar orasidagi masofani o'zgartiring — bir xil padding hamma joyda monotonlik yaratadi.
- **Do** barcha interaktiv elementlarda ko'rinadigan fokus halqasi (`ring-2 ring-ring`) bo'lishini ta'minlang.
- **Do** sonli ma'lumotlar (tranzaksiya summasi, ID, vaqt) uchun mono shrift ishlating — bu aniqlik va ishonch uyg'otadi.

### Don't:
- **Don't** an'anaviy O'zbek bank ilovalariga o'xshamang — eskirgan, og'ir, ortiqcha formalar va bosqichli jarayonlardan qoching.
- **Don't** kripto dashboard uslubidagi neon ranglar, qora fon yoki haddan tashqari "texnik" estetikadan foydalanmang.
- **Don't** generik SaaS shablonlaridagi bir xil kartochka grid'lari, hero-metrika shablonlari yoki gradient matnlardan foydalanmang.
- **Don't** xunuk UX qarorlarini qabul qilmang — foydalanuvchini chalkashtiradigan, noto'g'ri bosishga undaydigan yoki keraksiz qadamlar qo'shadigan interfeyslardan qoching.
- **Don't** modal oynalarni birinchi javob sifatida ishlatmang. Avval inline kengaytirish, sheet, yoki sahifa ichidagi yechimlarni ko'rib chiqing.
- **Don't** karta ichida karta ishlatmang — bu har doim noto'g'ri.
- **Don't** `border-left` yoki `border-right` ni 1px dan qalin aksent chiziq sifatida ishlatmang. Bu hech qachon yaxshi ko'rinmaydi.
- **Don't** gradient matn (`background-clip: text`) ishlatmang. Bezash, hech qachon mazmunli emas.
- **Don't** bir xil o'lchamdagi kartochkalarni ketma-ket takrorlamang — bu monoton va AI tomonidan yaratilganga o'xshaydi.
