import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import { MONTHS, money } from '../utils.js';

const Empty = ({ text }) => <p className="empty">{text}</p>;
const tip = (v) => money(v);

export function CategoryPie({ data }) {
  if (!data.length) return <Empty text="No expenses this month. Add one to see where your money goes." />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="name" innerRadius={62} outerRadius={104} paddingAngle={2}>
          {data.map((d) => <Cell key={d.categoryId} fill={d.color} />)}
        </Pie>
        <Tooltip formatter={tip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBar({ data }) {
  const rows = data.map((d) => ({ ...d, name: MONTHS[d.month - 1].slice(0, 3) }));
  if (!rows.some((r) => r.income || r.expense)) return <Empty text="No transactions this year yet." />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows}>
        <CartesianGrid vertical={false} stroke="#d9e0de" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip formatter={tip} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#0e6b5c" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill="#c2412d" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyLine({ data }) {
  if (!data.some((d) => d.expense)) return <Empty text="No daily spending to show for this month." />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke="#d9e0de" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={56} />
        <Tooltip formatter={tip} labelFormatter={(d) => `Day ${d}`} />
        <Line type="monotone" dataKey="expense" name="Spent" stroke="#c2412d" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
