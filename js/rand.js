$.randGen = (seed) => {
  let _seed = seed;
  return () => {
    const rnd = Math.sin(_seed++) * 10000
    return rnd - Math.floor(rnd)
  }
}
