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

// İlan verilerini global tutuyoruz (Favoriler sayfasında donmaması için)
window.allListings = [];
window.userFavorites = [];

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
    
    // DEVASA VERİTABANI KISALTMADAN EKLENDİ
    const locDatabase = { "Adana":["Aladağ","Ceyhan","Çukurova","Feke","İmamoğlu","Karaisalı","Karataş","Kozan","Pozantı","Saimbeyli","Sarıçam","Seyhan","Tufanbeyli","Yumurtalık","Yüreğir"], "Adıyaman":["Besni","Çelikhan","Gerger","Gölbaşı","Kahta","Merkez","Samsat","Sincik","Tut"], "Ankara":["Akyurt","Altındağ","Ayaş","Bala","Beypazarı","Çamlıdere","Çankaya","Çubuk","Elmadağ","Etimesgut","Evren","Gölbaşı","Güdül","Haymana","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Mamak","Nallıhan","Polatlı","Pursaklar","Sincan","Şereflikoçhisar","Yenimahalle"], "Antalya":["Akseki","Aksu","Alanya","Demre","Döşemealtı","Elmalı","Finike","Gazipaşa","Gündoğmuş","İbradı","Kaş","Kemer","Kepez","Konyaaltı","Korkuteli","Kumluca","Manavgat","Muratpaşa","Serik"], "Bursa":["Büyükorhan","Gemlik","Gürsu","Harmancık","İnegöl","İznik","Karacabey","Keles","Kestel","Mudanya","Mustafakemalpaşa","Nilüfer","Orhaneli","Orhangazi","Osmangazi","Yenişehir","Yıldırım"], "İstanbul":["Adalar","Arnavutköy","Ataşehir","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Bayrampaşa","Beşiktaş","Beykoz","Beylikdüzü","Beyoğlu","Büyükçekmece","Çatalca","Çekmeköy","Esenler","Esenyurt","Eyüpsultan","Fatih","Gaziosmanpaşa","Güngören","Kadıköy","Kağıthane","Kartal","Küçükçekmece","Maltepe","Pendik","Sancaktepe","Sarıyer","Silivri","Sultanbeyli","Sultangazi","Şile","Şişli","Tuzla","Ümraniye","Üsküdar","Zeytinburnu"], "İzmir":["Aliağa","Balçova","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Buca","Çeşme","Çiğli","Dikili","Foça","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Konak","Menderes","Menemen","Narlıdere","Ödemiş","Seferihisar","Selçuk","Tire","Torbalı","Urla"] };
    
    const masterDB = {
        "Otomobil": {
            "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "R8", "TT", "e-tron GT"], 
            "BMW": ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "6 Serisi", "7 Serisi", "8 Serisi", "M Serisi", "Z4"], 
            "Fiat": ["500", "Albea", "Bravo", "Doblo", "Egea", "Fiorino", "Linea", "Marea", "Palio", "Panda", "Punto", "Siena", "Tempra", "Uno", "Şahin", "Doğan", "Kartal"], 
            "Ford": ["B-Max", "C-Max", "Courier", "Escort", "Fiesta", "Focus", "Fusion", "Kuga", "Mondeo", "Mustang", "Puma", "Taunus", "Transit"], 
            "Honda": ["Accord", "City", "Civic", "CR-V", "CR-X", "HR-V", "Jazz", "S2000"], 
            "Hyundai": ["Accent", "Accent Blue", "Accent Era", "Bayon", "Elantra", "Getz", "i10", "i20", "i30", "Kona", "Sonata", "Tucson"], 
            "Mercedes-Benz": ["A-Serisi", "B-Serisi", "C-Serisi", "CLA", "CLK", "CLS", "E-Serisi", "G-Serisi", "GLA", "GLB", "GLC", "GLE", "S-Serisi", "SLK", "AMG GT"], 
            "Renault": ["Captur", "Clio", "Fluence", "Kadjar", "Kangoo", "Laguna", "Megane", "R 11", "R 12", "R 19", "R 21", "R 9", "Symbol", "Taliant", "Talisman", "Twingo"], 
            "Toyota": ["Auris", "Avensis", "C-HR", "Camry", "Corolla", "Corolla Cross", "Hilux", "Land Cruiser", "RAV4", "Yaris"], 
            "Volkswagen": ["Amarok", "Arteon", "Bora", "Caddy", "Golf", "Jetta", "Passat", "Passat Variant", "Polo", "Scirocco", "T-Roc", "Taigo", "Tiguan", "Touareg", "Touran", "Transporter"]
        },
        "Arazi, SUV & Pickup": {
            "Dacia": ["Duster", "Jogger"], "Nissan": ["Juke", "Navara", "Qashqai", "Skystar", "X-Trail"], "Peugeot": ["2008", "3008", "5008"]
        },
        "Motosiklet": {
            "Honda": ["Activa", "CBR", "CRF", "Dio", "Forza", "PCX", "Spacy", "NC 750", "Gold Wing"], "Yamaha": ["Crypton", "Delight", "FZ", "MT", "NMAX", "R25", "XMAX", "YBR", "TMAX"]
        },
        "Ticari Araçlar & Minivan": { "Fiat": ["Doblo", "Ducato", "Fiorino", "Scudo"], "Ford": ["Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Custom"] }
    };

    function populateSelects() {
        const fc = document.getElementById('form-category'); const fb = document.getElementById('form-brand'); const fm = document.getElementById('form-model');
        const filCat = document.getElementById('filter-category'); const filBrand = document.getElementById('filter-brand');
        const city = document.getElementById('form-city'); const dist = document.getElementById('form-district');

        if(fc) { fc.innerHTML='<option value="">Kategori Seçin</option>'; Object.keys(masterDB).forEach(c => fc.appendChild(new Option(c, c))); }
        if(filCat) { filCat.innerHTML='<option value="all">Tüm Kategoriler</option>'; Object.keys(masterDB).forEach(c => filCat.appendChild(new Option(c, c))); }
        if(fc && fb && fm) {
            fc.addEventListener('change', function() {
                fb.innerHTML='<option value="">Marka Seçin</option>'; fm.innerHTML='<option value="">Önce marka</option>'; fm.disabled=true;
                if(this.value && masterDB[this.value]) { fb.disabled=false; Object.keys(masterDB[this.value]).sort().forEach(b => fb.appendChild(new Option(b, b))); } else { fb.disabled=true; }
            });
            fb.addEventListener('change', function() {
                fm.innerHTML='<option value="">Model</option>'; const cat = fc.value;
                if(this.value && cat && masterDB[cat][this.value]) { fm.disabled=false; masterDB[cat][this.value].sort().forEach(m => fm.appendChild(new Option(m, m))); } else { fm.disabled=true; }
            });
        }
        if(filCat && filBrand) {
            filCat.addEventListener('change', function() {
                filBrand.innerHTML='<option value="all">Tüm Markalar</option>';
                if(this.value !== 'all' && masterDB[this.value]) { Object.keys(masterDB[this.value]).sort().forEach(b => filBrand.appendChild(new Option(b, b))); }
            });
        }
        if(city) { city.innerHTML='<option value="">İl Seçin</option>'; Object.keys(locDatabase).sort().forEach(c => city.appendChild(new Option(c, c))); }
        if(city && dist) {
            city.addEventListener('change', function() {
                dist.innerHTML='<option value="">İlçe Seçin</option>';
                if(this.value && locDatabase[this.value]) { dist.disabled=false; locDatabase[this.value].sort().forEach(d => dist.appendChild(new Option(d, d))); } else { dist.disabled=true; }
            });
        }
    }
    populateSelects();

    // ANA SAYFA TABS (KİRALIK/SATILIK) KONTROLÜ
    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // Stilleri Sıfırla
            document.querySelectorAll('.type-tab').forEach(t => {
                t.style.background = '#fff'; t.style.color = '#333'; t.style.border = '1px solid #ccc';
            });
            // Seçileni Kırmızı Yap
            this.style.background = '#e53935'; this.style.color = '#fff'; this.style.border = 'none';
            
            // Gizli veya açık filtreye değeri aktar
            const typeSelect = document.getElementById('filter-type');
            if(typeSelect) typeSelect.value = this.dataset.type;
            
            // Filtreleri anında çalıştır
            if(window.applyFilters) window.applyFilters();
        });
    });

    const formType = document.getElementById('form-type');
    const formCat = document.getElementById('form-category');
    const expWrapper = document.getElementById('expertise-wrapper');
    const carExp = document.getElementById('car-expertise');
    const motoExp = document.getElementById('moto-expertise');

    function checkFormDisplay() {
        if(!formType || !expWrapper) return;
        if(formType.value === 'Kiralık') {
            expWrapper.style.display = 'none';
        } else {
            expWrapper.style.display = 'block';
            if(formCat.value === 'Otomobil' || formCat.value === 'Arazi, SUV & Pickup') {
                carExp.style.display = 'block'; motoExp.style.display = 'none';
            } else if(formCat.value === 'Motosiklet') {
                carExp.style.display = 'none'; motoExp.style.display = 'block';
            } else {
                carExp.style.display = 'none'; motoExp.style.display = 'none';
            }
        }
    }
    if(formType) formType.addEventListener('change', checkFormDisplay);
    if(formCat) formCat.addEventListener('change', checkFormDisplay);

    const engine = await startEngine();
    if(!engine) return; 
    let auth = engine.auth; 
    let db = engine.db;

    const navElement = document.getElementById('main-nav');

    // ==========================================
    // DONMAYI ÖNLEYEN GLOBAL FİLTRELEME SİSTEMİ
    // ==========================================
    window.applyFilters = function() {
        const listCont = document.getElementById('car-listings') || document.getElementById('my-listings') || document.getElementById('favorites-list');
        if(!listCont) return;

        const isFavPage = document.getElementById('favorites-list') !== null;
        const isMyListings = document.getElementById('my-listings') !== null;
        
        // Arama kutusu o sayfada yoksa hata vermesin diye kontrol
        const searchInput = document.querySelector('.search-box input');
        const filterType = document.getElementById('filter-type');
        const filterCat = document.getElementById('filter-category');
        const filterBrand = document.getElementById('filter-brand');

        const f = {
            type: filterType ? filterType.value : 'all',
            category: filterCat ? filterCat.value : 'all',
            brand: filterBrand ? filterBrand.value : 'all',
            search: searchInput ? searchInput.value.toLowerCase().trim() : ""
        };

        listCont.innerHTML = '';
        const filtered = window.allListings.filter(c => {
            if(isFavPage && !window.userFavorites.includes(c.id)) return false;
            if(f.type !== 'all' && c.type !== f.type) return false;
            if(f.category !== 'all' && c.category !== f.category) return false;
            if(f.brand !== 'all' && c.brand !== f.brand) return false;
            if(f.search && !`${c.title} ${c.brand} ${c.model} ${c.city}`.toLowerCase().includes(f.search)) return false;
            return true;
        });

        if(!filtered.length) { 
            listCont.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">İlan bulunamadı.</p>'; 
            return; 
        }
        
        filtered.forEach(c => {
            const coverImage = (c.images && c.images.length > 0) ? c.images[0] : (c.image || 'https://via.placeholder.com/400');
            let statusBadge = ''; let editBtn = '';
            const heartIcon = window.userFavorites.includes(c.id) ? '❤️' : '🤍';

            // YAMUKLUK ÇÖZÜLDÜ: Düzenle butonu <a> etiketi yerine <button> yapıldı.
            if(isMyListings) {
                if(c.status === 'pending') statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#fbc02d; color:#000; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">⏳ Onay Bekliyor</span>`;
                else if(c.status === 'rejected') statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#d32f2f; color:#fff; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">❌ Reddedildi</span>`;
                else statusBadge = `<span style="position:absolute; top:10px; left:10px; background:#388e3c; color:#fff; padding:4px 8px; font-size:12px; border-radius:4px; font-weight:bold; z-index:5;">✅ Yayında</span>`;
                
                editBtn = `<button onclick="window.location.href='ilan-duzenle.html?id=${c.id}'; event.preventDefault();" style="position:absolute; top:10px; right:10px; background:#2196F3; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; font-size:12px; border:none; z-index:10; cursor:pointer;">✏️ Düzenle</button>`;
            }

            // KART TASARIMI BETONLANDI
            listCont.innerHTML += `
                <a href="detay.html?id=${c.id}" class="card" style="display:flex; flex-direction:column; position:relative; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1); text-decoration:none; color:inherit;">
                    ${statusBadge}
                    ${editBtn}
                    ${!isMyListings ? `<button onclick="toggleFav(event, '${c.id}')" style="position:absolute; top:10px; right:10px; background:white; border:none; border-radius:50%; padding:8px; cursor:pointer; z-index:10; font-size:16px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${heartIcon}</button>` : ''}
                    <div class="card-img-container" style="position:relative; width:100%; height:200px; background:#eee;">
                        <img src="${coverImage}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="card-content" style="padding:15px; display:flex; flex-direction:column; flex-grow:1;">
                        <h3 style="font-size:16px; margin-bottom:10px; color:#333;">${c.title}</h3>
                        <p class="price" style="font-size:18px; font-weight:bold; color:#e53935; margin-bottom:5px;">${c.price}</p>
                        <p class="details" style="font-size:13px; color:#777; margin-top:auto;">${c.city} • ${c.category}</p>
                    </div>
                </a>`;
        });
    };

    auth.onAuthStateChanged(user => {
        if (navElement) {
            if (user) { 
                const isAdmin = user.email === ADMIN_EMAIL;
                
                // Favorileri Çek
                db.collection('favorites').where('email', '==', user.email).get().then(snap => { 
                    window.userFavorites = snap.docs.map(d => d.data().listingId); 
                    if(document.getElementById('car-listings') || document.getElementById('favorites-list')) window.applyFilters(); 
                });
                
                // Bildirim ve Navbar Ayarı
                db.collection('listings').where('ownerEmail', '==', user.email).where('status', '==', 'rejected').get().then(snap1 => {
                    db.collection('notifications').where('to', 'in', ['all', user.email]).get().then(snap2 => {
                        const readNotifs = JSON.parse(localStorage.getItem('readNotifs') || '[]'); let notifCount = snap1.size;
                        snap2.forEach(n => { if(!readNotifs.includes(n.id)) notifCount++; });
                        const badge = notifCount > 0 ? `<span style="background:red; color:white; border-radius:50%; padding:2px 6px; font-size:12px; margin-left:5px;">${notifCount}</span>` : '';
                        
                        navElement.innerHTML = `${isAdmin ? '<a href="admin.html" class="nav-link" style="color:#e53935;font-weight:bold;">👑 Admin</a>' : ''} <a href="ilanlarim.html" class="nav-link">📦 İlanlarım</a> <a href="favoriler.html" class="nav-link">❤️ Favoriler</a> <a href="bildirimler.html" class="nav-link" style="position:relative;">🔔 Bildirimler ${badge}</a> <a href="profil.html" class="nav-link" style="font-weight:bold; color:#1b5e20;">👤 Profil</a> <button id="logout-btn" class="btn-secondary">Çıkış</button> <a href="ilan-ekle.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`;
                        document.getElementById('logout-btn')?.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
                    });
                });
            } else { 
                navElement.innerHTML = `<a href="giris.html" class="nav-link">Giriş Yap</a><a href="kayit.html" class="nav-link">Kayıt Ol</a> <a href="giris.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`; 
            }
        }
    });

    // İLANLARI VERİTABANINDAN ÇEKME (Ana Sayfa, Favoriler ve İlanlarım için)
    const listCont = document.getElementById('car-listings') || document.getElementById('my-listings') || document.getElementById('favorites-list');
    if (listCont) {
        auth.onAuthStateChanged(user => {
            const isMyListings = document.getElementById('my-listings') !== null;
            let query = db.collection('listings');
            if (isMyListings) { if(!user) return window.location.href = 'index.html'; query = query.where('ownerEmail', '==', user.email); } 
            else { query = query.where('status', '==', 'approved'); }

            query.get().then(snap => { 
                snap.forEach(d => window.allListings.push({id: d.id, ...d.data()})); 
                window.allListings.reverse(); 
                if(window.applyFilters) window.applyFilters(); 
            });
        });

        document.getElementById('filter-button')?.addEventListener('click', window.applyFilters);
        document.querySelector('.btn-search')?.addEventListener('click', window.applyFilters);
    }

    // FAVORİ EKLE/ÇIKAR FONKSİYONU
    window.toggleFav = async (e, id) => {
        e.preventDefault(); const user = auth.currentUser; if(!user) return alert("Giriş yapmalısınız!");
        const favRef = db.collection('favorites').doc(`${user.email}_${id}`); const doc = await favRef.get();
        if(doc.exists) { await favRef.delete(); window.userFavorites = window.userFavorites.filter(favId => favId !== id); e.target.innerText = '🤍'; } 
        else { await favRef.set({ email: user.email, listingId: id }); window.userFavorites.push(id); e.target.innerText = '❤️'; }
        if(document.getElementById('favorites-list') && doc.exists) window.applyFilters(); 
    };

    // İLAN DÜZENLEME MOTORU (ÇÖKME KORUMALI)
    const editForm = document.getElementById('edit-listing-form');
    if (editForm) {
        const urlId = newSearchParams(window.location.search).get('id');
        if(!urlId) window.location.href = 'ilanlarim.html';
        db.collection('listings').doc(urlId).get().then(d => {
            if(d.exists) {
                const c = d.data();
                document.getElementById('form-title').value = c.title || "";
                if(document.getElementById('form-type')) document.getElementById('form-type').value = c.type;
                document.getElementById('form-brand').value = c.brand || "";
                document.getElementById('form-model').value = c.model || "";
                document.getElementById('form-year').value = c.year || "";
                document.getElementById('form-km').value = c.km || "";
                if(document.getElementById('form-fuel')) document.getElementById('form-fuel').value = c.fuel;
                if(document.getElementById('form-gear')) document.getElementById('form-gear').value = c.gear;
                document.getElementById('form-phone').value = c.phone || "";
                document.getElementById('form-desc').value = c.description || "";
                if(c.price) document.getElementById('form-price').value = c.price.replace(/[^0-9]/g, '');
            }
        });
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault(); const user = auth.currentUser; if(!user) return;
            const btn = document.getElementById('submit-btn'); btn.textContent = "Güncelleniyor..."; btn.disabled = true;
            try {
                let updateData = {
                    title: document.getElementById('form-title').value || "", type: document.getElementById('form-type')?.value || "", brand: document.getElementById('form-brand').value || "", model: document.getElementById('form-model').value || "", year: document.getElementById('form-year').value || "", km: document.getElementById('form-km').value || "", fuel: document.getElementById('form-fuel')?.value || "", gear: document.getElementById('form-gear')?.value || "", price: document.getElementById('form-price')?.value ? Number(document.getElementById('form-price').value).toLocaleString('tr-TR') + " TL" : "0 TL", phone: document.getElementById('form-phone').value || "", description: document.getElementById('form-desc').value || "", status: "pending" 
                };
                await db.collection('listings').doc(urlId).update(updateData);
                alert("İlan güncellendi ve onaya gönderildi!"); window.location.href = 'ilanlarim.html';
            } catch (err) { alert("Hata: " + err.message); btn.textContent = "Değişiklikleri Onaya Gönder"; btn.disabled = false; }
        });
    }

    // KAYIT, GİRİŞ VE DİĞER FONKSİYONLAR...
    document.getElementById('register-form')?.addEventListener('submit', async e => { e.preventDefault(); const em = e.target.querySelector('input[type="email"]').value; const p1 = document.getElementById('reg-pass').value; if(p1 !== document.getElementById('reg-pass-confirm').value) return alert("Şifreler uyuşmuyor!"); try { const userCred = await auth.createUserWithEmailAndPassword(em, p1); await db.collection('users').doc(em).set({ ad: document.getElementById('reg-name').value, soyad: document.getElementById('reg-surname').value, email: em }); await userCred.user.sendEmailVerification(); await auth.signOut(); alert("Kayıt başarılı! Lütfen e-postanızı onaylayın."); window.location.href = 'giris.html'; } catch(err) { alert(err.message); } });
    document.getElementById('login-form')?.addEventListener('submit', async e => { e.preventDefault(); const em = e.target.querySelector('input[type="email"]').value; const p = e.target.querySelector('input[type="password"]').value; try { const userCred = await auth.signInWithEmailAndPassword(em, p); if(!userCred.user.emailVerified && em !== ADMIN_EMAIL) { await auth.signOut(); return alert("E-postanızı henüz onaylamadınız."); } window.location.href = 'index.html'; } catch(err) { alert("Hatalı Giriş."); } });
});
