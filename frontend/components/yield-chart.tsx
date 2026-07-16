const points = [42, 49, 45, 57, 55, 67, 74, 71, 82, 88, 94, 101];
const forecast = [101, 108, 114, 121];

function toPath(values: number[], startX = 24, step = 65) {
  return values.map((value, index) => `${index === 0 ? "M" : "L"} ${startX + index * step} ${210 - value * 1.45}`).join(" ");
}

export function YieldChart() {
  const observedPath = toPath(points);
  const forecastPath = toPath([points.at(-1) ?? 101, ...forecast], 24 + (points.length - 1) * 65);

  return (
    <div className="panel overflow-hidden p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Throughput panen</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-forest-950">Panen bergerak lebih cepat.</h2>
          <p className="mt-1 text-xs text-ink-600">Aktual vs proyeksi AI · 30 hari</p>
        </div>
        <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider text-ink-600">
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-forest-700" />Aktual</span>
          <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-leaf-400" />Proyeksi</span>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl bg-cream-50 p-2">
        <svg viewBox="0 0 1040 240" className="h-64 min-w-[780px] w-full" role="img" aria-label="Grafik throughput panen aktual dan proyeksi">
          <defs>
            <linearGradient id="yieldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f6b4b" stopOpacity=".24" />
              <stop offset="1" stopColor="#2f6b4b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 75, 120, 165, 210].map((y) => <line key={y} x1="24" x2="1015" y1={y} y2={y} stroke="#173d2c" strokeOpacity=".08" strokeDasharray="4 7" />)}
          <path d={`${observedPath} L 739 224 L 24 224 Z`} fill="url(#yieldArea)" />
          <path d={observedPath} fill="none" stroke="#22543b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d={forecastPath} fill="none" stroke="#9bc33d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 9" />
          {points.map((value, index) => <circle key={index} cx={24 + index * 65} cy={210 - value * 1.45} r="4" fill="#f3f1e8" stroke="#22543b" strokeWidth="3" />)}
          <rect x="808" y="22" width="190" height="49" rx="14" fill="#0c2419" />
          <text x="824" y="42" fill="#b7d75a" fontSize="10" fontWeight="800">FORECAST</text>
          <text x="824" y="59" fill="white" fontSize="13" fontWeight="800">+18.4 ton / minggu</text>
        </svg>
      </div>
    </div>
  );
}
