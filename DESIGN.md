---
name: MangaBox Ads
description: MangaBox ilovasida reklama sotib oladigan brendlar uchun kabinet
colors:
  primary: "#7c6cf0"
  primary-foreground: "#ffffff"
  canvas: "oklch(0.964 0.005 286)"
  card: "oklch(1 0 0)"
  field: "oklch(0.977 0.004 286)"
  foreground: "oklch(0.145 0 0)"
  muted: "oklch(0.969 0.004 286)"
  muted-foreground: "oklch(0.556 0.008 286)"
  border: "oklch(0.919 0.005 286)"
  ring: "oklch(0.708 0.008 286)"
  secondary: "#EAEDF0"
  active: "#0162FF"
  success: "oklch(0.6 0.15 160)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontFeature: "tabular-nums"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 0.625rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.625rem"
    height: "2.25rem"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  panel-header:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.title}"
    padding: "0.75rem 1.25rem"
  table-head:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    height: "2.75rem"
    padding: "0 0.5rem"
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.label}"
---

# Design System: MangaBox Ads

## Overview

**Creative North Star: "Reklama joyi ko'rinib turadi"**

MangaBox Ads — brend pul sarflashdan oldin **nimani sotib olayotganini ko'radigan** kabinet. Bu bitta gap butun tizimni tutib turadi: narxnomada slot nomi emas, ilovaning qaysi ekranida reklama turishi chiziladi; kampaniya sahifasida raqam emas, o'sha raqam nimadan kelib chiqqani ko'rsatiladi; kreativ ro'yxatda matn emas, kreativning o'zi rasmi va tugmasi bilan chiziladi. Interfeys mijozga ishonch berish uchun emas, unga **ko'rsatish** uchun ishlaydi.

Shu sababli tizim tinch va zich emas. Kulrang canvas ustida oq panellar suzadi, har bir panel bitta savolga javob beradi, panellar orasida havo bor. Bitta binafsha aksent — u tanlovni, faol holatni va harakatni bildiradi, boshqa hech narsani. Sonlar mono shriftda va tabular, chunki ular taqqoslanadi: bir slot ikkinchisidan qimmat, bir kamera boshqasidan ko'proq odam taniydi.

Bu tizim ochiqdan-ochiq rad etadi: an'anaviy O'zbek reklama agentliklarining prays-list PDF'larini; kripto va ads-tech dashboardlarining neon, qora fon va grafik devorini; CRM'larning bo'sh jadvallarini, ya'ni foydalanuvchini raqamlar bilan yolg'iz qoldiradigan ekranlarni; va generik SaaS shablonlarining bir xil kartochka grid'larini.

**Key Characteristics:**
- Ko'rsatish, aytish emas: joy, format va natija chiziladi
- Kulrang canvas → oq panel → botiq input: uchta sirt, uchtasi ham aniq
- Yagona binafsha aksent, ekranning 10% dan kam qismida
- Sonlar mono va tabular; jami summa har doim eng katta element
- Yorug' va qorong'i — ikkalasi teng huquqli, biri ikkinchisining ko'chirmasi emas
- O'zbek tili birinchi; shrift lotin va kirillda teng o'qiladi

## Colors

Binafsha-kulrang palitra. Neytrallar hech qachon sof kulrang emas — hammasida 286° tusdan ozgina bor, shuning uchun ular binafsha aksent bilan bitta oilada turadi.

### Primary
- **Yumshoq Binafsha** (`#7c6cf0`): tugmalar, tanlangan karta chegarasi, slider, progress, jonli ko'rsatkich. Qorong'ida yorug'roq lavanda (`oklch(0.76 0.14 285)`) — qora fonda bir xil quvvat beradi.

### Secondary
- **Sovuq Kulrang** (`#EAEDF0`): ikkilamchi tugmalar. Kamdan-kam ishlatiladi; ko'p hollarda `outline` yoki `ghost` afzal.
- **Tanlov Ko'ki** (`#0162FF`): faol tab chizig'i va checkbox. **Diqqat:** qorong'i rejimda bu token binafshaga aylanadi, ya'ni «tanlangan» rangi mavzu bilan tusini o'zgartiradi. Bu qasddan emas — yangi joyda ishlatishdan oldin `--active` ni primary bilan birlashtirish kerak.

