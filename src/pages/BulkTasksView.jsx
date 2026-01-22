import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Button,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getBulkTasksClusters, getBulkTasksLatest } from '../services/api';

const BulkTasksView = () => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedHost, setExpandedHost] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch clusters list
  const fetchClusters = async () => {
    try {
      const data = await getBulkTasksClusters();
      setClusters(data.clusters || []);
      if (data.clusters && data.clusters.length > 0 && !selectedCluster) {
        setSelectedCluster(data.clusters[0].clusterName);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch cluster data
  const fetchClusterData = async (clusterName) => {
    if (!clusterName) return;
    try {
      setLoading(true);
      const data = await getBulkTasksLatest(clusterName);
      setClusterData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  useEffect(() => {
    if (selectedCluster) {
      fetchClusterData(selectedCluster);
    }
  }, [selectedCluster]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (selectedCluster) {
        fetchClusterData(selectedCluster);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedCluster, autoRefresh]);

  const handleRefresh = () => {
    fetchClusters();
    if (selectedCluster) {
      fetchClusterData(selectedCluster);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const formatTime = (ms) => {
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  const getTasksColor = (tasks) => {
    if (tasks === 0) return 'default';
    if (tasks > 100) return 'error';
    if (tasks > 50) return 'warning';
    return 'success';
  };

  const getSummaryStats = () => {
    if (!clusterData?.snapshot) return null;
    
    const snapshot = clusterData.snapshot;
    const totalHosts = Object.keys(snapshot.dataWriteBulkSTasksByNode || {}).length;
    const totalIndices = Object.keys(snapshot.dataWriteBulkSTasksByIndex || {}).length;
    
    let totalTasks = 0;
    let totalRequests = 0;
    let totalTime = 0;
    
    Object.values(snapshot.dataWriteBulkSTasksByNode || {}).forEach(node => {
      totalTasks += node.totalWriteBulkSTasks || 0;
      totalRequests += node.totalWriteBulkSRequests || 0;
      totalTime += node.totalWriteBulkSTimeTakenMs || 0;
    });

    return { totalHosts, totalIndices, totalTasks, totalRequests, totalTime };
  };

  const renderSummaryCards = () => {
    const stats = getSummaryStats();
    if (!stats) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Active Tasks
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalTasks}
                  </Typography>
                </Box>
                <SpeedIcon color={getTasksColor(stats.totalTasks)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Requests
                  </Typography>
                  <Typography variant="h5">
                    {formatNumber(stats.totalRequests)}
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Time
                  </Typography>
                  <Typography variant="h5">
                    {formatTime(stats.totalTime)}
                  </Typography>
                </Box>
                <WarningIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Hosts
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalHosts}
                  </Typography>
                </Box>
                <StorageIcon color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Indices
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalIndices}
                  </Typography>
                </Box>
                <StorageIcon color="secondary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderHostsTable = () => {
    if (!clusterData?.snapshot?.dataWriteBulkSTasksByNode) return null;

    const hosts = clusterData.snapshot.sortedHostsOnTasks || [];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Host</TableCell>
              <TableCell align="right">Zone</TableCell>
              <TableCell align="right">Tasks</TableCell>
              <TableCell align="right">Requests</TableCell>
              <TableCell align="right">Time (ms)</TableCell>
              <TableCell align="right">Shards</TableCell>
              <TableCell align="center">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hosts.map((hostName) => {
              const hostData = clusterData.snapshot.dataWriteBulkSTasksByNode[hostName];
              const isExpanded = expandedHost === hostName;

              return (
                <>
                  <TableRow key={hostName} hover>
                    <TableCell>
                      <Tooltip title={hostName}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {hostName}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={hostData.zone || 'N/A'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={hostData.totalWriteBulkSTasks} 
                        color={getTasksColor(hostData.totalWriteBulkSTasks)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{formatNumber(hostData.totalWriteBulkSRequests)}</TableCell>
                    <TableCell align="right">{formatNumber(hostData.totalWriteBulkSTimeTakenMs)}</TableCell>
                    <TableCell align="right">
                      {Object.keys(hostData.dataWriteBulkSByShard || {}).length}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => setExpandedHost(isExpanded ? null : hostName)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Shard Details for {hostName}
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Shard</TableCell>
                                <TableCell align="right">Tasks</TableCell>
                                <TableCell align="right">Requests</TableCell>
                                <TableCell align="right">Time (ms)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(hostData.sortedShardsOnTasks || []).slice(0, 10).map((shard) => {
                                const shardData = hostData.dataWriteBulkSByShard[shard];
                                return (
                                  <TableRow key={shard}>
                                    <TableCell>{shard}</TableCell>
                                    <TableCell align="right">{shardData.numberOfTasks}</TableCell>
                                    <TableCell align="right">{shardData.totalRequests}</TableCell>
                                    <TableCell align="right">{shardData.totalTimeTakenMs}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderIndicesTable = () => {
    if (!clusterData?.snapshot?.dataWriteBulkSTasksByIndex) return null;

    const indices = clusterData.snapshot.indicesSortedonTasks || [];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Index Name</TableCell>
              <TableCell align="right">Tasks</TableCell>
              <TableCell align="right">Requests</TableCell>
              <TableCell align="right">Time (ms)</TableCell>
              <TableCell align="right">Avg Time/Task</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indices.map((indexName) => {
              const indexData = clusterData.snapshot.dataWriteBulkSTasksByIndex[indexName];
              const avgTime = indexData.numberOfTasks > 0 
                ? Math.round(indexData.totalTimeTakenMs / indexData.numberOfTasks)
                : 0;

              return (
                <TableRow key={indexName} hover>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {indexName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={indexData.numberOfTasks} 
                      color={getTasksColor(indexData.numberOfTasks)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{formatNumber(indexData.totalRequests)}</TableCell>
                  <TableCell align="right">{formatNumber(indexData.totalTimeTakenMs)}</TableCell>
                  <TableCell align="right">{avgTime} ms</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bulk Write Tasks Monitoring
        </Typography>
        <Box>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ mr: 1 }}
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Cluster Selection */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Cluster
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {clusters.map((cluster) => (
            <Chip
              key={cluster.clusterName}
              label={cluster.clusterName}
              onClick={() => setSelectedCluster(cluster.clusterName)}
              color={selectedCluster === cluster.clusterName ? 'primary' : 'default'}
              variant={selectedCluster === cluster.clusterName ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : clusterData ? (
        <>
          {renderSummaryCards()}

          <Paper sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Hosts View" />
              <Tab label="Indices View" />
            </Tabs>
          </Paper>

          {tabValue === 0 && renderHostsTable()}
          {tabValue === 1 && renderIndicesTable()}
        </>
      ) : (
        <Alert severity="info">
          No data available for the selected cluster
        </Alert>
      )}
    </Container>
  );
};

export default BulkTasksView;
