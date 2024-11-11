<script>
  let { data } = $props()
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  let playing = writable(false)
  let now_playing = writable({})
  let title = writable('')
  let artist = writable('')
  let album = writable('')
  let cover = writable('')
  let mbid = writable('')
  let listens = writable([])
  async function fetchNowPlaying() {
    let now_playing_fetch = await fetch(`https://api.listenbrainz.org/1/user/${data.username}/playing-now`)
    let res = await now_playing_fetch.json()
    $now_playing = res.payload
    if (res.payload.count == 1) {
      $playing = true
      $title = res.payload.listens[0].track_metadata.track_name
      $artist = res.payload.listens[0].track_metadata.artist_name
      $album = res.payload.listens[0].track_metadata.release_name
      if (res.payload.listens[0].track_metadata.additional_info.release_mbid != $mbid) { 
        let cover_fetch = await fetch(`https://coverartarchive.org/release/${res.payload.listens[0].track_metadata.additional_info.release_mbid}`)
        let cover_res = {}
        if (cover_fetch.status == 200) {
          cover_res = await cover_fetch.json()
          $cover = cover_res.images[0].thumbnails.large
        } else {
          $cover = '/no-cover.svg'
        }
      }
      $mbid = res.payload.listens[0].track_metadata.additional_info.release_mbid
    } else {
      $playing = false
    }
  }
  async function fetchListens() {
    // pass parameter
    let listens_fetch = await fetch(`https://api.listenbrainz.org/1/user/${data.username}/listens?count=40`)
    let res = await listens_fetch.json()
    $listens = res.payload.listens
  }
  onMount(() => {
    fetchNowPlaying()
    fetchListens()
    setInterval(fetchNowPlaying, 5000)
    setInterval(fetchListens, 60000)
  })
  
</script>
<div id="box">
  <div id="content">
    {#if $playing}
      <div id="now-playing">
        <span id="now-playing-text">Now Playing</span>
        <img src={$cover} alt="cover" id="cover">
        <div>
          <span id="title">
            {$title.length > 20 ? $title.substring(0, 17) + '...' : $title}
          </span>
          <br>
          <span id="artist">
            {$artist}
          </span>
          <hr>
          <span id="album">
            {$album}
          </span>
        </div> 
      </div>
    {:else}
      <div id="now-playing">
        <span id="now-playing-text">Not listening yet</span>
      </div>
    {/if}
    <div id="listens">
      <h3>Listen History</h3>
      {#each $listens as listen}
        <div class="listen">
          <span class="listen-title">
            {listen.track_metadata.track_name}
          </span>
          •
          <span class="listen-artist">
            {listen.track_metadata.artist_name}
          </span>
        </div>
      {/each}
      <div class="listen">
        <a href="https://listenbrainz.org/user/{data.username}" target="_blank">Go to profile on ListenBrainz</a>
      </div>
    </div>
  </div>
</div>

<style>
  #box {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  #content {
    width: 100vh;
    max-width: 100%;
    padding: 20px;
  }
  #now-playing {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 20px;
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 20px;
  }
  #now-playing-text {
    grid-column: 1/3;
  }
  #title {
    font-size: xx-large;
  }
  #artist, #album, .listen-artist {
    color: var(--secondary);
  }
  #cover {
    width: 30vw;
    max-width: 50vh;
    max-height: 50vh;
    aspect-ratio: 1/1;
    background: var(--accent);
    border-radius: 20px;
  }
  #listens {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 20px;
  }
  .listen {
    background: var(--bg-secondary);
    padding: 10px;
    border: 3px solid var(--secondary);
    border-radius: 20px;
  }
  hr {
    height: 3px;
    background: var(--secondary);
    border: none;
    border-radius: 20px;
    width: 50%;
  }
</style>
