const fs = require('fs');
const path = require('path');

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg: #030108;
  --panel: rgba(15, 10, 30, 0.6);
  --panel-border: rgba(123, 82, 240, 0.15);
  --panel-hover: rgba(123, 82, 240, 0.3);
  --primary: #8a2be2;
  --primary-glow: rgba(138, 43, 226, 0.5);
  --text-main: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.7);
  --text-dim: rgba(255, 255, 255, 0.4);
  --success: #00ffaa;
  --danger: #ff3366;
  --warning: #ffaa00;
  --font-sans: 'Josefin Sans', sans-serif;
  --font-serif: 'GFS Didot', serif;
}
html,body{
  height:100%;
  background: var(--bg);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(138, 43, 226, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(0, 255, 170, 0.05), transparent 25%);
  color: var(--text-main);
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: 14px;
  overflow: hidden;
}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:rgba(0,0,0,0.2)}
::-webkit-scrollbar-thumb{background:var(--primary);border-radius:4px}

.layout { display: flex; height: 100vh; }

/* SIDEBAR */
.sidebar {
  width: 260px;
  background: rgba(5, 3, 10, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  z-index: 10;
}
.brand {
  padding: 24px;
  border-bottom: 1px solid var(--panel-border);
}
.brand h1 {
  font-family: var(--font-serif);
  font-size: 24px;
  letter-spacing: 0.1em;
  background: linear-gradient(to right, #fff, #a480ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.brand p { font-size: 10px; color: var(--primary); letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }

.nav { flex: 1; overflow-y: auto; padding: 16px 12px; }
.nav-group { margin-bottom: 24px; }
.nav-title { font-size: 10px; color: var(--text-dim); letter-spacing: 0.15em; text-transform: uppercase; margin: 0 12px 8px; }
.nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px;
  color: var(--text-muted); text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}
.nav-link:hover {
  background: rgba(138, 43, 226, 0.1);
  color: var(--text-main);
}
.nav-link.active {
  background: linear-gradient(90deg, rgba(138, 43, 226, 0.2), transparent);
  border-left: 3px solid var(--primary);
  color: var(--text-main);
  box-shadow: inset 20px 0 20px -20px var(--primary-glow);
}
.badge { margin-left: auto; background: var(--primary); color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 12px; }
.badge.success { background: rgba(0, 255, 170, 0.15); color: var(--success); border: 1px solid rgba(0,255,170,0.3); }

/* MAIN CONTENT */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header {
  height: 64px;
  background: rgba(5, 3, 10, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}
.page-title { font-family: var(--font-serif); font-size: 20px; letter-spacing: 0.05em; }
.header-actions { display: flex; gap: 16px; align-items: center; }
.btn {
  background: linear-gradient(135deg, var(--primary), #5530cc);
  color: #fff; border: none; padding: 8px 16px; border-radius: 8px;
  font-family: var(--font-sans); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;
  cursor: pointer; transition: 0.3s;
  box-shadow: 0 4px 15px var(--primary-glow);
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--primary-glow); }
.btn-outline { background: transparent; border: 1px solid var(--panel-border); box-shadow: none; color: var(--text-main); }
.btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }

.content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* UI COMPONENTS */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

.card {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: 0.3s;
}
.card:hover { border-color: var(--panel-hover); transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.card-header { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px; display: flex; justify-content: space-between; }

.stat-value { font-family: var(--font-serif); font-size: 36px; margin: 8px 0; background: linear-gradient(135deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.trend { font-size: 12px; color: var(--success); display: flex; align-items: center; gap: 4px; }
.trend.down { color: var(--danger); }

/* FEED */
.feed-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.feed-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(138,43,226,0.1); display: grid; place-items: center; color: var(--primary); }
.feed-text { font-size: 14px; color: var(--text-main); margin-bottom: 4px; }
.feed-time { font-size: 11px; color: var(--text-muted); }

/* MESSAGES */
.chat-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; height: calc(100vh - 150px); }
.chat-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.chat-item { padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid transparent; cursor: pointer; transition: 0.2s; }
.chat-item:hover, .chat-item.active { background: rgba(138,43,226,0.05); border-color: var(--panel-border); }
.chat-window { background: var(--panel); border: 1px solid var(--panel-border); border-radius: 16px; display: flex; flex-direction: column; }
.chat-header { padding: 20px; border-bottom: 1px solid var(--panel-border); }
.chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.msg { max-width: 70%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
.msg.in { background: rgba(255,255,255,0.05); align-self: flex-start; border-bottom-left-radius: 4px; }
.msg.out { background: linear-gradient(135deg, var(--primary), #5530cc); align-self: flex-end; border-bottom-right-radius: 4px; }
.chat-input { padding: 16px; border-top: 1px solid var(--panel-border); display: flex; gap: 12px; }
.chat-input input { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--panel-border); border-radius: 8px; padding: 12px 16px; color: #fff; outline: none; }

/* AGENDA */
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 16px; }
.cal-day { aspect-ratio: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 8px; display: flex; flex-direction: column; }
.cal-date { font-size: 12px; color: var(--text-muted); }
.cal-event { margin-top: auto; background: rgba(138,43,226,0.2); color: #fff; font-size: 10px; padding: 4px; border-radius: 4px; border-left: 2px solid var(--primary); }

/* GALLERY */
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }
.gal-item { aspect-ratio: 3/4; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; position: relative; }
.gal-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: 0.3s; }
.gal-item:hover .gal-img { opacity: 1; transform: scale(1.05); }
.gal-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; opacity: 0; transition: 0.3s; }
.gal-item:hover .gal-overlay { opacity: 1; }

/* SETTINGS */
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.toggle { width: 44px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; }
.toggle.on { background: var(--success); }
.toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: #fff; border-radius: 50%; top: 3px; left: 3px; transition: 0.3s; }
.toggle.on::after { transform: translateX(20px); }
`;

const sidebarHtml = `
<div class="sidebar">
  <div class="brand">
    <h1>rWoman</h1>
    <p>Admin Console</p>
  </div>
  <div class="nav">
    <div class="nav-group">
      <div class="nav-title">Principal</div>
      <a href="02-dashboard.html" class="nav-link {nav_dashboard}"><span style="font-size:16px">⊞</span> Painel</a>
      <a href="03-perfil.html" class="nav-link {nav_perfil}"><span style="font-size:16px">👤</span> Meu Perfil</a>
    </div>
    <div class="nav-group">
      <div class="nav-title">Comunicação</div>
      <a href="04-mensagens.html" class="nav-link {nav_mensagens}"><span style="font-size:16px">✉</span> Mensagens <span class="badge">12</span></a>
      <a href="05-notificacoes.html" class="nav-link {nav_notificacoes}"><span style="font-size:16px">🔔</span> Notificações <span class="badge">5</span></a>
    </div>
    <div class="nav-group">
      <div class="nav-title">Gestão</div>
      <a href="06-agenda.html" class="nav-link {nav_agenda}"><span style="font-size:16px">📅</span> Agenda</a>
      <a href="07-galeria.html" class="nav-link {nav_galeria}"><span style="font-size:16px">🖼</span> Galeria <span class="badge">3</span></a>
      <a href="08-visitas.html" class="nav-link {nav_visitas}"><span style="font-size:16px">👁</span> Visitas</a>
      <a href="09-estatisticas.html" class="nav-link {nav_estatisticas}"><span style="font-size:16px">📈</span> Estatísticas</a>
    </div>
    <div class="nav-group">
      <div class="nav-title">Segurança</div>
      <a href="11-verificacao.html" class="nav-link {nav_verificacao}"><span style="font-size:16px">✓</span> Verificação <span class="badge success">OK</span></a>
      <a href="12-configuracoes.html" class="nav-link {nav_config}"><span style="font-size:16px">⚙</span> Configurações</a>
    </div>
  </div>
</div>
`;

function buildPage(filename, title, contentHtml, activeNav) {
  let sidebar = sidebarHtml
    .replace('{nav_dashboard}', activeNav === 'dashboard' ? 'active' : '')
    .replace('{nav_perfil}', activeNav === 'perfil' ? 'active' : '')
    .replace('{nav_mensagens}', activeNav === 'mensagens' ? 'active' : '')
    .replace('{nav_notificacoes}', activeNav === 'notificacoes' ? 'active' : '')
    .replace('{nav_agenda}', activeNav === 'agenda' ? 'active' : '')
    .replace('{nav_galeria}', activeNav === 'galeria' ? 'active' : '')
    .replace('{nav_visitas}', activeNav === 'visitas' ? 'active' : '')
    .replace('{nav_estatisticas}', activeNav === 'estatisticas' ? 'active' : '')
    .replace('{nav_verificacao}', activeNav === 'verificacao' ? 'active' : '')
    .replace('{nav_config}', activeNav === 'config' ? 'active' : '');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — rWoman</title>
<link href="https://fonts.googleapis.com/css2?family=GFS+Didot&family=Josefin+Sans:wght@300;400;600&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div class="layout">
  ${sidebar}
  <div class="main">
    <div class="header">
      <div class="page-title">${title}</div>
      <div class="header-actions">
        <span style="color:var(--text-muted);font-size:12px">● Online</span>
        <button class="btn btn-outline" onclick="window.location.href='/'">Ver Site</button>
      </div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
  </div>
</div>
<script>
  // Simple toggle logic for settings
  document.querySelectorAll('.toggle').forEach(t => t.onclick = () => t.classList.toggle('on'));
</script>
</body>
</html>`;
}

// 1. Dashboard
const dashboardHtml = `
<div class="grid-4" style="margin-bottom:32px">
  <div class="card"><div class="card-header">Visitas Hoje</div><div class="stat-value">1,248</div><div class="trend">▲ +12% vs Ontem</div></div>
  <div class="card"><div class="card-header">Novas Mensagens</div><div class="stat-value">42</div><div class="trend">▲ +5% vs Ontem</div></div>
  <div class="card"><div class="card-header">Reservas Pendentes</div><div class="stat-value">3</div><div class="trend down">▼ -1 vs Ontem</div></div>
  <div class="card"><div class="card-header">Ganhos Mensais</div><div class="stat-value">€4,200</div><div class="trend">▲ +18% vs Mês passado</div></div>
</div>
<div class="grid-2">
  <div class="card">
    <div class="card-header"><span>Atividade Recente</span><button class="btn btn-outline" style="padding:4px 8px;font-size:10px">Ver Tudo</button></div>
    <div class="feed-item"><div class="feed-icon">✉</div><div><div class="feed-text">Nova mensagem de Cliente #892</div><div class="feed-time">Há 5 minutos</div></div></div>
    <div class="feed-item"><div class="feed-icon" style="color:var(--success);background:rgba(0,255,170,0.1)">✓</div><div><div class="feed-text">Pagamento recebido (€200)</div><div class="feed-time">Há 2 horas</div></div></div>
    <div class="feed-item"><div class="feed-icon">📅</div><div><div class="feed-text">Nova reserva solicitada</div><div class="feed-time">Há 3 horas</div></div></div>
  </div>
  <div class="card">
    <div class="card-header"><span>Automação ativa</span><span class="badge success">LED ON</span></div>
    <div class="feed-item"><div class="feed-icon" style="color:var(--success);background:rgba(0,255,170,0.1)">●</div><div><div class="feed-text">3 FAQs respondidas instantaneamente</div><div class="feed-time">Nesta hora</div></div></div>
    <div class="feed-item"><div class="feed-icon" style="color:var(--success);background:rgba(0,255,170,0.1)">●</div><div><div class="feed-text">Agenda e disponibilidade sincronizadas</div><div class="feed-time">Há 4 horas</div></div></div>
  </div>
</div>
`;
fs.writeFileSync('apps/web/public/02-dashboard.html', buildPage('02-dashboard.html', 'Painel Geral', dashboardHtml, 'dashboard'));

// 2. Mensagens
const mensagensHtml = `
<div class="chat-layout">
  <div class="card chat-list" style="padding:16px">
    <div class="chat-item active">
      <div style="font-weight:600;margin-bottom:4px">Cliente Privado</div>
      <div style="font-size:12px;color:var(--text-muted)">Confirmo para as 18h?</div>
    </div>
    <div class="chat-item">
      <div style="font-weight:600;margin-bottom:4px">Visitante #104 <span class="badge" style="background:var(--warning);color:#000">Revisão pendente</span></div>
      <div style="font-size:12px;color:var(--text-muted)">Pode ser num hotel no centro?</div>
    </div>
    <div class="chat-item">
      <div style="font-weight:600;margin-bottom:4px">Carlos M.</div>
      <div style="font-size:12px;color:var(--text-muted)">Obrigado pela excelente tarde.</div>
    </div>
  </div>
  <div class="chat-window">
    <div class="chat-header">
      <div style="font-family:var(--font-serif);font-size:20px">Cliente Privado</div>
      <div style="font-size:12px;color:var(--success)">● Online</div>
    </div>
    <div class="chat-messages">
      <div class="msg in">Olá, tens disponibilidade para amanhã à tarde?</div>
      <div class="msg out" style="background:rgba(138,43,226,0.2);border:1px solid var(--primary)"><span style="font-size:10px;text-transform:uppercase;display:block;margin-bottom:4px;color:var(--primary)">● Resposta imediata</span>Sim, tenho horário livre das 14h às 18h amanhã. Qual horário preferes?</div>
      <div class="msg in">Excelente. Confirmo para as 18h?</div>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Escreve uma mensagem...">
      <button class="btn">Enviar</button>
    </div>
  </div>
</div>
`;
fs.writeFileSync('apps/web/public/04-mensagens.html', buildPage('04-mensagens.html', 'Mensagens', mensagensHtml, 'mensagens'));

// 3. Agenda
const agendaHtml = `
<div class="card mb-4" style="margin-bottom:24px">
  <div class="card-header" style="margin-bottom:0">Maio 2025</div>
</div>
<div class="calendar-grid">
  <div class="cal-day"><div class="cal-date">Seg 1</div></div>
  <div class="cal-day"><div class="cal-date">Ter 2</div><div class="cal-event">14:00 - Cliente VIP</div></div>
  <div class="cal-day"><div class="cal-date">Qua 3</div><div class="cal-event">18:00 - Reserva</div></div>
  <div class="cal-day"><div class="cal-date">Qui 4</div></div>
  <div class="cal-day"><div class="cal-date">Sex 5</div><div class="cal-event" style="background:var(--danger)">Bloqueado</div></div>
  <div class="cal-day"><div class="cal-date">Sáb 6</div></div>
  <div class="cal-day"><div class="cal-date">Dom 7</div></div>
</div>
`;
fs.writeFileSync('apps/web/public/06-agenda.html', buildPage('06-agenda.html', 'Agenda', agendaHtml, 'agenda'));

// 4. Galeria
const galeriaHtml = `
<div style="display:flex;justify-content:flex-end;margin-bottom:24px">
  <button class="btn">Upload Nova Foto</button>
</div>
<div class="gallery-grid">
  <div class="gal-item"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" class="gal-img"><div class="gal-overlay"><button class="btn btn-outline" style="width:100%">Tornar Privada</button></div></div>
  <div class="gal-item"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80" class="gal-img"><div class="gal-overlay"><button class="btn btn-outline" style="width:100%">Tornar Privada</button></div></div>
  <div class="gal-item"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" class="gal-img"><div class="gal-overlay"><button class="btn btn-outline" style="width:100%">Tornar Privada</button></div></div>
  <div class="gal-item" style="border: 2px dashed var(--panel-border); background: transparent; display:grid; place-items:center">
    <div style="text-align:center; color:var(--text-muted)">
      <div style="font-size:32px;margin-bottom:8px">+</div>
      <div style="font-size:12px;text-transform:uppercase">Adicionar</div>
    </div>
  </div>
</div>
`;
fs.writeFileSync('apps/web/public/07-galeria.html', buildPage('07-galeria.html', 'Galeria', galeriaHtml, 'galeria'));

// 5. Configuracoes
const configHtml = `
<div class="card" style="max-width:600px;margin:0 auto">
  <div class="setting-row">
    <div>
      <div style="font-size:16px;margin-bottom:4px">Notificações Push</div>
      <div style="font-size:12px;color:var(--text-muted)">Recebe alertas de novas mensagens e reservas.</div>
    </div>
    <div class="toggle on"></div>
  </div>
  <div class="setting-row">
    <div>
      <div style="font-size:16px;margin-bottom:4px">Modo Invisível</div>
      <div style="font-size:12px;color:var(--text-muted)">Oculta o teu perfil do diretório público.</div>
    </div>
    <div class="toggle"></div>
  </div>
  <div class="setting-row">
    <div>
      <div style="font-size:16px;margin-bottom:4px">Aprovação Automática</div>
      <div style="font-size:12px;color:var(--text-muted)">Aceita reservas de clientes verificados automaticamente.</div>
    </div>
    <div class="toggle on"></div>
  </div>
  <div style="margin-top:32px">
    <button class="btn" style="width:100%">Guardar Definições</button>
  </div>
</div>
`;
fs.writeFileSync('apps/web/public/12-configuracoes.html', buildPage('12-configuracoes.html', 'Configurações', configHtml, 'config'));

// Write remaining basic pages
const basicPages = ['03-perfil.html', '05-notificacoes.html', '08-visitas.html', '09-estatisticas.html', '10-anunciate.html', '11-verificacao.html', '13-suporte.html'];
basicPages.forEach(p => {
  const t = p.split('-')[1].replace('.html','').toUpperCase();
  const html = `<div class="card"><div class="card-header">${t}</div><p style="color:var(--text-muted);line-height:1.6">Área de ${t.toLowerCase()} em desenvolvimento. O design global foi aplicado e esta secção será preenchida com as funcionalidades finais em breve.</p></div>`;
  fs.writeFileSync('apps/web/public/' + p, buildPage(p, t, html, p.split('-')[1].replace('.html','')));
});

console.log('Beautiful Admin UI built!');
