let db;
let currentLang = 'sw';

const labels = {
  sw: {
    dashboard:'Dashboard', add:'Ongeza', date:'Tarehe', name:'Jina/Maelezo', crop:'Zao', qty:'Kiasi', amount:'Kiasi cha fedha', type:'Aina', actions:'Vitendo', edit:'Badili', del:'Futa', saved:'Imehifadhiwa', empty:'Hakuna taarifa bado.', scoreGood:'Nidhamu yako ya fedha iko vizuri.', scoreWarn:'Punguza matumizi yasiyo ya lazima ili mtaji ukue.', page:'Dashboard'
  },
  en: {
    dashboard:'Dashboard', add:'Add', date:'Date', name:'Name/Description', crop:'Crop', qty:'Quantity', amount:'Amount', type:'Type', actions:'Actions', edit:'Edit', del:'Delete', saved:'Saved', empty:'No records yet.', scoreGood:'Your financial discipline is strong.', scoreWarn:'Reduce non-essential spending so capital can grow.', page:'Dashboard'
  }
};

function money(n){ return new Intl.NumberFormat('sw-TZ').format(Number(n||0)) + ' TSh'; }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
async function save(){ await window.nassAPI.writeData(db); renderAll(); }

async function init(){
  db = await window.nassAPI.readData();
  currentLang = db.settings?.language || 'sw';
  document.getElementById('todayText').textContent = new Date().toLocaleDateString('sw-TZ', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  setupNav(); setupTopButtons(); setupCrud(); setupUpdates(); renderAll();
}

function setupNav(){
  document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.nav').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
    document.getElementById('pageTitle').textContent = btn.textContent;
  }));
}

function setupTopButtons(){
  document.getElementById('languageBtn').onclick = async () => {
    currentLang = currentLang === 'sw' ? 'en' : 'sw';
    db.settings = db.settings || {}; db.settings.language = currentLang; await save();
    document.getElementById('languageBtn').textContent = currentLang === 'sw' ? 'English' : 'Kiswahili';
  };
  document.getElementById('backupBtn').onclick = async () => {
    const p = await window.nassAPI.backupData('manual'); alert('Backup imehifadhiwa: ' + p);
  };
  document.getElementById('formatBtn').onclick = async () => {
    const ok = await window.nassAPI.formatData(); if(ok){ db = await window.nassAPI.readData(); renderAll(); }
  };
}

function setupCrud(){
  document.querySelectorAll('.crud').forEach(section => {
    const store = section.dataset.store;
    section.insertAdjacentHTML('beforeend', `
      <div class="form">
        <input data-field="date" type="date" />
        <input data-field="name" placeholder="Jina/Maelezo" />
        <input data-field="crop" placeholder="Zao" />
        <input data-field="quantity" type="number" placeholder="Kiasi" />
        <input data-field="amount" type="number" placeholder="Kiasi cha fedha" />
        <button data-add="${store}">Ongeza</button>
      </div>
      <div class="table-wrap" id="table-${store}"></div>
    `);
    section.querySelector(`[data-add="${store}"]`).onclick = async () => {
      const record = { id: uid() };
      section.querySelectorAll('[data-field]').forEach(i => record[i.dataset.field] = i.value);
      if(!record.date) record.date = new Date().toISOString().slice(0,10);
      db[store] = db[store] || []; db[store].push(record);
      section.querySelectorAll('[data-field]').forEach(i => i.value = '');
      await save();
    };
  });
}

function renderCrud(store){
  const wrap = document.getElementById(`table-${store}`); if(!wrap) return;
  const rows = db[store] || [];
  if(rows.length === 0){ wrap.innerHTML = `<div class="empty">${labels[currentLang].empty}</div>`; return; }
  wrap.innerHTML = `<table><thead><tr><th>Tarehe</th><th>Maelezo</th><th>Zao</th><th>Kiasi</th><th>Fedha</th><th>Vitendo</th></tr></thead><tbody>${rows.map(r => `
    <tr><td>${r.date||''}</td><td>${r.name||''}</td><td>${r.crop||''}</td><td>${r.quantity||''}</td><td>${money(r.amount)}</td><td><button class="small-btn" onclick="editRecord('${store}','${r.id}')">Badili</button><button class="small-btn danger" onclick="deleteRecord('${store}','${r.id}')">Futa</button></td></tr>
  `).join('')}</tbody></table>`;
}

window.deleteRecord = async (store,id) => { if(confirm('Unataka kufuta taarifa hii?')){ db[store] = (db[store]||[]).filter(r => r.id !== id); await save(); } };
window.editRecord = async (store,id) => {
  const r = (db[store]||[]).find(x => x.id === id); if(!r) return;
  const amount = prompt('Weka kiasi kipya cha fedha:', r.amount || 0); if(amount === null) return;
  const name = prompt('Weka maelezo mapya:', r.name || ''); if(name === null) return;
  r.amount = amount; r.name = name; await save();
};

function sum(store){ return (db[store]||[]).reduce((a,r)=>a+Number(r.amount||0),0); }
function renderDashboard(){
  const capital = sum('capital'); const sales = sum('sales'); const expenses = sum('expenses') + sum('purchases');
  const profit = sales - expenses;
  document.getElementById('totalCapital').textContent = money(capital);
  document.getElementById('totalSales').textContent = money(sales);
  document.getElementById('totalExpenses').textContent = money(expenses);
  document.getElementById('profitLoss').textContent = money(profit);
  const score = Math.max(0, Math.min(100, capital ? Math.round((1 - (expenses/(capital+sales+1))) * 100) : 70));
  document.getElementById('scoreBar').style.width = score + '%';
  document.getElementById('scoreText').textContent = score + '/100 - ' + (score >= 70 ? labels[currentLang].scoreGood : labels[currentLang].scoreWarn);
}

function setupUpdates(){
  const status = document.getElementById('updateStatus');
  document.getElementById('checkUpdateBtn').onclick = async () => {
    status.textContent = 'Inaangalia update...';
    const res = await window.nassAPI.checkUpdates();
    status.textContent = res.ok ? 'Imeangalia updates. Kama ipo, utaona taarifa hapa.' : 'Update haijaweza kuangaliwa: ' + res.error;
  };
  document.getElementById('downloadUpdateBtn').onclick = async () => {
    status.textContent = 'Inapakua update na kutengeneza backup kwanza...';
    const res = await window.nassAPI.downloadUpdate();
    status.textContent = res.ok ? 'Update imepakuliwa. Bonyeza Install Update.' : 'Imeshindikana: ' + res.error;
  };
  document.getElementById('installUpdateBtn').onclick = () => window.nassAPI.installUpdate();
  window.nassAPI.onUpdateStatus(payload => {
    if(payload.type === 'available') status.textContent = 'Toleo jipya lipo. Bonyeza Pakua Update.';
    if(payload.type === 'none') status.textContent = 'Hakuna update mpya kwa sasa.';
    if(payload.type === 'progress') status.textContent = `Inapakua: ${Math.round(payload.progress.percent)}%`;
    if(payload.type === 'downloaded') status.textContent = 'Update imepakuliwa. Bonyeza Install Update.';
    if(payload.type === 'error') status.textContent = 'Hitilafu ya update: ' + payload.error;
  });
}

function renderAll(){
  renderDashboard(); ['capital','crops','purchases','sales','stock','expenses','debts'].forEach(renderCrud);
  document.getElementById('languageBtn').textContent = currentLang === 'sw' ? 'English' : 'Kiswahili';
}

init();
