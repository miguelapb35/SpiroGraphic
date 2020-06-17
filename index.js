window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();



var scol = 'hsla(75, 5%, 95%, 1)';

function ready() {
  
  var c = document.getElementById("canvas");
  var $ = c.getContext("2d");

  var w = c.width = window.innerWidth;
  var h = c.height = window.innerHeight;
 
  
  var graph = new Graph(c.width, c.height);

  window.addEventListener('mousemove', function(e) {
    graph.ms.x = e.pageX;
    graph.ms.y = e.pageY;
  }, false);
  
   window.addEventListener('touchmove', function(e) {
    graph.ms.x = e.touches[0].pageX;
    graph.ms.y = e.touches[0].pageY;
  }, false);
  
  var draw = function() {
      graph.figure();
      graph.draw($);
  };
  run();

  function run() {
    window.requestAnimFrame(run);
    draw();
  }
}

function Graph(w, h) {
  var spiro = this;
  spiro.msdn = false;
  spiro.ms = {
    x: w / 2,
    y: h / 2
  };

  var contC = 224;
  var oc = contC / 12 + (contC * 10 / 12 * Math.random()) | 0;
  var ic = oc / 12 + (oc * 10 / 12 * Math.random()) | 0;
  var rat = contC / oc;
  
  var cont = new Circle(w / 2, h / 2, contC, 0);
  cont.strokeStyle = "hsla(75, 5%, 95%, 1)";

  var outer = cont.i_circle(oc, 0);
  var inner = outer.i_circle(ic, 0);

  var loc = [];
  var ang = 0;
  var bAng = cont.ang;

  spiro.figure = function() {
    ang += 2.0;
    
    var cAng = ang * Math.PI / 180 - bAng;
    cont.set(cAng);

    var oAng = -cAng * rat;
    outer.set(oAng);

    var p = inner.getPos();
    loc.push(p);
  };

  spiro.draw = function($) {
    $.clearRect(0, 0, w, h);
    $.fillStyle = 'hsla(255,255%,2555%,1)';
    
    $.shadowColor = 'hsla(0,0%,0%,.5)';
    $.shaodwBlur = 10;
    $.shadowOffsetX = 2;
    $.shadowOffsetY = 2;
    var ms = spiro.ms;
    if (cont.graph(ms.x, ms.y)) {
      $.lineWidth = 4.0;
      cont.draw($);
      outer.draw($);
      inner.draw($);
    }

    $.strokeStyle = scol;
    $.lineWidth = 2;
    $.beginPath();
    $.moveTo(loc[0].x, loc[0].y);
    for (var i = 1; i < loc.length; i++) {
      $.lineTo(loc[i].x, loc[i].y);
    }
    $.stroke();
  };
}

function Circle(cx, cy, r, ang) {
  var spiro = this;
  spiro.parent = null;
  spiro.children = null;

  spiro.cx = cx;
  spiro.cy = cy;
  spiro.r = r;
  spiro.strokeStyle = null;
  spiro.fillStyle = 'hsla(255,255%,255%,.7)';

  spiro.set = function(a) {
    spiro.ang = a;
    spiro.cos = Math.cos(spiro.ang);
    spiro.sin = Math.sin(spiro.ang);
  };
  spiro.set(ang);

  spiro.i_circle = function(ri, ai) {
    var x = spiro.cos * (spiro.r - ri);
    var y = spiro.sin * (spiro.r - ri);

    var ci = new Circle(x, y, ri, ai);
    spiro.appendChild(ci);
    return ci;
  };

  spiro.appendChild = function(e) {
    if (spiro.children === null) {
      spiro.children = [];
    }
    e.parent = spiro;
    spiro.children.push(e);
  };

  spiro.remove = function(e) {
    var kids = spiro.children;
    if (kids !== null) {
      for (var i in kids) {
        if (kids[i] == e) {
          kids.splice(i, 1);
        }
      }
    }
  };

  spiro.getPos = function() {
    var x = spiro.cx;
    var y = spiro.cy;
    var e = spiro.parent;

    while (e !== null) {
      var xx = e.cx + e.cos * x - e.sin * y;
      y = e.cy + e.sin * x + e.cos * y;
      x = xx;
      e = e.parent;
    }
    return {
      x: x,
      y: y
    };
  };

  spiro.graph = function(x, y) {
    var p = spiro.getPos();
    return (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) <= spiro.r * spiro.r;
  };

  spiro.draw = function($) {
    if (spiro.strokeStyle === null && spiro.fillStyle === null) {
      return;
    }

    var p = spiro.getPos();
    
    $.beginPath();
    $.arc(p.x, p.y, spiro.r, 0, Math.PI * 2.0, true);

    if (spiro.strokeStyle !== null) {
      $.strokeStyle = spiro.strokeStyle;
      $.stroke();
    } else {
      $.fillStyle = spiro.fillStyle;
      $.fill();
    }
  };
}

ready();

document.getElementById('reset').onclick = ready;
window.addEventListener('resize', function(){
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
}, false);