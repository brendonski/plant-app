<script lang="ts">
	import { plantsStore } from '$lib/stores/plants.svelte';
	import { bedsStore } from '$lib/stores/beds.svelte';
	import PhotoInput from '$lib/components/PhotoInput.svelte';
	import type { Bed } from '$lib/types';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let name = $state('');
	let dominantColour = $state('#ff69b4');
	let photo = $state<string | null>(null);
	let selectedBedId = $state<string>('');
	let selectedRow = $state(0);
	let selectedPosition = $state(0);
	let errors = $state<{
		name?: string;
		bedId?: string;
		location?: string;
	}>({});

	let selectedBed = $derived.by(() => {
		return selectedBedId ? bedsStore.getById(selectedBedId) : null;
	});

	let availableRows = $derived.by(() => {
		if (!selectedBed) return [];
		return Array.from({ length: selectedBed.rows }, (_, i) => i);
	});

	let availablePositions = $derived.by(() => {
		if (!selectedBed) return [];
		return Array.from({ length: selectedBed.positionsPerRow }, (_, i) => i);
	});

	function getRowLabel(row: number): string {
		return String.fromCharCode(65 + row);
	}

	function validate() {
		errors = {};

		if (!name.trim()) {
			errors.name = 'Plant name is required';
		}

		if (!selectedBedId) {
			errors.bedId = 'Please select a bed';
		}

		const existingPlant = plantsStore.getByLocation(selectedBedId, selectedRow, selectedPosition);
		if (existingPlant) {
			errors.location = `Position already occupied by "${existingPlant.name}"`;
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		plantsStore.add({
			name: name.trim(),
			dominantColour,
			photo,
			location: {
				bedId: selectedBedId,
				row: selectedRow,
				position: selectedPosition
			}
		});

		onClose();
	}

	function handlePhotoChange(photoDataUrl: string | null) {
		photo = photoDataUrl;
	}

	$effect(() => {
		if (bedsStore.beds.length > 0 && !selectedBedId) {
			selectedBedId = bedsStore.beds[0].id;
		}
	});
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="name">
			Plant Name <span class="required">*</span>
		</label>
		<input
			type="text"
			id="name"
			bind:value={name}
			placeholder='e.g., Dahlia "Winkie Chevron"'
			class:error={errors.name}
		/>
		{#if errors.name}
			<span class="error-message">{errors.name}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="colour">
			Dominant Colour <span class="required">*</span>
		</label>
		<div class="colour-input-group">
			<input type="color" id="colour" bind:value={dominantColour} />
			<input
				type="text"
				bind:value={dominantColour}
				placeholder="#ff69b4"
				class="colour-text-input"
			/>
		</div>
		<small>Select or enter a colour (hex format)</small>
	</div>

	<div class="form-group">
		<span class="label-text">Photo</span>
		<PhotoInput value={photo} onPhotoChange={handlePhotoChange} />
		<small>Upload an existing photo or take a new one</small>
	</div>

	<div class="form-group">
		<label for="bed">
			Bed <span class="required">*</span>
		</label>
		<select id="bed" bind:value={selectedBedId} class:error={errors.bedId}>
			{#each bedsStore.beds as bed}
				<option value={bed.id}>{bed.name}</option>
			{/each}
		</select>
		{#if errors.bedId}
			<span class="error-message">{errors.bedId}</span>
		{/if}
	</div>

	{#if selectedBed}
		<div class="location-group">
			<div class="form-group">
				<label for="row">
					Row <span class="required">*</span>
				</label>
				<select id="row" bind:value={selectedRow}>
					{#each availableRows as row}
						<option value={row}>Row {getRowLabel(row)}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="position">
					Position <span class="required">*</span>
				</label>
				<select id="position" bind:value={selectedPosition}>
					{#each availablePositions as position}
						<option value={position}>Position {position + 1}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if errors.location}
			<span class="error-message">{errors.location}</span>
		{/if}
	{/if}

	<div class="form-actions">
		<button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
		<button type="submit" class="btn-submit">Add Plant</button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label,
	.label-text {
		font-weight: 500;
		color: #333;
	}

	.required {
		color: #dc3545;
	}

	input[type='text'],
	select {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input[type='text']:focus,
	select:focus {
		outline: none;
		border-color: #007bff;
	}

	input.error,
	select.error {
		border-color: #dc3545;
	}

	.colour-input-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	input[type='color'] {
		width: 60px;
		height: 40px;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
	}

	.colour-text-input {
		flex: 1;
	}

	.location-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	small {
		color: #666;
		font-size: 0.85rem;
	}

	.error-message {
		color: #dc3545;
		font-size: 0.85rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	button {
		padding: 0.5rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: opacity 0.2s;
	}

	button:hover {
		opacity: 0.8;
	}

	.btn-cancel {
		background: #6c757d;
		color: white;
	}

	.btn-submit {
		background: #007bff;
		color: white;
		font-weight: 500;
	}
</style>
