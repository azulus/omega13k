# Omega 13k

Tools used:
* [js13k-boilerplate]https://github.com/ooflorent/js13k-boilerplate as a great starting point
* [jsfxr]https://github.com/mneubrand/jsfxr for audio!

Techniques used (to keep it small):
* custom es2015 minifier built on babel (minifier.js)
* pseudo-random seeded shape generation w/ fitness function to find likely seeds for ships
* pseudo-random seeded ship path and level generation
* character codes built in [jsfiddle]https://jsfiddle.net/rouxbot/11r4rhyL/ and ported as bits only
* lots of poorly optimized webgl :(

Install Dependencies: `npm install`

Build compiled output: `gulp build`

View output: `open dist/index.html`

Made by: [Kevin Grandon]https://github.com/kevingrandon and [Jeremy Stanley]https://github.com/azulus for [js13kgames]http://js13kgames.com/