### Neutral
- **Sahifa Kulrangi** (`canvas`): dashboard fonining o'zi. Panel emas, hech qachon matn ostida turmaydi.
- **Oq Panel** (`card`): mazmun turadigan yagona sirt. Yorug'da sof oq, qorong'ida fondan **yorug'roq** (`oklch(0.268 0.017 278)`).
- **Botiq Maydon** (`field`): input va textarea foni. Panelda u pastga botadi, canvasda esa deyarli bilinmaydi — shuning uchun input har doim panel ichida turishi kerak.
- **Asosiy Matn** (`foreground`): qora emas, `oklch(0.145)`.
- **O'chgan Matn** (`muted-foreground`): yorliqlar, izohlar, jadval sarlavhasi.
- **Ingichka Chiziq** (`border`): panel chegarasi, ajratgich, jadval qatorlari orasi.

### Status
- **Muvaffaqiyat** (`success`): efirdagi kampaniya nuqtasi, chegirma summasi.
- **Xatolik** (`destructive`): rad etilgan holat, eng kam buyurtma ogohlantirishi, o'chirish.
- Kampaniya holatlari o'z palitrasini yuritadi va u **token emas**, Tailwind rangi: `amber` — tekshiruvda (e'tibor talab qiladigan yagona holat), `blue` — tasdiqlangan va rejalashtirilgan, `emerald` — efirda, `muted` — qoralama, pauza, tugagan. Har biri `/10` fon va to'yingan matn bilan.

### Named Rules

**Uch Sirt Qoidasi.** `canvas` < `card` < `field` — sahifa, panel, input. Bu uchtasi yorug'da ham, qorong'ida ham bir xil tartibda turadi (qorong'ida `field` panelning ostiga botadi, `card` esa fondan ko'tariladi). Agar yangi element qaysi sirtda turishini ayta olmasangiz, u panelga tushmagan.

**Yagona Aksent Qoidasi.** Binafsha ekran sirtining 10% dan ko'p qismini egallamaydi. Uning kuchi kamligida: agar ekranda ikkita binafsha element bo'lsa, foydalanuvchi qaysi biri asosiy ekanini bilmaydi.

**Tusli Neytrallar Qoidasi.** Har bir neytral 286° dan 0.004–0.008 chroma oladi. Sof kulrang (`oklch(l 0 0)`) ishlatilmaydi — u sovuq va binafsha aksent bilan begona ko'rinadi.

## Typography

**Sans (hamma joyda):** Outfit — sarlavha ham, matn ham. `--font-sans` va `--font-heading` bitta oilaga ishora qiladi.
**Mono:** Geist Mono — summa, ko'rsatish soni, ID, o'lcham, foiz.

**Character:** Outfit geometrik va biroz yumaloq — rasmiy emas, lekin jiddiy. Bitta oila sarlavhadan matngacha ishlatilgani uchun iyerarxiya **o'lcham va og'irlik** bilan quriladi, shrift almashtirish bilan emas. Geist Mono esa faqat raqam uchun: u yerda har bir belgi bir xil kenglikda turishi shart, chunki sonlar ustma-ust taqqoslanadi.

`Spectral` (`--font-serif`) yuklanadi, lekin hech qayerda ishlatilmaydi — yangi ekranda unga tayanmang.

