// Generator Soal AI Ujangil — SPA vanilla. Navigasi via hash (tanpa reload), data SWR dari localStorage.
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const S = { token: LS.get('tk') || '', boot: LS.get('boot'), gen: null, q: '' };

function toast(m, er) { const t = $('#toast'); t.textContent = m; t.className = 'toast show' + (er ? ' er' : ''); clearTimeout(toast._t); toast._t = setTimeout(() => t.className = 'toast', 3000); }

// ---- API: dedupe request baca yang sama, POST text/plain (hindari preflight CORS) ----
const _fl = {};
async function api(action, data) {
  const k = action + JSON.stringify(data || {}), rd = action === 'boot';
  if (rd && _fl[k]) return _fl[k];
  const p = fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: S.token, data }) })
    .then(r => r.json()).then(r => { if (r.code === 'SESI') { logout(); } return r; })
    .catch(() => ({ success: false, message: 'Tidak dapat terhubung ke server.' }));
  if (rd) { _fl[k] = p; p.finally(() => delete _fl[k]); }
  return p;
}
async function refresh() { // stale-while-revalidate: tampil cache dulu, perbarui di latar
  if (!S.token) return; const r = await api('boot'); if (r.success) { S.boot = r; LS.set('boot', r); if (location.hash !== '#/' && location.hash !== '#/masuk') render(true); }
}
function logout() { S.token = ''; S.boot = null; localStorage.removeItem('tk'); localStorage.removeItem('boot'); location.hash = '#/masuk'; }

// ---- Views ----
const JENJANG = { 'SD/MI': [1, 2, 3, 4, 5, 6], 'SMP/MTs': [7, 8, 9], 'SMA/MA': [10, 11, 12], 'SMK': [10, 11, 12] };
const opt = a => a.map(x => `<option>${esc(x)}</option>`).join('');
const nav = () => `<header class="nav wrap"><a href="#/" class="logo"><i>AI</i>Generator Soal AI</a><span><button class="btn pwa" hidden>📲 Pasang</button> <a class="btn" href="#/masuk">Masuk</a> <a class="btn p" href="#/buat">Buka Aplikasi</a></span></header>`;

