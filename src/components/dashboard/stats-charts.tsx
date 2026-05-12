"use client";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsChartsProps {
  bills: any[];
}

export function StatsCharts({ bills }: StatsChartsProps) {
  if (!bills || bills.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
           <p className="text-slate-500">Sem dados para gráficos de custos.</p>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center">
           <p className="text-slate-500">Sem dados para despesas.</p>
        </Card>
      </div>
    );
  }

  // Process data for Pie Chart (By type)
  const dataByType = bills.reduce((acc: any[], bill) => {
    const typeLabel = bill.type === 'fixed' ? 'Fixas' : 'Variáveis';
    const existing = acc.find(item => item.name === typeLabel);
    if (existing) {
      existing.value += bill.total_amount;
    } else {
      acc.push({ name: typeLabel, value: bill.total_amount });
    }
    return acc;
  }, []);

  // Process data for Bar Chart (Individual bills)
  const dataByBill = bills.map(bill => ({
    name: bill.name.length > 10 ? bill.name.substring(0, 10) + '...' : bill.name,
    valor: bill.total_amount
  })).slice(0, 5); // Top 5 bills

  const COLORS = ["#6366f1", "#06b6d4", "#ec4899", "#8b5cf6"];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Divisão de Custos</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {dataByType.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Maiores Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByBill}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#6366f1' }}
              />
              <Bar 
                dataKey="valor" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
