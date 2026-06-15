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

async function startEngine() {
    try {
        for (let src of firebaseScripts) {
            await new Promise((res, rej) => { 
                const s = document.createElement('script'); 
                s.src = src; 
                s.onload = res; 
                s.onerror = () => { console.warn("Firebase yüklenemedi!"); res(); };
                document.head.appendChild(s); 
            });
        }
        if(!window.firebase) return null;

        firebase.initializeApp({
            apiKey: "AIzaSyB8fJs85fOFVpgU8gwwZ6gFWhBGrrt-V7Y",
            authDomain: "otosat-bd489.firebaseapp.com",
            projectId: "otosat-bd489",
            storageBucket: "otosat-bd489.firebasestorage.app",
            messagingSenderId: "1039910151531",
            appId: "1:1039910151531:web:841af972dd50dc6ed4982e"
        });
        return { auth: firebase.auth(), db: firebase.firestore() };
    } catch(e) {
        console.error(e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    
    const locDatabase = { "Adana":["Çukurova","Seyhan"], "Ankara":["Çankaya","Keçiören"], "İstanbul":["Kadıköy","Şişli","Beşiktaş"], "İzmir":["Bornova","Buca"] }; 
    const masterDB = {
        "Otomobil": {"Audi": ["A3", "A4"], "BMW": ["3 Serisi", "5 Serisi"], "Fiat": ["Egea", "Linea"], "Renault": ["Clio", "Megane"], "Volkswagen": ["Golf", "Passat"]},
        "Arazi, SUV & Pickup": {"Dacia": ["Duster"], "Nissan": ["Qashqai"], "Peugeot": ["3008"]},
        "Motosiklet": {"Honda": ["Dio", "PCX"], "Yamaha": ["MT-07", "NMAX"]}
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

    // FORMU DİNAMİK GİZLE/GÖSTER
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
    if(!engine) return; // Motor yüklenemezse HTML'deki sabit butonlar kalır, çökmez.
    
    let auth = engine.auth; 
    let db = engine.db;

    const navElement = document.querySelector('nav');
    let userFavorites = [];

    // OTURUM KONTROLÜ VE NAVBAR GÜNCELLEMESİ
    auth.onAuthStateChanged(user => {
        if (navElement) {
            if (user) { 
                const isAdmin = user.email === ADMIN_EMAIL;
                db.collection('favorites').where('email', '==', user.email).get().then(snap => { userFavorites = snap.docs.map(d => d.data().listingId); if(document.getElementById('car-listings') || document.getElementById('favorites-list')) applyFilters(); });
                db.collection('listings').where('ownerEmail', '==', user.email).where('status', '==', 'rejected').get().then(snap1 => {
                    db.collection('notifications').where('to', 'in', ['all', user.email]).get().then(snap2 => {
                        const readNotifs = JSON.parse(localStorage.getItem('readNotifs') || '[]'); let notifCount = snap1.size;
                        snap2.forEach(n => { if(!readNotifs.includes(n.id)) notifCount++; });
                        const badge = notifCount > 0 ? `<span style="background:red; color:white; border-radius:50%; padding:2px 6px; font-size:12px; margin-left:5px;">${notifCount}</span>` : '';
                        
                        // Giriş yapılıysa menüyü değiştir
                        navElement.innerHTML = `${isAdmin ? '<a href="admin.html" class="nav-link" style="color:#e53935;font-weight:bold;">👑 Admin</a>' : ''} <a href="ilanlarim.html" class="nav-link">📦 İlanlarım</a> <a href="favoriler.html" class="nav-link">❤️ Favoriler</a> <a href="bildirimler.html" class="nav-link" style="position:relative;">🔔 Bildirimler ${badge}</a> <a href="profil.html" class="nav-link" style="font-weight:bold; color:#1b5e20;">👤 Profil</a> <button id="logout-btn" class="btn-secondary">Çıkış</button> <a href="ilan-ekle.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`;
                        document.getElementById('logout-btn').addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
                    });
                });
            } else { 
                // Çıkış yapılıysa sabit HTML'i koru veya emin olmak için tekrar yaz
                navElement.innerHTML = `<a href="giris.html" class="nav-link">Giriş Yap</a><a href="kayit.html" class="nav-link">Kayıt Ol</a> <a href="giris.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`; 
            }
        }
    });

    // KAYIT, GİRİŞ VE ŞİFRE UNUTTUM
    document.getElementById('register-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const em = e.target.querySelector('input[type="email"]').value; 
        const p1 = document.getElementById('reg-pass').value;
        const ad = document.getElementById('reg-name').value;
        const soyad = document.getElementById('reg-surname').value;

        if(p1 !== document.getElementById('reg-pass-confirm').value) return alert("Şifreler uyuşmuyor!");
        try {
            const userCred = await auth.createUserWithEmailAndPassword(em, p1);
            await db.collection('users').doc(em).set({ ad: ad, soyad: soyad, email: em });
            await userCred.user.sendEmailVerification();
            await auth.signOut();
            alert("Kayıt başarılı! Lütfen e-posta adresinize gelen doğrulama linkine tıklayarak hesabınızı onaylayın.");
            window.location.href = 'giris.html'; 
        } catch(err) { alert(err.message); }
    });

    document.getElementById('login-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const em = e.target.querySelector('input[type="email"]').value; const p = e.target.querySelector('input[type="password"]').value;
        try {
            const userCred = await auth.signInWithEmailAndPassword(em, p);
            if(!userCred.user.emailVerified && em !== ADMIN_EMAIL) {
                await auth.signOut();
                return alert("E-posta adresinizi henüz onaylamadınız. Lütfen doğrulama linkine tıklayın.");
            }
            window.location.href = 'index.html';
        } catch(err) { alert("Hatalı E-Posta veya Şifre."); }
    });

    document.getElementById('forgot-password')?.addEventListener('click', e => {
        e.preventDefault();
        const email = prompt("Şifresini sıfırlamak istediğiniz E-Posta adresini girin:");
        if(email) {
            auth.sendPasswordResetEmail(email)
                .then(() => alert("Şifre sıfırlama bağlantısı e-postanıza gönderildi!"))
                .catch(err => alert("Hata: " + err.message));
        }
    });

    // PROFİL AYARLARI VE HESAP SİLME
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

        document.getElementById('prof-update-btn').addEventListener('click', async () => {
            const newPass = document.getElementById('prof-new-pass').value;
            if(newPass.length < 6) return alert("Şifre en az 6 karakter olmalıdır!");
            try {
                await auth.currentUser.updatePassword(newPass);
                alert("Şifreniz güncellendi!"); document.getElementById('prof-new-pass').value = '';
            } catch(e) { alert("Güvenlik gereği çıkış yapıp tekrar giriş yapmalısınız."); }
        });

        document.getElementById('prof-delete-btn')?.addEventListener('click', async () => {
            const user = auth.currentUser; if(!user) return;
            if(confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) {
                try {
                    await db.collection('users').doc(user.email).delete();
                    await user.delete();
                    alert("Hesabınız silindi."); window.location.href = 'index.html';
                } catch(e) { alert("Lütfen çıkış yapıp tekrar girdikten sonra deneyin."); }
            }
        });
    }

    // İLAN EKLEME (ÇÖKME KORUMALI)
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
            if(formType.value === 'Satılık') {
                if(formCat.value === 'Otomobil' || formCat.value === 'Arazi, SUV & Pickup') {
                    expertiseData = {
                        "Kaput": document.getElementById('c-kaput').value, "Tavan": document.getElementById('c-tavan').value,
                        "Bagaj Kapağı": document.getElementById('c-bagaj').value, "Sol Ön Çamurluk": document.getElementById('c-sol-on-camurluk').value,
                        "Sol Ön Kapı": document.getElementById('c-sol-on-kapi').value, "Sol Arka Kapı": document.getElementById('c-sol-arka-kapi').value,
                        "Sol Arka Çamurluk": document.getElementById('c-sol-arka-camurluk').value, "Sağ Ön Çamurluk": document.getElementById('c-sag-on-camurluk').value,
                        "Sağ Ön Kapı": document.getElementById('c-sag-on-kapi').value, "Sağ Arka Kapı": document.getElementById('c-sag-arka-kapi').value,
                        "Sağ Arka Çamurluk": document.getElementById('c-sag-arka-camurluk').value
                    };
                } else if(formCat.value === 'Motosiklet') {
                    expertiseData = {
                        "Şase": document.getElementById('m-sase').value, "Ön Mesnet": document.getElementById('m-mesnet').value,
                        "Yakıt Deposu": document.getElementById('m-depo').value, "Ön Grenaj / Kafa": document.getElementById('m-on-grenaj').value,
                        "Yan/Arka Grenajlar": document.getElementById('m-yan-grenaj').value
                    };
                }
            }

            await db.collection('listings').add({
                type: document.getElementById('form-type')?.value || "Belirtilmemiş", 
                category: document.getElementById('form-category')?.value || "Belirtilmemiş", 
                title: document.getElementById('form-title')?.value || "Başlıksız", 
                brand: document.getElementById('form-brand')?.value || "",
                model: document.getElementById('form-model')?.value || "", 
                year: document.getElementById('form-year')?.value || "", 
                km: document.getElementById('form-km')?.value || "0", 
                fuel: document.getElementById('form-fuel')?.value || "", 
                gear: document.getElementById('form-gear')?.value || "", 
                city: document.getElementById('form-city')?.value || "", 
                district: document.getElementById('form-district')?.value || "", 
                price: document.getElementById('form-price')?.value ? Number(document.getElementById('form-price').value).toLocaleString('tr-TR') + " TL" : "0 TL", 
                phone: document.getElementById('form-phone')?.value || "", 
                description: document.getElementById('form-desc')?.value || "",
                images: validImageUrls.length > 0 ? validImageUrls : [finalImage], 
                image: finalImage, 
                status: "pending", 
                ownerEmail: user.email, 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                takas: document.getElementById('form-takas') ? document.getElementById('form-takas').value : "Belirtilmemiş",
                hasarKaydi: document.getElementById('form-hasar-kaydi') ? document.getElementById('form-hasar-kaydi').value : "Yok",
                tramer: document.getElementById('form-tramer') ? document.getElementById('form-tramer').value : "",
                expertise: expertiseData
            });
            alert("İlan onaya gönderildi!"); window.location.href = 'index.html';
        } catch (err) { alert("Hata: " + err.message); btn.textContent = "İlanı Onaya Gönder"; btn.disabled = false; }
    });

    // İLAN DÜZENLEME MOTORU
    const editForm = document.getElementById('edit-listing-form');
    if (editForm) {
        const urlId = new URLSearchParams(window.location.search).get('id');
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
                const files = document.getElementById('form-image').files;
                let imageUrls = [];
                if(files.length > 0) {
                    for(let i=0; i < files.length; i++) {
                        const formData = new FormData(); formData.append('image', files[i]);
                        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
                        const imgData = await imgRes.json(); 
                        if(imgData && imgData.success && imgData.data && imgData.data.url) imageUrls.push(imgData.data.url);
                    }
                }
                
                let updateData = {
                    title: document.getElementById('form-title').value || "",
                    type: document.getElementById('form-type')?.value || "",
                    brand: document.getElementById('form-brand').value || "",
                    model: document.getElementById('form-model').value || "",
                    year: document.getElementById('form-year').value || "",
                    km: document.getElementById('form-km').value || "",
                    fuel: document.getElementById('form-fuel')?.value || "",
                    gear: document.getElementById('form-gear')?.value || "",
                    price: document.getElementById('form-price')?.value ? Number(document.getElementById('form-price').value).toLocaleString('tr-TR') + " TL" : "0 TL",
                    phone: document.getElementById('form-phone').value || "",
                    description: document.getElementById('form-desc').value || "",
                    status: "pending" 
                };

                const validImageUrls = imageUrls.filter(url => url !== undefined && url !== null && url !== "");
                if(validImageUrls.length > 0) { 
                    updateData.images = validImageUrls; 
                    updateData.image = validImageUrls[0]; 
                }
                
                await db.collection('listings').doc(urlId).update(updateData);
                alert("İlan güncellendi ve onaya gönderildi!"); window.location.href = 'ilanlarim.html';
            } catch (err) { alert("Hata: " + err.message); btn.textContent = "Değişiklikleri Onaya Gönder"; btn.disabled = false; }
        });
    }

    window.toggleFav = async (e, id) => {
        e.preventDefault(); const user = auth.currentUser; if(!user) return alert("Giriş yapmalısınız!");
        const favRef = db.collection('favorites').doc(`${user.email}_${id}`); const doc = await favRef.get();
        if(doc.exists) { await favRef.delete(); userFavorites = userFavorites.filter(favId => favId !== id); e.target.innerText = '🤍'; } 
        else { await favRef.set({ email: user.email, listingId: id }); userFavorites.push(id); e.target.innerText = '❤️'; }
        if(document.getElementById('favorites-list') && doc.exists) applyFilters(); 
    };

    // VİTRİN / İLANLARIM FİLTRESİ
    const listCont = document.getElementById('car-listings') || document.getElementById('my-listings');
    let allListings = [];
    if (listCont) {
        auth.onAuthStateChanged(user => {
            const isMyListings = document.getElementById('my-listings') !== null;
            let query = db.collection('listings');
            if (isMyListings) { if(!user) return window.location.href = 'index.html'; query = query.where('ownerEmail', '==', user.email); } 
            else { query = query.where('status', '==', 'approved'); }

            query.get().then(snap => { snap.forEach(d => allListings.push({id: d.id, ...d.data()})); allListings.reverse(); applyFilters(); });
        });

        document.getElementById('filter-button')?.addEventListener('click', applyFilters);
        document.querySelector('.btn-search')?.addEventListener('click', applyFilters);
        
        function applyFilters() {
            const isMyListings = document.getElementById('my-listings') !== null;
            const f = {
                type: document.getElementById('filter-type') ? document.getElementById('filter-type').value : 'all',
                category: document.getElementById('filter-category') ? document.getElementById('filter-category').value : 'all',
                brand: document.getElementById('filter-brand') ? document.getElementById('filter-brand').value : 'all',
                search: document.querySelector('.search-box input') ? document.querySelector('.search-box input').value.toLowerCase().trim() : ""
            };

            listCont.innerHTML = '';
            const filtered = allListings.filter(c => {
                if(f.type !== 'all' && c.type !== f.type) return false;
                if(f.category !== 'all' && c.category !== f.category) return false;
                if(f.brand !== 'all' && c.brand !== f.brand) return false;
                if(f.search && !`${c.title} ${c.brand} ${c.model} ${c.city}`.toLowerCase().includes(f.search)) return false;
                return true;
            });

            if(!filtered.length) { listCont.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">İlan bulunamadı.</p>'; return; }
            
            filtered.forEach(c => {
                const coverImage = (c.images && c.images.length > 0) ? c.images[0] : (c.image || 'https://via.placeholder.com/400');
                let statusBadge = ''; let editBtn = '';
                const heartIcon = userFavorites.includes(c.id) ? '❤️' : '🤍';

                if(isMyListings) {
                    if(c.status === 'pending') statusBadge = `<span class="badge-type" style="background:#fbc02d; color:#000;">⏳ Onay Bekliyor</span>`;
                    else if(c.status === 'rejected') statusBadge = `<span class="badge-type" style="background:#d32f2f;">❌ Reddedildi</span>`;
                    else statusBadge = `<span class="badge-type" style="background:#388e3c;">✅ Yayında</span>`;
                    editBtn = `<a href="ilan-duzenle.html?id=${c.id}" style="position:absolute; top:10px; right:10px; background:#2196F3; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; font-size:12px; z-index:10; text-decoration:none;">✏️ Düzenle</a>`;
                }

                listCont.innerHTML += `
                    <a href="detay.html?id=${c.id}" class="card">
                        ${statusBadge} ${editBtn}
                        ${!isMyListings ? `<button onclick="toggleFav(event, '${c.id}')" style="position:absolute; top:10px; right:10px; background:white; border:none; border-radius:50%; padding:8px; cursor:pointer; z-index:10; font-size:16px;">${heartIcon}</button>` : ''}
                        <div class="card-img-container"><img src="${coverImage}"></div>
                        <div class="card-content"><h3>${c.title}</h3><p class="price">${c.price}</p><p class="details">${c.city} • ${c.category}</p></div>
                    </a>`;
            });
        }
    }

    // DETAY SAYFASI (EKSPERTİZ TABLOSU VE ROZETSİZ TASARIM)
    if (document.getElementById('det-title')) {
        const id = new URLSearchParams(window.location.search).get('id');
        if(id) {
            db.collection('listings').doc(id).get().then(d => {
                if(d.exists) {
                    const c = d.data();
                    document.getElementById('det-title').textContent = c.title; document.getElementById('det-price').textContent = c.price;
                    document.getElementById('det-loc').textContent = c.city + ' / ' + c.district;
                    document.getElementById('det-brand').textContent = c.brand; document.getElementById('det-model').textContent = c.model;
                    document.getElementById('det-year').textContent = c.year; document.getElementById('det-km').textContent = c.km + ' km';
                    document.getElementById('det-gear').textContent = c.gear; document.getElementById('det-fuel').textContent = c.fuel;
                    document.getElementById('det-phone').textContent = c.phone; document.getElementById('det-desc').textContent = c.description;
                    document.getElementById('det-cat').textContent = c.category;
                    
                    const tb = document.getElementById('det-type'); tb.textContent = c.type; if(c.type === 'Kiralık') tb.style.background = '#2196F3';
                    const mainImg = document.getElementById('det-img'); const thumbnailsCont = document.getElementById('det-thumbnails');
                    const photos = (c.images && c.images.length > 0) ? c.images : [c.image || 'https://via.placeholder.com/400'];
                    mainImg.src = photos[0]; 
                    if(thumbnailsCont) { thumbnailsCont.innerHTML = ''; photos.forEach(url => { const img = document.createElement('img'); img.src = url; img.onclick = () => mainImg.src = url; thumbnailsCont.appendChild(img); }); }

                    // TAKAS, HASAR, TRAMER TABLO BİLGİLERİ (ROZETSİZ)
                    if(c.type === 'Satılık') {
                        document.getElementById('extra-details').style.display = 'block';
                        document.getElementById('det-takas').textContent = c.takas === 'Evet' ? 'Açık' : 'Kapalı';
                        const hasarSpan = document.getElementById('det-hasar');
                        if(c.hasarKaydi === 'Var') { hasarSpan.textContent = 'Var (Ağır Hasarlı)'; hasarSpan.style.color = '#d32f2f'; }
                        else { hasarSpan.textContent = 'Yok'; hasarSpan.style.color = '#388e3c'; }
                        document.getElementById('det-tramer').textContent = c.tramer ? c.tramer + " TL" : "Belirtilmemiş";
                    }

                    // EKSPERTİZ ŞEMASI ÇİZİMİ
                    const expSec = document.getElementById('expertise-section');
                    const expGrid = document.getElementById('det-expertise');
                    if(expSec && expGrid && c.expertise) {
                        let hasData = false;
                        for (const [parca, durum] of Object.entries(c.expertise)) {
                            if(durum !== 'Belirtilmemiş') {
                                hasData = true;
                                let colorClass = "exp-yok";
                                if(durum.includes('Orijinal')) colorClass = "exp-orijinal";
                                else if(durum === 'Boyalı') colorClass = "exp-boyali";
                                else if(durum.includes('Lokal')) colorClass = "exp-lokal";
                                else if(durum.includes('Değişen') || durum.includes('İşlemli')) colorClass = "exp-degisen";

                                expGrid.innerHTML += `<div class="exp-box ${colorClass}"><span>${parca}</span><span style="font-weight:normal; font-size:11px;">${durum}</span></div>`;
                            }
                        }
                        if(hasData) expSec.style.display = 'block';
                    }
                }
            });
        }
    }

    // BİLDİRİMLER LİSTESİ VE ADMIN (GİZLENDİ, BİLDİRİMLER.HTML'DE DEVAM)
    // SADECE GEREKLİ KODLARI KORUDUK...
});
