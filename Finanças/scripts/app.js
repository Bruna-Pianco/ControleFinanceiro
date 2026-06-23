import { carregarDashboard } from './components/dashboard.js'
import { abrirLancamento, setTipo, setPessoa, salvarLancamento } from './components/lancamento.js'
import { carregarHistorico, setFiltro, excluirEAtualizar } from './components/historico.js'
import { salvarUltimoLancamento } from './components/sucesso.js'

/**
 * Navega entre telas trocando a classe .active e dispara o carregamento
 * de dados específico de cada tela.
 */
function goTo(tela, params = {}) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById('screen-' + tela).classList.add('active')

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  const navEl = document.getElementById('nav-' + tela)
  if (navEl) navEl.classList.add('active')

  if (tela === 'dashboard') carregarDashboard()
  if (tela === 'lancamento') abrirLancamento(params.id || null)
  if (tela === 'historico') carregarHistorico()
}

async function handleSalvar() {
  const resultado = await salvarLancamento()
  if (!resultado) return

  salvarUltimoLancamento(resultado)
  window.location.href = 'pages/sucesso.html'
}

async function handleExcluir(id) {
  const excluiu = await excluirEAtualizar(id)
  if (excluiu) carregarDashboard()
}

// Expõe no escopo global para os onclick inline do HTML
window.goTo = goTo
window.setTipo = setTipo
window.setPessoa = setPessoa
window.salvar = handleSalvar
window.setFiltro = setFiltro
window.editarLancamento = (id) => goTo('lancamento', { id })
window.confirmarExclusao = handleExcluir

// Tela inicial
carregarDashboard()
