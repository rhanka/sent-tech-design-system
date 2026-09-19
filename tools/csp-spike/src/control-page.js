const box = document.createElement('div');
box.setAttribute('style', 'width:80px;height:40px;background:tomato');
document.getElementById('canvas').appendChild(box);
const viaCssom = document.createElement('div');
viaCssom.style.width = '80px'; viaCssom.style.background = 'seagreen'; viaCssom.style.height = '40px';
document.getElementById('canvas').appendChild(viaCssom);
setTimeout(() => {
  window.__result = { ok: true,
    attrStyleApplied: getComputedStyle(box).backgroundColor,
    cssomStyleApplied: getComputedStyle(viaCssom).backgroundColor };
}, 200);
