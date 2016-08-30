$.assign($, {
  dialogStrings: [
    'Attention all robot ships, begin your mission to destroy the Earth.',
  	'Mothership to Robot 41734 - We are detecting a problem with your transponder. We\'re sending out a repair ship, but in the meantime friendlies may fire on you.',
    'Just hang in there until the repair ship arrives!',
    'We appear to have lost the repair ship. We\'re sending another one out right away.',
    'Please stop destroying our ships, those are expensive!'
  ],

  dialogSendMessage: (messageIndex) => {
    let currIndex = 0,
      container = $.getElementById('m'),
      word = $.dialogStrings[messageIndex],
      drawLetter = () => {
        let sound = $.createBlipSound(Math.random);
            $.playSound(sound);

        container.textContent += word.substr(currIndex, 3);
        if (currIndex < word.length) {
          currIndex += 3;
          setTimeout(drawLetter, Math.random() * 150)
        }
      };
  
    container.textContent = '';

    drawLetter();
  }
})
