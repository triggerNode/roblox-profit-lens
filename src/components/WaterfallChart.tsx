import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface WaterfallData {
  name: string;
  value: number;
  cumulative: number;
  color: string;
}

interface WaterfallChartProps {
  grossRobux: number;
  robloxCut: number;
  adSpend: number;
  netRobux: number;
  devexRate: number;
  netUSD: number;
}

export const WaterfallChart = ({ grossRobux, robloxCut, adSpend, netRobux, devexRate, netUSD }: WaterfallChartProps) => {
  const data: WaterfallData[] = [
    {
      name: 'Gross Robux',
      value: grossRobux,
      cumulative: grossRobux,
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Roblox Cut',
      value: -robloxCut,
      cumulative: grossRobux - robloxCut,
      color: 'hsl(var(--destructive))'
    },
    {
      name: 'Ad Spend',
      value: -adSpend,
      cumulative: grossRobux - robloxCut - adSpend,
      color: 'hsl(var(--muted-foreground))'
    },
    {
      name: 'Net Robux',
      value: netRobux,
      cumulative: netRobux,
      color: 'hsl(var(--secondary))'
    },
    {
      name: 'DevEx Rate',
      value: netUSD,
      cumulative: netUSD,
      color: 'hsl(var(--accent))'
    }
  ];

  const formatValue = (value: number, isRobux: boolean = true) => {
    if (isRobux) {
      return `R$ ${Math.abs(value).toLocaleString()}`;
    }
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isUSD = label === 'DevEx Rate';
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Value: {formatValue(data.value, !isUSD)}
          </p>
          <p className="text-sm">
            Cumulative: {formatValue(data.cumulative, !isUSD)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};