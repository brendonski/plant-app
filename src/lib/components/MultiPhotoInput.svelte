<script lang="ts">
	interface Props {
		photos: string[];
		onPhotosChange: (photos: string[]) => void;
	}

	let { photos, onPhotosChange }: Props = $props();

	let fileInput = $state<HTMLInputElement>();
	let showCamera = $state(false);
	let videoElement = $state<HTMLVideoElement>();
	let canvasElement = $state<HTMLCanvasElement>();
	let stream: MediaStream | null = null;
	let supportsCamera = $state(typeof navigator !== 'undefined' && 'mediaDevices' in navigator);

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			const newPhotos = [...photos];
			
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const reader = new FileReader();
				await new Promise<void>((resolve) => {
					reader.onload = (e) => {
						const result = e.target?.result as string;
						newPhotos.push(result);
						resolve();
					};
					reader.readAsDataURL(file);
				});
			}
			
			onPhotosChange(newPhotos);
			if (fileInput) {
				fileInput.value = '';
			}
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

	function capturePhoto() {
		if (videoElement && canvasElement) {
			const context = canvasElement.getContext('2d');
			if (context) {
				canvasElement.width = videoElement.videoWidth;
				canvasElement.height = videoElement.videoHeight;
				context.drawImage(videoElement, 0, 0);
				const photoDataUrl = canvasElement.toDataURL('image/jpeg', 0.9);
				onPhotosChange([...photos, photoDataUrl]);
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

	function removePhoto(index: number) {
		const newPhotos = photos.filter((_, i) => i !== index);
		onPhotosChange(newPhotos);
	}
</script>

<div class="multi-photo-input">
	{#if photos.length > 0}
		<div class="photos-grid">
			{#each photos as photo, index (index)}
				<div class="photo-item">
					<img src={photo} alt="Plant photo {index + 1}" />
					<button type="button" class="remove-photo" onclick={() => removePhoto(index)}>✕</button>
				</div>
			{/each}
		</div>
	{/if}

	<div class="photo-actions">
		<button type="button" class="btn-upload" onclick={() => fileInput?.click()}>
			📁 {photos.length > 0 ? 'Add More Photos' : 'Upload Photos'}
		</button>
		{#if supportsCamera}
			<button type="button" class="btn-camera" onclick={startCamera}>
				📷 {photos.length > 0 ? 'Take Another' : 'Take Photo'}
			</button>
		{/if}
	</div>
	
	<input
		type="file"
		accept="image/*"
		multiple
		bind:this={fileInput}
		onchange={handleFileSelect}
		style="display: none;"
	/>
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
	.multi-photo-input {
		width: 100%;
	}

	.photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.photo-item {
		position: relative;
		aspect-ratio: 1;
		border: 2px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
	}

	.photo-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-photo {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		background: rgba(220, 53, 69, 0.9);
		color: white;
		border: none;
		border-radius: 50%;
		width: 1.75rem;
		height: 1.75rem;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
		padding: 0;
		line-height: 1;
	}

	.remove-photo:hover {
		background: #dc3545;
	}

	.photo-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn-upload,
	.btn-camera {
		padding: 0.75rem 1.5rem;
		border: 1px solid #007bff;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.95rem;
		background: white;
		color: #007bff;
		transition: all 0.2s;
		flex: 1;
		min-width: 150px;
	}

	.btn-upload:hover,
	.btn-camera:hover {
		background: #007bff;
		color: white;
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
