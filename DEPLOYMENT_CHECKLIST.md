# Deployment Checklist

## Pre-Deployment

### Backend
- [x] All code reviewed and approved
- [x] Linter passes (zero errors)
- [x] All tests passing
- [x] Coverage ≥80%
- [x] Environment variables documented
- [x] Secrets properly configured
- [x] Database migrations tested
- [x] API documentation up to date

### Frontend
- [x] All components tested
- [x] Build succeeds
- [x] No console errors
- [x] Responsive design verified
- [x] Accessibility checked
- [x] API integration tested

### Infrastructure
- [x] Terraform plan reviewed
- [x] Resource limits verified
- [x] Cost estimates within budget
- [x] Security groups configured
- [x] Monitoring enabled
- [x] Backups configured

## Deployment Steps

### 1. Database
- [ ] Backup existing database
- [ ] Run migrations: `npm run migrate:up`
- [ ] Verify schema changes
- [ ] Seed initial data: `npm run seed`
- [ ] Test database connectivity

### 2. Backend
- [ ] Build production bundle
- [ ] Upload to Lambda / Configure server
- [ ] Set environment variables
- [ ] Deploy Lambda functions
- [ ] Configure API Gateway
- [ ] Test health endpoints
- [ ] Verify JWT validation
- [ ] Test all API endpoints

### 3. Frontend
- [ ] Build production bundle
- [ ] Upload to S3 / hosting
- [ ] Configure CDN
- [ ] Set environment variables
- [ ] Verify API connectivity
- [ ] Test authentication
- [ ] Verify all pages load

### 4. Infrastructure
- [ ] Run Terraform plan
- [ ] Review changes
- [ ] Apply infrastructure: `terraform apply`
- [ ] Verify all resources created
- [ ] Check CloudWatch logs
- [ ] Verify alarms configured
- [ ] Test scaling

### 5. Monitoring
- [ ] CloudWatch dashboards active
- [ ] Alarms configured
- [ ] Log aggregation working
- [ ] Error tracking enabled
- [ ] Performance monitoring on
- [ ] Health checks passing

## Post-Deployment

### Verification
- [ ] Canary deployment successful
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] Database queries successful
- [ ] Frontend loads correctly
- [ ] User flows tested
- [ ] Performance acceptable

### Monitoring
- [ ] Error rate <1%
- [ ] p95 latency <300ms
- [ ] No memory leaks
- [ ] No connection pool exhaustion
- [ ] DLQ empty
- [ ] All alarms normal

### Documentation
- [ ] Deployment notes updated
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide reviewed
- [ ] Runbook finalized
- [ ] Stakeholders notified

## Rollback Plan

If issues are detected:

1. **Immediate Rollback** (< 5 min)
   - Switch Lambda alias to previous version
   - Rollback database migration if needed
   - Revert frontend to previous deployment

2. **Verify Rollback**
   - Health checks passing
   - Error rate normal
   - No data corruption

3. **Investigation**
   - Review logs and metrics
   - Identify root cause
   - Create incident report
   - Plan fixes for next deployment

## Emergency Contacts

- **DevOps Team**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Security Team**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

## Rollback Commands

```bash
# Lambda rollback
aws lambda update-alias \
  --function-name leave-attendance-api \
  --name LIVE \
  --function-version <previous-version>

# Database rollback
npm run migrate:down

# Frontend rollback
aws s3 sync s3://previous-deployment/ s3://current-bucket/
```

## Success Criteria

- ✅ All services healthy
- ✅ Zero errors in logs
- ✅ Performance targets met
- ✅ All users can access system
- ✅ Data integrity maintained
- ✅ Security posture maintained

---

**Approved By**: [Name]  
**Date**: [Date]  
**Status**: Ready for Production ✅

