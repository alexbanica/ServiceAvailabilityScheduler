import { DateTimeHelper } from '../helpers/DateTimeHelper';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { UserService } from './UserService';
import { SlackNotificationService } from './SlackNotificationService';

export class ExpiringReservationNotifier {
  private readonly notifiedExpiries = new Map<number, string>();

  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly userService: UserService,
    private readonly slackNotificationService: SlackNotificationService,
    private readonly expiryWarningMinutes: number,
  ) {}

  async notifyExpiring(now: Date): Promise<number> {
    if (!this.slackNotificationService.isEnabled()) {
      return 0;
    }

    const warningIso = DateTimeHelper.toMysqlDateTime(
      new Date(now.getTime() + this.expiryWarningMinutes * 60000),
    );
    const nowIso = DateTimeHelper.toMysqlDateTime(now);

    const expiring =
      await this.reservationRepository.findExpiring(nowIso, warningIso);
    if (!expiring.length) {
      this.notifiedExpiries.clear();
      return 0;
    }

    const userIds = Array.from(new Set(expiring.map((row) => row.userId)));
    const emailMap = await this.userService.getEmailsByIds(userIds);
    const expiringIds = new Set<number>();

    let sent = 0;
    for (const reservation of expiring) {
      if (reservation.id === null) {
        continue;
      }
      expiringIds.add(reservation.id);
      const expiresAt = DateTimeHelper.mysqlDateTimeToDate(
        reservation.expiresAt,
      );
      if (!expiresAt) {
        continue;
      }
      const currentMarker = this.notifiedExpiries.get(reservation.id);
      if (currentMarker && currentMarker === String(reservation.expiresAt)) {
        continue;
      }

      const minutesLeft = Math.max(
        0,
        Math.ceil((expiresAt.getTime() - now.getTime()) / 60000),
      );
      const email = emailMap.get(reservation.userId);
      if (!email) {
        console.warn(`Missing email for user ${reservation.userId}`);
        continue;
      }

      const delivered = await this.slackNotificationService.sendExpiryWarning(
        email,
        {
          serviceName: reservation.serviceName,
          environmentName: reservation.environmentName,
          minutesLeft,
        },
      );

      if (delivered) {
        this.notifiedExpiries.set(
          reservation.id,
          String(reservation.expiresAt),
        );
        sent += 1;
      }
    }

    for (const reservationId of this.notifiedExpiries.keys()) {
      if (!expiringIds.has(reservationId)) {
        this.notifiedExpiries.delete(reservationId);
      }
    }

    return sent;
  }
}
