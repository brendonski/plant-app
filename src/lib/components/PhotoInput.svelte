<script lang="ts">
	import { settingsStore } from '$lib/stores/settings.svelte';
	import { resizeImage } from '$lib/utils/imageResize';

	interface Props {
		value: string | null;
		onPhotoChange: (photoDataUrl: string | null) => void;
	}

	let { value, onPhotoChange }: Props = $props();

	let fileInput = $state<HTMLInputElement>();
	let showCamera = $state(false);
	let videoElement = $state<HTMLVideoElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let stream: MediaStream | null = null;
	let supportsCamera = $state(typeof navigator !== 'undefined' && 'mediaDevices' in navigator);

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async (e) => {
				const result = e.target?.result as string;
				try {
					const resized = await resizeImage(
						result,
						settingsStore.getMaxDimension(),
						settingsStore.getJpegQuality()
					);
					onPhotoChange(resized);
				} catch (err) {
					console.error('Error resizing image:', err);
					onPhotoChange(result); // Fallback to original
				}
			};
			reader.readAsDataURL(file);
		}
	}

	async function startCamera() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			showCamera = true;
			setTimeout(() => {
				if (videoElement) {
					videoElement.srcObject = stream;
				}
			}, 0);
		} catch (err) {
			alert('Unable to access camera: ' + err);
		}
	}

	async function capturePhoto() {
		if (videoElement && canvasElement) {
			const context = canvasElement.getContext('2d');
			if (context) {
				canvasElement.width = videoElement.videoWidth;
				canvasElement.height = videoElement.videoHeight;
				context.drawImage(videoElement, 0, 0);
				const photoDataUrl = canvasElement.toDataURL('image/jpeg', settingsStore.getJpegQuality());
				
				try {
					const resized = await resizeImage(
						photoDataUrl,
						settingsStore.getMaxDimension(),
						settingsStore.getJpegQuality()
					);
					onPhotoChange(resized);
				} catch (err) {
					console.error('Error resizing image:', err);
					onPhotoChange(photoDataUrl); // Fallback to original
				}
				
				closeCamera();
			}
		}
	}

	function closeCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		showCamera = false;
	}

	function removePhoto() {
		onPhotoChange(null);
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<div class="photo-input">
	{#if value}
		<div class="photo-preview">
			<img src={value} alt="Plant preview" />
			<button type="button" class="remove-photo" onclick={removePhoto}>✕</button>
		</div>
	{:else}
		<div class="photo-actions">
			<button type="button" class="btn-upload" onclick={() => fileInput?.click()}>
				📁 Upload Photo
			</button>
			{#if supportsCamera}
				<button type="button" class="btn-camera" onclick={startCamera}>📷 Take Photo</button>
			{/if}
		</div>
		<input
			type="file"
			accept="image/*"
			bind:this={fileInput}
			onchange={handleFileSelect}
			style="display: none;"
		/>
	{/if}
</div>

{#if showCamera}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="camera-modal" onclick={closeCamera}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="camera-content" onclick={(e) => e.stopPropagation()}>
			<video bind:this={videoElement} autoplay playsinline></video>
			<canvas bind:this={canvasElement} style="display: none;"></canvas>
			<div class="camera-controls">
				<button type="button" class="btn-capture" onclick={capturePhoto}>📸 Capture</button>
				<button type="button" class="btn-cancel" onclick={closeCamera}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.photo-input {
		width: 100%;
	}

	.photo-preview {
		position: relative;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		border: 2px dashed #ddd;
		border-radius: 8px;
		overflow: hidden;
	}

	.photo-preview img {
		width: 100%;
		height: auto;
		display: block;
	}

	.remove-photo {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(220, 53, 69, 0.9);
		color: white;
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.remove-photo:hover {
		background: #dc3545;
	}

	.photo-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		padding: 2rem;
		border: 2px dashed #ddd;
		border-radius: 8px;
	}

	.btn-upload,
	.btn-camera {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		background: #007bff;
		color: white;
		transition: opacity 0.2s;
	}

	.btn-upload:hover,
	.btn-camera:hover {
		opacity: 0.8;
	}

	.camera-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
	}

	.camera-content {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		max-width: 90%;
		max-height: 90%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	video {
		max-width: 100%;
		border-radius: 4px;
	}

	.camera-controls {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.btn-capture {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		background: #28a745;
		color: white;
		font-weight: 500;
	}

	.btn-cancel {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		background: #6c757d;
		color: white;
	}

	.btn-capture:hover,
	.btn-cancel:hover {
		opacity: 0.8;
	}
</style>
