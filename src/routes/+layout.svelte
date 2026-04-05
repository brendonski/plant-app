<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import InstallPrompt from "$lib/components/InstallPrompt.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
    <header>
        <nav>
            <a href="/" class="home-link">🏡 Garden App</a>
        </nav>
    </header>

    <main>
        {@render children()}
    </main>

    <InstallPrompt />
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    header {
        background: #2c3e50;
        color: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    nav {
        max-width: 1200px;
        margin: 0 auto;
    }

    .home-link {
        color: white;
        text-decoration: none;
        font-size: 1.25rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: opacity 0.2s;
    }

    .home-link:hover {
        opacity: 0.8;
    }

    main {
        flex: 1;
    }

    :global(body) {
        margin: 0;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        background: #f5f5f5;
    }
</style>
