<script>
  let { data } = $props()
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { writable, readable } from 'svelte/store'
  import { FastAverageColor } from 'fast-average-color'
  import { getContrastingHex } from 'color-contrast-picker'
  let playing = writable(false) 
  let kiosk = readable(data.kiosk)
  let iframe = readable(data.iframe)
  let fullscreen = writable($kiosk || $iframe)
  let now_playing = writable({})
  let title = writable('')
  let artist = writable('')
  let album = writable('')
  let cover = writable('/no-cover.svg')
  let largeCover = writable('/no-cover.svg')
  let mbid = writable('')
  let lastTitle = ""
  let listens = writable([])
  let wakelockSupport = writable(false)
  let wakeLocked = writable(data.awake)
  async function fetchNowPlaying() {
    let now_playing_fetch = await fetch(`https://api.listenbrainz.org/1/user/${data.username}/playing-now`)
    let res = await now_playing_fetch.json()
    $now_playing = res.payload
    if (res.payload.count == 1) {
      $playing = true
      $title = res.payload.listens[0].track_metadata.track_name
      $artist = res.payload.listens[0].track_metadata.artist_name
      $album = res.payload.listens[0].track_metadata.release_name
      let temp_mbid = res.payload.listens[0].track_metadata.additional_info.release_mbid || null
      if ($title != lastTitle) { 
        let search = ""
        if (res.payload.listens[0].track_metadata.additional_info.release_mbid) {
          search = res.payload.listens[0].track_metadata.additional_info.release_mbid
          let cover_fetch = await fetch(`https://coverartarchive.org/release/${search}`)
          if (cover_fetch.status >= 200 && cover_fetch.status < 400) {
            let cover_res = await cover_fetch.json()
            $cover = cover_res.images[0].thumbnails.large
            if (cover_res.images[0].thumbnails[1200]) {
              $largeCover = cover_res.images[0].thumbnails[1200]
            }
          } else {
            $cover = '/no-cover.svg'
          }
        } else {
          let fetch_release = await fetch(`https://musicbrainz.org/ws/2/release-group/?query=artist:${$artist}%20AND%20release:${$album}&fmt=json`)
          let res = await fetch_release.json()
          let release = {}
          if (res.count > 0) {
            release = res["release-groups"][0]
            // search = release.releases[0].id
            for (let i = 0;i < release.releases.length;i++) {
              let j = release.releases[i]
              let cover_fetch = await fetch(`https://coverartarchive.org/release/${j.id}`)
              if (cover_fetch.status >= 200 && cover_fetch.status < 400) {
                let cover_res = await cover_fetch.json()
                $cover = cover_res.images[0].thumbnails.large
                if (cover_res.images[0].thumbnails[1200]) {
                  $largeCover = cover_res.images[0].thumbnails[1200]
                }
                temp_mbid = j.id
                break
              } else {
                $cover = '/no-cover.svg'
              }
            }
          } else {
            $cover = '/no-cover.svg'
            temp_mbid = ''
          }
        }
        lastTitle = $title
      }
      $mbid = temp_mbid
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
  function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1); // remove #
    color = parseInt(color, 16); // convert to integer
    color = 0xFFFFFF ^ color; // invert three bytes
    color = color.toString(16); // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color; // prepend #
    return color;
  }
  onMount(async () => {
    fetchNowPlaying()
    setInterval(fetchNowPlaying, 5000)
    if (!$kiosk) {
      fetchListens()
      setInterval(fetchListens, 60000)
    }
    const fac = new FastAverageColor()
    cover.subscribe((url)=>{
      // document.getElementById("now-playing").style.backgroundImage = `url(${url})`
      if (url != '/no-cover.svg') {
        fac.getColorAsync(url).then((colors)=>{
          document.getElementById("now-playing").style.backgroundColor = colors.hex
          let inverted = getContrastingHex(colors.hex, 'AA_text')
          document.querySelectorAll(".color-change").forEach(e=>e.style.color = inverted)
          document.querySelector("hr").style.background = inverted
        })
      } else {
        document.getElementById("now-playing").style.backgroundColor = 'var(--bg-secondary)'
        document.querySelectorAll(".color-change").forEach(e=>e.style.color = 'var(--color)')
        document.querySelector("hr").style.backgroundColor = 'var(--secondary)'
      }
    })
    if ("wakeLock" in navigator) {
      $wakelockSupport = true
      if ($wakeLocked) {
        await navigator.wakeLock.request("screen")
      }
    }
  })
  let held = false
  function toggleFullscreen() {
    held = true
    setTimeout(() => {
      if (held) {
        $fullscreen = !$fullscreen
        if ($fullscreen) {
          document.getElementById("content").requestFullscreen({navigationUI: 'hide'})
        }
        held = false
      }
    }, 500)
    fullscreen.subscribe(value => {
      if (!value && document.fullscreen) {
        document.exitFullscreen()
      }
    })
  }
  let wakeLock
  async function toggleLock() {
    try {
      if ($wakeLocked) {
        await wakeLock.release()
        $wakeLocked = false
      } else {
        wakeLock = await navigator.wakeLock.request("screen")
        $wakeLocked = true
      }
    } catch (err) {}
  }
  if (browser && $wakelockSupport) {
    document.addEventListener("visibilitychange", async () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    })
  }
