<script lang="ts">
    import { page } from "$app/stores";
    import { bedsStore } from "$lib/stores/beds.svelte";
    import { plantsStore } from "$lib/stores/plants.svelte";
    import { goto } from "$app/navigation";

    const bedId = $derived($page.params.bedId ?? "");
    const bed = $derived(bedsStore.getById(bedId));
    const plants = $derived(plantsStore.getByBed(bedId));

    function getRowLabel(row: number): string {
        return String.fromCharCode(65 + row);
    }

    function getPlantAtPosition(row: number, position: number) {
        return plants.find(
            (p) => p.location.row === row && p.location.position === position,
        );
    }

    function handlePositionClick(row: number, position: number) {
        const plant = getPlantAtPosition(row, position);
        if (plant) {
            goto(`/plants?edit=${plant.id}`);
        } else {
            goto(`/plants?add=true&bed=${bedId}&row=${row}&position=${position}`);
        }
    }
</script>

{#if !bed}
    <div class="bed-grid-page">
        <div class="error-state">
            <h1>Bed Not Found</h1>
            <p>The bed you're looking for doesn't exist.</p>
            <a href="/beds" class="btn-primary">← Back to Beds</a>
        </div>
    </div>
{:else}
    <div class="bed-grid-page">
        <div class="header">
            <div class="header-content">
                <a href="/beds" class="back-link">← Back to Beds</a>
                <h1>{bed.name}</h1>
            </div>
            <div class="bed-info">
                <span>{bed.rows} rows × {bed.positionsPerRow} positions</span>
            </div>
        </div>

        <div class="grid-container">
            <div class="grid-wrapper">
                {#each Array(bed.rows) as _, rowIndex}
                    <div class="grid-column">
                        <div class="row-label">{getRowLabel(rowIndex)}</div>
                        <div class="positions">
                            {#each Array(bed.positionsPerRow) as _, posIndex}
                                {@const plant = getPlantAtPosition(rowIndex, posIndex)}
                                <button
                                    class="position-cell"
                                    class:occupied={plant}
                                    class:empty={!plant}
                                    onclick={() =>
                                        handlePositionClick(rowIndex, posIndex)}
                                    style={plant && plant.photos.length === 0
                                        ? `background-color: ${plant.dominantColour}33`
                                        : ""}
                                >
                                    <span class="position-number">{posIndex + 1}</span>
                                    {#if plant}
                                        {#if plant.photos.length > 0}
                                            <img 
                                                src={plant.photos[0]} 
                                                alt={plant.name} 
                                                class="plant-photo"
                                            />
                                        {:else}
                                            <div 
                                                class="plant-color-swatch"
                                                style="background-color: {plant.dominantColour}"
                                            ></div>
                                        {/if}
                                        <span class="plant-name">{plant.name}</span>
                                    {:else}
                                        <span class="empty-label">Empty</span>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-color empty-color"></div>
                <span>Empty position (click to add plant)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color occupied-color"></div>
                <span>Occupied position (click to edit plant)</span>
            </div>
        </div>
    </div>
{/if}

<style>
    .bed-grid-page {
        max-width: 768px;
        margin: 0 auto;
        padding: 2rem;
        width: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .header-content {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .back-link {
        color: #007bff;
        text-decoration: none;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid #007bff;
        border-radius: 4px;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .back-link:hover {
        background: #007bff;
        color: white;
    }

    h1 {
        margin: 0;
        font-size: 2rem;
    }

    .bed-info {
        color: #666;
        font-size: 1rem;
    }

    .error-state {
        text-align: center;
        padding: 4rem 2rem;
    }

    .error-state h1 {
        color: #dc3545;
        margin-bottom: 1rem;
    }

    .error-state p {
        color: #666;
        margin-bottom: 2rem;
    }

    .btn-primary {
        display: inline-block;
        background: #007bff;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
        transition: opacity 0.2s;
    }

    .btn-primary:hover {
        opacity: 0.8;
    }

    .grid-container {
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        overflow-x: auto;
        overflow-y: visible;
        width: 100%;
    }

    .grid-wrapper {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        width: 100%;
        min-width: min-content;
    }

    .grid-column {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex: 1 1 0;
        min-width: 80px;
        max-width: 150px;
    }

    .row-label {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        font-weight: bold;
        font-size: 1.25rem;
        color: #333;
        border-bottom: 2px solid #ddd;
        padding-bottom: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .positions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .position-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
        border: 2px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        padding: 0.5rem;
        background: white;
        position: relative;
    }

    .position-cell:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .position-cell.empty {
        background: #f8f9fa;
        border-style: dashed;
    }

    .position-cell.empty:hover {
        background: #e9ecef;
        border-color: #007bff;
    }

    .position-cell.occupied {
        border-color: #28a745;
        border-style: solid;
    }

    .position-cell.occupied:hover {
        border-color: #218838;
    }

    .position-number {
        font-weight: bold;
        color: #666;
        font-size: 0.75rem;
        position: absolute;
        top: 0.25rem;
        left: 0.25rem;
    }

    .plant-photo {
        width: 100%;
        flex: 1;
        min-height: 0;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0.25rem;
    }

    .plant-color-swatch {
        width: 100%;
        flex: 1;
        min-height: 0;
        border-radius: 4px;
        margin-bottom: 0.25rem;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .plant-name {
        font-size: 0.75rem;
        color: #333;
        font-weight: 500;
        text-align: center;
        word-wrap: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.1;
    }

    .empty-label {
        font-size: 0.85rem;
        color: #999;
        font-style: italic;
    }

    .legend {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .legend-color {
        width: 3rem;
        height: 2rem;
        border-radius: 4px;
        border: 2px solid #ddd;
    }

    .empty-color {
        background: #f8f9fa;
        border-style: dashed;
    }

    .occupied-color {
        background: linear-gradient(
            135deg,
            #ffb3ba33 0%,
            #bae1ff33 50%,
            #ffffba33 100%
        );
        border-color: #28a745;
    }

    @media (max-width: 768px) {
        .bed-grid-page {
            padding: 1rem;
        }

        h1 {
            font-size: 1.5rem;
        }

        .grid-container {
            padding: 1rem;
        }

        .grid-column {
            min-width: 70px;
        }

        .position-cell {
            font-size: 0.85rem;
            padding: 0.4rem;
        }

        .plant-name {
            font-size: 0.7rem;
        }

        .position-number {
            font-size: 0.7rem;
        }

        .row-label {
            min-height: 2.5rem;
            font-size: 1rem;
        }

        .legend {
            gap: 1rem;
        }
    }
</style>
