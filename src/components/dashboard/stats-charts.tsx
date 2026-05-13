"use client";

import { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-[310px] bg-slate-900/50 rounded-xl animate-pulse" />
        <div className="h-[310px] bg-slate-900/50 rounded-xl animate-pulse" />
      </div>
    );
  }

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

  const categoryLabels: Record<string, string> = {
    rent: 'Aluguel',
    electricity: 'Energia',
    water: 'Água',
    internet: 'Internet',
    supermarket: 'Mercado',
    maintenance: 'Manut.',
    other: 'Outros'
  };

  const categoryColors: Record<string, string> = {
    rent: '#6366f1', // indigo
    electricity: '#facc15', // yellow
    water: '#60a5fa', // blue
    internet: '#34d399', // emerald
    supermarket: '#fb923c', // orange
    maintenance: '#94a3b8', // slate
    other: '#818cf8' // light indigo
  };

  // Process data for Pie Chart (By category)
  const dataByCategory = bills.reduce((acc: any[], bill) => {
    const cat = bill.category || 'other';
    const label = categoryLabels[cat] || categoryLabels.other;
    const color = categoryColors[cat] || categoryColors.other;
    
    const existing = acc.find(item => item.name === label);
    if (existing) {
      existing.value += bill.total_amount;
    } else {
      acc.push({ name: label, value: bill.total_amount, color });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value);

  // Process data for Bar Chart (Individual bills - Top 5)
  const dataByBill = [...bills]
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 5)
    .map(bill => ({
      name: bill.name.length > 12 ? bill.name.substring(0, 12) + '...' : bill.name,
      valor: bill.total_amount,
      color: categoryColors[bill.category || 'other'] || categoryColors.other
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl group hover:border-slate-700 transition-all">
        <CardHeader>
          <CardTitle className="text-lg text-white">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
              >
                {dataByCategory.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl group hover:border-slate-700 transition-all">
        <CardHeader>
          <CardTitle className="text-lg text-white">Maiores Despesas</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByBill}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="valor" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              >
                {dataByBill.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
