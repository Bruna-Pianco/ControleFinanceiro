import { fmt } from '../utils/format.js'

/**
 * Lê o último lançamento salvo (passado via localStorage) e popula a tela.
 */
export function renderSucesso() {
  const dados = JSON.parse(localStorage.getItem('ultimoLancamento') || '{}')
  if (!dados.valor) return

  document.getElementById('suc-valor').textContent = fmt(dados.valor)
  document.getElementById('suc-cat').textContent = dados.categoria || '—'

  const tipoEl = document.getElementById('suc-tipo')
  tipoEl.textContent = dados.lancamento || '—'
  tipoEl.classList.toggle('entrada', dados.lancamento === 'Entrada')
}

export function salvarUltimoLancamento(transacao) {
  localStorage.setItem('ultimoLancamento', JSON.stringify({
    valor: transacao.valor,
    categoria: transacao.categoria,
    lancamento: transacao.lancamento
  }))
}
