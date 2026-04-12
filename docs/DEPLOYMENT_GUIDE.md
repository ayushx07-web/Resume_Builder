# Resume Builder - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Configure production database
- [ ] Set up production email service
- [ ] Configure Razorpay production keys
- [ ] Generate strong JWT secret
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment Variables

Create `.env` file in production:

```env
# Database - Production MySQL
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_NAME=resumebuilder_prod
DB_USER=prod_user
DB_PASSWORD=STRONG_SECURE_PASSWORD

# JWT - Use strong random keys
JWT_SECRET=GENERATE_A_VERY_LONG_RANDOM_STRING_AT_LEAST_64_CHARACTERS
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Razorpay - Production Keys
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXX

# Email - Production SMTP
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=YOUR_SENDGRID_API_KEY

# Application
APP_URL=https://resumebuilder.com
API_URL=https://api.resumebuilder.com
SUPPORT_EMAIL=support@resumebuilder.com

# CORS
CORS_ORIGINS=https://resumebuilder.com,https://www.resumebuilder.com
```

---

## Docker Production Deployment

### 1. Build Images

```bash
# Build backend
cd backend
docker build -t resumebuilder-backend:latest .

# Build frontend
cd ../frontend
docker build -t resumebuilder-frontend:latest .
```

### 2. Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: resumebuilder-mysql-prod
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-prod-data:/var/lib/mysql
    networks:
      - resumebuilder-prod-network
    restart: always
    command: --default-authentication-plugin=mysql_native_password

  backend:
    image: resumebuilder-backend:latest
    container_name: resumebuilder-backend-prod
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - resumebuilder-prod-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: resumebuilder-frontend:latest
    container_name: resumebuilder-frontend-prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - resumebuilder-prod-network
    restart: always
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  mysql-prod-data:

networks:
  resumebuilder-prod-network:
    driver: bridge
```

### 3. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## AWS Deployment

### Architecture

```
Internet
    |
CloudFront (CDN)
    |
Application Load Balancer
    |
    ├── ECS/Fargate (Backend)
    |   └── RDS MySQL
    └── S3 (Frontend Static)
```

### Setup Steps

1. **RDS MySQL Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier resumebuilder-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

2. **ECR Repository**
```bash
aws ecr create-repository --repository-name resumebuilder-backend
aws ecr create-repository --repository-name resumebuilder-frontend
```

3. **Push Docker Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_URI

# Tag and push
docker tag resumebuilder-backend:latest YOUR_ECR_URI/resumebuilder-backend:latest
docker push YOUR_ECR_URI/resumebuilder-backend:latest
```

4. **ECS Cluster**
```bash
aws ecs create-cluster --cluster-name resumebuilder-cluster
```

5. **Task Definition**

Create `task-definition.json`:

```json
{
  "family": "resumebuilder",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_URI/resumebuilder-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"},
        {"name": "DB_HOST", "value": "your-rds-endpoint.rds.amazonaws.com"}
      ]
    }
  ]
}
```

6. **S3 for Frontend**
```bash
aws s3 mb s3://resumebuilder-frontend
aws s3 sync ./frontend/dist s3://resumebuilder-frontend --delete
aws s3 website s3://resumebuilder-frontend --index-document index.html
```

7. **CloudFront Distribution**
```bash
aws cloudfront create-distribution \
  --origin-domain-name resumebuilder-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

---

## Kubernetes Deployment

### 1. Create Deployments

**backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resumebuilder-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resumebuilder-backend
  template:
    metadata:
      labels:
        app: resumebuilder-backend
    spec:
      containers:
      - name: backend
        image: resumebuilder-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: host
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secrets
              key: secret
---
apiVersion: v1
kind: Service
metadata:
  name: resumebuilder-backend-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: resumebuilder-backend
```

**frontend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resumebuilder-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resumebuilder-frontend
  template:
    metadata:
      labels:
        app: resumebuilder-frontend
    spec:
      containers:
      - name: frontend
        image: resumebuilder-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: resumebuilder-frontend-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: resumebuilder-frontend
```

### 2. Create Secrets

```bash
kubectl create secret generic db-secrets \
  --from-literal=host=your-db-host \
  --from-literal=user=your-db-user \
  --from-literal=password=your-db-password

kubectl create secret generic jwt-secrets \
  --from-literal=secret=your-jwt-secret
```

### 3. Deploy

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

---

## Nginx Configuration

**nginx.conf for production:**

```nginx
upstream backend {
    server backend:8080;
}

server {
    listen 80;
    server_name resumebuilder.com www.resumebuilder.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name resumebuilder.com www.resumebuilder.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## SSL Certificate Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d resumebuilder.com -d www.resumebuilder.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Database Backup Strategy

### Automated MySQL Backups

**backup.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="resumebuilder"

mkdir -p $BACKUP_DIR

mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > \
  $BACKUP_DIR/resumebuilder_$DATE.sql

# Compress
gzip $BACKUP_DIR/resumebuilder_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/resumebuilder_$DATE.sql.gz \
  s3://resumebuilder-backups/mysql/

# Keep only last 30 days locally
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Crontab:**
```bash
0 2 * * * /path/to/backup.sh
```

---

## Monitoring

### Prometheus & Grafana

**prometheus.yml:**
```yaml
scrape_configs:
  - job_name: 'resumebuilder-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/api/actuator/prometheus'
```

### CloudWatch (AWS)

Enable CloudWatch logs for ECS:

```json
{
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/resumebuilder",
      "awslogs-region": "us-east-1",
      "awslogs-stream-prefix": "backend"
    }
  }
}
```

---

## Performance Optimization

### Backend
- Enable connection pooling
- Configure Redis for caching
- Enable Gzip compression
- Use CDN for static assets

### Frontend
- Enable browser caching
- Minify and compress assets
- Use lazy loading
- Implement code splitting

### Database
- Add proper indexes
- Optimize queries
- Enable query caching
- Use read replicas for scaling

---

## Security Checklist

- [ ] Use HTTPS only
- [ ] Enable CORS properly
- [ ] Rate limiting implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure password storage (BCrypt)
- [ ] JWT token expiration
- [ ] Input validation
- [ ] Security headers configured
- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Database encryption at rest
- [ ] Secure environment variables

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs resumebuilder-backend

# Verify database connection
mysql -h DB_HOST -u DB_USER -p

# Check environment variables
docker exec resumebuilder-backend env
```

### Database Connection Issues

```bash
# Test MySQL connection
telnet DB_HOST 3306

# Check Flyway migrations
docker exec resumebuilder-backend ./mvnw flyway:info
```

### Performance Issues

```bash
# Check container resources
docker stats

# Monitor database
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;
```

---

## Rollback Strategy

### Quick Rollback

```bash
# Rollback backend
docker-compose -f docker-compose.prod.yml stop backend
docker tag resumebuilder-backend:previous resumebuilder-backend:latest
docker-compose -f docker-compose.prod.yml up -d backend

# Rollback database (if needed)
mysql -u root -p resumebuilder < backup_YYYYMMDD.sql
```

---

## Support

For deployment assistance:
- Email: devops@resumebuilder.com
- Docs: https://docs.resumebuilder.com
- GitHub Issues: https://github.com/yourusername/resume-builder/issues