### Hierarchy
- **Display** (600, `1.5rem` → `1.875rem` sm'dan, tracking-tight): sahifa sarlavhasi. Bitta ekranda bitta.
- **Headline** (600, `1rem`, tracking-tight): karta sarlavhasi, kampaniya nomi ro'yxatda.
- **Title** (600, `0.875rem`): panel sarlavhasi va jadval ustuni. Panel sarlavhasi ataylab kichik — u mazmunni bildiradi, u bilan raqobatlashmaydi.
- **Body** (400, `0.9375rem`, 1.6): asosiy matn, jadval katagi, forma yorlig'i.
- **Label** (400, `0.75rem`): ko'rsatkich yorlig'i, izoh, chip.
- **Mono** (400, `0.875rem`, tabular-nums): pul, ko'rsatish, ID, piksel o'lchami. Jami summa — `2rem`, 600, mono.

### Named Rules

**Raqam Mono Qoidasi.** Taqqoslanadigan har qanday son mono va `tabular-nums`. Aralash yozuvda ham: «kuniga **234 667** so'm» da raqam mono, matn sans. Proportsional shriftdagi ustma-ust sonlar qatorlari qalqiydi va bu ishonchni yo'qotadi.

**Bitta Oila Qoidasi.** Iyerarxiya o'lcham va og'irlik bilan yaratiladi. Yangi shrift oilasi qo'shish — tizimni buzish, o'lchamni o'zgartirish esa uni ishlatish.

## Layout

Ikki ustunli qobiq: chapda 17rem sidebar, o'ngda kontent. Kontent `max-w-[1500px]` bilan markazlashadi (sozlamalar kabi forma sahifalari `max-w-3xl`), sahifa paddingi `1rem → 1.5rem (sm) → 2.5rem (lg)`.

Sahifa ichida ritm ikki pog'onali: mustaqil bloklar orasida `2rem` (`space-y-8`), bitta blok ichidagi qismlar orasida `1.5rem` (`space-y-6`), grid kataklari orasida `1rem`. Panel ichki paddingi `1.25rem`, sarlavha qatori `0.75rem 1.25rem`.

Ikki ustunli ish ekranlari (narxnoma, kampaniya umumiy ko'rinishi) `minmax(0,1fr)` + qat'iy o'ng ustun (`21rem`–`22rem`) shaklida quriladi va o'ng ustun `lg:sticky lg:top-6` bo'ladi — natija, narx yoki xulosa foydalanuvchi bilan birga suriladi.

Breakpointlar Tailwind standarti: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Jadval `xl` dan pastda kartalar ro'yxatiga aylanadi, ikki ustun `lg` da birga tushadi, yon panel mazmundan keyin keladi.

### Named Rules

**Natija Ko'rinib Tursin Qoidasi.** Foydalanuvchi qiymat kiritadigan ekranda natija (narx, xulosa, jami) sticky ustunda turadi. Tor ekranda u mazmundan keyin tushadi va tanlov qilinganda o'sha yerga sekin suriladi — javobni qidirish foydalanuvchining ishi emas.

## Elevation & Depth

Tizim tekis. Chuqurlik soya bilan emas, **sirt rangi va chegara** bilan beriladi: oq panel kulrang canvas ustida turadi, ingichka chegara uning qirrasini chizadi, botiq input panelning ichiga kiradi. Qorong'ida xuddi shu uchlik lightness bilan takrorlanadi.

Soya faqat uch holatda: suzuvchi element (popover, dropdown, sheet), forma boshqaruvining nozik qirrasi (`shadow-xs`), va interaktiv kartaning hover javobi. `ring-1 ring-foreground/10` — shadcn `Card` va popoverlarda soya o'rnini bosuvchi qirra chizig'i.

### Shadow Vocabulary
- **Suzuvchi Sirt** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — `shadow-md`): popover, dropdown, combobox. Sheet `shadow-lg` oladi.
- **Boshqaruv Qirrasi** (`shadow-xs`): input, `outline` tugma, tabs'ning faol trigger'i. Deyarli ko'rinmaydi, lekin elementni sirtdan ajratadi.
- **Hover Ko'tarilishi** (`0 2px 8px rgba(0,0,0,0.06)`): faqat bosiladigan kartada, faqat hover'da, faqat yorug' rejimda (qorong'ida `dark:hover:shadow-none`).

### Named Rules

**Tekis-Sukutda Qoidasi.** Statik sirt soyasiz. Soya — holat javobi (hover, focus) yoki suzuvchi element belgisi. Panel hech qachon soya olmaydi.

## Shapes

Yumshoq, lekin dumaloq emas. Asos `--radius: 0.625rem`, undan koeffitsiyent bilan chiqadi: `sm 0.375rem` (chip, kichik tugma), `md 0.5rem` (tugma, input, dropdown), `lg 0.625rem`, `xl 0.875rem` (panel, karta), `2xl 1.125rem`.

Chegara har doim 1px va `border` tokenida. Tabletka shaklidagi tugma yo'q — to'liq dumaloqlik faqat ikki joyda: status nuqtasi (`rounded-full`, 6–8px) va progress/slider yo'lagi.

