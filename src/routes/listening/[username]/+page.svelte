<script>
  let { data } = $props()
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { FastAverageColor } from 'fast-average-color'
  let playing = writable(false)
  let now_playing = writable({})
  let title = writable('')
  let artist = writable('')
  let album = writable('')
  let cover = writable('')
  let mbid = writable('')
  let lastTitle = ""
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
      let temp_mbid = res.payload.listens[0].track_metadata.additional_info.release_mbid || null
      if ($title != lastTitle) { 
        let search = ""
        if (res.payload.listens[0].track_metadata.additional_info.release_mbid) {
          search = res.payload.listens[0].track_metadata.additional_info.release_mbid
          let cover_fetch = await fetch(`https://coverartarchive.org/release/${search}`)
          if (cover_fetch.status >= 200 && cover_fetch.status < 400) {
            let cover_res = await cover_fetch.json()
            $cover = cover_res.images[0].thumbnails.large
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
  onMount(() => {
    fetchNowPlaying()
    fetchListens()
    setInterval(fetchNowPlaying, 5000)
    setInterval(fetchListens, 60000)
    const fac = new FastAverageColor()
    cover.subscribe((url)=>{
      // document.getElementById("now-playing").style.backgroundImage = `url(${url})`
      if (url != '/no-cover.svg') {
        fac.getColorAsync(url).then((colors)=>{
          document.getElementById("now-playing").style.backgroundColor = colors.hex
          document.querySelectorAll(".color-change").forEach(e=>e.style.color = invertColor(colors.hex))
          document.querySelector("hr").style.background = invertColor(colors.hex)
        })
      } else {
        document.getElementById("now-playing").style.backgroundColor = 'var(--bg-secondary)'
        document.querySelectorAll(".color-change").forEach(e=>e.style.color = 'var(--color)')
        document.querySelector("hr").style.backgroundColor = 'var(--secondary)'
      }
    })
  })
  
</script>
<div id="box">
  <div id="content">
    {#if $playing}
      <div id="now-playing">
        <span id="now-playing-text" class="color-change"><a href="https://listenbrainz.org/user/{data.username}/" target="_blank" class="color-change">[{data.username}]</a> Now Playing</span>
        <img src={$cover} alt="" id="cover">
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
      <div id="now-playing">
        <span id="now-playing-text"><a href="https://listenbrainz.org/user/{data.username}/" target="_blank">[{data.username}]</a> Not listening yet</span>
      </div>
    {/if}
    <div id="listens">
      <h3>Listening History</h3>
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
    align-items: center;
    justify-items: center;
    gap: 20px;
    backdrop-filter: blur(100px);
    padding: 20px;
  }
  @media only screen and (max-width: 150vh) {
    #now-playing {
      width: calc(100% - 20px);
    }
  }
  #now-playing-text {
    font-size: x-large;
    grid-column: 1/3;
  }
  #title {
    font-size: xx-large;
    font-weight: 600;
  }
  #artist, #album, #mbid {
    font-weight: 500;
  }
  .listen-artist {
    color: var(--secondary);
  }
  #mbid {
    font-size: small;
  }
  #cover {
    width: 30vw;
    max-width: 50vh;
    max-height: 50vh;
    aspect-ratio: 1/1;
    background: var(--accent);
    border-radius: 20px;
    border: none;
  }
  #listens {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 20px;
  }
  @media only screen and (max-width: 100vh) {
    #listens {
      width: calc(100% - 20px);
    }
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
