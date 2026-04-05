<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  type FileEntry = {
    name: string;
    kind: "file" | "directory";
    size?: number;
    content?: string;
  };

  let files = $state<FileEntry[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let selectedFile = $state<string | null>(null);
  let fileContent = $state<string | null>(null);

  async function loadOPFSContents() {
    if (!browser) return;

    try {
      loading = true;
      error = null;
      files = [];

      const root = await navigator.storage.getDirectory();
      const entries: FileEntry[] = [];

      // @ts-ignore - File System Access API types may not be available
      for await (const entry of root.values()) {
        const fileEntry: FileEntry = {
          name: entry.name,
          kind: entry.kind,
        };

        if (entry.kind === "file") {
          try {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            fileEntry.size = file.size;
          } catch (err) {
            console.error(`Error getting file info for ${entry.name}:`, err);
          }
        }

        entries.push(fileEntry);
      }

      files = entries.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error("Error loading OPFS contents:", err);
    } finally {
      loading = false;
    }
  }

  async function viewFile(fileName: string) {
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();

      selectedFile = fileName;
      
      // Try to pretty-print JSON
      try {
        const parsed = JSON.parse(text);
        fileContent = JSON.stringify(parsed, null, 2);
      } catch {
        fileContent = text;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error(`Error reading file ${fileName}:`, err);
    }
  }

  async function deleteFile(fileName: string) {
    if (!confirm(`Delete ${fileName}?`)) return;

    try {
      const root = await navigator.storage.getDirectory();
      await root.removeEntry(fileName);
      await loadOPFSContents();
      if (selectedFile === fileName) {
        selectedFile = null;
        fileContent = null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error(`Error deleting file ${fileName}:`, err);
    }
  }

  async function clearAllOPFS() {
    if (!confirm("Delete ALL OPFS files? This cannot be undone!")) return;

    try {
      const root = await navigator.storage.getDirectory();
      // @ts-ignore - File System Access API types may not be available
      for await (const entry of root.values()) {
        await root.removeEntry(entry.name, { recursive: true });
      }
      await loadOPFSContents();
      selectedFile = null;
      fileContent = null;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error("Error clearing OPFS:", err);
    }
  }

  onMount(() => {
    loadOPFSContents();
  });
</script>

<div class="debug-container">
  <header>
    <h1>OPFS Debug View</h1>
    <div class="actions">
      <button onclick={loadOPFSContents} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>
      <button onclick={clearAllOPFS} disabled={loading || files.length === 0} class="danger">
        Clear All
      </button>
      <a href="/">Back to App</a>
    </div>
  </header>

  {#if error}
    <div class="error">
      <strong>Error:</strong> {error}
    </div>
  {/if}

  <div class="content">
    <div class="file-list">
      <h2>Files ({files.length})</h2>
      {#if loading}
        <p>Loading...</p>
      {:else if files.length === 0}
        <p class="empty">No files in OPFS</p>
      {:else}
        <ul>
          {#each files as file}
            <li class:selected={selectedFile === file.name}>
              <button onclick={() => viewFile(file.name)} class="file-item">
                <span class="icon">{file.kind === "directory" ? "📁" : "📄"}</span>
                <span class="name">{file.name}</span>
                {#if file.size !== undefined}
                  <span class="size">{(file.size / 1024).toFixed(2)} KB</span>
                {/if}
              </button>
              <button onclick={() => deleteFile(file.name)} class="delete" title="Delete">
                🗑️
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="file-viewer">
      <h2>File Content</h2>
      {#if selectedFile}
        <div class="file-header">
          <strong>{selectedFile}</strong>
        </div>
        <pre><code>{fileContent || "Loading..."}</code></pre>
      {:else}
        <p class="empty">Select a file to view its contents</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .debug-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #555;
  }

  .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button:hover:not(:disabled) {
    background: #f5f5f5;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.danger {
    background: #fee;
    border-color: #fcc;
    color: #c00;
  }

  button.danger:hover:not(:disabled) {
    background: #fcc;
  }

  a {
    color: #0066cc;
    text-decoration: none;
    padding: 0.5rem 1rem;
  }

  a:hover {
    text-decoration: underline;
  }

  .error {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1rem;
    color: #c00;
  }

  .content {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
    height: calc(100vh - 200px);
  }

  .file-list,
  .file-viewer {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fafafa;
    overflow: auto;
  }

  .file-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-list li {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: stretch;
  }

  .file-list li.selected .file-item {
    background: #e3f2fd;
    border-color: #2196f3;
  }

  .file-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
  }

  .file-item:hover {
    background: #f5f5f5;
    border-color: #999;
  }

  .icon {
    font-size: 1.2rem;
  }

  .name {
    flex: 1;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
  }

  .size {
    color: #666;
    font-size: 0.85rem;
  }

  .delete {
    padding: 0.5rem;
    font-size: 1.2rem;
    line-height: 1;
    min-width: auto;
  }

  .file-header {
    background: white;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px 4px 0 0;
    border-bottom: none;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
  }

  pre {
    margin: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    padding: 1rem;
    overflow: auto;
    max-height: calc(100vh - 350px);
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .empty {
    color: #999;
    font-style: italic;
    padding: 2rem;
    text-align: center;
  }
</style>
