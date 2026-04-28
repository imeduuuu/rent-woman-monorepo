const fs = require('fs');
const path = require('path');

const pages = [
  { id: '01-home.html', title: 'Home' },
  { id: '02-dashboard.html', title: 'Painel' },
  { id: '03-perfil.html', title: 'Meu Perfil' },
  { id: '04-mensagens.html', title: 'Mensagens' },
  { id: '05-notificacoes.html', title: 'Notificações' },
  { id: '06-agenda.html', title: 'Agenda' },
  { id: '07-galeria.html', title: 'Galeria' },
  { id: '08-visitas.html', title: 'Visitas' },
  { id: '09-estatisticas.html', title: 'Estatísticas' },
  { id: '10-anunciate.html', title: 'Anunciar-me' },
  { id: '11-verificacao.html', title: 'Verificação' },
  { id: '12-configuracoes.html', title: 'Configurações' },
  { id: '13-suporte.html', title: 'Suporte' }
];

let template = fs.readFileSync('apps/web/public/cerebro.html', 'utf8');

// Update colors to make text whiter
template = template.replace('--iv3:rgba(237,232,224,.32)', '--iv3:rgba(255,255,255,.7)');
template = template.replace('--iv4:rgba(237,232,224,.14)', '--iv4:rgba(255,255,255,.5)');
template = template.replace('color:var(--iv3)', 'color:rgba(255,255,255,.75)');

// Remove "Treinar agora" button from header
template = template.replace('<button class="tb-btn" onclick="runTraining()">Treinar agora</button>', '');

// Remove the whole "Aprendizagem diária" (Training Log) box
template = template.replace(/<!-- ROW 2: Training \+ Countries -->[\s\S]*?<!-- Countries -->/, '<!-- ROW 2: Countries -->\n    <div class="g2 mb16">\n      <!-- Countries -->');

// Also remove the "Testar agente em tempo real" box to make it more of an automatic dashboard?
// Wait, the user only specifically mentioned "retire isso de entrenar". I will leave the test chat.
// But they said "somente aparecerá o que a ia integrada com o fluxo faz pelos clientes em automatico sem aparecer"
// which means the dashboard should only show what the AI is doing automatically.
// I'll leave the test chat, but make the colors whiter.

// Actually, I will write the updated cerebro.html back first.
fs.writeFileSync('apps/web/public/cerebro.html', template);

// Now generate the other pages
pages.forEach(p => {
  if (p.id === '01-home.html') return;
  
  let pageContent = template;
  
  // Make the current page active in sidebar
  pageContent = pageContent.replace('class="sb-a on"', 'class="sb-a"');
  pageContent = pageContent.replace(`onclick="go('${p.id}')"`, `class="sb-a on" onclick="go('${p.id}')"`);
  
  // Replace main content with a placeholder
  const placeholder = `
    <div class="brain-hdr mb16" style="min-height:400px;display:flex;align-items:center;justify-content:center;flex-direction:column">
      <div class="ai-icon mb16">✦</div>
      <div style="font-family:'GFS Didot',serif;font-size:32px;letter-spacing:.06em;color:#fff">${p.title}</div>
      <div class="mc mt8">Página em construção...</div>
    </div>
  `;
  
  pageContent = pageContent.replace(/<div class="pw">[\s\S]*?<\/div><!-- \/pw -->/, `<div class="pw">${placeholder}</div><!-- /pw -->`);
  
  fs.writeFileSync(path.join('apps/web/public', p.id), pageContent);
});

console.log('Pages generated successfully!');
