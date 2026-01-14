// StaleIndicesView.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getClusters, getStaleIndices } from '../services/api';

export function StaleIndicesView() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClusters().then(d => {
      setClusters(d.clusters || []);
      if (d.clusters && d.clusters.length > 0) setSelectedCluster(d.clusters[0]);
    });
  }, []);

  const handleFetch = () => {
    if (!selectedCluster) return;
    setLoading(true);
    getStaleIndices(selectedCluster, days)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Stale Indices</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Cluster</InputLabel>
            <Select value={selectedCluster} label="Cluster" onChange={(e) => setSelectedCluster(e.target.value)}>
              {clusters.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField label="Days" type="number" value={days} onChange={(e) => setDays(e.target.value)} sx={{ width: 150 }} />
          <Button variant="contained" onClick={handleFetch}>Search</Button>
        </Box>
      </Paper>

      {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

      {data && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Found {data.staleCount} stale indices (not modified in {data.daysChecked} days)</Typography>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Index Name</TableCell>
                  <TableCell align="right">Doc Count</TableCell>
                  <TableCell align="right">Size (GB)</TableCell>
                  <TableCell align="right">Size Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.staleIndices?.map((idx) => (
                  <TableRow key={idx.indexName}>
                    <TableCell>{idx.indexName}</TableCell>
                    <TableCell align="right">{idx.docCount.toLocaleString()}</TableCell>
                    <TableCell align="right">{(idx.currentSize / 1024 / 1024 / 1024).toFixed(2)}</TableCell>
                    <TableCell align="right">{idx.sizeChange}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

// ClustersView.jsx
import { getClusterNodes } from '../services/api';

export function ClustersView() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClusters().then(d => {
      setClusters(d.clusters || []);
      if (d.clusters && d.clusters.length > 0) setSelectedCluster(d.clusters[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedCluster) return;
    setLoading(true);
    getClusterNodes(selectedCluster)
      .then(d => { setNodes(d.nodes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCluster]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Clusters & Nodes</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Cluster</InputLabel>
          <Select value={selectedCluster} label="Cluster" onChange={(e) => setSelectedCluster(e.target.value)}>
            {clusters.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </Select>
        </FormControl>
      </Paper>

      {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Host Name</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>Tier</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodes.map((node, idx) => (
                <TableRow key={idx}>
                  <TableCell>{node.hostName}</TableCell>
                  <TableCell>{node.ipAddress}</TableCell>
                  <TableCell>{node.port}</TableCell>
                  <TableCell>{node.type?.join(', ')}</TableCell>
                  <TableCell>{node.zone}</TableCell>
                  <TableCell>{node.nodeTier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// JobsView.jsx
import { getJobs, triggerJob } from '../services/api';

export function JobsView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    getJobs().then(d => { setJobs(d.jobs || []); setLoading(false); });
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = (jobName) => {
    triggerJob(jobName).then(() => {
      alert(`Job ${jobName} triggered successfully`);
      setTimeout(fetchJobs, 2000);
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Jobs Management</Typography>
      {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Last Status</TableCell>
                <TableCell>Run Count</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.name}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.enabled ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{job.lastStatus}</TableCell>
                  <TableCell>{job.runCount}</TableCell>
                  <TableCell>{job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleTrigger(job.name)}>Trigger</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
