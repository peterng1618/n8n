import { Container } from '@n8n/di';

import { GlobalConfig } from '../../index';

const buildConfig = (env: Record<string, string> = {}) => {
	Object.entries(env).forEach(([key, val]) => {
		vi.stubEnv(key, val);
	});
	return Container.get(GlobalConfig);
};

describe('N8N_CLOSED_NETWORK_MODE', () => {
	beforeEach(() => {
		Container.reset();
		vi.unstubAllEnvs();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('is off by default and leaves every caller alone', () => {
		const config = buildConfig();

		expect(config.closedNetworkMode).toBe(false);
		expect(config.diagnostics.enabled).toBe(true);
		expect(config.dynamicBanners.enabled).toBe(true);
		expect(config.versionNotifications.enabled).toBe(true);
		expect(config.versionNotifications.whatsNewEnabled).toBe(true);
		expect(config.license.autoRenewalEnabled).toBe(true);
	});

	it('turns off every n8n-operated caller that is still on its default endpoint', () => {
		const config = buildConfig({ N8N_CLOSED_NETWORK_MODE: 'true' });

		expect(config.diagnostics.enabled).toBe(false);
		expect(config.personalization.enabled).toBe(false);
		expect(config.dynamicBanners.enabled).toBe(false);
		expect(config.versionNotifications.enabled).toBe(false);
		expect(config.versionNotifications.whatsNewEnabled).toBe(false);
		expect(config.license.autoRenewalEnabled).toBe(false);
	});

	it('wins over the individual variables an admin set', () => {
		// The reason the flag exists: one variable instead of eight, and it is not
		// silently defeated by a stale value left in the environment.
		const config = buildConfig({
			N8N_CLOSED_NETWORK_MODE: 'true',
			N8N_DIAGNOSTICS_ENABLED: 'true',
			N8N_DYNAMIC_BANNERS_ENABLED: 'true',
			N8N_VERSION_NOTIFICATIONS_ENABLED: 'true',
			N8N_VERSION_NOTIFICATIONS_WHATS_NEW_ENABLED: 'true',
			N8N_LICENSE_AUTO_RENEW_ENABLED: 'true',
		});

		expect(config.diagnostics.enabled).toBe(false);
		expect(config.dynamicBanners.enabled).toBe(false);
		expect(config.versionNotifications.enabled).toBe(false);
		expect(config.versionNotifications.whatsNewEnabled).toBe(false);
		expect(config.license.autoRenewalEnabled).toBe(false);
	});

	it('warns about the settings it forced off', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		buildConfig({
			N8N_CLOSED_NETWORK_MODE: 'true',
			N8N_DIAGNOSTICS_ENABLED: 'true',
		});

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('N8N_DIAGNOSTICS_ENABLED'));
	});

	describe('endpoints the admin pointed at their own network', () => {
		it('keeps telemetry when the diagnostics endpoint is repointed', () => {
			const config = buildConfig({
				N8N_CLOSED_NETWORK_MODE: 'true',
				N8N_DIAGNOSTICS_CONFIG_BACKEND: 'key;https://telemetry.corp.internal',
			});

			expect(config.diagnostics.enabled).toBe(true);
		});

		it('keeps version checks when the endpoint is repointed', () => {
			const config = buildConfig({
				N8N_CLOSED_NETWORK_MODE: 'true',
				N8N_VERSION_NOTIFICATIONS_ENDPOINT: 'https://versions.corp.internal/',
			});

			expect(config.versionNotifications.enabled).toBe(true);
		});

		it('keeps banners when the endpoint is repointed', () => {
			const config = buildConfig({
				N8N_CLOSED_NETWORK_MODE: 'true',
				N8N_DYNAMIC_BANNERS_ENDPOINT: 'https://banners.corp.internal',
			});

			expect(config.dynamicBanners.enabled).toBe(true);
		});

		it('keeps license renewal when the server URL is repointed', () => {
			const config = buildConfig({
				N8N_CLOSED_NETWORK_MODE: 'true',
				N8N_LICENSE_SERVER_URL: 'https://license.corp.internal/v1',
			});

			expect(config.license.autoRenewalEnabled).toBe(true);
		});
	});

	describe('destinations the admin owns', () => {
		it('never clears the Sentry DSNs', () => {
			// A DSN the admin set may well name a Sentry inside the closed network.
			const config = buildConfig({
				N8N_CLOSED_NETWORK_MODE: 'true',
				N8N_SENTRY_DSN: 'https://key@sentry.corp.internal/1',
				N8N_FRONTEND_SENTRY_DSN: 'https://key@sentry.corp.internal/2',
			});

			expect(config.sentry.backendDsn).toBe('https://key@sentry.corp.internal/1');
			expect(config.sentry.frontendDsn).toBe('https://key@sentry.corp.internal/2');
		});

		it('never disables the templates library or external hooks', () => {
			// Anonymous reads, so out of scope by design.
			const config = buildConfig({ N8N_CLOSED_NETWORK_MODE: 'true' });

			expect(config.templates.enabled).toBe(true);
		});
	});
});