Panel `overflow-hidden` bo'ladi, shuning uchun ichidagi jadval va ro'yxat uning burchagiga kesiladi — ichki elementga alohida radius berish shart emas va berilmasligi kerak.

### Named Rules

**Kartada Karta Yo'q Qoidasi.** Panel ichiga ikkinchi chegarali panel qo'yilmaydi. Ichki guruh kerak bo'lsa — `border-t` ajratgich yoki `bg-muted` fon, chegara emas.

## Components

### Tugmalar (Buttons)
- **Shakl:** `0.5rem` radius, balandlik `2.25rem` (`sm 2rem`, `lg 2.5rem`, `xs 1.5rem`), padding `0 0.625rem`, ikonka `1rem`.
- **Primary:** `bg-primary` + oq matn; hover'da `bg-primary/80`. Ekrandagi yagona asosiy harakat.
- **Outline:** oq fon + `border-border` + `shadow-xs`; hover'da `bg-muted`. Ikkinchi darajali harakatlar uchun asosiy tanlov.
- **Ghost:** **shaffof** fon, hover'da `bg-muted`. Toolbar va ikonka tugmalari. Oq panelda oq dog' qoldirmasligi uchun fon berilmaydi.
- **Destructive:** `bg-destructive/10` + qizil matn — to'la qizil emas, chunki o'chirish tugmasi ekranda eng baland ovoz bo'lmasligi kerak.
- **Bosilganda:** `active:translate-y-px` — barcha variantlarda, tugma haqiqatan bosilganday.
- **Focus:** `ring-3 ring-ring/50` + `border-ring`.

### Input'lar (Fields)
- **Shakl:** `0.5rem` radius, `border-input` chegarasi, `bg-field` foni, `shadow-xs`.
- **Focus:** `border-ring` + `ring-3 ring-ring/50`.
- **Xatolik:** `aria-invalid` → `border-destructive` + `ring-3 ring-destructive/20`, ostida `text-xs text-destructive` xabar. Xabar muammoni **va yechimni** aytadi: «Eng kam buyurtma 100 000 so'm. Ulushni yoki muddatni oshiring.»
- **Karetka va tanlov:** `caret-color: primary`, `::selection` — primary 35% aralashma. Bu global, har bir maydonda ishlaydi.

### Panel (asosiy konteyner)
`components/dashboard/ads/panel.tsx` — kabinetdagi har bir mazmun bloki shunda turadi.
- **Shakl:** `0.875rem` radius, `border-border`, `bg-card`, `overflow-hidden`.
- **Sarlavha:** ixtiyoriy; bo'lsa `0.75rem 1.25rem` padding va ostida `border-b`. O'ng tomonda amal tugmasi turishi mumkin.
- **Tana:** paddingni chaqiruvchi beradi (`bodyClassName`), chunki jadval panel qirrasiga tegib turishi, forma esa `1.25rem` olishi kerak.
- **Soya:** yo'q.

### Jadval (Table)
- **Sarlavha qatori:** `bg-muted/50` + `border-b`, balandlik `2.75rem`, `title` shriftida. Fon shuning uchun kerakki, oq panelda sarlavha va birinchi qator bir xil ko'rinib qolmasin.
- **Qator:** `border-b`, hover'da `bg-muted/50`, bosiladigan bo'lsa `cursor-pointer`.
- **Chekka ustunlar** panel ichida `pl-5` / `pr-5` oladi — panel paddingi bilan tekislanadi.
- **Mobil:** `xl` dan pastda jadval yashiriladi va o'rniga `divide-y` kartalar ro'yxati chiqadi. Gorizontal surilish — oxirgi chora.

### Chip va Status
- **Chip:** `bg-muted` + `muted-foreground`, `0.375rem` radius, `0.125rem 0.5rem` padding, `label` shriftida. Format, o'lcham, filtr uchun.
- **Status:** ikonka + matn, `bg-<rang>/10` + to'yingan matn, `rounded-full`. Rang holatni bildiradi (yuqoridagi Status palitrasiga qarang), qorong'ida matn yorug'roq tonga o'tadi.

### Tabs
- **`line` varianti** (kabinetda shu ishlatiladi): fon yo'q, faol element ostida 2px chiziq va to'yingan matn.
- **`default` varianti:** oq fon + chegara + `shadow-xs` segment.