const V = {
  landing: () => nav() + `<main class="wrap"><section class="hero"><div><span class="pill">Satu guru, semua soal, seketika</span>
    <h1>Buat soal <span class="hl">lengkap</span> dalam <span class="hl">hitungan menit</span></h1>
    <p class="m">Susun soal berkualitas untuk semua jenjang dan jenis soal dengan AI, lengkap dengan kunci jawaban dan pembahasan.</p>
    <p><a class="btn p" href="#/buat">Mulai Buat Soal</a> <a class="btn" href="#fitur">Lihat Fitur</a></p></div>
    <div class="card"><span class="pill">Pratinjau</span><div class="q card" style="margin-top:12px"><b>1.</b> Organel sel yang berfungsi sebagai tempat fotosintesis adalah…<ul><li>A. Mitokondria</li><li>B. Kloroplas</li><li>C. Ribosom</li><li>D. Lisosom</li></ul><span class="tag">C1 · Mudah</span></div></div></section>
    <section id="fitur" class="sec"><h2>Fitur</h2><div class="grid">${['Semua jenjang & kelas', 'Level kognitif C1–C6', 'Pilihan ganda, isian, uraian, benar/salah', 'Bank soal pribadi'].map(t => `<div class="card"><b class="b">${t}</b></div>`).join('')}</div></section>
    <section class="sec"><h2>Cara kerja</h2><div class="grid">${['Isi parameter', 'AI membuat soal', 'Simpan ke bank soal'].map((t, i) => `<div class="card"><span class="hl b">${i + 1}</span> ${t}</div>`).join('')}</div></section></main>`,
  masuk: () => nav() + `<main class="wrap" style="max-width:460px;padding-top:48px"><div class="card"><h2>Masuk ke Workspace</h2><p class="m">Guru cukup username terdaftar. Admin memakai PIN.</p>
    <label>Username</label><input id="u" autocomplete="username"><label>PIN (khusus Admin)</label><input id="pin" type="password" inputmode="numeric" autocomplete="current-password">
    <p class="err" id="le"></p><button class="btn p w" id="lb" style="width:100%">Masuk</button></div></main>`,
  app: (c, a) => `<div class="shell"><aside class="side"><div class="logo" style="margin-bottom:12px"><i>AI</i>EDU-AI Ujangil</div><div class="hd m" style="font-size:11px">WORKSPACE</div>
    ${[['dashboard', 'Dashboard'], ['buat', 'Buat Soal'], ['bank', 'Bank Soal'], ['kunci', 'API Key']].map(([h, t]) => `<a href="#/${h}" class="${a === h ? 'on' : ''}" data-r="${h}">${t}</a>`).join('')}<a href="#" id="lo">Keluar</a></aside><main class="main" id="view">${c}</main></div>`,
  dashboard() { const b = S.boot; if (!b) return '<div class="skel"></div>'; return `<button class="btn pwa" hidden style="float:right">📲 Pasang di HP</button><h2>Halo, ${esc(b.user.n)}</h2><p class="m">Ringkasan bank soal Anda.</p>
    <div class="grid"><div class="card stat"><span class="m">Total butir soal</span><b>${b.stats.total}</b></div><div class="card stat"><span class="m">Dibuat bulan ini</span><b>${b.stats.bulan}</b></div><div class="card stat"><span class="m">Sisa kuota hari ini</span><b>${b.kuota.sisa}</b></div><div class="card stat"><span class="m">Status AI</span><b style="font-size:20px" class="${b.hasKey ? '' : 'err'}">${b.hasKey ? 'Aktif' : 'Belum aktif'}</b></div></div>
    ${b.hasKey ? '' : '<p><a class="btn p" href="#/kunci">Aktifkan API Key</a></p>'}<h2 style="margin-top:24px">Soal terbaru</h2>${tbl(b.bank.slice(0, 5))}`; },
  buat() { return `<h2>Buat Soal AI</h2><p class="m">Maksimal 10 soal per permintaan.</p><div class="card"><div class="f">
    <div><label>Jenjang</label><select id="jenjang">${opt(Object.keys(JENJANG))}</select></div><div><label>Kelas</label><select id="kelas"></select></div>
    <div><label>Mata pelajaran</label><input id="mapel"></div><div><label>Topik / materi</label><input id="topik"></div>
    <div><label>Jenis soal</label><select id="jenis">${opt(['Pilihan Ganda', 'Benar/Salah', 'Isian Singkat', 'Uraian'])}</select></div><div><label>Jumlah</label><input id="jumlah" type="number" min="1" max="10" value="5"></div>
    <div><label>Level kognitif</label><select id="level">${opt(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])}</select></div><div><label>Kesulitan</label><select id="kesulitan">${opt(['Mudah', 'Sedang', 'Sulit'])}</select></div></div>
    <p><button class="btn p w" id="gb">✨ Generate Soal</button></p></div><div id="hasil"></div>`; },
  bank() { const b = S.boot; if (!b) return '<div class="skel"></div>'; return `<h2>Bank Soal</h2><input id="cari" placeholder="Cari topik, mapel, soal…" value="${esc(S.q)}"><div class="sc card" id="tb" style="margin-top:12px">${tbl(filt(b.bank), true)}</div>`; },
  kunci() { const b = S.boot || {}; return `<h2>Aktivasi API Key Google Gemini</h2><p class="m">Kunci disimpan hanya di Script Properties server, tidak pernah dikirim balik ke browser. Ambil gratis di aistudio.google.com.</p>
    <div class="card"><label>API Key ${b.keyMask ? '(tersimpan: ' + esc(b.keyMask) + ')' : ''}</label><input id="key" type="password" placeholder="Tempel API key"><p id="ke" class="m"></p><button class="btn p" id="kb">Simpan & Uji Koneksi</button></div>`; }
};
const filt = a => { const q = S.q.toLowerCase(); return q ? a.filter(x => (x.topik + x.mapel + x.teks).toLowerCase().includes(q)) : a; };
const tbl = (a, del) => !a.length ? '<p class="m">Belum ada soal.</p>' : `<div class="sc"><table><tr><th>Soal</th><th>Mapel</th><th>Jenis</th><th>Level</th>${del ? '<th></th>' : ''}</tr>${a.map(x => `<tr><td>${esc(String(x.teks).slice(0, 90))}</td><td>${esc(x.mapel)}</td><td>${esc(x.jenis)}</td><td><span class="tag">${esc(x.level)}</span></td>${del ? `<td><button class="btn" data-del="${esc(x.id)}" style="min-height:32px;padding:0 12px">Hapus</button></td>` : ''}</tr>`).join('')}</table></div>`;
const soalHtml = (i, n) => `<div class="card q" style="margin-top:12px"><b>${n}.</b> ${esc(i.teks)}<ul>${(i.opsi || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul><p class="m"><b>Kunci:</b> ${esc(i.kunci)}<br>${esc(i.pembahasan)}</p></div>`;

