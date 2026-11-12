import type { Money } from '#shared/types'

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return ''
  const amount = Number(money.amount)
  if (!Number.isFinite(amount)) return ''
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: money.currencyCode || 'AUD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function errorMessage(error: unknown): string {
  const candidate = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }
  return (
    candidate?.data?.statusMessage ||
    candidate?.data?.message ||
    candidate?.statusMessage ||
    candidate?.message ||
    'Something went wrong. Please try again.'
  )
}