### Navigatsiya (Sidebar)
- **Fon:** `sidebar` tokeni (canvasdan bir oz yorug'), o'ngda `border-r`.
- **Faol element:** `bg-sidebar-accent` + primary matn.
- **Sarlavha:** `font-heading` 1.25rem 600.
- **Pastda:** foydalanuvchi menyusi; mobilda sidebar sheet sifatida ochiladi.

### Slot ko'rinishi (signature)
`components/dashboard/ads/slot-preview.tsx` — reklama joyi ilovaning qaysi ekranida turishini ko'rsatadigan SVG telefon sxemasi. Tizimning North Star'i shu komponentda moddiylashgan.
- **Shakl:** `120×204` viewBox, `13.5px` radius ramka, tepada notch, ilova ekranlarida pastda tab-bar.
- **Rang:** ilova elementlari `muted-foreground` ning 10–25% i, reklama bloki esa **primary** — `fill-primary/15` + `stroke-primary/45`, tanlanganda `/30` va `/80`.
- **Nisbat:** reklama bloki haqiqiy kreativ nisbatini takrorlaydi (16:9, 2:3, karta).
- **Qoida:** rasm fayli yo'q, hamma narsa vektor va token — shuning uchun u istalgan o'lchamda va ikkala mavzuda ham aniq.

### Narx paneli (signature)
Narxnomadagi yopishib turuvchi ustun: tanlangan joy sxemasi va nomi → ikkita surgich → natija → harakat. Jami summa `2rem` mono, o'zgarganda **sanab yetib boradi** (420ms, `1-(1-t)³`, `prefers-reduced-motion` da darhol). Uning ostida har doim kunlik ulush turadi — katta summa shu qator bilan tushunarli bo'ladi.

## Do's and Don'ts

### Do:
- **Do** har bir mazmun blokini `Panel` ga soling. Canvasda yalang'och turgan jadval yoki forma — tugallanmagan ekran.
- **Do** input'ni panel ichida joylang: `field` foni faqat oq panelda botiq ko'rinadi.
- **Do** taqqoslanadigan sonlarni mono va `tabular-nums` bilan yozing, pul summasini esa `formatSomAmount` orqali o'tkazing.
- **Do** katta summani inson o'lchoviga aylantiring: jami yonida kunlik yoki birlik narxini bering.
- **Do** xato xabarida muammoni **va** chiqish yo'lini ayting.
- **Do** ikkala mavzuni ham tekshiring — `canvas`, `card`, `field` pog'onasi qorong'ida teskari lightness bilan quriladi va faqat token orqali to'g'ri ishlaydi.
- **Do** interaktiv elementga ko'rinadigan focus halqasi bering (`ring-3 ring-ring/50` yoki `ring-2 ring-ring`).
- **Do** harakat qo'shsangiz bittasini tanlang va uni ma'noga bog'lang (summaning sanab borishi kabi), keyin `prefers-reduced-motion` ni hurmat qiling.

### Don't:
- **Don't** `bg-card` ni boshqaruv foni sifatida ishlatmang (tugma, input, tab). U panel rangi; boshqaruv uchun `field`, `muted` yoki shaffof bor.
- **Don't** panel ichiga chegarali ikkinchi panel qo'ymang.
- **Don't** sof kulrang (`oklch(l 0 0)`) yoki Tailwind'ning `gray-*` shkalasini ishlatmang — status ranglaridan tashqari hamma neytral tokendan keladi.
- **Don't** bitta ekranda ikkita binafsha asosiy element qo'ymang.
- **Don't** yangi shrift oilasi qo'shmang; `Spectral` ham yuklangan bo'lsa-da, ishlatilmaydi.
- **Don't** `--active` ni yangi joyda ishlatmang: u yorug'da ko'k, qorong'ida binafsha. Tanlov rangi kerak bo'lsa `primary` oling.
- **Don't** raqamlar devori bilan cheklanmang — ko'rsatkich yonida u nimadan kelib chiqqani (davr, qamrov, ulush) turishi kerak.
- **Don't** modal oynani birinchi yechim sifatida tanlamang: avval panel ichida ochish, sheet yoki alohida sahifani ko'rib chiqing.
- **Don't** gradient matn, shisha effekti yoki dekorativ blur ishlatmang.
