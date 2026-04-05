<script lang="ts">
    import { plantsStore } from "$lib/stores/plants.svelte";
    import { bedsStore } from "$lib/stores/beds.svelte";
    import AddPlantForm from "$lib/components/AddPlantForm.svelte";
    import EditPlantForm from "$lib/components/EditPlantForm.svelte";
    import PhotoCarousel from "$lib/components/PhotoCarousel.svelte";
    import type { Plant } from "$lib/types";
    import { browser } from "$app/environment";
    import { compareColorsByHue } from "$lib/utils/colorSort";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let showAddForm = $state(false);
    let editingPlantId = $state<string | null>(null);
    let initialBedId = $state<string | undefined>(undefined);
    let initialRow = $state<number | undefined>(undefined);
    let initialPosition = $state<number | undefined>(undefined);
    let returnToBedId = $state<string | undefined>(undefined);

    // Handle URL parameters
    $effect(() => {
        const params = $page.url.searchParams;
        const addParam = params.get("add");
        const editParam = params.get("edit");
        const bedParam = params.get("bed");
        const rowParam = params.get("row");
        const positionParam = params.get("position");
        const returnToBedParam = params.get("returnToBed");

        if (returnToBedParam) {
            returnToBedId = returnToBedParam;
        }

        if (addParam === "true") {
            initialBedId = bedParam || undefined;
            initialRow = rowParam ? parseInt(rowParam, 10) : undefined;
            initialPosition = positionParam ? parseInt(positionParam, 10) : undefined;
            showAddForm = true;
            clearUrlParams();
        } else if (editParam) {
            editingPlantId = editParam;
            clearUrlParams();
        }
    });

    function clearUrlParams() {
        const params = new URLSearchParams($page.url.searchParams);
        const returnToBed = params.get("returnToBed");
        if (returnToBed) {
            goto(`/plants?returnToBed=${returnToBed}`, { replaceState: true, keepFocus: true });
        } else {
            goto("/plants", { replaceState: true, keepFocus: true });
        }
    }

    // Load saved sort preference from localStorage
    const SORT_PREFERENCE_KEY = "plant-list-sort-preference";
    const savedSort =
        browser &&
        (localStorage.getItem(SORT_PREFERENCE_KEY) as
            | "name"
            | "bed"
            | "colour"
            | null);
    // Default to 'name' if saved value is invalid or missing
    let sortBy = $state<"name" | "bed" | "colour">(
        savedSort && ["name", "bed", "colour"].includes(savedSort)
            ? savedSort
            : "name",
    );

    // Save sort preference whenever it changes
    $effect(() => {
        if (browser) {
            localStorage.setItem(SORT_PREFERENCE_KEY, sortBy);
        }
    });

    function handleEdit(plantId: string) {
        editingPlantId = plantId;
    }

    function handleRemove(plantId: string) {
        const plant = plantsStore.getById(plantId);
        if (
            plant &&
            confirm(
                `Are you sure you want to remove "${plant.name}"? This action cannot be undone.`,
            )
        ) {
            plantsStore.remove(plantId);
        }
    }

    function closeModals() {
        showAddForm = false;
        editingPlantId = null;
        initialBedId = undefined;
        initialRow = undefined;
        initialPosition = undefined;
    }

    function getBedName(bedId: string): string {
        const bed = bedsStore.getById(bedId);
        return bed?.name || "Unknown Bed";
    }

    function getRowLabel(row: number): string {
        return String.fromCharCode(65 + row);
    }

    function getLocationString(
        bedId: string,
        row: number,
        position: number,
    ): string {
        return `${getBedName(bedId)}, Row ${getRowLabel(row)}, Position ${position + 1}`;
    }

    // Get plants list - use a simpler derived to avoid reactivity issues
    let plants = $derived(plantsStore.plants);

    // Sort the plants based on the selected sort option
    let sortedPlants = $derived.by(() => {
        // Create a copy to sort
        const plantsCopy = plants.slice();

        switch (sortBy) {
            case "name":
                return plantsCopy.sort((a, b) => a.name.localeCompare(b.name));

            case "bed":
                return plantsCopy.sort((a, b) => {
                    const bedA = getBedName(a.location.bedId);
                    const bedB = getBedName(b.location.bedId);
                    const bedCompare = bedA.localeCompare(bedB);
                    if (bedCompare !== 0) return bedCompare;

                    // If same bed, sort by row then position
                    if (a.location.row !== b.location.row) {
                        return a.location.row - b.location.row;
                    }
                    return a.location.position - b.location.position;
                });

            case "colour":
                return plantsCopy.sort((a, b) =>
                    compareColorsByHue(a.dominantColour, b.dominantColour),
                );

            default:
                return plantsCopy;
        }
    });
</script>

