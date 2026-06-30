import { useState, useEffect } from "react";
import { admin } from "../../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from "recharts";
import { HiOutlineUsers, HiOutlineCpuChip, HiOutlineDocumentText, HiOutlineChartBarSquare, HiOutlineArrowTrendingUp, HiOutlineShieldCheck } from "react-icons/hi2";

const COLORS = ["#5436da", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const PIE_COLORS = ["#5436da", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#8b5cf6"];
const AUDIT_COLORS = { login: "#10b981", chat: "#5436da", upload: "#f59e0b", register: "#06b6d4" };

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3 hover:border-[var(--accent)]/30 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, height = 260 }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg text-xs shadow-black/20">
      <p className="text-[var(--text-primary)] font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usageChart, setUsageChart] = useState([]);
  const [usersChart, setUsersChart] = useState([]);
  const [providersChart, setProvidersChart] = useState([]);
  const [auditChart, setAuditChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    Promise.all([
      admin.getStats(),
      admin.getChartUsage(),
      admin.getChartUsers(),
      admin.getChartProviders(),
      admin.getChartDailyAudit(),
    ])
      .then(([s, u, us, p, a]) => {
        setStats(s.data.data);
        setUsageChart(u.data.data || []);
        setUsersChart(us.data.data || []);
        setProvidersChart(p.data.data || []);
        setAuditChart(a.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
          <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
          <div className="w-2 h-2 bg-[var(--accent)] rounded-full typing-dot" />
        </div>
      </div>
    );
  }

  const usageData = usageChart.map((d) => ({
    date: d._id.slice(5),
    Success: d.success,
    Failed: d.failed,
    Total: d.total,
  }));

  const regData = usersChart.map((d) => ({
    date: d._id.slice(5),
    Registrations: d.count,
  }));

  const providerData = providersChart.map((d) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count,
  }));

  const totalCalls = providerData.reduce((s, p) => s + p.value, 0);

  const auditChartData = auditChart.map((d) => ({
    date: d._id.slice(5),
    ...d,
  }));

  const auditActions = ["login", "chat", "upload", "register"];

  const totalMessages = stats?.totalAudit || 0;
  const recentRate = stats?.recentLogs && stats?.logs7d ? ((stats.recentLogs / stats.logs7d) * 100).toFixed(0) : "0";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">System overview and analytics</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-0.5">
          {["24h", "7d", "30d"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === t ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HiOutlineUsers} label="Total Users" value={stats?.totalUsers ?? 0} sub={`${stats?.users24h ?? 0} in last 24h`} color="bg-[#5436da]" />
        <StatCard icon={HiOutlineCpuChip} label="API Calls" value={stats?.totalLogs ?? 0} sub={`${stats?.recentLogs ?? 0} today · ${stats?.successRate ?? 0}% success`} color="bg-[#10b981]" />
        <StatCard icon={HiOutlineDocumentText} label="Documents" value={stats?.totalDocs ?? 0} sub={`${stats?.docs24h ?? 0} uploaded today`} color="bg-[#f59e0b]" />
        <StatCard icon={HiOutlineChartBarSquare} label="Conversations" value={stats?.totalConvs ?? 0} sub={`${totalMessages} audit events logged`} color="bg-[#06b6d4]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Daily API Calls" subtitle="Success vs failed requests over time" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} barCategoryGap="20%">
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Success" fill="#10b981" stackId="a" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="Failed" fill="#ef4444" stackId="a" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Registrations" subtitle="Daily signups over the last 30 days" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={regData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5436da" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5436da" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Registrations" stroke="#5436da" strokeWidth={2} fill="url(#regGrad)" dot={false} activeDot={{ r: 4, fill: "#5436da" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Provider Distribution" subtitle="LLM provider usage breakdown" height={240}>
          {providerData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-[var(--text-tertiary)]">No data yet</div>
          ) : (
            <div className="flex items-center h-full gap-4">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={providerData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {providerData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {providerData.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">{p.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{p.value} calls · {((p.value / totalCalls) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Activity Timeline" subtitle="User actions over the last 7 days" height={240}>
          {auditChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-[var(--text-tertiary)]">No activity yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditChartData} barCategoryGap="12%">
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {auditActions.map((a) => (
                  <Bar key={a} dataKey={a} fill={AUDIT_COLORS[a]} stackId="a" radius={[2, 2, 0, 0]} maxBarSize={24} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="System Health" subtitle="Key metrics at a glance" height={240}>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col justify-center items-center bg-[var(--bg-main)] rounded-xl p-4 border border-[var(--border)]">
              <HiOutlineArrowTrendingUp className="w-6 h-6 text-[#10b981] mb-2" />
              <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{stats?.successRate ?? 0}%</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Success Rate</p>
            </div>
            <div className="flex flex-col justify-center items-center bg-[var(--bg-main)] rounded-xl p-4 border border-[var(--border)]">
              <HiOutlineShieldCheck className="w-6 h-6 text-[#5436da] mb-2" />
              <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{stats?.totalAdmins ?? 0}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Admins</p>
            </div>
            <div className="flex flex-col justify-center items-center bg-[var(--bg-main)] rounded-xl p-4 border border-[var(--border)]">
              <HiOutlineDocumentText className="w-6 h-6 text-[#f59e0b] mb-2" />
              <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{stats?.totalDocs ?? 0}</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Documents</p>
            </div>
            <div className="flex flex-col justify-center items-center bg-[var(--bg-main)] rounded-xl p-4 border border-[var(--border)]">
              <HiOutlineCpuChip className="w-6 h-6 text-[#06b6d4] mb-2" />
              <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{recentRate}%</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Activity Rate</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