// ---- Router & render (swap #view saja → klik antar menu instan) ----
function render(soft) {
  const h = (location.hash || '#/').replace('#/', '') || 'landing', root = $('#app');
  if (['dashboard', 'buat', 'bank', 'kunci'].includes(h)) {
    if (!S.token) return location.hash = '#/masuk';
    const v = $('#view'); if (v && soft === true || v && root.dataset.shell) { if (soft !== true || root.dataset.view === h) { /* pertahankan input saat soft refresh */ } }
    if (soft === true && root.dataset.view === h && h !== 'dashboard' && h !== 'bank') return;
    if (root.dataset.shell) { $('#view').innerHTML = V[h](); root.querySelectorAll('.side a[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === h)); }
    else { root.innerHTML = V.app(V[h](), h); root.dataset.shell = 1; }
    root.dataset.view = h; wire(h);
  } else { delete root.dataset.shell; root.dataset.view = ''; root.innerHTML = V[h === 'masuk' ? 'masuk' : 'landing'](); wire(h); }
}
function wire(h) {
  const lo = $('#lo'); if (lo) lo.onclick = e => { e.preventDefault(); logout(); };
  if (h === 'masuk') { const go = async () => { const b = $('#lb'); b.disabled = true; b.textContent = 'Memeriksa…';
      const r = await api('login', { username: $('#u').value, pin: $('#pin').value }); b.disabled = false; b.textContent = 'Masuk';
      if (!r.success) return $('#le').textContent = r.message; S.token = r.token; LS.set('tk', r.token); S.boot = null; location.hash = '#/dashboard'; refresh(); };
    $('#lb').onclick = go; $('#pin').onkeydown = e => e.key === 'Enter' && go(); }
  if (h === 'buat') {
    const jj = $('#jenjang'), kl = () => $('#kelas').innerHTML = opt(JENJANG[jj.value]); jj.onchange = kl; kl();
    $('#gb').onclick = async () => { const d = {}; ['jenjang', 'kelas', 'mapel', 'topik', 'jenis', 'jumlah', 'level', 'kesulitan'].forEach(k => d[k] = $('#' + k).value);
      if (!d.mapel || !d.topik) return toast('Mapel dan topik wajib diisi.', 1);
      const b = $('#gb'); b.disabled = true; b.textContent = 'AI sedang bekerja…'; $('#hasil').innerHTML = '<div class="skel" style="margin-top:12px"></div>';
      const r = await api('generate', d); b.disabled = false; b.textContent = '✨ Generate Soal';
      if (!r.success) { $('#hasil').innerHTML = ''; toast(r.message, 1); if (r.code === 'KEY') location.hash = '#/kunci'; return; }
      S.gen = { d, items: r.items };
      $('#hasil').innerHTML = r.items.map((i, n) => soalHtml(i, n + 1)).join('') + '<p><button class="btn p w" id="sv">Simpan ke Bank Soal</button></p>';
      $('#sv').onclick = async () => { $('#sv').disabled = true; const s = await api('saveSoal', { param: S.gen.d, items: S.gen.items });
        if (s.success) { toast(s.saved + ' soal tersimpan.'); $('#hasil').innerHTML = ''; refresh(); } else { toast(s.message, 1); $('#sv').disabled = false; } }; };
  }
  if (h === 'bank') {
    $('#cari').oninput = e => { S.q = e.target.value; $('#tb').innerHTML = tbl(filt(S.boot.bank), true); };
    $('#tb').onclick = async e => { const id = e.target.dataset.del; if (!id || !confirm('Hapus soal ini?')) return;
      S.boot.bank = S.boot.bank.filter(x => x.id !== id); LS.set('boot', S.boot); $('#tb').innerHTML = tbl(filt(S.boot.bank), true); // optimistic
      const r = await api('delSoal', { ids: [id] }); if (!r.success) { toast(r.message, 1); } refresh(); };
  }
  if (h === 'kunci') $('#kb').onclick = async () => { const b = $('#kb'); b.disabled = true; b.textContent = 'Menguji…';
    const r = await api('saveKey', { key: $('#key').value }); b.disabled = false; b.textContent = 'Simpan & Uji Koneksi';
    if (r.success) { toast('Tersambung & valid (' + r.latensi + ' ms).'); $('#key').value = ''; refresh(); } else $('#ke').textContent = r.message; };
  if (['dashboard', 'bank'].includes(h) && S.token) refresh();
}
window.addEventListener('hashchange', () => render());
document.addEventListener('pointerover', e => { if (e.target.closest && e.target.closest('[data-r]') && S.token && !S.boot) refresh(); });
render(); if (S.token) refresh();

// ---- Modul PWA: pasang ke layar utama HP ----
let _ip = null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
function pwaShow() { document.querySelectorAll('.pwa').forEach(b => b.hidden = standalone() || !(_ip || ios() || LS.get('pwaHint'))); }
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _ip = e; pwaShow(); });
window.addEventListener('appinstalled', () => { _ip = null; toast('Aplikasi terpasang di layar utama.'); pwaShow(); });
document.addEventListener('click', async e => {
  if (!e.target.closest('.pwa')) return;
  if (_ip) { _ip.prompt(); await _ip.userChoice; _ip = null; pwaShow(); }
  else toast(ios() ? 'Ketuk tombol Bagikan (⬆️) di Safari → "Tambah ke Layar Utama".' : 'Buka menu ⋮ browser → "Instal aplikasi" / "Tambahkan ke layar utama".');
});
if (!ios() && !_ip) LS.set('pwaHint', 1); // browser tanpa prompt otomatis: tetap tampilkan tombol panduan
new MutationObserver(pwaShow).observe($('#app'), { childList: true, subtree: true }); pwaShow();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
