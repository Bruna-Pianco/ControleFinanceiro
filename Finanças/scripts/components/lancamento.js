import { criarTransacao, atualizarTransacao, buscarTransacao } from '../services/supabaseClient.js'

// Estado local do formulário
let tipoSelecionado = 'Saída'
let pessoaSelecionada = 'Bruna'
let idEmEdicao = null // null = criando novo / número = editando

/**
 * Abre a tela de lançamento. Se receber um id, carrega os dados para edição.
 */
export async function abrirLancamento(id = null) {
  idEmEdicao = id

  const titulo = document.querySelector('#screen-lancamento .header-title')
  const botaoSalvar = document.querySelector('#screen-lancamento .save-btn')

  if (id) {
    titulo.textContent = 'Editar lançamento'
    botaoSalvar.textContent = 'Salvar alterações'
    try {
      const t = await buscarTransacao(id)
      preencherFormulario(t)
    } catch (err) {
      console.error('Erro ao buscar transação:', err)
      alert('Não foi possível carregar este lançamento.')
    }
  } else {
    titulo.textContent = 'Novo lançamento'
    botaoSalvar.textContent = 'Salvar lançamento'
    limparFormulario()
  }
}

function preencherFormulario(t) {
  document.getElementById('inp-valor').value = t.valor
  document.getElementById('inp-data').value = t.data
  document.getElementById('inp-desc').value = t.descricao || ''
  document.getElementById('inp-cat').value = t.categoria
  setTipo(t.lancamento)
  setPessoa(t.pessoa)
}

export function limparFormulario() {
  document.getElementById('inp-valor').value = ''
  document.getElementById('inp-desc').value = ''
  document.getElementById('inp-cat').value = ''
  document.getElementById('inp-data').value = new Date().toISOString().split('T')[0]
  setTipo('Saída')
  setPessoa('Bruna')
}

export function setTipo(tipo) {
  tipoSelecionado = tipo
  document.getElementById('btn-saida').className = 'type-btn' + (tipo === 'Saída' ? ' active-saida' : '')
  document.getElementById('btn-entrada').className = 'type-btn' + (tipo === 'Entrada' ? ' active-entrada' : '')
}

export function setPessoa(pessoa) {
  pessoaSelecionada = pessoa
  document.getElementById('btn-bru').className = 'pessoa-btn' + (pessoa === 'Bruna' ? ' active' : '')
  document.getElementById('btn-lucas').className = 'pessoa-btn' + (pessoa === 'Lucas' ? ' active' : '')
  document.getElementById('btn-ambos').className = 'pessoa-btn' + (pessoa === 'Ambos' ? ' active' : '')
}

/**
 * Valida e salva o formulário (cria ou atualiza dependendo do estado).
 * Retorna os dados salvos em caso de sucesso, ou null se falhar.
 */
export async function salvarLancamento() {
  const valor = parseFloat(document.getElementById('inp-valor').value)
  const data = document.getElementById('inp-data').value
  const descricao = document.getElementById('inp-desc').value
  const categoria = document.getElementById('inp-cat').value

  if (!valor || valor <= 0) { alert('Informe um valor válido.'); return null }
  if (!data) { alert('Informe a data.'); return null }
  if (!categoria) { alert('Selecione uma categoria.'); return null }

  const payload = { data, lancamento: tipoSelecionado, valor, descricao, categoria, pessoa: pessoaSelecionada }
  const botao = document.querySelector('#screen-lancamento .save-btn')
  botao.disabled = true
  botao.textContent = 'Salvando...'

  try {
    const resultado = idEmEdicao
      ? await atualizarTransacao(idEmEdicao, payload)
      : await criarTransacao(payload)
    return resultado
  } catch (err) {
    alert('Erro ao salvar: ' + err.message)
    return null
  } finally {
    botao.disabled = false
    botao.textContent = idEmEdicao ? 'Salvar alterações' : 'Salvar lançamento'
  }
}
