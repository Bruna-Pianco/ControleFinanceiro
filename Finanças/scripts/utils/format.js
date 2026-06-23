// Ícones por categoria — usado no dashboard e histórico
export const catIcons = {
  'Alimentação': '🛒',
  'Transporte': '🚗',
  'Moradia': '🏠',
  'Saúde': '💊',
  'Lazer': '🎬',
  'Educação': '📚',
  'Roupas': '👕',
  'Assinaturas': '📱',
  'Investimento': '📈',
  'Salário': '💰',
  'Outros': '📦'
}

// Formata número para R$ 1.234,56
export function fmt(valor) {
  return 'R$ ' + Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Formata data ISO (2026-06-23) para DD/MM
export function fmtData(dataISO) {
  if (!dataISO) return ''
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}

// Retorna { inicio, fim } do mês atual em formato ISO (YYYY-MM-DD)
export function getRangeMesAtual() {
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)
  return {
    inicio: inicio.toISOString().split('T')[0],
    fim: fim.toISOString().split('T')[0]
  }
}

// Agrupa um array de transações por "AAAA-MM"
export function agruparPorMes(transacoes) {
  const grupos = {}
  transacoes.forEach(t => {
    const [ano, mes] = t.data.split('-')
    const chave = `${ano}-${mes}`
    if (!grupos[chave]) grupos[chave] = []
    grupos[chave].push(t)
  })
  return grupos
}

export const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
