const colors = {
  Low: "#6b7280",
  Medium: "#2563eb",
  High: "#d97706",
  Critical: "#dc2626",
};

export default function PriorityBadge({ level }) {
  return (
    <span
      className="priority-badge"
      style={{ backgroundColor: colors[level] || "#6b7280" }}
    >
      {level}
    </span>
  );
}
