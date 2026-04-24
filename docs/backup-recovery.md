# Backup and Recovery Strategy

This document outlines the comprehensive backup and recovery strategy for the AI Viz Portal.

## Overview

The backup strategy ensures data protection and business continuity in case of data loss, corruption, or disaster. The strategy uses multiple backup types and retention policies to balance recovery speed with storage costs.

## Backup Strategy

### Database Backups

#### Full Backups
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days
- **Storage**: S3 Standard-IA (Infrequent Access)
- **Description**: Complete database backup including all tables, indexes, and data

#### Incremental Backups
- **Frequency**: Every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC)
- **Retention**: 7 days
- **Storage**: S3 Standard
- **Description**: Only changes since the last full backup

#### Point-in-Time Recovery (PITR)
- **Frequency**: Continuous
- **Retention**: 7 days
- **Storage**: Supabase internal (WAL logs)
- **Description**: Allows recovery to any point in time within the retention window

### Storage Backups

#### Supabase Storage
- **Frequency**: Daily at 3:00 AM UTC
- **Retention**: 30 days
- **Storage**: S3 Standard-IA
- **Description**: Backup of all files stored in Supabase Storage

## Recovery Objectives

### Recovery Point Objective (RPO)
- **Maximum Data Loss**: < 4 hours
- **Description**: In the worst case, at most 4 hours of data may be lost

### Recovery Time Objective (RTO)
- **Complete Recovery**: < 4 hours
- **Critical Systems**: < 1 hour
- **Description**: Time required to restore full system functionality

## Supabase Project Configuration

### Project Details
- **Project ID**: zhofaxmmywbjbofetfla
- **Project Name**: ai-viz-portal
- **Region**: eu-west-1
- **Database Version**: PostgreSQL 17.6.1.104
- **Status**: ACTIVE_HEALTHY

### Backup Configuration Steps

To configure backups in Supabase:

1. **Navigate to Project Settings**
   - Go to Supabase Dashboard
   - Select the ai-viz-portal project
   - Navigate to Database > Backups

2. **Configure Full Backups**
   - Enable daily backups
   - Set backup time to 2:00 AM UTC
   - Set retention to 30 days
   - Configure S3 Standard-IA storage

3. **Configure Incremental Backups**
   - Enable incremental backups
   - Set frequency to every 4 hours
   - Set retention to 7 days
   - Configure S3 Standard storage

4. **Configure PITR**
   - Enable Point-in-Time Recovery
   - Set retention to 7 days
   - Verify WAL log configuration

5. **Configure Storage Backups**
   - Enable storage backups
   - Set backup time to 3:00 AM UTC
   - Set retention to 30 days

## Recovery Procedures

### Scenario 1: Single Table Recovery

**Use Case**: Accidental data deletion or corruption in a single table

**Steps**:
1. Identify the time of the incident
2. Use PITR to restore the database to a point before the incident
3. Export the affected table from the restored database
4. Import the table into the production database
5. Verify data integrity

**Estimated Time**: 1-2 hours

### Scenario 2: Complete Database Recovery

**Use Case**: Complete database corruption or major data loss

**Steps**:
1. Identify the latest valid backup
2. Restore from the most recent full backup
3. Apply incremental backups in chronological order
4. Use PITR for fine-grained recovery if needed
5. Verify all data and functionality
6. Update application configuration if needed

**Estimated Time**: 2-4 hours

### Scenario 3: Storage Recovery

**Use Case**: Loss of files in Supabase Storage

**Steps**:
1. Identify the affected files
2. Restore from the most recent storage backup
3. Verify file integrity
4. Update any references if paths changed

**Estimated Time**: 1-2 hours

## Monitoring and Alerting

### Backup Status Monitoring

Monitor the following metrics:
- Backup success/failure status
- Backup completion time
- Backup size
- Storage usage
- PITR lag time

### Alerting Rules

Set up alerts for:
- Failed backups
- Backup completion time > 2 hours
- Storage usage > 80%
- PITR lag > 1 hour

### Monitoring Tools

Use the backup monitoring utility in `src/lib/backupMonitoring.ts` to:
- Check backup status
- Monitor backup health
- Send alerts on failures
- Generate backup reports

## Testing

### Regular Testing Schedule

- **Monthly**: Test single table recovery
- **Quarterly**: Test complete database recovery
- **Annually**: Test disaster recovery procedures

### Test Procedure

1. Create a test environment
2. Perform a backup restore
3. Verify data integrity
4. Test application functionality
5. Document any issues
6. Update procedures if needed

## Security Considerations

### Backup Encryption
- All backups are encrypted at rest
- Encryption keys are managed by Supabase
- S3 backups use AWS KMS for encryption

### Access Control
- Only authorized personnel can access backups
- Backup access is logged and audited
- Recovery requires multi-factor authentication

### Data Privacy
- Backups comply with GDPR requirements
- Personal data is encrypted
- Backup retention policies are enforced

## Disaster Recovery Plan

### Disaster Scenarios

1. **Regional Outage**
   - Use cross-region replication
   - Restore data from S3 in another region
   - Estimated RTO: 4-8 hours

2. **Account Compromise**
   - Revoke all access
   - Change all credentials
   - Restore from last known good backup
   - Estimated RTO: 2-4 hours

3. **Data Corruption**
   - Identify corruption source
   - Restore from backup before corruption
   - Verify data integrity
   - Estimated RTO: 2-4 hours

## Emergency Contacts

### Primary Contact
- **Role**: Database Administrator
- **Email**: dba@example.com
- **Phone**: +1-555-0100

### Secondary Contact
- **Role**: DevOps Engineer
- **Email**: devops@example.com
- **Phone**: +1-555-0101

### Supabase Support
- **Email**: support@supabase.io
- **Documentation**: https://supabase.com/docs

## Appendix

### Backup Schedule Summary

| Backup Type | Frequency | Retention | Storage | RPO |
|-------------|-----------|-----------|---------|-----|
| Full Database | Daily (2:00 AM UTC) | 30 days | S3 Standard-IA | 24h |
| Incremental | Every 4h | 7 days | S3 Standard | 4h |
| PITR | Continuous | 7 days | Supabase Internal | < 1h |
| Storage | Daily (3:00 AM UTC) | 30 days | S3 Standard-IA | 24h |

### Recovery Time Summary

| Scenario | RTO | Complexity |
|----------|-----|------------|
| Single Table | 1-2h | Low |
| Complete Database | 2-4h | Medium |
| Storage | 1-2h | Low |
| Regional Outage | 4-8h | High |
| Account Compromise | 2-4h | Medium |

### Commands Reference

#### Check Backup Status
```bash
npm run backup:status
```

#### Trigger Manual Backup
```bash
npm run backup:create
```

#### Restore from Backup
```bash
npm run backup:restore <backup-id>
```

#### Monitor Backup Health
```bash
npm run backup:monitor
```

## Related Documentation

- [Supabase Backups](https://supabase.com/docs/guides/database/backups)
- [Point-in-Time Recovery](https://supabase.com/docs/guides/database/pitr)
- [Disaster Recovery](https://supabase.com/docs/guides/platform/disaster-recovery)
