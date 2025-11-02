import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { GeoService } from './GeoService';
import { AttendanceLog } from '../types';
import logger from '../lib/logger';
import { differenceInMinutes } from 'date-fns';

export class AttendanceService {
  private repository: AttendanceRepository;
  private geoService: GeoService;

  constructor() {
    this.repository = new AttendanceRepository();
    this.geoService = new GeoService();
  }

  async clockIn(userId: string, lat?: number, lng?: number, source: string = 'MOBILE'): Promise<AttendanceLog> {
    // Check if already clocked in today
    const existing = await this.repository.getTodayClockIn(userId);
    if (existing) {
      throw new Error('ALREADY_CLOCKED_IN');
    }

    // Validate geo location if enabled
    if (lat && lng) {
      const isValid = await this.geoService.validateLocation(lat, lng);
      if (!isValid.valid) {
        throw new Error('GEO_OUT_OF_RANGE');
      }
    }

    const log = await this.repository.clockIn({
      userId,
      clockIn: new Date(),
      lat,
      lng,
      source,
    } as AttendanceLog);

    logger.info('User clocked in', { userId, logId: log.id, lat, lng, source });
    return log;
  }

  async clockOut(userId: string): Promise<void> {
    // Find today's clock-in
    const todayClockIn = await this.repository.getTodayClockIn(userId);
    if (!todayClockIn) {
      throw new Error('CLOCK_OUT_MISSING_IN');
    }

    if (todayClockIn.clockOut) {
      throw new Error('ALREADY_CLOCKED_OUT');
    }

    const clockOutTime = new Date();
    const durationMinutes = differenceInMinutes(clockOutTime, todayClockIn.clockIn);

    await this.repository.clockOut(todayClockIn.id, clockOutTime, durationMinutes);

    logger.info('User clocked out', { userId, logId: todayClockIn.id, durationMinutes });
  }

  async getTodayStatus(userId: string): Promise<{ status: string; log?: AttendanceLog }> {
    const todayClockIn = await this.repository.getTodayClockIn(userId);

    if (!todayClockIn) {
      return { status: 'NOT_STARTED' };
    }

    if (todayClockIn.clockOut) {
      return { status: 'CLOCKED_OUT', log: todayClockIn };
    }

    return { status: 'CLOCKED_IN', log: todayClockIn };
  }

  async getLogs(userId?: string, from?: string, to?: string, pagination?: any) {
    return this.repository.getLogs(userId, from, to, pagination);
  }
}