</script>
<div id="box">
  <div id="content">
    {#if $playing}
      <div id="now-playing" class="{$fullscreen ? 'fullscreen' : ''} {$iframe ? 'iframe' : ''}">
        <div id="top-right">
          <button class="m-icon color-change {$kiosk ? 'hide': ''} {$iframe ? 'hide': ''} {$wakelockSupport ? 'hide': ''}" id="lock"
            onclick={toggleLock}>
            {$wakeLocked ? 'bedtime_off' : 'bedtime'}
          </button>
          <button class="m-icon color-change {$kiosk ? 'hide': ''} {$iframe ? 'hide': ''}" id="expand"
            onmousedown={toggleFullscreen}
            onmouseup={() => held = false}
            ontouchstart={toggleFullscreen}
            ontouchend={()=> held = false}
            onclick={() => $fullscreen = !$fullscreen}>
            {$fullscreen ? 'collapse_content' : 'expand_content'}
          </button>
        </div>
        <span id="now-playing-text" class="color-change {$iframe ? 'hide': ''}">
          <a href="https://listenbrainz.org/user/{data.username}/" target="_blank" class="color-change">
            {data.username} Now Playing
          </a>
        </span>
        <img src={$fullscreen ? $largeCover : $cover} alt="" id="cover" class="{$fullscreen ? 'fullscreen' : ''}">
        <div>
          <span id="title" class="color-change">
            {$title.length > 20 ? $title.substring(0, 17) + '...' : $title}
          </span>
          <br>
          <span id="artist" class="color-change">
            {$artist}
          </span>
          <hr>
          <span id="album" class="color-change">
            {$album}
          </span>
          <br>
          {#if $mbid.length > 0 && $mbid != null }
            <span id="mbid" class="color-change">MusicBrainz ID: <a href="https://musicbrainz.org/release/{$mbid}" target="_blank" class="color-change">{$mbid}</a></span>           
          {/if}
        </div> 
      </div>
    {:else}
      <div id="now-playing" class="{$fullscreen ? 'fullscreen' : ''} {$iframe ? 'iframe' : ''} not-playing">
        <div id="top-right">
          <button class="m-icon color-change {$kiosk ? 'hide': ''} {$iframe ? 'hide': ''} {$wakelockSupport ? 'hide': ''}" id="lock"
            onclick={toggleLock}>
            {$wakeLocked ? 'bedtime_off' : 'bedtime'}
          </button>
          <button class="m-icon color-change {$kiosk ? 'hide': ''} {$iframe ? 'hide': ''}" id="expand"
            onmousedown={toggleFullscreen}
            onmouseup={() => held = false}
            ontouchstart={toggleFullscreen}
            ontouchend={()=> held = false}
            onclick={() => $fullscreen = !$fullscreen}>
            {$fullscreen ? 'collapse_content' : 'expand_content'}
          </button>
        </div>
        <span id="now-playing-text"><a href="https://listenbrainz.org/user/{data.username}/" target="_blank">{data.username}</a> Not listening yet</span>
      </div>
    {/if}
    <div id="listens" class="{$fullscreen ? 'fullscreen' : ''}">
      <h3>Listening History</h3>
      {#each $listens as listen}
        <div class="listen">
          {#if listen.track_metadata.mbid_mapping && (listen.track_metadata.mbid_mapping.recording_mbid || listen.track_metadata.mbid_mapping.release_mbid)}
            {@const rec_url = listen.track_metadata.mbid_mapping.recording_mbid ? `https://musicbrainz.org/recording/${listen.track_metadata.mbid_mapping.recording_mbid}` : `https://musicbrainz.org/release/${listen.track_metadata.mbid_mapping.release_mbid}`}
            <a class="listen-title" href={rec_url} target="_blank">
              {listen.track_metadata.track_name}
            </a>
          {:else}
            <span class="listen-title" href="https://listenbrainz.org/track/{listen.track_metadata.mbid_mapping}" target="_blank">
              {listen.track_metadata.track_name}
            </span>
          {/if}
            •
          {#if listen.track_metadata.mbid_mapping && listen.track_metadata.mbid_mapping.artist_mbids.length > 0}
            <a class="listen-artist" href="https://musicbrainz.org/artist/{listen.track_metadata.mbid_mapping.artist_mbids[0]}" target="_blank">
              {listen.track_metadata.artist_name}
            </a>
          {:else}
            <span class="listen-artist">
              {listen.track_metadata.artist_name}
            </span>
          {/if}
        </div>
      {/each}
      <div class="listen">
        <a href="https://listenbrainz.org/user/{data.username}" target="_blank">More on ListenBrainz</a>
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
    background: var(--bg);
    max-width: calc(100% - 40px);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  #now-playing {
    background: var(--bg-secondary);
    background-size: cover;
    background-position: center;
    width: 125vh;
    border-radius: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    align-items: center;
    justify-items: center;
    gap: 20px;
    backdrop-filter: blur(100px);
    padding: 56px 20px 20px 20px;
    position: relative;
  }
  #now-playing:not(.not-playing) {
    min-height: calc(50vh + 20px);
  }
  #now-playing.iframe {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    border-radius: 0;
    width: calc(100% - 40px) !important;
    height: calc(100% - 40px) !important;
    grid-template-rows: 1fr !important;
  }
  #now-playing.not-playing {
    width: 80%;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    height: 20vh;
  }
  #now-playing.not-playing > #now-playing-text {
    font-size: xx-large;
    text-align: center;
    word-wrap: normal;
  }
  #now-playing.fullscreen {
    width: calc(100% - 60px);
    height: calc(100% - 96px);
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    overflow-y: auto
  }
  #now-playing:not(.not-playing) #now-playing-text {
    font-size: x-large;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
  }
  #now-playing:not(.not-playing) #now-playing-text > a {
    color: var(--text);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 20px;
    border-radius: 56px;
  }
  #now-playing:not(.not-playing) #now-playing-text > a:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  #now-playing-text {
    font-size: x-large;
  }
  #cover {
    width: 100%;
    max-width: calc(100cqh - 96px);
    max-height: calc(100cqh - 96px);
    /* aspect-ratio: 1/1; */
    background: var(--accent);
    border-radius: 20px;
    border: none;
  }
  #cover.fullscreen {
    width: 100%;
  }
  @media only screen and (max-width: 150vh) {
    #now-playing:not(.fullscreen) {
      width: calc(100% - 20px) !important;
    } 
  }
  @media only screen and (max-width: 100vh) {
    #now-playing:not(.not-playing) {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
      padding: 56px 20px 56px 20px;
      max-height: calc(100vh - 132px);
    }
    /* #now-playing.fullscreen:not(.not-playing) {
      height: calc(100% - 132px);
    } */
    #now-playing.iframe:not(.not-playing) {
      padding: 20px 20px 56px 20px;
      height: calc(100% - 76px) !important;
      max-height: none !important;
    }
    #now-playing-text {
      grid-column: 1;
      backdrop-filter: blur(5px);
    }
    #now-playing:not(.not-playing) #now-playing-text {
      top: auto;
      bottom: 0;
    }
    #cover {
      max-width: calc(100cqw - 40px);
      max-height: calc(100cqw - 40px);
      width: 100%;
    }
    #cover.fullscreen {
      max-width: calc(100cqw - 40px);
      max-height: calc(100cqw - 40px);
      width: 100%;
    }
  }
  #title {
    font-size: xx-large;
    font-weight: 600;
  }
  #artist, #album, #mbid {
    font-weight: 500;
  }
  #top-right {
    position: absolute;
    float: right;
    top: 0;
    right: 0;
    display: flex;
    gap: 0;
  }
  #expand {
    background: none;
    outline: none;
    width: var(--width);
    height: var(--width);
    z-index: 10;
    border-radius: 10px 20px 10px 10px;
    margin: 5px 5px 5px 0;
  }
  #lock {
    background: none;
    outline: none;
    width: var(--width);
    height: var(--width);
    z-index: 10;
    border-radius: 10px;
  }
  #expand:hover, #lock:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .listen-artist {
    color: var(--secondary);
  }
  #mbid {
    font-size: small;
  }
  #listens {
    width: 80%;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 20px;
  }
  #listens.fullscreen {
    display: none;
  }
  @media only screen and (max-width: 100vh) {
    #listens {
      width: calc(100% - 20px);
    }
  }
  .listen {
    background: var(--bg-secondary);
    padding: 10px;
    border-bottom: 2px solid var(--bg-tertiary);
  }
  .listen:last-of-type {
    border: none;
  }
  hr {
    height: 3px;
    background: var(--secondary);
    border: none;
    border-radius: 20px;
    width: 50%;
  }
  .hide {
    display: none;
  }
</style>
