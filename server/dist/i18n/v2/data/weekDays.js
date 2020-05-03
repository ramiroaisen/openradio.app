"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helper = {
    // ar => Arabic => اللغة العربية
    ar: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    // az => Azerbaijani => azərbaycan dili
    az: ["Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə", "Bazar"],
    // be => Belarusian => беларуская мова
    be: ["панядзелак", "аўторак", "серада", "чацьвер", "пятніца", "сыбота", "нядзеля"],
    // bg => Bulgarian => български език
    bg: ["понеделник", "вторник", "сряда", "четвъртък", "петък", "събота", "неделя"],
    // bs => Bosnian => bosanski jezik
    bs: ["ponedeljak", "utorak", "srijeda", "cxetvrtak", "petak", "subota", "nedjelja"],
    // ca => Catalan => català
    ca: ["dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge"],
    // cs => Czech => čeština
    cs: ["pondĕlí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "nedĕle"],
    // da => Danish => dansk
    da: ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"],
    // de => German => Deutsch
    de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    // el => Greek => Ελληνικά
    el: ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"],
    // en => English => English
    en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    // es => Spanish => Español
    es: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    // et => Estonian => eesti
    et: ["esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev", "pühapäev"],
    // fa => Persian => فارسی
    fa: ["دوشنبه", "سهشنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه", "یکشنبه"],
    // fi => Finnish => suomi
    fi: ["maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai", "sunnuntai"],
    // fr => French => Français
    fr: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    // he => Hebrew => עברית
    he: ["יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "יום שבת", "יום ראשון"],
    // hr => Croatian => hrvatski jezik
    hr: ["ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota", "nedjelja"],
    // hu => Hungarian => magyar
    hu: ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"],
    // hy => Armenian => Հայերեն
    hy: ["Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ", "Կիրակի"],
    // id => Indonesian => Indonesian
    id: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    // it => Italian => Italiano
    it: ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"],
    // ja => Japanese => 日本語
    ja: ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
    // ka => Georgian => ქართული
    ka: ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"],
    // kk => Kazakh => қазақ тілі
    kk: ["дүйсенбi", "сейсенбi", "сәрсенбі", "бейсенбі", "жұма", "сенбі", "жексенбi"],
    // ko => Korean => 한국어
    ko: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
    // TODO: ky => Kyrgyz => Кыргызча
    ky: ["Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби", "Жекшемби"],
    // lt => Lithuanian => lietuvių kalba
    lt: ["Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis", "Sekmadienis"],
    // lv => Latvian => latviešu valoda
    lv: ["pirmdiena", "otrdiena", "trešdiena", "ceturtdiena", "piektdiena", "sestdiena", "svētdiena"],
    // mk => Macedonian => македонски јазик
    mk: ["Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота", "Недела"],
    // mn => Mongolian => Монгол хэл
    mn: ["даваа", "мягмар", "лхагва", "пүрэв", "баасан", "бямба", "ням"],
    // nb => Norwegian Bokmål => Norsk bokmål
    nb: ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"],
    // nl => Dutch => Nederlands
    nl: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
    // nn => Norwegian Nynorsk => Norsk nynorsk
    nn: ["måndag", "tysdag", "onsdag", "torsdag", "fredag", "laurdag", "sundag"],
    // pl => Polish => język polski
    pl: ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"],
    // pt => Portuguese => Português
    pt: ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"],
    // ro => Romanian => Română
    ro: ["luni", "marţi", "miercuri", "joi", "vineri", "sîmbătă", "duminică"],
    // ru => Russian => Русский
    ru: ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"],
    // sk => Slovak => slovenčina
    sk: ["pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota", "nedel'a"],
    // sl => Slovene => slovenski jezik
    sl: ["Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"],
    // sr => Serbian => српски језик
    sr: ["Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота", "Недеља"],
    // sv => Swedish => svenska
    sv: ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"],
    // th => Thai => ไทย
    th: ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฦหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"],
    // tr => Turkish => Türkçe
    tr: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    // uk => Ukrainian => Українська
    uk: ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"],
    // ur => Urdu => اردو
    ur: ["پير", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ", "اتوار"],
    // uz => Uzbek => Ўзбек
    uz: ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"],
    // vi => Vietnamese => Tiếng Việt
    vi: ["次𠄩", "次𠀧", "次四", "次𠄼", "次𦒹", "次𦉱", "主日"],
    // zh => Chinese => 中文
    zh: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
};
exports.weekDays = {};
for (const [key, value] of Object.entries(exports.helper)) {
    exports.weekDays[key] = Object.fromEntries(Object.entries(value));
}
//# sourceMappingURL=weekDays.js.map