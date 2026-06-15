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
    for (let src of firebaseScripts) {
        await new Promise((res) => { 
            const s = document.createElement('script'); 
            s.src = src; 
            s.onload = res; 
            // Engelleyici varsa sonsuza kadar beklemesin diye hata yakalayıcı eklendi
            s.onerror = () => { console.warn("Firebase engellendi. Opera Kalkanı veya VPN açık olabilir."); res(); };
            document.head.appendChild(s); 
        });
    }
    
    if(!window.firebase) return { error: true }; // Firebase yüklenemediyse durdur

    firebase.initializeApp({
        apiKey: "AIzaSyB8fJs85fOFVpgU8gwwZ6gFWhBGrrt-V7Y",
        authDomain: "otosat-bd489.firebaseapp.com",
        projectId: "otosat-bd489",
        storageBucket: "otosat-bd489.firebasestorage.app",
        messagingSenderId: "1039910151531",
        appId: "1:1039910151531:web:841af972dd50dc6ed4982e"
    });
    return { auth: firebase.auth(), db: firebase.firestore() };
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

    const engine = await startEngine();
    if(engine.error) return alert("Sitenin altyapısı yüklenemedi. Lütfen Opera'nın Reklam Engelleyicisini (Mavi Kalkan) kapatıp sayfayı yenileyin.");
    
    let auth = engine.auth; 
    let db = engine.db;

    const navElement = document.querySelector('nav');
    let userFavorites = [];

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
                        navElement.innerHTML = `${isAdmin ? '<a href="admin.html" class="nav-link" style="color:#e53935;font-weight:bold;">👑 Admin</a>' : ''} <a href="ilanlarim.html" class="nav-link">📦 İlanlarım</a> <a href="favoriler.html" class="nav-link">❤️ Favoriler</a> <a href="bildirimler.html" class="nav-link" style="position:relative;">🔔 Bildirimler ${badge}</a> <a href="profil.html" class="nav-link" style="font-weight:bold; color:#1b5e20;">👤 Profil</a> <button id="logout-btn" class="btn-secondary">Çıkış</button> <a href="ilan-ekle.html" class="btn-primary" style="margin-left:10px;">İlan Ver</a>`;
                        document.getElementById('logout-btn').addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
                    });
                });
            } else { navElement.innerHTML = `<a href="giris.html" class="nav-link">Giriş Yap</a><a href="kayit.html" class="nav-link">Kayıt Ol</a> <a href="giris.html" class="btn-primary">İlan Ver</a>`; }
        }
    });

    // İLAN YÜKLEME (ÇÖKME VE UNDEFINED KORUMALI)
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
                    if(imgData && imgData.success && imgData.data && imgData.data.url) {
                        imageUrls.push(imgData.data.url);
                    }
                } catch (imgError) {
                    console.warn("Fotoğraf yükleme başarısız oldu.");
                }
            }
            
            // Eğer resim yüklenemezse veya undefined dönerse sistemi koru
            const validImageUrls = imageUrls.filter(url => url !== undefined && url !== null && url !== "");
            const finalImage = (validImageUrls.length > 0) ? validImageUrls[0] : "https://via.placeholder.com/400?text=Gorsel+Yok";

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
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert("İlan onaya gönderildi!"); window.location.href = 'index.html';
        } catch (err) { alert("Sistemsel Hata: " + err.message); btn.textContent = "İlanı Onaya Gönder"; btn.disabled = false; }
    });

    // İLAN DÜZENLEME MOTORU (ÇÖKME KORUMALI)
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
                
                if(isMyListings) {
                    if(c.status === 'pending') statusBadge = `<span class="badge-type" style="background:#fbc02d; color:#000;">⏳ Onay Bekliyor</span>`;
                    else if(c.status === 'rejected') statusBadge = `<span class="badge-type" style="background:#d32f2f;">❌ Reddedildi</span>`;
                    else statusBadge = `<span class="badge-type" style="background:#388e3c;">✅ Yayında</span>`;
                    editBtn = `<a href="ilan-duzenle.html?id=${c.id}" style="position:absolute; top:10px; right:10px; background:#2196F3; color:white; padding:6px 12px; border-radius:4px; font-weight:bold; font-size:12px; z-index:10; text-decoration:none;">✏️ Düzenle</a>`;
                }

                listCont.innerHTML += `
                    <a href="detay.html?id=${c.id}" class="card">
                        ${statusBadge} ${editBtn}
                        <div class="card-img-container"><img src="${coverImage}"></div>
                        <div class="card-content"><h3>${c.title}</h3><p class="price">${c.price}</p><p class="details">${c.city} • ${c.category}</p></div>
                    </a>`;
            });
        }
    }
});
