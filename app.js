const db = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const ytId = u => (String(u).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || [])[1];
const PAGE = 8;
let levels = [], records = [], sel = null, page = 0, admin = false, loaded = false;

async function load() {
  const [l, r] = await Promise.all([
    db.from('levels').select('*').order('position'),
    db.from('records').select('*').order('created_at')]);
  if (l.error || r.error) {
    $('#mid').innerHTML = '<p class="err">No se pudo cargar la lista. Revisá config.js y que hayas corrido el SQL en Supabase.</p>';
    return;
  }
  levels = l.data; records = r.data; loaded = true;
  pick(location.hash.slice(1) || (sel && sel.id));
}

function pick(id) {
  sel = levels.find(l => String(l.id) === String(id)) || levels[0] || null;
  page = 0; render();
}

function render() {
  if (!loaded) return;
  const q = $('#q').value.trim().toLowerCase();
  $('#list').innerHTML = levels.map((l, i) => [l, i]).filter(([l]) => l.name.toLowerCase().includes(q))
    .map(([l, i]) => `<li><a href="#${l.id}" class="${sel && sel.id === l.id ? 'on' : ''}"><b>#${i + 1}</b>${esc(l.name)}</a></li>`).join('')
    || '<li class="empty">No hay niveles que coincidan.</li>';
  const rs = sel ? records.filter(r => r.level_id === sel.id) : [];
  if (!sel) {
    $('#mid').innerHTML = `<h2>Todavía no hay niveles</h2><p class="meta">${admin ? 'Cargá el primer record con "Nuevo record".' : 'El admin todavía no cargó ninguno.'}</p>`;
  } else {
    const v = rs.map(r => ytId(r.video_url)).find(Boolean);
    $('#mid').innerHTML = `<h2>${esc(sel.name)}</h2><p class="meta">por ${esc(sel.creator || 'creador desconocido')}</p>
      <div class="chips"><span class="chip">ID ${sel.id}</span><span class="chip">${sel.aredl_rank != null ? 'Top AREDL #' + sel.aredl_rank : 'Fuera de la AREDL'}</span></div>
      ${v ? `<iframe class="video" src="https://www.youtube-nocookie.com/embed/${v}" allowfullscreen title="Video de ${esc(sel.name)}"></iframe>` : ''}
      ${admin ? '<div class="chips"><button data-act="up">Subir</button><button data-act="down">Bajar</button><button data-act="del">Eliminar nivel</button></div>' : ''}`;
  }
  const sorted = [...rs].sort((a, b) => b.percent - a.percent || a.created_at.localeCompare(b.created_at));
  $('#rc').textContent = `(${rs.length})`;
  $('#recs').innerHTML = sorted.slice(page * PAGE, (page + 1) * PAGE).map(r =>
    `<li><div class="who">${esc(r.player)}<small>${new Date(r.created_at).toLocaleDateString('es-AR')}</small></div>
    <span class="pct ${r.percent === 100 ? 'full' : ''}">${r.percent}%</span>
    <a class="play" href="${esc(r.video_url)}" target="_blank" rel="noopener">Ver</a>
    ${admin ? `<button data-rec="${r.id}" title="Eliminar record" aria-label="Eliminar record">✕</button>` : ''}</li>`).join('')
    || '<li class="empty">Sin records todavía.</li>';
  const n = Math.ceil(sorted.length / PAGE);
  $('#pager').innerHTML = n > 1 ? Array.from({ length: n }, (_, i) => `<button class="${i === page ? 'on' : ''}" data-page="${i}">${i + 1}</button>`).join('') : '';
  $('#auth').textContent = admin ? 'Salir' : 'Admin';
  $('#new').hidden = !admin;
}

/* Orden: con top AREDL va después del nivel con top AREDL inmediatamente anterior
   (y de los niveles manuales que cuelgan de él); sin top, va debajo del nivel elegido. */
function place(order, lv, afterId) {
  let i = 0;
  if (lv.aredl_rank != null) {
    const prev = order.filter(l => l.aredl_rank != null && l.aredl_rank < lv.aredl_rank)
      .sort((a, b) => b.aredl_rank - a.aredl_rank)[0];
    if (prev) { i = order.indexOf(prev) + 1; while (order[i] && order[i].aredl_rank == null) i++; }
  } else i = order.findIndex(l => l.id === afterId) + 1;
  order.splice(i, 0, lv);
  return order;
}

// Un solo upsert = una sola operación: los puestos se renumeran todos juntos.
const saveOrder = order => db.from('levels').upsert(order.map((l, i) => (
  { id: l.id, name: l.name, creator: l.creator, aredl_rank: l.aredl_rank, position: i + 1 })));

