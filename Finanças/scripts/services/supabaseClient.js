import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://iywxbozsjaueemwcuscv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5d3hib3pzamF1ZWVtd2N1c2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTAwNjksImV4cCI6MjA5NjU2NjA2OX0.s9y0Pihl_zl7MiwonNTGoWRGClIWnKfvqfgrHS1coMk'

const db = createClient(SUPABASE_URL, SUPABASE_KEY)
const TABELA = 'Transacoes'

/**
 * Busca transações dentro de um intervalo de datas (opcional).
 * Sem argumentos, retorna todas as transações.
 */
export async function listarTransacoes({ inicio, fim } = {}) {
  let query = db.from(TABELA).select('*').order('data', { ascending: false })
  if (inicio) query = query.gte('data', inicio)
  if (fim) query = query.lte('data', fim)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Cria uma nova transação.
 * payload: { data, lancamento, valor, descricao, categoria, pessoa }
 */
export async function criarTransacao(payload) {
  const { data, error } = await db.from(TABELA).insert(payload).select().single()
  if (error) throw error
  return data
}

/**
 * Atualiza uma transação existente pelo id.
 */
export async function atualizarTransacao(id, payload) {
  const { data, error } = await db.from(TABELA).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

/**
 * Exclui uma transação pelo id.
 */
export async function excluirTransacao(id) {
  const { error } = await db.from(TABELA).delete().eq('id', id)
  if (error) throw error
}

/**
 * Busca uma única transação pelo id (usado na tela de edição).
 */
export async function buscarTransacao(id) {
  const { data, error } = await db.from(TABELA).select('*').eq('id', id).single()
  if (error) throw error
  return data
}
