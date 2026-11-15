// ============================================================
// CONTENT SETTINGS — edit these files first when details change.
// Prices and legal fees are copied from the old website, NOT newly verified.
// ============================================================
export const contact = {
  name: 'Заур Байрамов', email: 'info@azeperevod.ru',
  phone: '+994505267737', phoneLabel: '(+99450) 526-77-37', city: 'Баку, Азербайджан',
  // Update these links only after they are confirmed.
  social: [
    {label:'VK',url:'https://vk.com/azeperevod'},
    {label:'Facebook',url:'https://www.facebook.com/profile.php?id=100000827687775'}
  ]
};
// Update one row here; all three languages will show the same correct amount.
// Translation rates: edit this list to update prices in RU / EN / AZ.
export const prices = [
  {id:"az", ru:"Азербайджанский", en:"Azerbaijani", az:"Azərbaycan dili", from:350, to:400},
  {id:"az-special", ru:"Азербайджанский — художественный, IT, технический и медицинский перевод", en:"Azerbaijani — literary, IT, technical and medical translation", az:"Azərbaycan dili — bədii, İT, texniki və tibbi tərcümə", from:550, to:600},
  {id:"eu4", ru:"Английский, украинский, французский, немецкий, испанский, итальянский", en:"English, Ukrainian, French, German, Spanish, Italian", az:"İngilis, ukrayna, fransız, alman, ispan, italyan", from:350, to:400},
  {id:"group1", ru:"Грузинский, литовский, чешский, турецкий, болгарский, казахский, киргизский, узбекский, таджикский, латышский, польский, эстонский, туркменский", en:"Georgian, Lithuanian, Czech, Turkish, Bulgarian, Kazakh, Kyrgyz, Uzbek, Tajik, Latvian, Polish, Estonian, Turkmen", az:"Gürcü, litva, çex, türk, bolqar, qazax, qırğız, özbək, tacik, latış, polyak, eston, türkmən", from:450, to:500},
  {id:"group2", ru:"Румынский, македонский, шведский, боснийский, греческий, датский, норвежский, финский, словацкий, словенский, португальский, сербский, хорватский, голландский, венгерский", en:"Romanian, Macedonian, Swedish, Bosnian, Greek, Danish, Norwegian, Finnish, Slovak, Slovenian, Portuguese, Serbian, Croatian, Dutch, Hungarian", az:"Rumın, makedon, isveç, bosniya, yunan, danimarka, norveç, fin, slovak, sloven, portuqal, serb, xorvat, holland, macar", from:500, to:550},
  {id:"group3", ru:"Китайский, корейский, монгольский, албанский, индонезийский, малайский, непальский, тайский, лезгинский, фарси, арабский, вьетнамский, хинди, иврит, японский, каталанский, татарский", en:"Chinese, Korean, Mongolian, Albanian, Indonesian, Malay, Nepali, Thai, Lezgin, Persian, Arabic, Vietnamese, Hindi, Hebrew, Japanese, Catalan, Tatar", az:"Çin, koreya, monqol, alban, indoneziya, malay, nepal, tay, ləzgi, fars, ərəb, vyetnam, hindi, ivrit, yapon, katalan, tatar", from:800, to:900}
];
// Payment methods confirmed in the October 2026 brief.
// Confirm that each payment method is available for the customer before invoicing.
export const paymentMethods = ['Сбербанк','Mastercard','Visa','СБП','ЮMoney','Western Union'];

// Add the supplied logo to public/assets and set this path, e.g. /assets/logo.svg.
export const brandLogo = null;
