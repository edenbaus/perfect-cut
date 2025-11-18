# Perfect Cut - Sheet Goods Cutting Optimizer

Perfect Cut helps woodworkers and DIY enthusiasts efficiently cut plywood and sheet goods by optimizing cutting plans to minimize waste, reduce cuts, and work efficiently with handheld tools like circular saws and track saws.

## Features

- **Multiple Optimization Modes**: Minimize waste, cuts, or sheets used
- **Visual Cutting Plans**: Interactive 2D visualization with color-coded pieces
- **Step-by-Step Instructions**: Sequential cutting guide for handheld tools
- **Grain Direction Support**: Maintain consistent grain patterns
- **Kerf Width Accounting**: Accurate blade thickness calculations
- **User Authentication**: Secure account management
- **Project Management**: Save and load multiple projects

## Quick Start with Docker (Recommended)

### Prerequisites

- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- 4GB RAM available
- 2GB disk space

### Running the App

```bash
# 1. Clone the repository
git clone <repository-url>
cd perfect_cut

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Wait for services to start (~60 seconds for first build)
docker-compose logs -f
```

### Access the Application

Once all services are running:

- **Frontend**: http://localhost:81
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

### Your First Project

1. Open http://localhost:81
2. Click "Get Started" to register
3. Create a new project
4. Add a sheet: 96" × 48" (standard plywood)
5. Add pieces you need to cut
6. Click "Calculate Cutting Plan"
7. View your optimized layout!

### Stopping the App

```bash
# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

## Development Mode

For development with hot-reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access at:
# Frontend: http://localhost:5173
# Backend: http://localhost:8005
```

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check status
docker-compose ps

# Rebuild after code changes
docker-compose up -d --build

# Access database
docker-compose exec db psql -U postgres -d perfectcut

# Backup database
docker-compose exec db pg_dump -U postgres perfectcut > backup.sql
```

## Environment Configuration

Edit `.env` file to customize:

```bash
# Ports
FRONTEND_PORT=81
BACKEND_PORT=8001
POSTGRES_PORT=5433

# Database
POSTGRES_DB=perfectcut
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-in-production

# Security (IMPORTANT: Change for production!)
SECRET_KEY=your-secret-key-minimum-32-characters-long
```

## Tech Stack

**Backend:**
- Python 3.11 with FastAPI
- PostgreSQL database
- SQLAlchemy ORM
- Custom bin packing optimization algorithm

**Frontend:**
- React 18 with TypeScript
- Vite build tool
- TailwindCSS styling
- React Konva for visualization

**Deployment:**
- Docker & Docker Compose
- Nginx for production serving

## How It Works

### Optimization Algorithm

Perfect Cut uses a **Guillotine Bin Packing Algorithm** that:
- Places pieces using Best Area Fit strategy
- Accounts for blade kerf (saw width)
- Supports piece rotation when grain allows
- Generates sequential cut instructions
- Minimizes waste across multiple sheets

### Optimization Modes

- **Minimize Waste**: Best material utilization
- **Minimize Cuts**: Fewest number of cuts
- **Minimize Sheets**: Use fewest sheets possible
- **Balanced**: Optimizes across multiple factors

## Troubleshooting

### Can't Access the App?

```bash
# Check if services are running
docker-compose ps

# View logs for errors
docker-compose logs

# Restart everything
docker-compose down
docker-compose up -d
```

### Port Already in Use?

Edit `.env` to use different ports:
```bash
FRONTEND_PORT=3000
BACKEND_PORT=8002
```

### Database Connection Issues?

```bash
# Wait for database to be ready (takes ~10 seconds)
docker-compose logs db

# Look for: "database system is ready to accept connections"
```

### Build Failures?

```bash
# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

For more help, see:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Comprehensive troubleshooting guide
- [DOCKER.md](DOCKER.md) - Detailed Docker documentation
- [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) - Quick start guide

## Manual Installation (Without Docker)

If you prefer not to use Docker:

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
createdb perfectcut
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8001/api
npm run dev
```

Access at http://localhost:5173

## Project Structure

```
perfect_cut/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config & security
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Optimization logic
│   ├── alembic/         # Database migrations
│   └── Dockerfile
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── api/        # API client
│   │   ├── pages/      # Page components
│   │   └── stores/     # State management
│   └── Dockerfile
├── docker-compose.yml   # Production setup
├── docker-compose.dev.yml  # Development setup
└── .env.example        # Environment template
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Key Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login
GET  /api/projects          - List projects
POST /api/projects          - Create project
POST /api/optimize          - Generate cutting plan
```

## Example Project

Try this example to test the optimizer:

**Materials:**
- 1× Sheet: 96" × 48" (4'×8' plywood)

**Pieces Needed:**
- 3× Shelves: 36" × 12"
- 2× Sides: 48" × 12"
- 1× Back: 36" × 36"

**Result:**
- Fits on 1 sheet
- ~15% waste
- 12 cuts needed
- Clear step-by-step instructions

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file

## Support

- **Documentation**: Check TROUBLESHOOTING.md and DOCKER.md
- **Issues**: Open an issue on GitHub
- **Questions**: See API docs at http://localhost:8001/docs

## Security Notes

⚠️ **For Production Deployment:**
- Change `SECRET_KEY` in `.env` (use 32+ random characters)
- Change `POSTGRES_PASSWORD` to a strong password
- Update `BACKEND_CORS_ORIGINS` to your domain
- Use HTTPS/SSL
- Set up regular database backups

Generate a secure key:
```bash
openssl rand -hex 32
```

## Useful Resources

- [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) - Fast Docker setup
- [DOCKER.md](DOCKER.md) - Complete Docker reference
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues & solutions
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

## Acknowledgments

Built with modern web technologies:
- FastAPI for the backend
- React for the frontend
- PostgreSQL for the database
- Docker for containerization

Optimization algorithm inspired by research in cutting stock problems and bin packing.

---

**Happy Cutting!** 🪚

For detailed guides, see the documentation files in this repository.
