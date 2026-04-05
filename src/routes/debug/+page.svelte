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

  function truncateValue(value: any, maxLength: number = 100): any {
    if (typeof value === 'string' && value.length > maxLength) {
      return value.substring(0, maxLength) + `... (${value.length} chars total)`;
    }
    if (Array.isArray(value)) {
      return value.map(item => truncateValue(item, maxLength));
    }
    if (value !== null && typeof value === 'object') {
      const truncated: any = {};
      for (const [key, val] of Object.entries(value)) {
        truncated[key] = truncateValue(val, maxLength);
      }
      return truncated;
    }
    return value;
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
        const truncated = truncateValue(parsed);
        fileContent = JSON.stringify(truncated, null, 2);
      } catch {
        // For non-JSON files, truncate if too long
        if (text.length > 100) {
          fileContent = text.substring(0, 100) + `... (${text.length} chars total)`;
        } else {
          fileContent = text;
        }
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

  async function exportData() {
    try {
      const root = await navigator.storage.getDirectory();
      const exportData: Record<string, string> = {};

      // @ts-ignore - File System Access API types may not be available
      for await (const entry of root.values()) {
        if (entry.kind === "file") {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const text = await file.text();
          exportData[entry.name] = text;
        }
      }

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `plant-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error("Error exporting data:", err);
    }
  }

  async function importData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!confirm(`This will import ${Object.keys(data).length} file(s). Continue?`)) {
          return;
        }

        const root = await navigator.storage.getDirectory();
        
        for (const [fileName, content] of Object.entries(data)) {
          if (typeof content === "string") {
            const fileHandle = await root.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
          }
        }

        await loadOPFSContents();
        alert(`Successfully imported ${Object.keys(data).length} file(s)!`);
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        console.error("Error importing data:", err);
        alert("Error importing data. Please check the file format.");
      }
    };

    input.click();
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
      <button onclick={exportData} disabled={loading || files.length === 0} class="export">
        📥 Export Data
      </button>
      <button onclick={importData} disabled={loading} class="import">
        📤 Import Data
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
    flex-wrap: wrap;
    gap: 1rem;
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
    flex-wrap: wrap;
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

  button.export {
    background: #e8f5e9;
    border-color: #c8e6c9;
    color: #2e7d32;
  }

  button.export:hover:not(:disabled) {
    background: #c8e6c9;
  }

  button.import {
    background: #e3f2fd;
    border-color: #bbdefb;
    color: #1565c0;
  }

  button.import:hover:not(:disabled) {
    background: #bbdefb;
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
    word-break: break-all;
  }

  .size {
    color: #666;
    font-size: 0.85rem;
    white-space: nowrap;
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
    word-break: break-all;
  }

  pre {
    margin: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    padding: 1rem;
    overflow: auto;
    max-height: calc(100vh - 350px);
    word-break: break-all;
    white-space: pre-wrap;
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

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .debug-container {
      padding: 1rem;
    }

    header {
      flex-direction: column;
      align-items: flex-start;
    }

    h1 {
      font-size: 1.4rem;
    }

    .actions {
      width: 100%;
      justify-content: flex-start;
    }

    .content {
      grid-template-columns: 1fr;
      height: auto;
      gap: 1rem;
    }

    .file-list,
    .file-viewer {
      padding: 1rem;
      max-height: 50vh;
    }

    .file-item {
      padding: 0.5rem;
      font-size: 0.85rem;
    }

    .name {
      font-size: 0.8rem;
    }

    .size {
      font-size: 0.75rem;
    }

    pre {
      max-height: 40vh;
      padding: 0.75rem;
      font-size: 0.75rem;
    }

    code {
      font-size: 0.75rem;
    }

    button {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
    }
  }
</style>
