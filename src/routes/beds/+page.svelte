<script lang="ts">
    import { bedsStore } from "$lib/stores/beds.svelte";
    import { plantsStore } from "$lib/stores/plants.svelte";
    import AddBedForm from "$lib/components/AddBedForm.svelte";
    import EditBedForm from "$lib/components/EditBedForm.svelte";

    let showAddForm = $state(false);
    let editingBedId = $state<string | null>(null);

    function handleEdit(bedId: string) {
        editingBedId = bedId;
    }

    function handleRemove(bedId: string) {
        if (
            confirm(
                "Are you sure you want to remove this bed? This action cannot be undone.",
            )
        ) {
            bedsStore.remove(bedId);
        }
    }

    function closeModals() {
        showAddForm = false;
        editingBedId = null;
    }

    $effect(() => {
        console.log("effect has run");
        bedsStore.migrateToIdb();
        plantsStore.migrateToIdb();
    });
</script>

<div class="beds-page">
    <div class="header">
        <div class="header-content">
            <h1>Garden Beds</h1>
            <a href="/plants" class="link-secondary">🌸 View Plants</a>
        </div>
        <button class="btn-primary" onclick={() => (showAddForm = true)}
            >+ Add Bed</button
        >
    </div>

    {#if bedsStore.beds.length === 0}
        <div class="empty-state">
            <p>No beds created yet.</p>
            <p>Click "Add Bed" to get started with your garden management.</p>
        </div>
    {:else}
        <div class="beds-grid">
            {#each bedsStore.beds as bed (bed.id)}
                <div class="bed-card">
                    <h2>{bed.name}</h2>
                    <div class="bed-details">
                        <p><strong>Rows:</strong> {bed.rows}</p>
                        <p>
                            <strong>Positions per row:</strong>
                            {bed.positionsPerRow}
                        </p>
                        <p class="bed-capacity">
                            <strong>Total positions:</strong>
                            {bed.rows * bed.positionsPerRow}
                        </p>
                    </div>
                    <div class="bed-actions">
                        <button
                            class="btn-secondary"
                            onclick={() => handleEdit(bed.id)}>Edit</button
                        >
                        <button
                            class="btn-danger"
                            onclick={() => handleRemove(bed.id)}>Remove</button
                        >
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if showAddForm}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="modal-overlay" onclick={closeModals}>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="modal-content" onclick={(e) => e.stopPropagation()}>
                <h2>Add New Bed</h2>
                <AddBedForm onClose={closeModals} />
            </div>
        </div>
    {/if}

    {#if editingBedId}
        {@const bed = bedsStore.getById(editingBedId)}
        {#if bed}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="modal-overlay" onclick={closeModals}>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="modal-content" onclick={(e) => e.stopPropagation()}>
                    <h2>Edit Bed: {bed.name}</h2>
                    <EditBedForm {bed} onClose={closeModals} />
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .beds-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    h1 {
        margin: 0;
        font-size: 2rem;
    }

    .link-secondary {
        color: #007bff;
        text-decoration: none;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid #007bff;
        border-radius: 4px;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .link-secondary:hover {
        background: #007bff;
        color: white;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #666;
    }

    .empty-state p {
        margin: 0.5rem 0;
    }

    .beds-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .bed-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .bed-card h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        color: #333;
    }

    .bed-details {
        margin-bottom: 1.5rem;
    }

    .bed-details p {
        margin: 0.5rem 0;
        color: #666;
    }

    .bed-capacity {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        color: #333 !important;
    }

    .bed-actions {
        display: flex;
        gap: 0.5rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: opacity 0.2s;
    }

    button:hover {
        opacity: 0.8;
    }

    .btn-primary {
        background: #007bff;
        color: white;
        font-weight: 500;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
        flex: 1;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
        flex: 1;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-content h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
    }
</style>
