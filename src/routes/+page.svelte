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
    </p>
    <ul>
      <li>Live Now Playing Widget with adaptive colors</li>
      <li>Listening history</li>
      <li>Expanded widget (hold expand for full screen)</li>
      <li>Screen Wake lock, thus the screen won't turn off</li>
      <li>Kisok mode, add <code>?kiosk=true</code> to the url to enable</li>
      <li>Screen Wake Lock in kiosk mode, add <code>?kiosk=true&awake=true</code> to the url to enable</li>
      <li>Iframe mode ensures to widget fills the full viewport, add <code>?iframe=true</code> to the url to enable</li>
    </ul>
    <div id="input">
      <input bind:value={username} placeholder="ListenBrainz username" type="text"/>
      <button on:click={goTo} id="go" class="m-icon">rocket_launch</button>
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
  #input {
    display: flex;
    align-items: center;
    gap: 10px
  }
  #go {
    height: 56px;
    width: 56px;
  }
  code {
    font-family: monospace;
    background: var(--bg-secondary);
    padding: 2px;
    border-radius: 5px;
  }
</style>
