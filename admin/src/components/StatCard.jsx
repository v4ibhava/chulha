export default function StatCard({ title, value, icon, color = 'bg-primary-500' }) {
  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
