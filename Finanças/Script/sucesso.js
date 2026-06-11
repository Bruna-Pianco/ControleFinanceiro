// Lê os dados passados pelo app.js via localStorage
const dados = JSON.parse(localStorage.getItem('ultimoLancamento') || '{}')

function fmt(val) {
  return 'R$ ' + Number(val).toLocaleString('pt-BR', {minimumFractionDigits: 2})
}

if (dados.valor) {
  document.getElementById('suc-valor').textContent = fmt(dados.valor)
  document.getElementById('suc-cat').textContent = dados.categoria || '—'

  const tipoEl = document.getElementById('suc-tipo')
  tipoEl.textContent = dados.lancamento || '—'
  if (dados.lancamento === 'Entrada') tipoEl.classList.add('entrada')
}

function novoLancamento() {
  window.location.href = 'index.html'
}

function verHistorico() {
  window.location.href = 'index.html#historico'
}

window.novoLancamento = novoLancamento
window.verHistorico = verHistorico