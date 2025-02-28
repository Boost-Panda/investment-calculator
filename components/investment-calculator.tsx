"use client"

import { useState, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    const recurringPeriodsPerYear = recurringFrequency === "monthly" ? 12 : 1
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Investment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-primary">Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="pl-10 border-input focus:ring-primary"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground">Years</span>
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
                <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
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

        <Card className="lg:col-span-7 border-none shadow-md">
          <CardContent className="p-6">
            <div className="mb-8 text-center">
              <h3 className="text-xl font-medium text-primary mb-2">Total Balance</h3>
              <p className="text-4xl font-bold text-primary">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(totalBalance)}
              </p>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: "Year", position: "insideBottom", offset: -5 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis 
                    tickFormatter={formatYAxis} 
                    width={60} 
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label: string | number) => `Year: ${label}`}
                    contentStyle={{ 
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--card-foreground)"
                    }}
                  />
                  <Legend />
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

