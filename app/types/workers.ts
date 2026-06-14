export interface Worker {
  id: string
  name: string
  rate: number
  regular_hours: number
  pay_schedule: 'weekly' | 'kinsenas'
  is_active: boolean
  created_at: string
}

export interface WorkLog {
  id: string
  worker_id: string
  work_date: string
  hours_worked: number
  overtime_hrs: number
  notes?: string | null
  isPaid?: boolean
}

export interface Payroll {
  id: string
  worker_id: string
  period_start: string
  period_end: string
  days_worked: number
  total_hours: number
  overtime_hours: number
  gross_pay: number
  cash_advance: number
  net_pay: number
  status: 'pending' | 'paid'
}

export interface CashAdvance {
  id: string
  worker_id: string
  amount: number
  reason?: string | null
  status: 'unpaid' | 'deducted'
}