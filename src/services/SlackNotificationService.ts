import https from 'https';
import { SlackConfigDto } from '../dtos/AppConfigDto';

type SlackApiResponse = {
  ok: boolean;
  error?: string;
};

type SlackUserLookupResponse = SlackApiResponse & {
  user?: { id?: string };
};

type SlackConversationOpenResponse = SlackApiResponse & {
  channel?: { id?: string };
};

class SlackApiClient {
  constructor(private readonly token: string) {}

  async lookupUserIdByEmail(email: string): Promise<string | null> {
    const response = await this.request<SlackUserLookupResponse>(
      'users.lookupByEmail',
      { email },
    );
    if (!response.ok) {
      if (response.error === 'users_not_found') {
        return null;
      }
      throw new Error(response.error || 'Slack user lookup failed');
    }
    return response.user?.id ?? null;
  }

  async openIm(userId: string): Promise<string> {
    const response = await this.request<SlackConversationOpenResponse>(
      'conversations.open',
      { users: userId },
    );
    if (!response.ok) {
      throw new Error(response.error || 'Slack conversation open failed');
    }
    const channelId = response.channel?.id;
    if (!channelId) {
      throw new Error('Slack conversation channel missing');
    }
    return channelId;
  }

  async postMessage(channelId: string, text: string): Promise<void> {
    const response = await this.request<SlackApiResponse>('chat.postMessage', {
      channel: channelId,
      text,
      unfurl_links: false,
      unfurl_media: false,
    });
    if (!response.ok) {
      throw new Error(response.error || 'Slack message failed');
    }
  }

  private async request<T extends SlackApiResponse>(
    method: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    const body = JSON.stringify(payload);
    const options = {
      method: 'POST',
      hostname: 'slack.com',
      path: `/api/${method}`,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise<T>((resolve, reject) => {
      const req = https.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Slack HTTP ${res.statusCode}`));
            return;
          }
          try {
            const parsed = JSON.parse(raw) as T;
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}

export type ExpiryWarningPayload = {
  serviceName: string;
  environmentName: string;
  minutesLeft: number;
};

export class SlackNotificationService {
  private readonly client: SlackApiClient | null;
  private readonly userIdCache = new Map<string, string>();

  constructor(private readonly config: SlackConfigDto) {
    if (config.enabled && config.botToken) {
      this.client = new SlackApiClient(config.botToken);
    } else {
      this.client = null;
    }
  }

  isEnabled(): boolean {
    return Boolean(this.client);
  }

  async sendExpiryWarning(
    email: string,
    payload: ExpiryWarningPayload,
  ): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    const userId = await this.lookupUserId(email);
    if (!userId) {
      console.warn(`Slack user not found for ${email}`);
      return false;
    }

    const channelId = await this.client.openIm(userId);
    const minutesLabel = payload.minutesLeft === 1 ? 'minute' : 'minutes';
    const text =
      `Heads up! Your claim on ${payload.serviceName} ` +
      `(${payload.environmentName}) expires in ${payload.minutesLeft} ` +
      `${minutesLabel}. Open the scheduler to extend if needed.`;
    await this.client.postMessage(channelId, text);
    return true;
  }

  private async lookupUserId(email: string): Promise<string | null> {
    const cached = this.userIdCache.get(email);
    if (cached) {
      return cached;
    }
    if (!this.client) {
      return null;
    }
    try {
      const userId = await this.client.lookupUserIdByEmail(email);
      if (userId) {
        this.userIdCache.set(email, userId);
      }
      return userId;
    } catch (err) {
      console.warn(`Slack lookup failed for ${email}`, err);
      return null;
    }
  }
}
