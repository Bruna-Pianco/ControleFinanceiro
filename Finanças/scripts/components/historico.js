import { listarTransacoes, excluirTransacao } from '../services/supabaseClient.js'
import { fmt, fmtData, catIcons, agruparPorMes, NOMES_MESES } from '../utils/format.js'

let todasTransacoes = []
let filtroAtivo = 'todos'

/**
 * Busca todas as transações no banco e renderiza a lista.
 */
export async function carregarHistorico() {
  const lista = document.getElementById('hist-lista')
  lista.innerHTML = '<p class="msg-vazio">Carregando...</p>'

  try {
    todasTransacoes = await listarTransacoes()
    renderHistorico()
  } catch (err) {
    console.error('Erro ao carregar histórico:', err)
    lista.innerHTML = '<p class="msg-vazio">Não foi possível carregar os dados.</p>'
  }
}

export function setFiltro(filtro, elementoClicado) {
  filtroAtivo = filtro
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'))
  elementoClicado.classList.add('active')
  renderHistorico()
}

function renderHistorico() {
  const container = document.getElementById('hist-lista')

  const transacoesFiltradas = filtroAtivo === 'todos'
    ? todasTransacoes
    : todasTransacoes.filter(t => t.lancamento === filtroAtivo || t.pessoa === filtroAtivo)

  if (!transacoesFiltradas.length) {
    container.innerHTML = '<p class="msg-vazio">Nenhum lançamento encontrado.</p>'
    return
  }

  const grupos = agruparPorMes(transacoesFiltradas)

  container.innerHTML = Object.entries(grupos).map(([chave, transacoes]) => {
    const [ano, mes] = chave.split('-')
    const tituloMes = `${NOMES_MESES[parseInt(mes) - 1]} ${ano}`

    return `
      <div class="section-title" style="margin-top:16px;">${tituloMes}</div>
      <div class="card" style="padding: 4px 16px;">
        ${transacoes.map(linhaTransacao).join('')}
      </div>
    `
  }).join('')
}

function linhaTransacao(t) {
  return `
    <div class="tx-item">
      <div class="tx-icon" style="background:${t.lancamento === 'Entrada' ? 'var(--green-bg)' : 'var(--red-bg)'};">
        ${catIcons[t.categoria] || '📦'}
      </div>
      <div class="tx-info">
        <div class="tx-name">${t.descricao || t.categoria}</div>
        <div class="tx-sub">${t.categoria} · ${t.pessoa} · ${fmtData(t.data)}</div>
      </div>
      <div class="tx-actions">
        <div class="tx-amount ${t.lancamento === 'Entrada' ? 'entrada' : 'saida'}">
          ${t.lancamento === 'Entrada' ? '+' : '−'} ${fmt(t.valor)}
        </div>
        <div class="tx-buttons">
          <button class="btn-icon" onclick="window.editarLancamento(${t.id})" aria-label="Editar">✏️</button>
          <button class="btn-icon" onclick="window.confirmarExclusao(${t.id})" aria-label="Excluir">🗑️</button>
        </div>
      </div>
    </div>
  `
}

/**
 * Exclui uma transação após confirmação e recarrega a lista local.
 */
export async function excluirEAtualizar(id) {
  if (!confirm('Excluir este lançamento? Essa ação não pode ser desfeita.')) return false

  try {
    await excluirTransacao(id)
    todasTransacoes = todasTransacoes.filter(t => t.id !== id)
    renderHistorico()
    return true
  } catch (err) {
    alert('Erro ao excluir: ' + err.message)
    return false
  }
}
