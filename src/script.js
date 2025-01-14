import * as bb from "./boingball.js";

var parentW = window.innerWidth;
var parentH = window.innerHeight;

bb.SetupBoingBall(document.body, parentW, parentH);

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  bb.ResizeBoingBall(width, height);
});
