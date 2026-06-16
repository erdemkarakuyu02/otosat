// ==========================================
// FİREBASE BAĞLANTISI VE KURULUM
// ==========================================
const firebaseScripts = [
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js"
];

// !!! KENDİ IMGBB ANAHTARINI BURAYA YAZ !!!
const IMGBB_API_KEY = "658362c964a6b3407806eb59735c285b"; 
const ADMIN_EMAIL = 'denizqw02@gmail.com'; 

window.allListings = [];
window.userFavorites = [];
window.favoritesLoaded = false;

async function startEngine() {
    for (let src of firebaseScripts) {
        await new Promise((res) => { 
            const s = document.createElement('script'); s.src = src; s.onload = res; 
            s.onerror = () => { console.warn("Firebase bağlantı hatası!"); res(); };
            document.head.appendChild(s); 
        });
    }
    if(!window.firebase) return null;
    try {
        firebase.initializeApp({
            apiKey: "AIzaSyB8fJs85fOFVpgU8gwwZ6gFWhBGrrt-V7Y",
            authDomain: "otosat-bd489.firebaseapp.com",
            projectId: "otosat-bd489",
            storageBucket: "otosat-bd489.firebasestorage.app",
            messagingSenderId: "1039910151531",
            appId: "1:1039910151531:web:841af972dd50dc6ed4982e"
        });
        return { auth: firebase.auth(), db: firebase.firestore() };
    } catch(e) { return null; }
}

