<script lang="ts">
  type Props = {
    photos: string[];
    plantName: string;
  };

  let { photos, plantName }: Props = $props();
  
  let currentIndex = $state(0);
  let startX = $state(0);
  let currentX = $state(0);
  let isDragging = $state(false);
  let containerElement: HTMLDivElement | undefined = $state();

  function goToNext() {
    if (currentIndex < photos.length - 1) {
      currentIndex++;
    }
  }

  function goToPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
    }
  }

  function goToIndex(index: number) {
    currentIndex = index;
  }

  function handleTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    isDragging = false;
    currentX = 0;
    startX = 0;
  }

  function handleMouseDown(e: MouseEvent) {
    startX = e.clientX;
    isDragging = true;
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    currentX = e.clientX;
  }

  function handleMouseUp() {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    isDragging = false;
    currentX = 0;
    startX = 0;
  }

  function handleMouseLeave() {
    if (isDragging) {
      isDragging = false;
      currentX = 0;
      startX = 0;
    }
  }

  $effect(() => {
    if (currentIndex >= photos.length) {
      currentIndex = photos.length - 1;
    }
    if (currentIndex < 0) {
      currentIndex = 0;
    }
  });

  let translateX = $derived(() => {
    const baseTranslate = -currentIndex * 100;
    if (isDragging && containerElement) {
      const containerWidth = containerElement.offsetWidth;
      const dragPercent = ((currentX - startX) / containerWidth) * 100;
      return baseTranslate + dragPercent;
    }
    return baseTranslate;
  });
</script>

<div 
  class="carousel-container"
  bind:this={containerElement}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  onmousedown={handleMouseDown}
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseLeave}
>
  <div class="carousel-track" style="transform: translateX({translateX()}%)">
    {#each photos as photo, index (index)}
      <div class="carousel-slide">
        <img src={photo} alt="{plantName} - Photo {index + 1}" draggable="false" />
      </div>
    {/each}
  </div>

  {#if photos.length > 1}
    <!-- Navigation arrows -->
    {#if currentIndex > 0}
      <button class="carousel-btn prev" onclick={goToPrevious} aria-label="Previous photo">
        ‹
      </button>
    {/if}
    {#if currentIndex < photos.length - 1}
      <button class="carousel-btn next" onclick={goToNext} aria-label="Next photo">
        ›
      </button>
    {/if}

    <!-- Indicators -->
    <div class="carousel-indicators">
      {#each photos as _, index (index)}
        <button
          class="indicator"
          class:active={currentIndex === index}
          onclick={() => goToIndex(index)}
          aria-label="Go to photo {index + 1}"
        />
      {/each}
    </div>

    <!-- Photo counter -->
    <div class="photo-counter">
      {currentIndex + 1} / {photos.length}
    </div>
  {/if}
</div>

<style>
  .carousel-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f5f5f5;
    user-select: none;
    touch-action: pan-y pinch-zoom;
  }

  .carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease-out;
    will-change: transform;
  }

  .carousel-slide {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  .carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    cursor: pointer;
    font-size: 2rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    z-index: 2;
  }

  .carousel-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  .carousel-btn:active {
    background: rgba(0, 0, 0, 0.8);
  }

  .carousel-btn.prev {
    left: 0.5rem;
  }

  .carousel-btn.next {
    right: 0.5rem;
  }

  .carousel-indicators {
    position: absolute;
    bottom: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 2;
  }

  .indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;
  }

  .indicator:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
  }

  .indicator.active {
    background: white;
    width: 1.5rem;
    border-radius: 0.25rem;
  }

  .photo-counter {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    z-index: 2;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .carousel-btn {
      width: 2rem;
      height: 2rem;
      font-size: 1.5rem;
    }

    .carousel-btn.prev {
      left: 0.25rem;
    }

    .carousel-btn.next {
      right: 0.25rem;
    }
  }
</style>
