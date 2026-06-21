export default function KPICard({ icon: Icon, label, value, color = 'accent' }) {
  const iconColor = color === 'genie' ? 'text-ag-genie'  : 'text-ag-accent';
  const iconBg    = color === 'genie' ? 'bg-ag-genie-subtle' : 'bg-ag-accent-subtle';

  return (
    <div className="ag-fade-in bg-ag-bg-surface border border-ag-border rounded-xl p-5 hover:border-ag-border-strong transition-colors">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.5} />
      </div>
      <p className={`font-display text-2xl font-bold ${iconColor} mb-0.5`}>{value}</p>
      <p className="text-xs text-ag-fg-subtle">{label}</p>
    </div>
  );
}
