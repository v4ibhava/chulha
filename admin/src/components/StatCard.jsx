export default function StatCard({ title, value, icon, color = 'text-primary-500', bgColor = 'bg-primary-50' }) {
  return (
    <div className="card p-6 animate-fade-in flex items-center gap-4">
      <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/5`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-display font-extrabold text-charcoal-800">{value}</p>
      </div>
    </div>
  );
}
