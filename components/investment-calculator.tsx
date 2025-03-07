"use client"

import { useState, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the chart data type
interface ChartDataPoint {
  year: number;
  balance: number;
  principal: number;
  interest: number;
}

export default function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(5000)
  const [years, setYears] = useState(30)
  const [rate, setRate] = useState(6)
  const [compoundFrequency, setCompoundFrequency] = useState("annually")
  const [recurringAmount, setRecurringAmount] = useState(100)
  const [recurringFrequency, setRecurringFrequency] = useState("monthly")
  const [totalBalance, setTotalBalance] = useState(0)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  const calculateInvestment = useCallback(() => {
    const rateDecimal = rate / 100
    let periodsPerYear = 1
    if (compoundFrequency === "semi-annually") periodsPerYear = 2
    if (compoundFrequency === "quarterly") periodsPerYear = 4
    if (compoundFrequency === "monthly") periodsPerYear = 12
    if (compoundFrequency === "daily") periodsPerYear = 365

    const ratePerPeriod = rateDecimal / periodsPerYear
    const recurringPerPeriod = recurringAmount / (recurringFrequency === "monthly" ? 1 : 12)

    let balance = initialInvestment
    let principal = initialInvestment
    const data = []
    const currentYear = new Date().getFullYear()

    data.push({ year: currentYear, balance, principal, interest: 0 })

    for (let year = 1; year <= years; year++) {
      for (let period = 1; period <= periodsPerYear; period++) {
        const interest = balance * ratePerPeriod
        balance += interest

        if (recurringFrequency === "monthly") {
          for (let month = 1; month <= 12 / periodsPerYear; month++) {
            balance += recurringPerPeriod
            principal += recurringPerPeriod
          }
        } else if (period === 1) {
          balance += recurringAmount
          principal += recurringAmount
        }
      }

      data.push({
        year: currentYear + year,
        balance: balance,
        principal: principal,
        interest: balance - principal,
      })
    }

    setTotalBalance(balance)
    setChartData(data)
  }, [initialInvestment, years, rate, compoundFrequency, recurringAmount, recurringFrequency])

  useEffect(() => {
    calculateInvestment()
  }, [calculateInvestment])

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatYAxis = (value: number): string => {
    if (value >= 1000000) return `$${Math.round(value / 1000000)}M`
    if (value >= 1000) return `$${Math.round(value / 1000)}k`
    return `$${value}`
  }

  return (
    <div className="w-full h-full overflow-auto bg-background p-3 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <Card className="md:col-span-5 border-none shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <Label htmlFor="initial-investment" className="font-medium text-primary">
                Initial investment
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="initial-investment"
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="pl-10 border-input focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="years" className="font-medium text-primary">
                Years of investment growth
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="years"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={years}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setYears(0)
                    } else {
                      const numericValue = e.target.value.replace(/[^0-9]/g, '')
                      setYears(Number(numericValue))
                      // If the input contained non-numeric characters, update the input value
                      if (numericValue !== e.target.value) {
                        e.target.value = numericValue
                      }
                    }
                  }}
                  className="pl-10 border-input focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate" className="font-medium text-primary">
                Estimated rate of return
              </Label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="pl-10 border-input focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compound-frequency" className="font-medium text-primary">
                Compound frequency
              </Label>
              <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                <SelectTrigger id="compound-frequency" className="w-full border-input focus:ring-primary">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="semi-annually">Semi-annually</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-amount" className="font-medium text-primary">
                Amount of recurring investments
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="recurring-amount"
                  type="number"
                  value={recurringAmount}
                  onChange={(e) => setRecurringAmount(Number(e.target.value))}
                  className="pl-10 border-input focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurring-frequency" className="font-medium text-primary">
                Recurring investment frequency
              </Label>
              <ToggleGroup
                type="single"
                value={recurringFrequency}
                onValueChange={(value) => {
                  if (value) setRecurringFrequency(value)
                }}
                className="justify-start"
              >
                <ToggleGroupItem 
                  value="monthly" 
                  className={cn(
                    "px-6 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  )}
                >
                  Monthly
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="annually" 
                  className={cn(
                    "px-6 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  )}
                >
                  Annually
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-7 border-none shadow-sm">
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-primary mb-1">Total Balance</h3>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(totalBalance)}
              </p>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: "Year", position: "insideBottom", offset: -5 }}
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={formatYAxis} 
                    width={50} 
                    stroke="var(--muted-foreground)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label: string | number) => `Year: ${label}`}
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--card-foreground)",
                      fontSize: "12px",
                      padding: "8px"
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="principal"
                    name="Total principal"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    fillOpacity={0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Investment return"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    fillOpacity={0.3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

