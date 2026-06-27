export function VehicleSilhouette({ color = "#64748b" }) {
  return (
    <svg aria-hidden="true" className="h-12 w-20 shrink-0" viewBox="0 0 128 72" fill="none">
      <path
        d="M27 47.5 35.5 30a10 10 0 0 1 9-5.5h39a10 10 0 0 1 9 5.5L101 47.5h4.5A8.5 8.5 0 0 1 114 56v4.5a3 3 0 0 1-3 3h-6a8.5 8.5 0 0 1-17 0H40a8.5 8.5 0 0 1-17 0h-6a3 3 0 0 1-3-3V56a8.5 8.5 0 0 1 8.5-8.5H27Z"
        fill={color}
        stroke="#0f172a"
        strokeOpacity="0.15"
        strokeWidth="2"
      />
      <path d="M46 31h36c4.2 0 8 2.4 9.8 6.1L96 45H32l4.2-7.9A11 11 0 0 1 46 31Z" fill="white" fillOpacity="0.35" />
      <circle cx="33.5" cy="56" r="7.5" fill="#111827" />
      <circle cx="94.5" cy="56" r="7.5" fill="#111827" />
      <circle cx="33.5" cy="56" r="3.75" fill="#cbd5e1" />
      <circle cx="94.5" cy="56" r="3.75" fill="#cbd5e1" />
    </svg>
  );
}
