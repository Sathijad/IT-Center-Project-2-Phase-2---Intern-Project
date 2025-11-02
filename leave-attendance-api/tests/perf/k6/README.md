# k6 Performance Tests

## Prerequisites

Install k6:
```bash
# Windows (using Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get update && sudo apt-get install -y k6
```

## Running Tests

### Basic Test

```bash
k6 run tests/perf/k6/leave-load.js
```

### With Custom Environment Variables

```bash
API_URL=http://localhost:8082 \
TOKEN=your-jwt-token \
USER_ID=your-user-id \
k6 run tests/perf/k6/leave-load.js
```

### Load Test (Production)

```bash
API_URL=https://api.itcenter.local \
TOKEN=production-token \
k6 run --duration 10m --vus 50 tests/perf/k6/leave-load.js
```

### Stress Test

```bash
API_URL=http://localhost:8082 \
k6 run --duration 5m --vus 100 tests/perf/k6/leave-load.js
```

## Performance Targets

- **p95 latency**: < 300ms
- **p99 latency**: < 500ms
- **Error rate**: < 1%
- **RPS**: ≥ 20 sustained

## Customization

Edit `leave-load.js` to:
- Adjust ramp-up/ramp-down stages
- Change target user count
- Modify thresholds
- Add more endpoints
- Customize sleep intervals

## Output

Reports saved to:
- `tests/perf/reports/k6-summary.json` (JSON)
- `stdout` (text summary)

