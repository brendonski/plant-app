<script lang="ts">
	import { bedsStore } from '$lib/stores/beds.svelte';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let name = $state('');
	let rows = $state(3);
	let positionsPerRow = $state(10);
	let errors = $state<{ name?: string; rows?: string; positionsPerRow?: string }>({});

	function validate() {
		errors = {};
		
		if (!name.trim()) {
			errors.name = 'Bed name is required';
		}
		
		if (rows < 1) {
			errors.rows = 'Must have at least 1 row';
		} else if (rows > 26) {
			errors.rows = 'Maximum 26 rows (A-Z)';
		}
		
		if (positionsPerRow < 1) {
			errors.positionsPerRow = 'Must have at least 1 position per row';
		} else if (positionsPerRow > 100) {
			errors.positionsPerRow = 'Maximum 100 positions per row';
		}
		
		return Object.keys(errors).length === 0;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (!validate()) {
			return;
		}
		
		bedsStore.add({
			name: name.trim(),
			rows,
			positionsPerRow
		});
		
		onClose();
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="name">
			Bed Name <span class="required">*</span>
		</label>
		<input
			type="text"
			id="name"
			bind:value={name}
			placeholder="e.g., Bed 1, South Garden"
			class:error={errors.name}
		/>
		{#if errors.name}
			<span class="error-message">{errors.name}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="rows">
			Number of Rows <span class="required">*</span>
		</label>
		<input
			type="number"
			id="rows"
			bind:value={rows}
			min="1"
			max="26"
			class:error={errors.rows}
		/>
		<small>Rows will be labeled A, B, C, etc. (max 26)</small>
		{#if errors.rows}
			<span class="error-message">{errors.rows}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="positions">
			Positions per Row <span class="required">*</span>
		</label>
		<input
			type="number"
			id="positions"
			bind:value={positionsPerRow}
			min="1"
			max="100"
			class:error={errors.positionsPerRow}
		/>
		<small>Number of plant positions in each row (max 100)</small>
		{#if errors.positionsPerRow}
			<span class="error-message">{errors.positionsPerRow}</span>
		{/if}
	</div>

	<div class="summary">
		<strong>Total positions:</strong>
		{rows * positionsPerRow}
	</div>

	<div class="form-actions">
		<button type="button" class="btn-cancel" onclick={onClose}>Cancel</button>
		<button type="submit" class="btn-submit">Add Bed</button>
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

	label {
		font-weight: 500;
		color: #333;
	}

	.required {
		color: #dc3545;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	input:focus {
		outline: none;
		border-color: #007bff;
	}

	input.error {
		border-color: #dc3545;
	}

	small {
		color: #666;
		font-size: 0.85rem;
	}

	.error-message {
		color: #dc3545;
		font-size: 0.85rem;
	}

	.summary {
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
		text-align: center;
		color: #333;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
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
