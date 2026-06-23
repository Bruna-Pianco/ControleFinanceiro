import { listarTransacoes } from '../services/supabaseClient.js'
import { fmt, fmtData, catIcons, getRangeMesAtual } from '../utils/format.js'

/**
 * Carrega os dados do mês atual e atualiza o dashboard na tela.
 */
export async function carregarDashboard() {
  const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  document.getElementById('dash-mes').textContent = 'Saldo — ' + mesAtual

  const lista = document.getElementById('dash-lista')

  try {
    const { inicio, fim } = getRangeMesAtual()
    const transacoes = await listarTransacoes({ inicio, fim })

    const entradas = transacoes
      .filter(t => t.lancamento === 'Entrada')
      .reduce((soma, t) => soma + Number(t.valor), 0)

    const saidas = transacoes
      .filter(t => t.lancamento === 'Saída')
      .reduce((soma, t) => soma + Number(t.valor), 0)

    document.getElementById('dash-saldo').textContent = fmt(entradas - saidas)
    document.getElementById('dash-entradas').textContent = fmt(entradas)
    document.getElementById('dash-saidas').textContent = fmt(saidas)

    renderUltimosLancamentos(transacoes.slice(0, 5))
  } catch (err) {
    console.error('Erro ao carregar dashboard:', err)
    lista.innerHTML = '<p class="msg-vazio">Não foi possível carregar os dados.</p>'
  }
}

function renderUltimosLancamentos(transacoes) {
  const lista = document.getElementById('dash-lista')

  if (!transacoes.length) {
    lista.innerHTML = '<p class="msg-vazio">Nenhum lançamento este mês.</p>'
    return
  }

  lista.innerHTML = transacoes.map(t => `
    <div class="tx-item">
      <div class="tx-icon" style="background:${t.lancamento === 'Entrada' ? 'var(--green-bg)' : 'var(--red-bg)'};">
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
  `).join('')
}
