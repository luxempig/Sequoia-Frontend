// ← NO code or exports before these imports!
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  year: string;
  count: number;
}

interface Props {
  president: string;
}

const TimelineChart: React.FC<Props> = ({ president }) => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    let url = '/api/voyages/timeline';
    if (president) url += `?president=${encodeURIComponent(president)}`;
    fetch(url)
      .then(res => res.json())
      .then((d: DataPoint[]) => setData(d));
  }, [president]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#3182ce" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TimelineChart;
