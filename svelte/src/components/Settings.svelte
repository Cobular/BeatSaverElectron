<script lang="ts">
    import {writable} from "svelte/store"

    export const settings = writable({
        file: ""
    })

    // settings.subscribe(
    //   ipcRenderer.send("updateSettings")
    // )
</script>

<div class="settings">
    <h1>Settings</h1>
    <form id="content">
        <label for="file_upload">BeatSaver Directory</label>
        <input type="file" id="file_upload" bind:value={$settings.file} />
    </form>
</div>

<style>
  #content {
    display: grid;
    grid-template-columns: 30% 70%;
    grid-column-gap: 10px;
  }
  .settings {
      display: flex;
      flex-direction: column;
  }
  h1 {
      align-self: center;
  }
</style>
