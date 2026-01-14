import { useState, useEffect } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getClusters, getIndexingRate } from '../services/api';

export default function IndexingRateView() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [rateData, setRateData] = useState(null);
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
    getIndexingRate(selectedCluster)
      .then(data => { setRateData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCluster]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Indexing Rate Analysis</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Cluster</InputLabel>
          <Select value={selectedCluster} label="Select Cluster" onChange={(e) => setSelectedCluster(e.target.value)}>
            {clusters.map((cluster) => (<MenuItem key={cluster} value={cluster}>{cluster}</MenuItem>))}
          </Select>
        </FormControl>
      </Paper>

      {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}

      {!loading && rateData && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Index</TableCell>
                <TableCell align="right">Shards</TableCell>
                <TableCell align="right">From Creation</TableCell>
                <TableCell align="right">Last 3m</TableCell>
                <TableCell align="right">Last 15m</TableCell>
                <TableCell align="right">Last 60m</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(rateData.indices || {}).map(([indexName, rate]) => (
                <TableRow key={indexName}>
                  <TableCell>{indexName}</TableCell>
                  <TableCell align="right">{rate.numberOfShards}</TableCell>
                  <TableCell align="right">{rate.fromCreation.toFixed(3)}</TableCell>
                  <TableCell align="right">{rate.last3Minutes.toFixed(3)}</TableCell>
                  <TableCell align="right">{rate.last15Minutes.toFixed(3)}</TableCell>
                  <TableCell align="right">{rate.last60Minutes.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
