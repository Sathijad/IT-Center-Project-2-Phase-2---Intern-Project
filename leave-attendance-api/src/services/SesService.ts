import AWS from 'aws-sdk';
import logger from '../lib/logger';

const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@itcenter.local';
const REPLY_TO = process.env.SES_REPLY_TO || 'hr@itcenter.local';

const ses = new AWS.SES({ region: AWS_REGION });

export class SesService {
  async sendLeaveNotification(
    to: string,
    subject: string,
    body: string,
    type: 'requested' | 'approved' | 'rejected'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Email templates
      const templates: Record<string, string> = {
        requested: `Your leave request has been submitted and is pending approval.<br><br>${body}`,
        approved: `Your leave request has been approved.<br><br>${body}`,
        rejected: `Your leave request has been rejected.<br><br>${body}`,
      };

      const emailBody = templates[type] || body;

      const params: AWS.SES.SendEmailRequest = {
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: emailBody },
          },
        },
        ReplyToAddresses: [REPLY_TO],
      };

      // In development, log instead of sending
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Email notification (dev mode)', { to, subject, type });
        return { success: true };
      }

      const result = await ses.sendEmail(params).promise();
      logger.info('Email sent', { to, messageId: result.MessageId, type });

      return { success: true, messageId: result.MessageId };
    } catch (error: any) {
      logger.error('Failed to send email', { to, error: error.message });
      return { success: false, error: error.message };
    }
  }
}

