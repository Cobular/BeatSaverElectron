<script lang="ts">
    import Settings from "../components/Settings.svelte";
</script>

<main>
    <div class="main-child">
        <Settings />
    </div>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
    }

    .main-child {
        max-width: 80%;
        width: 600px;
    }

    :global(*) {
        font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    }
</style>