<div class="plants-page">
    <div class="header">
        <div class="header-content">
            <h1>Plants</h1>
            <a href="/beds" class="link-secondary">🌱 View Beds</a>
        </div>
        <button class="btn-primary" onclick={() => (showAddForm = true)}
            >+ Add Plant</button
        >
    </div>

    {#if plants.length > 0}
        <div class="controls">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select" bind:value={sortBy}>
                <option value="name">Name</option>
                <option value="bed">Bed & Position</option>
                <option value="colour">Colour</option>
            </select>
        </div>
    {/if}

    {#if bedsStore.beds.length === 0}
        <div class="empty-state">
            <p>No beds created yet.</p>
            <p>
                Please <a href="/beds">create a bed</a> first before adding plants.
            </p>
        </div>
    {:else if plants.length === 0}
        <div class="empty-state">
            <p>No plants recorded yet.</p>
            <p>Click "Add Plant" to record your first plant.</p>
        </div>
    {:else}
        <div class="plants-grid">
            {#each sortedPlants as plant (plant.id)}
                <div class="plant-card">
                    {#if plant.photos.length > 0}
                        <div class="plant-photos">
                            <PhotoCarousel
                                photos={plant.photos}
                                plantName={plant.name}
                            />
                        </div>
                    {:else}
                        <div class="plant-photo-placeholder">
                            <span>📷</span>
                            <small>No photos</small>
                        </div>
                    {/if}

                    <div class="plant-info">
                        <h2>{plant.name}</h2>

                        <div class="plant-details">
                            <p>
                                <strong>Colour:</strong>
                                <span class="colour-display">
                                    <span
                                        class="colour-swatch"
                                        style="background-color: {plant.dominantColour}"
                                    ></span>
                                </span>
                            </p>
                            {#if plant.secondaryColour}
                                <p>
                                    <strong>Secondary Colour:</strong>
                                    <span class="colour-display">
                                        <span
                                            class="colour-swatch"
                                            style="background-color: {plant.secondaryColour}"
                                        ></span>
                                    </span>
                                </p>
                            {/if}
                            <p>
                                <strong>Location:</strong>
                                {getLocationString(
                                    plant.location.bedId,
                                    plant.location.row,
                                    plant.location.position,
                                )}
                            </p>
                            {#if plant.notes}
                                <div class="plant-notes">
                                    <strong>Notes:</strong>
                                    <p class="notes-text">{plant.notes}</p>
                                </div>
                            {/if}
                        </div>

                        <div class="plant-actions">
                            <button
                                class="btn-secondary"
                                onclick={() => handleEdit(plant.id)}
                                >Edit</button
                            >
                            <button
                                class="btn-danger"
                                onclick={() => handleRemove(plant.id)}
                                >Remove</button
                            >
                        </div>
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
                <h2>Add Plant Record</h2>
                <AddPlantForm 
                    onClose={closeModals} 
                    {initialBedId}
                    {initialRow}
                    {initialPosition}
                    {returnToBedId}
                />
            </div>
        </div>
    {/if}

    {#if editingPlantId}
        {@const plant = plantsStore.getById(editingPlantId)}
        {#if plant}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="modal-overlay" onclick={closeModals}>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="modal-content" onclick={(e) => e.stopPropagation()}>
                    <h2>Edit Plant: {plant.name}</h2>
                    <EditPlantForm {plant} onClose={closeModals} {returnToBedId} />
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .plants-page {
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

    .controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .controls label {
        font-weight: 500;
        color: #333;
    }

    .controls select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        font-size: 1rem;
        cursor: pointer;
        transition: border-color 0.2s;
    }

    .controls select:hover {
        border-color: #007bff;
    }

    .controls select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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

    .empty-state a {
        color: #007bff;
        text-decoration: none;
    }

    .empty-state a:hover {
        text-decoration: underline;
    }

    .plants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }

    .plant-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .plant-photos {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f5f5f5;
    }

    .plant-photo-placeholder {
        width: 100%;
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        color: #999;
    }

    .plant-photo-placeholder span {
        font-size: 3rem;
    }

    .plant-photo-placeholder small {
        margin-top: 0.5rem;
    }

    .plant-info {
        padding: 1.5rem;
    }

    .plant-info h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        color: #333;
    }

    .plant-details {
        margin-bottom: 1.5rem;
    }

    .plant-details p {
        margin: 0.75rem 0;
        color: #666;
    }

    .plant-notes {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }

    .plant-notes strong {
        color: #333;
    }

    .notes-text {
        margin: 0.5rem 0 0 0;
        color: #555;
        white-space: pre-wrap;
        line-height: 1.5;
    }

    .colour-display {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .colour-swatch {
        display: inline-block;
        width: 1.5rem;
        height: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .plant-actions {
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
        overflow-y: auto;
        padding: 2rem;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 600px;
        width: 100%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        max-height: 90vh;
        overflow-y: auto;
        margin: auto;
    }

    .modal-content h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
    }
</style>