document.addEventListener('DOMContentLoaded', async function() {
    
    // TÜRKİYE'NİN 81 İLİ VE TÜM İLÇELERİ
    const locDatabase = { "Adana":["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Karataş","Kozan","Pozantı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"], "Adıyaman":["Besni","Çelikhan","Gerger","Gölbaşı","Kahta","Merkez","Samsat","Sincik","Tut"], "Afyonkarahisar":["Başmakçı","Bayat","Bolvadin","Çay","Çobanlar","Dazkırı","Dinar","Emirdağ","Evciler","Hocalar","İhsaniye","İscehisar","Kızılören","Merkez","Sandıklı","Sinanpaşa","Sultandağı","Şuhut"], "Ağrı":["Diyadin","Doğubayazıt","Eleşkirt","Hamur","Merkez","Patnos","Taşlıçay","Tutak"], "Aksaray":["Ağaçören","Eskil","Gülağaç","Güzelyurt","Merkez","Ortaköy","Sarıyahşi","Sultanhanı"], "Amasya":["Göynücek","Gümüşhacıköy","Hamamözü","Merkez","Merzifon","Suluova","Taşova"], "Ankara":["Akyurt","Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"], "Antalya":["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"], "Ardahan":["Çıldır","Damal","Göle","Hanak","Merkez","Posof"], "Artvin":["Ardanuç","Arhavi","Borçka","Hopa","Kemalpaşa","Merkez","Murgul","Şavşat","Yusufeli"], "Aydın":["Bozdoğan","Buharkent","Çine","Didim","Efeler","Germencik","İncirliova","Karacasu","Karpuzlu","Koçarlı","Köşk","Kuşadası","Kuyucak","Nazilli","Söke","Sultanhisar","Yenipazar"], "Balıkesir":["Altıeylül","Ayvalık","Balya","Bandırma","Bigadiç","Burhaniye","Dursunbey","Edremit","Erdek","Gömeç","Gönen","Havran","İvrindi","Karesi","Kepsut","Manyas","Marmara","Savaştepe","Sındırgı","Susurluk"], "Bartın":["Amasra","Kurucaşile","Merkez","Ulus"], "Batman":["Beşiri","Gercüş","Hasankeyf","Kozluk","Merkez","Sason"], "Bayburt":["Aydıntepe","Demirözü","Merkez"], "Bilecik":["Bozüyük","Gölpazarı","İnhisar","Merkez","Osmaneli","Pazaryeri","Söğüt","Yenipazar"], "Bingöl":["Adaklı","Genç","Karlıova","Kiğı","Merkez","Solhan","Yayladere","Yedisu"], "Bitlis":["Adilcevaz","Ahlat","Güroymak","Hizan","Merkez","Mutki","Tatvan"], "Bolu":["Dörtdivan","Gerede","Göynük","Kıbrıscık","Mengen","Merkez","Mudurnu","Seben","Yeniçağa"], "Burdur":["Ağlasun","Altınyayla","Bucak","Çavdır","Çeltikçi","Gölhisar","Karamanlı","Kemer","Merkez","Tefenni","Yeşilova"], "Bursa":["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"], "Çanakkale":["Ayvacık","Bayramiç","Biga","Bozcaada","Çan","Eceabat","Ezine","Gelibolu","Gökçeada","Lapseki","Merkez","Yenice"], "Çankırı":["Atkaracalar","Bayramören","Çerkeş","Eldivan","Ilgaz","Kızılırmak","Korgun","Kurşunlu","Merkez","Orta","Şabanözü","Yapraklı"], "Çorum":["Alaca","Bayat","Boğazkale","Dodurga","İskilip","Kargı","Laçin","Mecitözü","Merkez","Oğuzlar","Ortaköy","Osmancık","Sungurlu","Uğurludağ"], "Denizli":["Acıpayam","Babadağ","Baklan","Bekilli","Beyağaç","Bozkurt","Buldan","Çal","Çameli","Çardak","Çivril","Güney","Honaz","Kale","Merkezefendi","Pamukkale","Sarayköy","Serinhisar","Tavas"], "Diyarbakır":["Bağlar","Bismil","Çermik","Çınar","Çüngüş","Dicle","Eğil","Ergani","Hani","Hazro","Kayapınar","Kocaköy","Kulp","Lice","Silvan","Sur","Yenişehir"], "Düzce":["Akçakoca","Cumayeri","Çilimli","Gölyaka","Gümüşova","Kaynaşlı","Merkez","Yığılca"], "Edirne":["Enez","Havsa","İpsala","Keşan","Lalapaşa","Meriç","Merkez","Süloğlu","Uzunköprü"], "Elazığ":["Ağın","Alacakaya","Arıcak","Baskil","Karakoçan","Keban","Kovancılar","Maden","Merkez","Palu","Sivrice"], "Erzincan":["Çayırlı","İliç","Kemah","Kemaliye","Merkez","Otlukbeli","Refahiye","Tercan","Üzümlü"], "Erzurum":["Aşkale","Aziziye","Çat","Hınıs","Horasan","İspir","Karaçoban","Karayazı","Köprüköy","Narman","Oltu","Olur","Palandöken","Pasinler","Pazaryolu","Şenkaya","Tekman","Tortum","Uzundere","Yakutiye"], "Eskişehir":["Alpu","Beylikova","Çifteler","Günyüzü","Han","İnönü","Mahmudiye","Mihalgazi","Mihalıççık","Odunpazarı","Sarıcakaya","Seyitgazi","Sivrihisar","Tepebaşı"], "Gaziantep":["Araban","İslahiye","Karkamış","Nizip","Nurdağı","Oğuzeli","Şahinbey","Şehitkamil","Yavuzeli"], "Giresun":["Alucra","Bulancak","Çamoluk","Çanakçı","Dereli","Doğankent","Espiye","Eynesil","Görele","Güce","Keşap","Merkez","Piraziz","Şebinkarahisar","Tirebolu","Yağlıdere"], "Gümüşhane":["Kelkit","Köse","Kürtün","Merkez","Şiran","Torul"], "Hakkari":["Çukurca","Derecik","Merkez","Şemdinli","Yüksekova"], "Hatay":["Altınözü","Antakya","Arsuz","Belen","Defne","Dörtyol","Erzin","Hassa","İskenderun","Kırıkhan","Kumlu","Payas","Reyhanlı","Samandağ","Yayladağı"], "Iğdır":["Aralık","Karakoyunlu","Merkez","Tuzluca"], "Isparta":["Aksu","Atabey","Eğirdir","Gelendost","Gönen","Keçiborlu","Merkez","Senirkent","Sütçüler","Şarkikaraağaç","Uluborlu","Yalvaç","Yenişarbademli"], "İstanbul":["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"], "İzmir":["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"], "Kahramanmaraş":["Afşin","Andırın","Çağlayancerit","Dulkadiroğlu","Ekinözü","Elbistan","Göksun","Nurhak","Onikişubat","Pazarcık","Türkoğlu"], "Karabük":["Eflani","Eskipazar","Merkez","Ovacık","Safranbolu","Yenice"], "Karaman":["Ayrancı","Başyayla","Ermenek","Kazımkarabekir","Merkez","Sarıveliler"], "Kars":["Akyaka","Arpaçay","Digor","Kağızman","Merkez","Sarıkamış","Selim","Susuz"], "Kastamonu":["Abana","Ağlı","Araç","Azdavay","Bozkurt","Cide","Çatalzeytin","Daday","Devrekani","Doğanyurt","Hanönü","İhsangazi","İnebolu","Küre","Merkez","Pınarbaşı","Seydiler","Şenpazar","Taşköprü","Tosya"], "Kayseri":["Akkışla","Bünyan","Develi","Felahiye","Hacılar","İncesu","Kocasinan","Melikgazi","Özvatan","Pınarbaşı","Sarıoğlan","Sarız","Talas","Tomarza","Yahyalı","Yeşilhisar"], "Kırıkkale":["Bahşılı","Balışeyh","Çelebi","Delice","Karakeçili","Keskin","Merkez","Sulakyurt","Yahşihan"], "Kırklareli":["Babaeski","Demirköy","Kofçaz","Lüleburgaz","Merkez","Pehlivanköy","Pınarhisar","Vize"], "Kırşehir":["Akçakent","Akpınar","Boztepe","Çiçekdağı","Kaman","Merkez","Mucur"], "Kilis":["Elbeyli","Merkez","Musabeyli","Polateli"], "Kocaeli":["Başiskele","Çayırova","Darıca","Derince","Dilovası","Gebze","Gölcük","İzmit","Kandıra","Kartepe","Körfez"], "Konya":["Ahırlı","Akören","Akşehir","Altınekin","Beyşehir","Bozkır","Cihanbeyli","Çeltik","Çumra","Derbent","Derebucak","Doğanhisar","Emirgazi","Ereğli","Güneysınır","Hadim","Halkapınar","Hüyük","Ilgın","Kadınhanı","Karapınar","Karatay","Kulu","Meram","Sarayönü","Selçuklu","Seydişehir","Taşkent","Tuzlukçu","Yalıhüyük","Yunak"], "Kütahya":["Altıntaş","Aslanapa","Çavdarhisar","Domaniç","Dumlupınar","Emet","Gediz","Hisarcık","Merkez","Pazarlar","Simav","Şaphane","Tavşanlı"], "Malatya":["Akçadağ","Arapgir","Arguvan","Battalgazi","Darende","Doğanşehir","Doğanyol","Hekimhan","Kale","Kuluncak","Pütürge","Yazıhan","Yeşilyurt"], "Manisa":["Ahmetli","Akhisar","Alaşehir","Demirci","Gölmarmara","Gördes","Kırkağaç","Köprübaşı","Kula","Salihli","Sarıgöl","Saruhanlı","Selendi","Soma","Şehzadeler","Turgutlu","Yunusemre"], "Mardin":["Artuklu","Dargeçit","Derik","Kızıltepe","Mazıdağı","Midyat","Nusaybin","Ömerli","Savur","Yeşilli"], "Mersin":["Akdeniz","Anamur","Aydıncık","Bozyazı","Çamlıyayla","Erdemli","Gülnar","Mezitli","Mut","Silifke","Tarsus","Toroslar","Yenişehir"], "Muğla":["Bodrum","Dalaman","Datça","Fethiye","Kavaklıdere","Köyceğiz","Marmaris","Menteşe","Milas","Ortaca","Seydikemer","Ula","Yatağan"], "Muş":["Bulanık","Hasköy","Korkut","Malazgirt","Merkez","Varto"], "Nevşehir":["Acıgöl","Avanos","Derinkuyu","Gülşehir","Hacıbektaş","Kozaklı","Merkez","Ürgüp"], "Niğde":["Altunhisar","Bor","Çamardı","Çiftlik","Merkez","Ulukışla"], "Ordu":["Akkuş","Altınordu","Aybastı","Çamaş","Çatalpınar","Çaybaşı","Fatsa","Gölköy","Gülyalı","Gürgentepe","İkizce","Kabadüz","Kabataş","Korgan","Kumru","Mesudiye","Perşembe","Ulubey","Ünye"], "Osmaniye":["Bahçe","Düziçi","Hasanbeyli","Kadirli","Merkez","Sumbas","Toprakkale"], "Rize":["Ardeşen","Çamlıhemşin","Çayeli","Derepazarı","Fındıklı","Güneysu","Hemşin","İkizdere","İyidere","Kalkandere","Merkez","Pazar"], "Sakarya":["Adapazarı","Akyazı","Arifiye","Erenler","Ferizli","Geyve","Hendek","Karapürçek","Karasu","Kaynarca","Kocaali","Pamukova","Sapanca","Serdivan","Söğütlü","Taraklı"], "Samsun":["Alaçam","Asarcık","Atakum","Ayvacık","Bafra","Canik","Çarşamba","Havza","İlkadım","Kavak","Ladik","Ondokuzmayıs","Salıpazarı","Tekkeköy","Terme","Vezirköprü","Yakakent"], "Siirt":["Baykan","Eruh","Kurtalan","Merkez","Pervari","Şirvan","Tillo"], "Sinop":["Ayancık","Boyabat","Dikmen","Durağan","Erfelek","Gerze","Merkez","Saraydüzü","Türkeli"], "Sivas":["Akıncılar","Altınyayla","Divriği","Doğanşar","Gemerek","Gölova","Gürün","Hafik","İmranlı","Kangal","Koyulhisar","Merkez","Suşehri","Şarkışla","Ulaş","Yıldızeli","Zara"], "Şanlıurfa":["Akçakale","Birecik","Bozova","Ceylanpınar","Eyyübiye","Halfeti","Haliliye","Harran","Hilvan","Karaköprü","Siverek","Suruç","Viranşehir"], "Şırnak":["Beytüşşebap","Cizre","Güçlükonak","İdil","Merkez","Silopi","Uludere"], "Tekirdağ":["Çerkezköy","Çorlu","Ergene","Hayrabolu","Kapaklı","Malkara","Marmaraereğlisi","Muratlı","Saray","Süleymanpaşa","Şarköy"], "Tokat":["Almus","Artova","Başçiftlik","Erbaa","Merkez","Niksar","Pazar","Reşadiye","Sulusaray","Turhal","Yeşilyurt","Zile"], "Trabzon":["Akçaabat","Araklı","Arsin","Beşikdüzü","Çarşıbaşı","Çaykara","Dernekpazarı","Düzköy","Hayrat","Köprübaşı","Maçka","Of","Ortahisar","Sürmene","Şalpazarı","Tonya","Vakfıkebir","Yomra"], "Tunceli":["Çemişgezek","Hozat","Mazgirt","Merkez","Nazımiye","Ovacık","Pertek","Pülümür"], "Uşak":["Banaz","Eşme","Karahallı","Merkez","Sivaslı","Ulubey"], "Van":["Bahçesaray","Başkale","Çaldıran","Çatak","Edremit","Erciş","Gevaş","Gürpınar","İpekyolu","Muradiye","Özalp","Saray","Tuşba"], "Yalova":["Altınova","Armutlu","Çınarcık","Çiftlikköy","Merkez","Termal"], "Yozgat":["Akdağmadeni","Aydıncık","Boğazlıyan","Çandır","Çayıralan","Çekerek","Kadışehri","Merkez","Saraykent","Sarıkaya","Sorgun","Şefaatli","Yenifakılı","Yerköy"], "Zonguldak":["Alaplı","Çaycuma","Devrek","Ereğli","Gökçebey","Kilimli","Kozlu","Merkez"] };

    const masterDB = {
        "Otomobil": { "Alfa Romeo": ["147", "156", "159", "Giulietta", "MiTo", "Stelvio", "Tonale"], "Aston Martin": ["DB11", "DB9", "Vantage", "Rapide"], "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "R8", "TT", "e-tron GT", "Q Serisi"], "Bentley": ["Continental GT", "Flying Spur"], "BMW": ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "6 Serisi", "7 Serisi", "8 Serisi", "M Serisi", "Z4"], "Chery": ["Omoda 5", "Tiggo 7 Pro", "Tiggo 8 Pro", "Kimo", "Chance"], "Chevrolet": ["Aveo", "Camaro", "Captiva", "Corvette", "Cruze", "Kalos", "Lacetti", "Spark"], "Chrysler": ["300C", "PT Cruiser", "Sebring"], "Citroen": ["C-Elysee", "C1", "C2", "C3", "C4", "C5", "Saxo", "Xsara", "Ami"], "Dacia": ["Duster", "Lodgy", "Logan", "Sandero", "Stepway", "Spring", "Jogger"], "DS Automobiles": ["DS 3", "DS 4", "DS 5", "DS 7", "DS 9"], "Ferrari": ["458 Italia", "488 GTB", "California", "F430", "Portofino", "Roma"], "Fiat": ["500", "Albea", "Bravo", "Doblo", "Egea", "Fiorino", "Linea", "Marea", "Palio", "Panda", "Punto", "Siena", "Tempra", "Uno", "Şahin", "Doğan", "Kartal"], "Ford": ["B-Max", "C-Max", "Courier", "Escort", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Puma", "Taunus", "Transit"], "Honda": ["Accord", "City", "Civic", "CR-V", "CR-X", "HR-V", "Jazz", "S2000"], "Hyundai": ["Accent", "Accent Blue", "Accent Era", "Bayon", "Elantra", "Getz", "i10", "i20", "i30", "Kona", "Sonata", "Tucson"], "Jaguar": ["F-Type", "XE", "XF", "XJ"], "Kia": ["Ceed", "Cerato", "Picanto", "Rio", "Sorento", "Sportage", "Stonic"], "Lada": ["Niva", "Samara", "Vega"], "Maserati": ["Ghibli", "GranTurismo", "Levante", "Quattroporte"], "Mazda": ["2", "3", "6", "CX-3", "CX-5", "MX-5", "RX-8"], "Mercedes-Benz": ["A-Serisi", "B-Serisi", "C-Serisi", "CLA", "CLK", "CLS", "E-Serisi", "G-Serisi", "GLA", "GLB", "GLC", "GLE", "S-Serisi", "SLK", "AMG GT"], "Mini": ["Cooper", "Cooper Clubman", "Countryman"], "Mitsubishi": ["Colt", "Lancer", "Space Star", "L200"], "Nissan": ["Almera", "Juke", "Micra", "Navara", "Note", "Primera", "Qashqai", "X-Trail"], "Opel": ["Astra", "Combo", "Corsa", "Crossland", "Insignia", "Kadett", "Meriva", "Mokka", "Vectra", "Zafira"], "Peugeot": ["106", "2008", "206", "207", "208", "3008", "301", "307", "308", "407", "5008", "508", "Partner", "RCZ", "Rifter"], "Porsche": ["911", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"], "Renault": ["Captur", "Clio", "Fluence", "Kadjar", "Kangoo", "Laguna", "Megane", "R 11", "R 12", "R 19", "R 21", "R 9", "Symbol", "Taliant", "Talisman", "Twingo"], "Seat": ["Altea", "Arona", "Ateca", "Cordoba", "Ibiza", "Leon", "Toledo"], "Skoda": ["Fabia", "Favorit", "Felicia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Scala", "Superb"], "Subaru": ["BRZ", "Forester", "Impreza", "Legacy", "XV"], "Suzuki": ["Alto", "Baleno", "Grand Vitara", "Jimny", "Swift", "Vitara"], "Toyota": ["Auris", "Avensis", "C-HR", "Camry", "Corolla", "Corolla Cross", "Hilux", "Land Cruiser", "RAV4", "Yaris"], "Volkswagen": ["Amarok", "Arteon", "Bora", "Caddy", "Golf", "Jetta", "Passat", "Passat Variant", "Polo", "Scirocco", "T-Roc", "Taigo", "Tiguan", "Touareg", "Touran", "Transporter"], "Volvo": ["C30", "S40", "S60", "S80", "S90", "V40", "V60", "XC40", "XC60", "XC90"] },
        "Arazi, SUV & Pickup": { "Audi": ["Q2", "Q3", "Q5", "Q7", "Q8"], "BMW": ["X1", "X2", "X3", "X4", "X5", "X6", "X7"], "Chery": ["Omoda 5", "Tiggo 7 Pro", "Tiggo 8 Pro"], "Dacia": ["Duster", "Jogger"], "Ford": ["EcoSport", "Kuga", "Puma", "Ranger", "F-150"], "Hyundai": ["Bayon", "Kona", "Tucson", "Santa Fe"], "Jeep": ["Cherokee", "Compass", "Grand Cherokee", "Renegade", "Wrangler"], "Kia": ["Sorento", "Sportage", "Stonic"], "Land Rover": ["Defender", "Discovery", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"], "Mercedes-Benz": ["G Serisi", "GLA", "GLB", "GLC", "GLE", "GLS", "X-Class"], "Nissan": ["Juke", "Navara", "Qashqai", "Skystar", "X-Trail"], "Peugeot": ["2008", "3008", "5008"], "Porsche": ["Cayenne", "Macan"], "Renault": ["Captur", "Kadjar", "Koleos"], "Skoda": ["Kamiq", "Karoq", "Kodiaq"], "SsangYong": ["Actyon Sports", "Korando", "Rexton"], "Suzuki": ["Grand Vitara", "Jimny", "Vitara"], "Toyota": ["C-HR", "Hilux", "Land Cruiser", "RAV4"], "Volkswagen": ["Amarok", "Taigo", "T-Roc", "Tiguan", "Touareg"], "Volvo": ["XC40", "XC60", "XC90"] },
        "Motosiklet": { "Aprilia": ["RS", "SR", "Tuono"], "Bajaj": ["Pulsar", "Dominar", "Discover"], "BMW": ["F Serisi", "G Serisi", "R Serisi", "S 1000 RR"], "Ducati": ["Diavel", "Monster", "Panigale"], "Harley-Davidson": ["Iron 883", "Sportster", "Street Rod", "Fat Boy"], "Honda": ["Activa", "CBR", "CRF", "Dio", "Forza", "PCX", "Spacy", "NC 750", "Gold Wing"], "Kawasaki": ["Ninja", "Z Serisi", "Versys"], "KTM": ["Duke", "RC", "Adventure"], "Kuba": ["Bluebird", "Space", "Superlight"], "Kymco": ["Agility", "Downtown", "Xciting"], "Mondial": ["Drift L", "Lavare", "ZNU"], "Peugeot": ["Django", "Kisbee", "Metropolis"], "Piaggio": ["Beverly", "Liberty", "Medley"], "RKS": ["Spontini", "Titanic", "Azure"], "Suzuki": ["Burgman", "GSX-R", "V-Strom"], "SYM": ["Fiddle", "Joymax", "Symphony"], "Triumph": ["Bonneville", "Tiger", "Trident"], "TVS": ["Apache", "Jupiter", "NTORQ"], "Vespa": ["GTS", "Primavera", "Sprint"], "Yamaha": ["Crypton", "Delight", "FZ", "MT", "NMAX", "R25", "XMAX", "YBR", "TMAX"] },
        "Ticari Araçlar & Minivan": { "Citroen": ["Berlingo", "Jumper", "Jumpy", "Nemo"], "Fiat": ["Doblo", "Ducato", "Fiorino", "Scudo"], "Ford": ["Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Custom"], "Mercedes-Benz": ["Sprinter", "Viano", "Vito", "Citan"], "Peugeot": ["Bipper", "Boxer", "Expert", "Partner", "Rifter"], "Renault": ["Kangoo", "Master", "Trafic", "Express"], "Volkswagen": ["Caddy", "Caravelle", "Crafter", "Transporter", "Volt"] },
        "Elektrikli Araçlar": { "Tesla": ["Model 3", "Model Y", "Model S", "Model X"], "Togg": ["T10X", "T10F"], "BYD": ["Atto 3", "Seal", "Dolphin", "Tang"], "BMW": ["i3", "i4", "iX", "iX3", "i7"], "Mercedes-Benz": ["EQA", "EQB", "EQC", "EQE", "EQS"], "Audi": ["e-tron", "Q4 e-tron", "Q8 e-tron", "RS e-tron GT"], "Renault": ["Zoe", "Megane E-Tech", "Twizy"], "MG": ["MG4", "ZS EV", "Marvel R"], "Skywell": ["ET5"], "Leapmotor": ["T03"], "Polestar": ["Polestar 2"], "Porsche": ["Taycan"] },
        "Ağır Vasıta (Kamyon & Tır)": { "Mercedes-Benz": ["Actros", "Atego", "Axor", "Arocs"], "Ford Trucks": ["F-Max", "Cargo"], "Scania": ["G Serisi", "P Serisi", "R Serisi", "S Serisi"], "Volvo": ["FH Serisi", "FM Serisi", "FMX"], "BMC": ["Tuğra", "Pro", "Fatih"], "Renault Trucks": ["T Serisi", "Premium", "Magnum"], "MAN": ["TGX", "TGS", "TGL", "TGM"], "DAF": ["XF", "CF", "LF"], "Isuzu": ["NPR", "NKR", "N-Wide"] },
        "Tarım Makineleri (Traktör)": { "New Holland": ["TD Serisi", "TT Serisi", "T4 Serisi", "Biçerdöver"], "Massey Ferguson": ["MF 200", "MF 5400", "MF 240", "MF 285"], "Tümosan": ["8000 Serisi", "8100 Serisi"], "John Deere": ["5E Serisi", "5M Serisi", "6 Serisi"], "Erkunt": ["Kudret", "Nimet", "Kıymet"], "Başak": ["2060", "2075", "2090"], "Hattat": ["200", "300", "C Serisi"], "Case IH": ["JX", "Puma"] },
        "İş Makineleri & Sanayi": { "JCB": ["Kazıcı Yükleyici (Beko Loder)", "Ekskavatör", "Telehandler", "Mini Yükleyici"], "Caterpillar": ["Dozer", "Ekskavatör", "Greyder", "Loder", "Silindir"], "Komatsu": ["Ekskavatör", "Loder", "Dozer", "Greyder"], "Volvo": ["Loder", "Ekskavatör", "Kamyon"], "Hidromek": ["Beko Loder", "Ekskavatör", "Greyder"], "Hitachi": ["Ekskavatör", "Loder"], "Bobcat": ["Mini Yükleyici", "Mini Ekskavatör"] },
        "Karavan & Kamp": { "Motokaravan": ["Fiat Ducato Altyapılı", "Peugeot Boxer Altyapılı", "Ford Transit Altyapılı"], "Çekme Karavan": ["Erba", "Pino", "Adria", "Başoğlu", "Gülme", "Ortaklar"], "Araç Üstü Çadır": ["Tüm Markalar"] },
        "Deniz Araçları": { "Motoryat": ["Azimut", "Princess", "Sunseeker", "Galeon", "Numarine"], "Yelkenli": ["Bavaria", "Beneteau", "Jeanneau", "Dufour", "Hanse"], "Sürat Teknesi": ["Glastron", "Sea Ray", "Bayliner", "Chaparral"], "Gulet & Ahşap": ["Bodrum Guleti", "Marmaris Guleti"], "Zodyak & Şişme Bot": ["Joker Boat", "Zodiac", "Brig"], "Jet Ski": ["Yamaha", "Sea-Doo", "Kawasaki"] },
        "ATV & UTV": { "Polaris": ["RZR", "Sportsman"], "Can-Am": ["Maverick", "Outlander"], "Kuba": ["Kuba ATV Serisi"], "CFMoto": ["CForce", "ZForce"] },
        "Klasik Araçlar": { "Klasik Otomobil": ["Chevrolet Impala", "Ford Mustang", "Mercedes-Benz W114", "VW Beetle"], "Klasik Arazi Aracı": ["Jeep CJ", "Land Rover Series"] },
        "Hasarlı & Diğer": { "Tüm Markalar": ["Ağır Hasar Kayıtlı (Pert)", "Çekme Belgeli", "Hurda Belgeliler", "Parça Niyetine"] }
    };

    function populateSelects() {
        const fc = document.getElementById('form-category'); const fb = document.getElementById('form-brand'); const fm = document.getElementById('form-model');
        const filCat = document.getElementById('filter-category'); const filBrand = document.getElementById('filter-brand'); const filModel = document.getElementById('filter-model');
        const city = document.getElementById('form-city'); const dist = document.getElementById('form-district');
        const filCity = document.getElementById('filter-city'); const filDist = document.getElementById('filter-district');

        if(fc) { fc.innerHTML='<option value="">Kategori Seçin</option>'; Object.keys(masterDB).forEach(c => fc.appendChild(new Option(c, c))); }
        if(filCat) { filCat.innerHTML='<option value="all">Tüm Kategoriler</option>'; Object.keys(masterDB).forEach(c => filCat.appendChild(new Option(c, c))); }
        
        if(fc && fb && fm) {
            fc.addEventListener('change', function() {
                fb.innerHTML='<option value="">Marka Seçin</option>'; fm.innerHTML='<option value="">Önce marka</option>'; fm.disabled=true;
                if(this.value && masterDB[this.value]) { fb.disabled=false; Object.keys(masterDB[this.value]).sort().forEach(b => fb.appendChild(new Option(b, b))); } else { fb.disabled=true; }
            });
            fb.addEventListener('change', function() {
                fm.innerHTML='<option value="">Model/Seri Seçin</option>'; const cat = fc.value;
                if(this.value && cat && masterDB[cat][this.value]) { fm.disabled=false; masterDB[cat][this.value].sort().forEach(m => fm.appendChild(new Option(m, m))); } else { fm.disabled=true; }
            });
        }

        if(filCat && filBrand) {
            filCat.addEventListener('change', function() {
                filBrand.innerHTML='<option value="all">Tüm Markalar</option>';
                if(filModel) { filModel.innerHTML='<option value="all">Önce Marka Seçin</option>'; filModel.disabled = true; }
                if(this.value !== 'all' && masterDB[this.value]) { Object.keys(masterDB[this.value]).sort().forEach(b => filBrand.appendChild(new Option(b, b))); }
            });
        }
        if(filBrand && filModel && filCat) {
            filBrand.addEventListener('change', function() {
                filModel.innerHTML='<option value="all">Tüm Modeller</option>'; const cat = filCat.value;
                if(this.value !== 'all' && cat !== 'all' && masterDB[cat][this.value]) { filModel.disabled = false; masterDB[cat][this.value].sort().forEach(m => filModel.appendChild(new Option(m, m))); } else { filModel.disabled = true; }
            });
        }

        if(city) { city.innerHTML='<option value="">İl Seçin</option>'; Object.keys(locDatabase).sort().forEach(c => city.appendChild(new Option(c, c))); }
        if(city && dist) {
            city.addEventListener('change', function() {
                dist.innerHTML='<option value="">İlçe Seçin</option>';
                if(this.value && locDatabase[this.value]) { dist.disabled=false; locDatabase[this.value].sort().forEach(d => dist.appendChild(new Option(d, d))); } else { dist.disabled=true; }
            });
        }

        if(filCity) { filCity.innerHTML='<option value="all">Tüm İller</option>'; Object.keys(locDatabase).sort().forEach(c => filCity.appendChild(new Option(c, c))); }
        if(filCity && filDist) {
            filCity.addEventListener('change', function() {
                filDist.innerHTML='<option value="all">Tüm İlçeler</option>';
                if(this.value !== 'all' && locDatabase[this.value]) { filDist.disabled = false; locDatabase[this.value].sort().forEach(d => filDist.appendChild(new Option(d, d))); } else { filDist.disabled = true; }
            });
        }
    }
    populateSelects();

    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.type-tab').forEach(t => { t.style.background = '#fff'; t.style.color = '#454f5b'; t.style.border = '2px solid #dfe3e8'; t.style.boxShadow = 'none'; });
            this.style.background = '#e53935'; this.style.color = '#fff'; this.style.border = '2px solid #e53935'; this.style.boxShadow = '0 4px 15px rgba(229, 57, 53, 0.3)';
            const typeSelect = document.getElementById('filter-type');
            if(typeSelect) typeSelect.value = this.dataset.type;
            if(window.applyFilters) window.applyFilters();
        });
    });

    window.checkFormDisplay = function() {
        const formType = document.getElementById('form-type'); const formCat = document.getElementById('form-category'); const expWrapper = document.getElementById('expertise-wrapper'); const carExp = document.getElementById('car-expertise'); const motoExp = document.getElementById('moto-expertise');
        if(!formType || !expWrapper) return;
        if(formType.value === 'Kiralık') { expWrapper.style.display = 'none'; } 
        else {
            expWrapper.style.display = 'block';
            if(formCat.value === 'Otomobil' || formCat.value === 'Arazi, SUV & Pickup') { carExp.style.display = 'block'; motoExp.style.display = 'none'; } 
            else if(formCat.value === 'Motosiklet') { carExp.style.display = 'none'; motoExp.style.display = 'block'; } 
            else { carExp.style.display = 'none'; motoExp.style.display = 'none'; }
        }
    };
    if(document.getElementById('form-type')) document.getElementById('form-type').addEventListener('change', window.checkFormDisplay);
    if(document.getElementById('form-category')) document.getElementById('form-category').addEventListener('change', window.checkFormDisplay);

    const engine = await startEngine();
    if(!engine) return; 
    let auth = engine.auth; let db = engine.db;
    const navElement = document.getElementById('main-nav');

    window.applyFilters = function() {
        const listCont = document.getElementById('car-listings') || document.getElementById('my-listings') || document.getElementById('favorites-list');
        if(!listCont) return;

        const isFavPage = document.getElementById('favorites-list') !== null;
        const isMyListings = document.getElementById('my-listings') !== null;

        if (isFavPage && !window.favoritesLoaded) {
            listCont.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Favorileriniz yükleniyor...</p>';
            return;
        }

        const filterType = document.getElementById('filter-type'); const filterCat = document.getElementById('filter-category'); const filterBrand = document.getElementById('filter-brand'); const filterModel = document.getElementById('filter-model'); const filterCity = document.getElementById('filter-city'); const filterDist = document.getElementById('filter-district'); const minYear = document.getElementById('filter-min-year'); const maxYear = document.getElementById('filter-max-year'); const searchInput = document.querySelector('.search-box input');

        const f = {
            type: filterType ? filterType.value : 'all',
            category: filterCat ? filterCat.value : 'all',
            brand: filterBrand ? filterBrand.value : 'all',
            model: filterModel ? filterModel.value : 'all',
            city: filterCity ? filterCity.value : 'all',
            district: filterDist ? filterDist.value : 'all',
            minY: minYear && minYear.value ? parseInt(minYear.value) : 0,
            maxY: maxYear && maxYear.value ? parseInt(maxYear.value) : 9999,
            search: searchInput ? searchInput.value.toLowerCase().trim() : ""
        };

        listCont.innerHTML = '';
        const filtered = window.allListings.filter(c => {
            if(isFavPage && !window.userFavorites.includes(c.id)) return false;
            if(f.type !== 'all' && c.type !== f.type) return false;
            if(f.category !== 'all' && c.category !== f.category) return false;
            if(f.brand !== 'all' && c.brand !== f.brand) return false;
            if(f.model !== 'all' && c.model !== f.model) return false;
            if(f.city !== 'all' && c.city !== f.city) return false;
            if(f.district !== 'all' && c.district !== f.district) return false;
            if(c.year && (parseInt(c.year) < f.minY || parseInt(c.year) > f.maxY)) return false;
            if(f.search && !`${c.title} ${c.brand} ${c.model} ${c.city} ${c.district}`.toLowerCase().includes(f.search)) return false;
            return true;
        });

        if(!filtered.length) { listCont.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">İlan bulunamadı.</p>'; return; }
        
        filtered.forEach(c => {
            const coverImage = (c.images && c.images.length > 0) ? c.images[0] : (c.image || 'https://via.placeholder.com/400');
            let statusBadge = ''; let editBtn = '';
            const heartIcon = window.userFavorites.includes(c.id) ? '❤️' : '🤍';

            if(isMyListings) {
                if(c.status === 'pending') statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#fbc02d; color:#000; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">⏳ Onay Bekliyor</span>`;
                else if(c.status === 'rejected') statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#d32f2f; color:#fff; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">❌ Reddedildi</span>`;
                else statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#388e3c; color:#fff; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">✅ Yayında</span>`;
                editBtn = `<button onclick="window.location.href='ilan-duzenle.html?id=${c.id}'; event.preventDefault();" style="position:absolute; top:10px; right:10px; background:#2196F3; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; font-size:12px; border:none; z-index:10; cursor:pointer;">✏️ Düzenle</button>`;
            }

            listCont.innerHTML += `
                <a href="detay.html?id=${c.id}" class="card">
                    ${statusBadge} ${editBtn}
                    ${!isMyListings ? `<button onclick="toggleFav(event, '${c.id}')" class="fav-btn">${heartIcon}</button>` : ''}
                    <div class="card-img-container"><img src="${coverImage}"></div>
                    <div class="card-content">
                        <h3>${c.title}</h3><p class="price">${c.price}</p><p class="details">${c.city}, ${c.district} • ${c.category}</p>
                    </div>
                </a>`;
        });
    };

    auth.onAuthStateChanged(user => {
        if (navElement) {
            if (user) { 
                const isAdmin = user.email === ADMIN_EMAIL;
                db.collection('favorites').where('email', '==', user.email).get().then(snap => { 
                    window.userFavorites = snap.docs.map(d => d.data().listingId); 
                    window.favoritesLoaded = true;
                    if(document.getElementById('car-listings') || document.getElementById('favorites-list')) window.applyFilters(); 
                });
                
                db.collection('listings').where('ownerEmail', '==', user.email).where('status', '==', 'rejected').get().then(snap1 => {
                    db.collection('notifications').where('to', 'in', ['all', user.email]).get().then(snap2 => {
                        const readNotifs = JSON.parse(localStorage.getItem('readNotifs') || '[]'); let notifCount = snap1.size;
                        snap2.forEach(n => { if(!readNotifs.includes(n.id)) notifCount++; });
                        const badge = notifCount > 0 ? `<span style="background:red; color:white; border-radius:50%; padding:2px 6px; font-size:12px; margin-left:5px;">${notifCount}</span>` : '';
                        
                        navElement.innerHTML = `${isAdmin ? '<a href="admin.html" class="nav-link" style="color:#e53935;font-weight:bold;">👑 Admin</a>' : ''} <a href="ilanlarim.html" class="nav-link">📦 İlanlarım</a> <a href="favoriler.html" class="nav-link">❤️ Favoriler</a> <a href="bildirimler.html" class="nav-link" style="position:relative;">🔔 Bildirimler ${badge}</a> <a href="profil.html" class="nav-link" style="font-weight:bold; color:#1b5e20;">👤 Profil</a> <button id="logout-btn" class="btn-secondary">Çıkış</button> <a href="ilan-ekle.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`;
                        document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
                    });
                });
            } else { navElement.innerHTML = `<a href="giris.html" class="nav-link">Giriş Yap</a><a href="kayit.html" class="nav-link">Kayıt Ol</a> <a href="giris.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`; }
        }
    });

    const listCont = document.getElementById('car-listings') || document.getElementById('my-listings') || document.getElementById('favorites-list');
    if (listCont) {
        auth.onAuthStateChanged(user => {
            const isMyListings = document.getElementById('my-listings') !== null;
            let query = db.collection('listings');
            if (isMyListings) { if(!user) return window.location.href = 'index.html'; query = query.where('ownerEmail', '==', user.email); } 
            else { query = query.where('status', '==', 'approved'); }

            query.get().then(snap => { snap.forEach(d => window.allListings.push({id: d.id, ...d.data()})); window.allListings.reverse(); if(window.applyFilters) window.applyFilters(); });
        });

        document.getElementById('filter-button')?.addEventListener('click', window.applyFilters);
        document.querySelector('.search-box button')?.addEventListener('click', window.applyFilters);
    }

    window.toggleFav = async (e, id) => {
        e.preventDefault(); const user = auth.currentUser; if(!user) return alert("Giriş yapmalısınız!");
        const favRef = db.collection('favorites').doc(`${user.email}_${id}`); const doc = await favRef.get();
        if(doc.exists) { 
            await favRef.delete(); 
            window.userFavorites = window.userFavorites.filter(favId => favId !== id); 
            e.target.innerText = '🤍'; 
        } else { 
            await favRef.set({ email: user.email, listingId: id }); 
            window.userFavorites.push(id); 
            e.target.innerText = '❤️'; 
        }
        if(document.getElementById('favorites-list')) window.applyFilters(); 
    };

    // ==========================================
    // PROFİL SAYFASI MOTORU
    // ==========================================
    if(document.getElementById('prof-email')) {
        auth.onAuthStateChanged(user => {
            if(!user) return window.location.href = 'index.html';
            document.getElementById('prof-email').value = user.email;
            db.collection('users').doc(user.email).get().then(d => {
                if(d.exists) {
                    document.getElementById('prof-name').value = d.data().ad || "Girilmemiş";
                    document.getElementById('prof-surname').value = d.data().soyad || "Girilmemiş";
                }
            });
        });

        document.getElementById('prof-update-btn')?.addEventListener('click', async () => {
            const newPass = document.getElementById('prof-new-pass').value;
            if(newPass.length < 6) return alert("Şifre en az 6 karakter olmalıdır!");
            try { 
                await auth.currentUser.updatePassword(newPass); 
                alert("Şifreniz güncellendi!"); 
                document.getElementById('prof-new-pass').value = ''; 
            } catch(e) { alert("Güvenlik gereği çıkış yapıp tekrar giriş yapmalısınız."); }
        });

        document.getElementById('prof-delete-btn')?.addEventListener('click', async () => {
            const user = auth.currentUser; if(!user) return;
            if(confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) {
                try { 
                    await user.delete(); 
                    await db.collection('users').doc(user.email).delete(); 
                    alert("Hesabınız tamamen silindi."); window.location.href = 'index.html'; 
                } catch(e) { 
                    if(e.code === 'auth/requires-recent-login') {
                        alert("GÜVENLİK UYARISI: Hesabınızı silebilmemiz için yakın zamanda giriş yapmış olmanız gerekiyor. Lütfen ÇIKIŞ YAPIN, tekrar GİRİŞ YAPIN ve silmeyi tekrar deneyin.");
                    } else { alert("Hata: " + e.message); }
                }
            }
        });
    }

    // İLAN EKLEME
    document.getElementById('add-listing-form')?.addEventListener('submit', async function(e) {
        e.preventDefault(); const user = auth.currentUser; if(!user) return alert("Giriş yapmalısınız!");
        const files = document.getElementById('form-image').files; if(files.length === 0) return alert("Fotoğraf seçin!");
        const btn = document.getElementById('submit-btn'); btn.textContent = "Yükleniyor..."; btn.disabled = true;
        try {
            let imageUrls = [];
            for(let i=0; i < files.length; i++) {
                const formData = new FormData(); formData.append('image', files[i]);
                try {
                    const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                    const imgData = await imgRes.json(); 
                    if(imgData && imgData.success && imgData.data && imgData.data.url) imageUrls.push(imgData.data.url);
                } catch (imgError) { console.warn("Fotoğraf engellendi"); }
            }
            
            const validImageUrls = imageUrls.filter(url => url !== undefined && url !== null && url !== "");
            const finalImage = (validImageUrls.length > 0) ? validImageUrls[0] : "https://via.placeholder.com/400?text=Gorsel+Yok";

            let expertiseData = null;
            if(document.getElementById('form-type').value === 'Satılık') {
                if(document.getElementById('form-category').value === 'Otomobil' || document.getElementById('form-category').value === 'Arazi, SUV & Pickup') {
                    expertiseData = { "Kaput": document.getElementById('c-kaput').value, "Tavan": document.getElementById('c-tavan').value, "Bagaj Kapağı": document.getElementById('c-bagaj').value, "Sol Ön Çamurluk": document.getElementById('c-sol-on-camurluk').value, "Sol Ön Kapı": document.getElementById('c-sol-on-kapi').value, "Sol Arka Kapı": document.getElementById('c-sol-arka-kapi').value, "Sol Arka Çamurluk": document.getElementById('c-sol-arka-camurluk').value, "Sağ Ön Çamurluk": document.getElementById('c-sag-on-camurluk').value, "Sağ Ön Kapı": document.getElementById('c-sag-on-kapi').value, "Sağ Arka Kapı": document.getElementById('c-sag-arka-kapi').value, "Sağ Arka Çamurluk": document.getElementById('c-sag-arka-camurluk').value };
                } else if(document.getElementById('form-category').value === 'Motosiklet') {
                    expertiseData = { "Şase": document.getElementById('m-sase').value, "Ön Mesnet": document.getElementById('m-mesnet').value, "Yakıt Deposu": document.getElementById('m-depo').value, "Ön Grenaj / Kafa": document.getElementById('m-on-grenaj').value, "Yan/Arka Grenajlar": document.getElementById('m-yan-grenaj').value };
                }
            }

            await db.collection('listings').add({
                type: document.getElementById('form-type')?.value || "Belirtilmemiş", category: document.getElementById('form-category')?.value || "Belirtilmemiş", title: document.getElementById('form-title')?.value || "Başlıksız", brand: document.getElementById('form-brand')?.value || "", model: document.getElementById('form-model')?.value || "", year: document.getElementById('form-year')?.value || "", km: document.getElementById('form-km')?.value || "0", fuel: document.getElementById('form-fuel')?.value || "", gear: document.getElementById('form-gear')?.value || "", city: document.getElementById('form-city')?.value || "", district: document.getElementById('form-district')?.value || "", price: document.getElementById('form-price')?.value ? Number(document.getElementById('form-price').value).toLocaleString('tr-TR') + " TL" : "0 TL", phone: document.getElementById('form-phone')?.value || "", description: document.getElementById('form-desc')?.value || "", images: validImageUrls.length > 0 ? validImageUrls : [finalImage], image: finalImage, status: "pending", ownerEmail: user.email, createdAt: firebase.firestore.FieldValue.serverTimestamp(), takas: document.getElementById('form-takas') ? document.getElementById('form-takas').value : "Belirtilmemiş", hasarKaydi: document.getElementById('form-hasar-kaydi') ? document.getElementById('form-hasar-kaydi').value : "Yok", tramer: document.getElementById('form-tramer') ? document.getElementById('form-tramer').value : "", expertise: expertiseData
            });
            alert("İlan onaya gönderildi!"); window.location.href = 'index.html';
        } catch (err) { alert("Hata: " + err.message); btn.textContent = "İlanı Onaya Gönder"; btn.disabled = false; }
    });

    const editForm = document.getElementById('edit-listing-form');
    if (editForm) {
        const urlId = new URLSearchParams(window.location.search).get('id');
        if(!urlId) window.location.href = 'ilanlarim.html';

        db.collection('listings').doc(urlId).get().then(d => {
            if(d.exists) {
                const c = d.data();
                document.getElementById('form-title').value = c.title || "";
                if(document.getElementById('form-type')) document.getElementById('form-type').value = c.type;
                
                document.getElementById('form-category').value = c.category; document.getElementById('form-category').dispatchEvent(new Event('change'));
                document.getElementById('form-brand').value = c.brand; document.getElementById('form-brand').dispatchEvent(new Event('change'));
                document.getElementById('form-model').value = c.model; document.getElementById('form-year').value = c.year || ""; document.getElementById('form-km').value = c.km || "";
                
                if(document.getElementById('form-fuel')) document.getElementById('form-fuel').value = c.fuel;
                if(document.getElementById('form-gear')) document.getElementById('form-gear').value = c.gear;
                
                document.getElementById('form-phone').value = c.phone || ""; document.getElementById('form-desc').value = c.description || "";
                if(c.price) document.getElementById('form-price').value = c.price.replace(/[^0-9]/g, '');

                document.getElementById('form-city').value = c.city; document.getElementById('form-city').dispatchEvent(new Event('change'));
                document.getElementById('form-district').value = c.district;

                if(document.getElementById('form-takas')) document.getElementById('form-takas').value = c.takas || "Hayır";
                if(document.getElementById('form-hasar-kaydi')) document.getElementById('form-hasar-kaydi').value = c.hasarKaydi || "Yok";
                if(document.getElementById('form-tramer')) document.getElementById('form-tramer').value = c.tramer || "";

                window.checkFormDisplay();
                if(c.expertise) {
                    for (const [parca, durum] of Object.entries(c.expertise)) {
                        const selectIdMap = { "Kaput": "c-kaput", "Tavan": "c-tavan", "Bagaj Kapağı": "c-bagaj", "Sol Ön Çamurluk": "c-sol-on-camurluk", "Sol Ön Kapı": "c-sol-on-kapi", "Sol Arka Kapı": "c-sol-arka-kapi", "Sol Arka Çamurluk": "c-sol-arka-camurluk", "Sağ Ön Çamurluk": "c-sag-on-camurluk", "Sağ Ön Kapı": "c-sag-on-kapi", "Sağ Arka Kapı": "c-sag-arka-kapi", "Sağ Arka Çamurluk": "c-sag-arka-camurluk", "Şase": "m-sase", "Ön Mesnet": "m-mesnet", "Yakıt Deposu": "m-depo", "Ön Grenaj / Kafa": "m-on-grenaj", "Yan/Arka Grenajlar": "m-yan-grenaj" };
                        const targetId = selectIdMap[parca]; if(targetId && document.getElementById(targetId)) document.getElementById(targetId).value = durum;
                    }
                }
            }
        });

        editForm.addEventListener('submit', async function(e) {
            e.preventDefault(); const user = auth.currentUser; if(!user) return;
            const btn = document.getElementById('submit-btn'); btn.textContent = "Güncelleniyor..."; btn.disabled = true;
            try {
                const files = document.getElementById('form-image').files; let imageUrls = [];
                if(files.length > 0) { for(let i=0; i < files.length; i++) { const formData = new FormData(); formData.append('image', files[i]); const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData }); const imgData = await imgRes.json(); if(imgData && imgData.success && imgData.data && imgData.data.url) imageUrls.push(imgData.data.url); } }
                
                let expertiseData = null;
                if(document.getElementById('form-type').value === 'Satılık') {
                    if(document.getElementById('form-category').value === 'Otomobil' || document.getElementById('form-category').value === 'Arazi, SUV & Pickup') { expertiseData = { "Kaput": document.getElementById('c-kaput').value, "Tavan": document.getElementById('c-tavan').value, "Bagaj Kapağı": document.getElementById('c-bagaj').value, "Sol Ön Çamurluk": document.getElementById('c-sol-on-camurluk').value, "Sol Ön Kapı": document.getElementById('c-sol-on-kapi').value, "Sol Arka Kapı": document.getElementById('c-sol-arka-kapi').value, "Sol Arka Çamurluk": document.getElementById('c-sol-arka-camurluk').value, "Sağ Ön Çamurluk": document.getElementById('c-sag-on-camurluk').value, "Sağ Ön Kapı": document.getElementById('c-sag-on-kapi').value, "Sağ Arka Kapı": document.getElementById('c-sag-arka-kapi').value, "Sağ Arka Çamurluk": document.getElementById('c-sag-arka-camurluk').value }; } 
                    else if(document.getElementById('form-category').value === 'Motosiklet') { expertiseData = { "Şase": document.getElementById('m-sase').value, "Ön Mesnet": document.getElementById('m-mesnet').value, "Yakıt Deposu": document.getElementById('m-depo').value, "Ön Grenaj / Kafa": document.getElementById('m-on-grenaj').value, "Yan/Arka Grenajlar": document.getElementById('m-yan-grenaj').value }; }
                }

                let updateData = { title: document.getElementById('form-title').value || "", type: document.getElementById('form-type')?.value || "", category: document.getElementById('form-category').value || "", brand: document.getElementById('form-brand').value || "", model: document.getElementById('form-model').value || "", year: document.getElementById('form-year').value || "", km: document.getElementById('form-km').value || "", fuel: document.getElementById('form-fuel')?.value || "", gear: document.getElementById('form-gear')?.value || "", city: document.getElementById('form-city').value || "", district: document.getElementById('form-district').value || "", price: document.getElementById('form-price')?.value ? Number(document.getElementById('form-price').value).toLocaleString('tr-TR') + " TL" : "0 TL", phone: document.getElementById('form-phone').value || "", description: document.getElementById('form-desc').value || "", status: "pending", takas: document.getElementById('form-takas') ? document.getElementById('form-takas').value : "Belirtilmemiş", hasarKaydi: document.getElementById('form-hasar-kaydi') ? document.getElementById('form-hasar-kaydi').value : "Yok", tramer: document.getElementById('form-tramer') ? document.getElementById('form-tramer').value : "", expertise: expertiseData };
                
                const validImageUrls = imageUrls.filter(url => url !== undefined && url !== null && url !== "");
                if(validImageUrls.length > 0) { updateData.images = validImageUrls; updateData.image = validImageUrls[0]; }
                
                await db.collection('listings').doc(urlId).update(updateData); alert("İlan güncellendi ve onaya gönderildi!"); window.location.href = 'ilanlarim.html';
            } catch (err) { alert("Hata: " + err.message); btn.textContent = "Değişiklikleri Onaya Gönder"; btn.disabled = false; }
        });
    }

    // KAYIT VE GİRİŞ
    document.getElementById('register-form')?.addEventListener('submit', async e => { e.preventDefault(); const em = e.target.querySelector('input[type="email"]').value; const p1 = document.getElementById('reg-pass').value; if(p1 !== document.getElementById('reg-pass-confirm').value) return alert("Şifreler uyuşmuyor!"); try { const userCred = await auth.createUserWithEmailAndPassword(em, p1); await db.collection('users').doc(em).set({ ad: document.getElementById('reg-name').value, soyad: document.getElementById('reg-surname').value, email: em }); await userCred.user.sendEmailVerification(); await auth.signOut(); alert("Kayıt başarılı! Lütfen e-postanızı onaylayın."); window.location.href = 'giris.html'; } catch(err) { alert(err.message); } });
    document.getElementById('login-form')?.addEventListener('submit', async e => { e.preventDefault(); const em = e.target.querySelector('input[type="email"]').value; const p = e.target.querySelector('input[type="password"]').value; try { const userCred = await auth.signInWithEmailAndPassword(em, p); if(!userCred.user.emailVerified && em !== ADMIN_EMAIL) { await auth.signOut(); return alert("E-postanızı henüz onaylamadınız."); } window.location.href = 'index.html'; } catch(err) { alert("Hatalı Giriş."); } });
});
