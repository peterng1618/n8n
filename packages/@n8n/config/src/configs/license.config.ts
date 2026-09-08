import { Config, Env } from '../decorators';

@Config
export class LicenseConfig {
	/** URL of the license server used to validate and refresh licenses. */
	@Env('N8N_LICENSE_SERVER_URL')
	serverUrl: string = 'https://license.n8n.io/v1';

	/** Whether to automatically renew licenses before they expire. */
	@Env('N8N_LICENSE_AUTO_RENEW_ENABLED')
	autoRenewalEnabled: boolean = true;

	/** Activation key used to activate or upgrade the instance license. */
	@Env('N8N_LICENSE_ACTIVATION_KEY')
	activationKey: string = '';

	/** Whether to release floating entitlements back to the pool when the instance shuts down. */
	@Env('N8N_LICENSE_DETACH_FLOATING_ON_SHUTDOWN')
	detachFloatingOnShutdown: boolean = true;

	/** Tenant identifier for the license SDK (for example, self-hosted, sandbox, embed, cloud). */
	@Env('N8N_LICENSE_TENANT_ID')
	tenantId: number = 1;

	/** Ephemeral license certificate. See: https://github.com/n8n-io/license-management?tab=readme-ov-file#concept-ephemeral-entitlements */
	@Env('N8N_LICENSE_CERT')
	cert: string = '';

	/**
	 * Report every enterprise feature as licensed and lift all license quotas,
	 * without a license. The instance reports itself as an `Enterprise` plan.
	 * For local development and manual feature testing only.
	 *
	 * Two features stay off on purpose: `feat:apiDisabled`, because it is
	 * inverted and turning it on disables the public API, and
	 * `feat:showNonProdBanner`, because it is a UI marker rather than a
	 * capability.
	 *
	 * This changes only what the license reports. Features that need more
	 * configuration to work (S3 storage, SSO, the AI services) stay unavailable
	 * until you configure them.
	 *
	 * This is not a license grant.
	 */
	@Env('N8N_LICENSE_INSECURE_UNLOCK_ALL_FEATURES')
	insecureUnlockAllFeatures: boolean = false;
}
