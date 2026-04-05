<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let showPrompt = $state(false);
	let dismissed = $state(false);

	onMount(() => {
		// Check if running in standalone mode (already installed)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		
		// Check if previously dismissed (expires after 7 days)
		const dismissedUntil = localStorage.getItem('install-prompt-dismissed');
		const now = Date.now();
		
		if (dismissedUntil && parseInt(dismissedUntil) > now) {
			return;
		}

		// Detect iOS Safari
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

		// Show prompt if on iOS Safari and not already installed
		if (isIOS && isSafari && !isStandalone) {
			showPrompt = true;
		}
	});

	function dismiss() {
		dismissed = true;
		// Remember dismissal for 7 days
		const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
		localStorage.setItem('install-prompt-dismissed', sevenDaysFromNow.toString());
		
		// Hide with animation
		setTimeout(() => {
			showPrompt = false;
		}, 300);
	}
</script>

{#if browser && showPrompt}
	<div class="install-prompt" class:dismissed>
		<div class="content">
			<div class="icon">🌱</div>
			<div class="text">
				<strong>Install Garden App</strong>
				<p>Add to your home screen to keep your plant data safe and access the app quickly.</p>
				<div class="instructions">
					Tap the menu <span class="menu-icon">⋯</span>, then Share <span class="share-icon">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 5v14M5 12l7-7 7 7"/>
						</svg>
					</span>, then "Add to Home Screen"
				</div>
			</div>
			<button class="dismiss" onclick={dismiss} aria-label="Dismiss">✕</button>
		</div>
	</div>
{/if}

<style>
	.install-prompt {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
		color: white;
		padding: 1rem;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
		transform: translateY(0);
		transition: transform 0.3s ease-out, opacity 0.3s ease-out;
	}

	.install-prompt.dismissed {
		transform: translateY(100%);
		opacity: 0;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		position: relative;
	}

	.icon {
		font-size: 2rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.text {
		flex: 1;
	}

	.text strong {
		display: block;
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
	}

	.text p {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		opacity: 0.95;
	}

	.instructions {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 500;
	}

	.menu-icon {
		display: inline-flex;
		align-items: center;
		background: white;
		color: #22c55e;
		border-radius: 4px;
		padding: 0.15rem 0.35rem;
		margin: 0 0.15rem;
		font-size: 1.2rem;
		font-weight: bold;
		line-height: 1;
	}

	.share-icon {
		display: inline-flex;
		align-items: center;
		background: white;
		color: #22c55e;
		border-radius: 4px;
		padding: 0.15rem;
		margin: 0 0.15rem;
	}

	.dismiss {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		font-size: 1.25rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 0.2s;
	}

	.dismiss:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.dismiss:active {
		background: rgba(255, 255, 255, 0.4);
	}

	@media (max-width: 640px) {
		.install-prompt {
			padding: 0.75rem;
		}

		.icon {
			font-size: 1.5rem;
		}

		.text strong {
			font-size: 1rem;
		}

		.text p {
			font-size: 0.85rem;
		}

		.instructions {
			font-size: 0.8rem;
		}
	}
</style>
