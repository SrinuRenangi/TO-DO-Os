import React, { useEffect, useState } from 'react';

export const AnalogClock: React.FC<{ size?: number }> = ({ size = 160 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-white shadow-md border-4 border-slate-200"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 200 200" className="w-full h-full">
        {/* Dial Background with Soft Subtle Gradient */}
        <circle cx="100" cy="100" r="94" fill="#FFFFFF" />

        {/* 60 Minute Tick Marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const isHour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={isHour ? '14' : '17'}
              x2="100"
              y2="21"
              stroke={isHour ? '#334155' : '#CBD5E1'}
              strokeWidth={isHour ? '2.5' : '1'}
              transform={`rotate(${i * 6} 100 100)`}
            />
          );
        })}

        {/* 12 Hour Numerals */}
        {[
          { num: 12, x: 100, y: 35 },
          { num: 1, x: 135, y: 44 },
          { num: 2, x: 160, y: 68 },
          { num: 3, x: 170, y: 104 },
          { num: 4, x: 160, y: 140 },
          { num: 5, x: 135, y: 164 },
          { num: 6, x: 100, y: 174 },
          { num: 7, x: 65, y: 164 },
          { num: 8, x: 40, y: 140 },
          { num: 9, x: 30, y: 104 },
          { num: 10, x: 40, y: 68 },
          { num: 11, x: 65, y: 44 },
        ].map((item) => (
          <text
            key={item.num}
            x={item.x}
            y={item.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="700"
            fill="#1E293B"
            fontFamily="Inter, sans-serif"
          >
            {item.num}
          </text>
        ))}

        {/* Hour Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="56"
          stroke="#0F172A"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 100 100)`}
        />

        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="38"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 100 100)`}
        />

        {/* Second Hand (Orange / Accent) */}
        <line
          x1="100"
          y1="115"
          x2="100"
          y2="28"
          stroke="#EA580C"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${secondAngle} 100 100)`}
        />

        {/* Center Cap Pin */}
        <circle cx="100" cy="100" r="4.5" fill="#EA580C" />
        <circle cx="100" cy="100" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export default AnalogClock;
