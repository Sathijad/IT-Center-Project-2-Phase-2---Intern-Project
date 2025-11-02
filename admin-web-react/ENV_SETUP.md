# Environment Variables Setup

Create a `.env.local` file in the `admin-web-react/` directory:

## Required Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8082
```

## Quick Setup

```bash
cd admin-web-react

# Create .env.local
echo "VITE_API_BASE_URL=http://localhost:8082" > .env.local
```

## Production

For production deployments:
```env
VITE_API_BASE_URL=https://api.itcenter.local
```

