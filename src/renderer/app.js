let crops=[];
const fmt=n=>`TSh ${Number(n||0).toLocaleString()}`;
async function refresh(){
 const d=await api.dashboard();
 cards.innerHTML=[['Mtaji',d.capital],['Manunuzi',d.purchases],['Mauzo',d.sales],['Matumizi',d.expenses],['Faida/Hasara',d.profit]].map(x=>`<div class="card"><small>${x[0]}</small><b>${fmt(x[1])}</b></div>`).join('');
 const tx=await api.listTransactions();
 txRows.innerHTML=tx.map(t=>`<tr><td>${t.type}</td><td>${t.crop_name||'-'}</td><td>${t.person||'-'}</td><td>${fmt(t.amount)}</td><td>${t.date}</td></tr>`).join('');
 crops=await api.listCrops(); cropSelect.innerHTML='<option value="">-- Hakuna --</option>'+crops.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
 const st=await api.stockReport(); stockRows.innerHTML=st.map(s=>`<tr><td>${s.name}</td><td>${Number(s.stock).toLocaleString()}</td><td>${s.unit}</td></tr>`).join('');
}
document.querySelectorAll('aside button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(b.dataset.page).classList.add('active');title.textContent=b.textContent;refresh();});
txForm.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(txForm));await api.addTransaction(data);txForm.reset();await refresh();alert('Imehifadhiwa');};
backup.onclick=async()=>{const p=await api.createBackup();status.textContent='Backup imehifadhiwa: '+p;};
format.onclick=async()=>{const ok=await api.formatAll();if(ok){status.textContent='Taarifa zimefutwa, backup imehifadhiwa.';refresh();}};
updates.onclick=async()=>{status.textContent='Inaangalia updates...';try{await api.checkUpdates();status.textContent='Update check imekamilika.'}catch(e){status.textContent='Hakuna update au mtandao una shida.'}};
refresh();
