# ElasticObservability UI

React-based dashboard for visualizing Elasticsearch cluster metrics and monitoring data from ElasticObservability API.

## Features

- **Dashboard**: Overview of application status, clusters, and jobs
- **Indexing Rate Visualization**: View indexing rates per shard across multiple time windows
- **Thread Pool Queue Monitor**: Real-time visualization of thread pool write queue depths
- **Stale Indices Detection**: Identify indices with no modifications over configurable days
- **Cluster & Node Management**: View cluster topology and node details
- **Job Management**: Monitor and trigger scheduled jobs

## Technology Stack

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Prerequisites

- **Node.js 18.x - 22.x** (tested with 22.18.0) and npm 9+
- ElasticObservability backend running on `http://localhost:9092`

## Installation

```bash
# Verify Node.js version
node --version  # Should be 18.x - 22.x

# Install dependencies
npm install
```

**Note:** The project uses ESM modules (`"type": "module"`) and is fully compatible with Node.js 22.18.0.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3000` with API proxy to `http://localhost:9092`.

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ElasticObservability-UI/
├── src/
│   ├── components/
│   │   └── Navigation.jsx       # Side navigation menu
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── IndexingRateView.jsx # Indexing rate analysis
│   │   ├── TPWQueueView.jsx     # Thread pool queue monitoring
│   │   ├── StaleIndicesView.jsx # Stale indices detection
│   │   ├── ClustersView.jsx     # Cluster and node management
│   │   ├── JobsView.jsx         # Job management
│   │   └── AllPages.jsx         # Consolidated components
│   ├── services/
│   │   └── api.js               # API client and endpoints
│   ├── App.jsx                  # Main app component with routing
│   └── main.jsx                 # Application entry point
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## API Integration

The UI connects to ElasticObservability API endpoints:

### Cluster Management
- `GET /api/clusters` - List all clusters
- `GET /api/clusters/{cluster}/nodes` - Get cluster nodes

### Monitoring
- `GET /api/indexingRate/{cluster}` - Indexing rate metrics
- `GET /api/tpwqueue/{cluster}` - Thread pool queue metrics
- `GET /api/staleIndices/{cluster}/{days}` - Stale indices

### Status & Control
- `GET /api/status` - Application status
- `GET /api/jobs` - Job status
- `POST /api/jobs/{job}/trigger` - Trigger job

## Configuration

### API Base URL

The API base URL is configured in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:9092',
      changeOrigin: true,
    },
  },
}
```

To change the backend URL, update the `target` field.

### Port Configuration

Change the development server port in `vite.config.js`:

```javascript
server: {
  port: 3000,  // Change this
}
```

## Features in Detail

### Dashboard
- Real-time application status
- Cluster count and list
- Job execution statistics
- Auto-refresh every 30 seconds

### Indexing Rate View
- Select cluster from dropdown
- View indexing rates for all indices
- Metrics: fromCreation, last3m, last15m, last60m
- Rates displayed in bytes/millisecond per shard

### Thread Pool Queue Monitor
- Real-time queue depth visualization
- Line charts for each host
- Shows last 40 data points
- Auto-refresh every 60 seconds
- Identifies hosts with queue buildup

### Stale Indices View
- Search for indices not modified in n days
- Configurable day threshold
- Shows document count, size, and change
- Helps identify candidates for deletion

### Clusters View
- Select cluster to view nodes
- Display node details (host, IP, type, zone, tier)
- Useful for topology understanding

### Jobs View
- View all scheduled jobs
- See last run status and count
- Manually trigger jobs
- Auto-refresh every 30 seconds

## Development

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/Navigation.jsx`

### Adding New API Endpoints

Add methods to `src/services/api.js`:

```javascript
export const getNewData = async (param) => {
  const response = await apiClient.get(`/newEndpoint/${param}`);
  return response.data;
};
```

## Styling

The application uses Material-UI's theme system. To customize:

Edit theme in `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Change colors here
    },
  },
});
```

## Error Handling

- API errors are logged to console
- Loading states shown with CircularProgress
- Empty states with informative messages
- Failed requests don't crash the app

## Auto-Refresh

Most views auto-refresh:
- Dashboard: 30 seconds
- TPWQueue: 60 seconds
- Jobs: 30 seconds

To disable, remove `setInterval` in useEffect hooks.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

**API connection errors:**
- Ensure backend is running on port 9092
- Check CORS settings if accessing from different origin
- Verify API endpoints in browser DevTools

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

**Blank screen:**
- Check browser console for errors
- Verify `index.html` has correct script path
- Ensure all imports are correct

## Production Deployment

### Static Hosting

```bash
npm run build
# Deploy dist/ directory to your hosting
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://elasticobservability-backend:9092;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

- Code splitting with React.lazy (not yet implemented)
- Memoization with React.memo for expensive components
- Debouncing for search inputs
- Virtual scrolling for large lists (consider for large datasets)

## Future Enhancements

- [ ] Dark mode support
- [ ] Export data to CSV/JSON
- [ ] Advanced filtering and search
- [ ] User preferences persistence
- [ ] Real-time WebSocket updates
- [ ] Alert thresholds configuration
- [ ] Historical trend analysis
- [ ] Cluster comparison views
- [ ] Custom dashboards

## License

Internal use only.

## Support

For issues or questions:
- Check ElasticObservability backend logs
- Review browser console for errors
- Refer to API documentation in backend
