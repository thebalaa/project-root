# Infrastructure

This directory houses infrastructure files for **DevOps & Infrastructure** (as per the architecture). The infra components are responsible for:

1. **CI/CD (GitHub Actions)**  
2. **Containerization & Orchestration (Docker, docker-compose)**  
3. **Monitoring & Logging (Prometheus, Loki, Grafana)**  
4. **Testing & QA** (AI Service, Backend, Frontend)

## Structure

- **ci-cd/github-actions.yml**: GitHub Actions workflow definitions (build, lint, test, deploy).  
- **docker/Dockerfile**: Base Docker image definition for the application.  
- **docker/docker-compose.yml**: Compose file linking multiple services (Backend, AI, IPFS, DB, etc.).  
- **monitoring/**: Monitoring configurations for Prometheus, Loki, Grafana.  
- **tests/**: Integration and E2E tests for AI, backend routes, and frontend flows.

## Setup

1. **Docker**:
   - Install Docker and Docker Compose on your system.
   - Run `docker-compose up --build` from `docker/` to start all services locally.

2. **CI/CD**:
   - GitHub Actions will trigger on pushes or pull requests.  
   - Configure environment secrets in your repository settings (for tokens, keys, etc.).

3. **Monitoring**:
   - Prometheus, Loki, Grafana configured to read logs and metrics from containers.
   - Access Grafana dashboards at `http://localhost:3000/` (example port).

## Future Improvements

- Consider migrating from Docker Compose to Kubernetes for production.
- Integrate Alertmanager and advanced logging solutions.
- Expand tests in `infra/tests/` to cover broader use cases.
