<script>
  let username = ''
  function goTo() {
    window.location.href = '/listening/' + username
  }
</script>

<div id="body">
  <div id="box">
    <input bind:value={username} placeholder="username" type="text"/>
    <button on:click={goTo} id="go">Go</button>
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
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #go {
    height: 66px;
    width: 66px;
  }
</style>
