import { supabase } from '../config/supabase';
import { LoggerService } from './LoggerService';

/**
 * SQL for creating the audit_logs table:
 * 
 * CREATE TABLE audit_logs (
 *   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   actor_id    UUID REFERENCES users(id),
 *   actor_role  VARCHAR(20),
 *   action      VARCHAR(100) NOT NULL,
 *   target_id   VARCHAR(255),
 *   target_type VARCHAR(50),
 *   metadata    JSONB,
 *   ip_address  INET,
 *   created_at  TIMESTAMPTZ DEFAULT NOW()
 * );
 */

export class AuditService {
  static async log(params: {
    actorId: string;
    actorRole: string;
    action: string;
    targetId?: string;
    targetType?: string;
    metadata?: any;
    ip?: string;
  }) {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        actor_id: params.actorId,
        actor_role: params.actorRole,
        action: params.action,
        target_id: params.targetId,
        target_type: params.targetType,
        metadata: params.metadata,
        ip_address: params.ip
      });

      if (error) {
        console.error('[AuditService] Failed to log action:', error.message);
      }

      // 2. Also send to Discord for real-time monitoring
      try {
        const metadataStr = params.metadata ? `\n**Metadata**: \`\`\`json\n${JSON.stringify(params.metadata, null, 2)}\n\`\`\`` : '';
        await LoggerService.warn(
            `🛡️ SECURITY AUDIT: ${params.action}`,
            `**Actor**: ${params.actorId} (${params.actorRole})\n**Target**: ${params.targetId || 'N/A'} (${params.targetType || 'N/A'})\n**IP**: ${params.ip || 'Unknown'}${metadataStr}`
        );
      } catch (logErr) {
        console.error('[AuditService] Discord logging failed:', logErr);
      }
    } catch (err) {
      console.error('[AuditService] Unexpected error:', err);
    }
  }
}
