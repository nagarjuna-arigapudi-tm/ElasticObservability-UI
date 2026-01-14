import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Grid
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getClusters, getTPWQueueCluster } from '../services/api';

export default function TPWQueueView() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [tpwqData, setTpwqData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClusters().then(data => {
      setClusters(data.clusters || []);
      if (data.clusters && data.clusters.length > 0) {
        setSelectedCluster(data.clusters[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCluster) return;

    setLoading(true);
    getTPWQueueCluster(selectedCluster)
      .then(data => {
        setTpwqData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching TPWQueue data:', error);
        setLoading(false);
      });

    const interval = setInterval(() => {
      getTPWQueueCluster(selectedCluster)
        .then(data => setTpwqData(data))
        .catch(console.error);
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [selectedCluster]);

  const prepareChartData = (hostName) => {
    if (!tpwqData?.hosts?.[hostName]?.dataPoints) return [];
    
    return tpwqData.hosts[hostName].dataPoints
      .slice(0, 40) // Show last 40 points
      .reverse()
      .map(dp => ({
        time: new Date(dp.timestamp).toLocaleTimeString(),
        queue: dp.queue,
      }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Thread Pool Write Queue Monitor
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Cluster</InputLabel>
          <Select
            value={selectedCluster}
            label="Select Cluster"
            onChange={(e) => setSelectedCluster(e.target.value)}
          >
            {clusters.map((cluster) => (
              <MenuItem key={cluster} value={cluster}>{cluster}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && tpwqData && (
        <Grid container spacing={3}>
          {tpwqData.hostnames?.map((hostName) => (
            <Grid item xs={12} key={hostName}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {hostName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Data Points: {tpwqData.hosts[hostName]?.dataPointCount} / {tpwqData.hosts[hostName]?.numberOfDataPoints}
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareChartData(hostName)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'Queue Depth', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="queue" stroke="#8884d8" name="Thread Pool Write Queue" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !tpwqData && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No data available. Ensure the getThreadPoolWriteQueue job is enabled and running.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
