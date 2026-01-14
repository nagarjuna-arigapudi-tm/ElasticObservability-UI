import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { getStatus, getClusters, getJobs } from '../services/api';

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, clustersData, jobsData] = await Promise.all([
          getStatus(),
          getClusters(),
          getJobs(),
        ]);
        setStatus(statusData);
        setClusters(clustersData.clusters || []);
        setJobs(jobsData.jobs || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: <strong>{status?.status || 'Unknown'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clusters: <strong>{status?.clusters || 0}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rates Tracked: <strong>{status?.ratesTracked || 0}</strong>
            </Typography>
          </Paper>
        </Grid>

        {/* Clusters Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Clusters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Clusters: <strong>{clusters.length}</strong>
            </Typography>
            <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
              {clusters.slice(0, 5).map((cluster) => (
                <Typography key={cluster} variant="body2">
                  • {cluster}
                </Typography>
              ))}
              {clusters.length > 5 && (
                <Typography variant="body2" color="text.secondary">
                  ... and {clusters.length - 5} more
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Jobs Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Jobs Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Jobs: <strong>{jobs.length}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enabled: <strong>{jobs.filter(j => j.enabled).length}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Run Success: <strong>{jobs.filter(j => j.lastStatus === 'success').length}</strong>
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Jobs
            </Typography>
            <Box sx={{ mt: 2 }}>
              {jobs.slice(0, 5).map((job) => (
                <Box key={job.name} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body1">
                    <strong>{job.name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {job.lastStatus} | Runs: {job.runCount} | 
                    Last: {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
