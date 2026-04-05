<script lang="ts">
  import { browser } from "$app/environment";

  let exporting = $state(false);
  let importing = $state(false);
  let message = $state<{ type: 'success' | 'error', text: string } | null>(null);

  async function exportData() {
    if (!browser) return;
    
    try {
      exporting = true;
      message = null;
      
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

      const fileCount = Object.keys(exportData).length;
      
      if (fileCount === 0) {
        message = { type: 'error', text: 'No data to export' };
        return;
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
      
      message = { type: 'success', text: `Successfully exported ${fileCount} file(s)` };
    } catch (err) {
      message = { 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error exporting data' 
      };
      console.error("Error exporting data:", err);
    } finally {
      exporting = false;
    }
  }

  async function importData() {
    if (!browser) return;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        importing = true;
        message = null;
        
        const text = await file.text();
        const data = JSON.parse(text);

        const fileCount = Object.keys(data).length;
        
        if (!confirm(`This will import ${fileCount} file(s). Existing files with the same names will be overwritten. Continue?`)) {
          importing = false;
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

        message = { type: 'success', text: `Successfully imported ${fileCount} file(s)!` };
      } catch (err) {
        message = { 
          type: 'error', 
          text: 'Error importing data. Please check the file format.' 
        };
        console.error("Error importing data:", err);
      } finally {
        importing = false;
      }
    };

    input.click();
  }

  function clearMessage() {
    message = null;
  }
</script>

<div class="settings-container">
  <header>
    <h1>⚙️ Settings</h1>
    <a href="/" class="back-link">← Back to Home</a>
  </header>

  {#if message}
    <div class="message {message.type}">
      <span>{message.text}</span>
      <button onclick={clearMessage} class="close-btn">✕</button>
    </div>
  {/if}

  <div class="settings-section">
    <h2>Data Backup & Restore</h2>
    <p class="description">
      Export your garden data to a backup file or restore from a previous backup.
    </p>

    <div class="action-buttons">
      <button onclick={exportData} disabled={exporting || importing} class="export-btn">
        <span class="icon">📥</span>
        <div class="button-text">
          <strong>Export Data</strong>
          <small>Download backup file</small>
        </div>
      </button>

      <button onclick={importData} disabled={exporting || importing} class="import-btn">
        <span class="icon">📤</span>
        <div class="button-text">
          <strong>Import Data</strong>
          <small>Restore from backup</small>
        </div>
      </button>
    </div>

    <div class="info-box">
      <strong>ℹ️ How it works:</strong>
      <ul>
        <li><strong>Export:</strong> Creates a JSON backup file containing all your beds and plant data</li>
        <li><strong>Import:</strong> Restores data from a backup file (existing data with same names will be overwritten)</li>
        <li>Keep backup files in a safe location like cloud storage or email them to yourself</li>
      </ul>
    </div>
  </div>

  <div class="settings-section">
    <h2>Advanced</h2>
    <div class="action-buttons">
      <a href="/debug" class="debug-link">
        <span class="icon">🔧</span>
        <div class="button-text">
          <strong>Debug View</strong>
          <small>View raw storage files</small>
        </div>
      </a>
    </div>
  </div>
</div>

<style>
  .settings-container {
    max-width: 800px;
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
    font-size: 2rem;
    color: #333;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    color: #333;
  }

  .back-link {
    color: #0066cc;
    text-decoration: none;
    font-size: 1rem;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .message {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message.success {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
  }

  .message.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    margin-left: 1rem;
    opacity: 0.7;
    color: inherit;
  }

  .close-btn:hover {
    opacity: 1;
  }

  .settings-section {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .description {
    color: #666;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .export-btn,
  .import-btn,
  .debug-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border: 2px solid;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    text-decoration: none;
  }

  .export-btn {
    background: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
  }

  .export-btn:hover:not(:disabled) {
    background: #c8e6c9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
  }

  .import-btn {
    background: #e3f2fd;
    border-color: #2196f3;
    color: #1565c0;
  }

  .import-btn:hover:not(:disabled) {
    background: #bbdefb;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
  }

  .debug-link {
    background: #f5f5f5;
    border-color: #999;
    color: #333;
  }

  .debug-link:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .icon {
    font-size: 2rem;
  }

  .button-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .button-text strong {
    font-size: 1rem;
  }

  .button-text small {
    font-size: 0.85rem;
    opacity: 0.8;
  }

  .info-box {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.25rem;
    color: #495057;
    line-height: 1.6;
  }

  .info-box strong {
    display: block;
    margin-bottom: 0.75rem;
    color: #333;
  }

  .info-box ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-box li {
    margin-bottom: 0.5rem;
  }

  .info-box li:last-child {
    margin-bottom: 0;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .settings-container {
      padding: 1rem;
    }

    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    h2 {
      font-size: 1.2rem;
    }

    .settings-section {
      padding: 1.5rem;
    }

    .action-buttons {
      grid-template-columns: 1fr;
    }

    .export-btn,
    .import-btn,
    .debug-link {
      padding: 1rem;
    }

    .icon {
      font-size: 1.5rem;
    }

    .button-text strong {
      font-size: 0.9rem;
    }

    .button-text small {
      font-size: 0.8rem;
    }
  }
</style>
