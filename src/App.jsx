import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import IndexingRateView from './pages/IndexingRateView';
import TPWQueueView from './pages/TPWQueueView';
import BulkTasksView from './pages/BulkTasksView';
import StaleIndicesView from './pages/StaleIndicesView';
import ClustersView from './pages/ClustersView';
import JobsView from './pages/JobsView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ElasticObservability Dashboard
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Box sx={{ display: 'flex', flex: 1 }}>
            <Navigation />
            
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                p: 3,
              }}
            >
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/indexing-rate" element={<IndexingRateView />} />
                  <Route path="/tpwqueue" element={<TPWQueueView />} />
                  <Route path="/bulk-tasks" element={<BulkTasksView />} />
                  <Route path="/stale-indices" element={<StaleIndicesView />} />
                  <Route path="/clusters" element={<ClustersView />} />
                  <Route path="/jobs" element={<JobsView />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
