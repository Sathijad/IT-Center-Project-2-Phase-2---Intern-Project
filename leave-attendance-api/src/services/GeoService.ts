import logger from '../lib/logger';

const ENABLE_GEO_VALIDATION = process.env.ENABLE_GEO_VALIDATION === 'true';
const OFFICE_LAT = parseFloat(process.env.GEO_OFFICE_LAT || '-33.8688');
const OFFICE_LNG = parseFloat(process.env.GEO_OFFICE_LNG || '151.2093');
const RADIUS_METERS = parseFloat(process.env.GEO_RADIUS_METERS || '500');

export class GeoService {
  validateLocation(lat: number, lng: number): { valid: boolean; distance?: number; error?: string } {
    if (!ENABLE_GEO_VALIDATION) {
      return { valid: true };
    }

    try {
      const distance = this.calculateDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);

      if (distance > RADIUS_METERS) {
        logger.warn('Location validation failed - out of range', {
          lat,
          lng,
          distance,
          radius: RADIUS_METERS,
        });
        return {
          valid: false,
          distance,
          error: `Location is ${Math.round(distance)}m away from office (allowed: ${RADIUS_METERS}m)`,
        };
      }

      return { valid: true, distance };
    } catch (error) {
      logger.error('Geographic validation error', { lat, lng, error });
      return {
        valid: false,
        error: 'Unable to validate location',
      };
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two coordinates
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

