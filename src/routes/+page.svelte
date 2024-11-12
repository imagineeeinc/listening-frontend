<script>
  let username = ''
  function goTo() {
    window.location.href = '/listening/' + username
  }
</script>

<div id="body">
  <div id="box">
    <h1>ListenBrainz live listening viewer</h1>
    <p>
      View a user listening to music live. Using the <a href="https://listenbrainz.org/" target="_blank">ListenBrainz</a> scrobbling service's public api to view what a user has listened in the past and live.
    <p>
    <div>
      <input bind:value={username} placeholder="ListenBrainz username" type="text"/>
      <button on:click={goTo} id="go">Go</button>
    </div>
  </div>
</div>

<style>
  #body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  #box {
    width: 100vh;
    max-width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  h1 {
    font-size: xx-large;
  }
  #go {
    height: 56px;
    width: 56px;
  }
</style>
