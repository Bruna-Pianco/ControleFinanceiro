import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'


async function loadDashboard() {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0]
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data, error } = await db
    .from('Transacoes')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim)

  if (error) { console.error(error); return }

  // Cálculos
  const entradas = data
    .filter(t => t.lancamento === 'Entrada')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const saidas = data
    .filter(t => t.lancamento === 'Saída')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const saldo = entradas - saidas

  // Atualiza o HTML
  document.getElementById('dash-saldo').textContent = fmt(saldo)
  document.getElementById('dash-entradas').textContent = fmt(entradas)
  document.getElementById('dash-saidas').textContent = fmt(saidas)

  // Últimos lançamentos
  const ultimas = data.slice(-5).reverse()
  const lista = document.getElementById('dash-lista')
  lista.innerHTML = ultimas.length ? ultimas.map(t => `
    <div class="tx-item">
      <div class="tx-icon" style="background:${t.lancamento === 'Entrada' ? '#EAF3DE' : '#FCEBEB'};">
        ${catIcons[t.categoria] || '📦'}
      </div>
      <div class="tx-info">
        <div class="tx-name">${t.descricao || t.categoria}</div>
        <div class="tx-sub">${t.pessoa} · ${fmtData(t.data)}</div>
      </div>
      <div class="tx-amount ${t.lancamento === 'Entrada' ? 'entrada' : 'saida'}">
        ${t.lancamento === 'Entrada' ? '+' : '−'} ${fmt(t.valor)}
      </div>
    </div>
  `).join('') : '<p style="color:#888; font-size:14px; padding: 12px 0;">Nenhum lançamento este mês.</p>'
}

const catIcons = {
  'Alimentação':'🛒','Transporte':'🚗','Moradia':'🏠','Saúde':'💊',
  'Lazer':'🎬','Educação':'📚','Roupas':'👕','Assinaturas':'📱',
  'Investimento':'📈','Salário':'💰','Outros':'📦'
}

function fmt(val) {
  return 'R$ ' + Number(val).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})
}

function fmtData(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}`
}

let todasTx = []
let filtroAtivo = 'todos'

async function loadHistorico() {
  const { data, error } = await db
    .from('Transacoes')
    .select('*')
    .order('data', { ascending: false })

  if (error) { console.error(error); return }
  todasTx = data || []
  renderHistorico()
}

function setFiltro(f, el) {
  filtroAtivo = f
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'))
  el.classList.add('active')
  renderHistorico()
}

function renderHistorico() {
  const lista = filtroAtivo === 'todos'
    ? todasTx
    : todasTx.filter(t => t.lancamento === filtroAtivo || t.pessoa === filtroAtivo)

  const container = document.getElementById('hist-lista')

  if (!lista.length) {
    container.innerHTML = '<p style="color:#888; font-size:14px; padding:12px 0;">Nenhum lançamento encontrado.</p>'
    return
  }

  // Agrupa por mês
  const grupos = {}
  lista.forEach(t => {
    const [y, m] = t.data.split('-')
    const key = `${y}-${m}`
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(t)
  })

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  let html = ''
  Object.entries(grupos).forEach(([key, txs]) => {
    const [y, m] = key.split('-')
    html += `<div class="section-title" style="margin-top:16px;">${meses[parseInt(m)-1]} ${y}</div>`
    html += `<div class="card" style="padding: 4px 16px;">`
    txs.forEach(t => {
      html += `
        <div class="tx-item">
          <div class="tx-icon" style="background:${t.lancamento === 'Entrada' ? '#EAF3DE' : '#FCEBEB'};">
            ${catIcons[t.categoria] || '📦'}
          </div>
          <div class="tx-info">
            <div class="tx-name">${t.descricao || t.categoria}</div>
            <div class="tx-sub">${t.categoria} · ${t.pessoa} · ${fmtData(t.data)}</div>
          </div>
          <div class="tx-amount ${t.lancamento === 'Entrada' ? 'entrada' : 'saida'}">
            ${t.lancamento === 'Entrada' ? '+' : '−'} ${fmt(t.valor)}
          </div>
        </div>`
    })
    html += '</div>'
  })

  container.innerHTML = html
}

const db = createClient(
  'https://iywxbozsjaueemwcuscv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d3hib3pzamF1ZWVtd2N1c2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTAwNjksImV4cCI6MjA5NjU2NjA2OX0.s9y0Pihl_zl7MiwonNTGoWRGClIWnKfvqfgrHS1coMk'
)

let varTipo = 'Saída'
let varPessoa = 'Bruna'


function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('screen-' + screen).classList.add('active')
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  const navEl = document.getElementById('nav-' + screen)
  if (navEl) navEl.classList.add('active')
  if (screen === 'lancamento') resetForm()
  if (screen === 'historico') loadHistorico()  
}

function resetForm() {
  document.getElementById('inp-valor').value = ''
  document.getElementById('inp-desc').value = ''
  document.getElementById('inp-cat').value = ''
  document.getElementById('inp-data').value = new Date().toISOString().split('T')[0]
  setTipo('Saída')
  setPessoa('Bruna')
}

function setTipo(t) {
  varTipo = t
  document.getElementById('btn-saida').className = 'type-btn' + (t === 'Saída' ? ' active-saida' : '')
  document.getElementById('btn-entrada').className = 'type-btn' + (t === 'Entrada' ? ' active-entrada' : '')
}

function setPessoa(p) {
  varPessoa = p
  document.getElementById('btn-bru').className = 'pessoa-btn' + (p === 'Bruna' ? ' active' : '')
  document.getElementById('btn-lucas').className = 'pessoa-btn' + (p === 'Lucas' ? ' active' : '')
  document.getElementById('btn-ambos').className = 'pessoa-btn' + (p === 'Ambos' ? ' active' : '')
}

async function salvar() {
  const valor = parseFloat(document.getElementById('inp-valor').value)
  const data = document.getElementById('inp-data').value
  const descricao = document.getElementById('inp-desc').value
  const categoria = document.getElementById('inp-cat').value

  if (!valor || valor <= 0) { alert('Informe um valor válido'); return }
  if (!data) { alert('Informe a data'); return }
  if (!categoria) { alert('Selecione uma categoria'); return }

  const btn = document.querySelector('.save-btn')
  btn.textContent = 'Salvando...'
  btn.disabled = true

  const { error } = await db.from('Transacoes').insert({
    data, lancamento: varTipo, valor, descricao, categoria, pessoa: varPessoa
  })

  btn.textContent = 'Salvar lançamento'
  btn.disabled = false

  if (error) { alert('Erro: ' + error.message); return }

  localStorage.setItem('ultimoLancamento', JSON.stringify({
  valor, categoria, lancamento: varTipo
  }))
  window.location.href = 'sucesso.html'
  }

// Chama ao iniciar
const mesAtual = new Date().toLocaleString('pt-BR', {month: 'long', year: 'numeric'})
document.getElementById('dash-mes').textContent = 'Saldo — ' + mesAtual
loadDashboard()

// Expõe funções globais
window.goTo = goTo
window.setTipo = setTipo
window.setPessoa = setPessoa
window.salvar = salvar
window.setFiltro = setFiltro