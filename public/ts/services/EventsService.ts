export class EventsService {
  private eventSource: EventSource | null = null;

  start(onExpiring: (data: {
    service_key: string;
    environment: string;
    service_name: string;
    minutes_left: number;
  }) => void): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.eventSource = new EventSource('/events');
    this.eventSource.addEventListener('expiring', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as {
        service_key: string;
        environment: string;
        service_name: string;
        minutes_left: number;
      };
      onExpiring(data);
    });
  }
}