async function act(a) {
  const order = [...levels], i = order.findIndex(l => l.id === sel.id);
  if (a === 'del') {
    if (!confirm(`¿Eliminar "${sel.name}" y todos sus records?`)) return;
    const { error } = await db.from('levels').delete().eq('id', sel.id);
    if (error) return alert(error.message);
    order.splice(i, 1);
  } else {
    const j = i + (a === 'up' ? -1 : 1);
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length) { const { error } = await saveOrder(order); if (error) return alert(error.message); }
  load();
}

document.addEventListener('click', async e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.page) { page = +t.dataset.page; render(); }
  else if (t.dataset.rec) {
    if (!confirm('¿Eliminar este record?')) return;
    await db.from('records').delete().eq('id', t.dataset.rec); load();
  } else if (t.dataset.act) act(t.dataset.act);
});
addEventListener('hashchange', () => pick(location.hash.slice(1)));
$('#q').oninput = () => render();

const dlg = $('#dlg');

$('#auth').onclick = () => {
  if (admin) return db.auth.signOut();
  dlg.innerHTML = `<form id="f"><h2>Ingresar como admin</h2>
    <label>Email<input name="email" type="email" required autocomplete="username"></label>
    <label>Contraseña<input name="pass" type="password" required autocomplete="current-password"></label>
    <p class="err" id="msg"></p><button class="pri">Ingresar</button></form>`;
  dlg.showModal();
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const E = e.target.elements;
    const { error } = await db.auth.signInWithPassword({ email: E.email.value, password: E.pass.value });
    if (error) $('#msg').textContent = 'Email o contraseña incorrectos.'; else dlg.close();
  };
};
db.auth.onAuthStateChange((_, s) => { admin = !!s; render(); });

$('#new').onclick = () => {
  dlg.innerHTML = `<form id="f"><h2>Nuevo record</h2>
    <label>ID del nivel<input name="lvlid" type="number" required></label>
    <button type="button" id="look">Traer datos del nivel</button>
    <div id="lvl" class="grid">
      <label>Nombre del nivel<input name="lname"></label>
      <label>Creador<input name="creator"></label>
      <label>Top AREDL (vacío si no está)<input name="rank" type="number" min="1"></label>
      <label>Si no tiene top AREDL, va debajo de<select name="after"><option value="none">Elegí un nivel</option><option value="top">Al principio de la lista</option>${levels.map((l, i) => `<option value="${l.id}">#${i + 1} ${esc(l.name)}</option>`).join('')}</select></label>
    </div>
    <label>Jugador<input name="player" required></label>
    <label>Porcentaje<input name="percent" type="number" min="1" max="100" value="100" required></label>
    <label>Video (showcase o completion)<input name="video" type="url" required></label>
    <p class="err" id="msg"></p><button class="pri">Guardar record</button></form>`;
  const f = $('#f'), E = f.elements, msg = $('#msg');
  E.lvlid.oninput = () => { $('#lvl').hidden = levels.some(l => String(l.id) === E.lvlid.value); };
  $('#look').onclick = async () => {
    const id = E.lvlid.value;
    if (!id) return;
    const get = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch { return null; } };
    const [gd, ar] = await Promise.all([get(`https://gdbrowser.com/api/level/${id}`), get(CONFIG.AREDL_LEVEL_URL.replace('{id}', id))]);
    if (gd && gd.name) { E.lname.value = gd.name; E.creator.value = gd.author || ''; }
    const pos = ar && (ar.position ?? (ar.level && ar.level.position));
    if (pos) E.rank.value = pos;
    msg.className = ''; msg.textContent = `Nombre: ${gd && gd.name ? 'listo' : 'completalo a mano'}. Top AREDL: ${pos ? 'listo' : 'no encontrado, ponelo a mano si lo tiene'}.`;
  };
  f.onsubmit = async e => {
    e.preventDefault();
    msg.className = 'err'; msg.textContent = '';
    try {
      const id = +E.lvlid.value, video = E.video.value.trim();
      if (!/^https?:\/\//i.test(video)) throw new Error('El video tiene que ser un link http(s).');
      if (!levels.some(l => l.id === id)) {
        const lv = { id, name: E.lname.value.trim(), creator: E.creator.value.trim() || null, aredl_rank: E.rank.value ? +E.rank.value : null };
        if (!lv.name) throw new Error('Falta el nombre del nivel.');
        if (lv.aredl_rank == null && levels.length && E.after.value === 'none') throw new Error('Elegí debajo de qué nivel va.');
        const { error } = await saveOrder(place([...levels], lv, E.after.value === 'top' ? null : +E.after.value));
        if (error) throw error;
      }
      const { error } = await db.from('records').insert({ level_id: id, player: E.player.value.trim(), percent: +E.percent.value, video_url: video });
      if (error) throw error;
      dlg.close(); location.hash = id; await load();
    } catch (err) { msg.textContent = err.message; }
  };
  dlg.showModal();
};

load();
