//INITIALISATION
let score = 0;
let vie = 3;
let coordonneestirplayer = [];
let coordonneestirbot = [];
let coordonneesplayer = [];
let coordonneesbot = [];
let playerx = 10;
let playery = 40;

// CONFIGURATION
let tempsNouveauTirPlayer = 500;
let tempsNouveauBot = 1500;
let tempsNouveauTirBot = 2000;

let pause = false;
let mort = false;

//HTML
let tirs = d3.select("svg #tirs");
let persos = d3.select("svg #persos");
let playerzone = d3.select(".playerzone");
let player = d3.select(".player");
let scoretext = d3.select(".score");
scoretext.html(score);

//PLAYER
function update_player() {
  var pos = d3.pointer(event);
  var x = pos[0];
  var y = pos[1];
  playerx = x;
  playery = y;
  player.attr("x", x).attr("y", y);
}

playerzone.on("mousemove", function (e) {
  if (!pause) {
    update_player();
  }
});

setInterval(function () {
  if (!pause) {
    coordonneesplayer = [
      {
        x: playerx,
        y: playery,
      },
    ];
  }
}, 50);

//TIRS PLAYER
function tirplayer() {
  let update = tirs.selectAll(".tirplayer.actif").data(coordonneestirplayer);
  update
    .enter()
    .append("use")
    .attr("href", "#eau")
    .attr("class", "tirplayer actif");

  update.exit().remove();
  update_tirplayer();
}

function update_tirplayer() {
  tirs
    .selectAll(".actif")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);
}

function fintirplayer(d) {
  return d.x < 140;
}

setInterval(function () {
  if (!pause) {
    coordonneestirplayer.forEach(function (d) {
      d.x += 2;
    });

    update_tirplayer();
    if (coordonneestirplayer.every(fintirplayer)) {
      update_tirplayer();
    } else {
      coordonneestirplayer = coordonneestirplayer.filter(fintirplayer);
      tirplayer();
    }

    if (
      suppressionDansTableau(coordonneestirplayer, (collisiontirplayer) =>
        suppressionDansTableau(
          coordonneesbot,
          (collisionbot) => distance(collisiontirplayer, collisionbot) < 5
        )
      )
    ) {
      score += 100;
      scoretext.html(score);
      scoretext.attr("class", "score score" + score.toString().length);
      tirplayer();
      bot();
    } else {
      update_tirplayer();
    }
  }
}, 50);

setInterval(function () {
  if (!pause) {
    coordonneestirplayer.push({
      x: playerx,
      y: playery,
    });
    tirplayer();
  }
}, tempsNouveauTirPlayer);

//BOT
function bot() {
  let update = persos.selectAll(".bot.actif").data(coordonneesbot);
  update
    .enter()
    .append("use")
    .attr("class", "bot actif")
    .attr("href", "#barbarbecue");

  update.exit().remove();
  update_bot();
}

function update_bot() {
  persos
    .selectAll(".actif")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);
}

function finbot(d) {
  return d.x > 40;
}

setInterval(function () {
  if (!pause) {
    coordonneesbot.forEach(function (d) {
      d.x -= d.vitesse / 2;
    });

    update_bot();
    if (coordonneesbot.every(finbot)) {
      update_bot();
    } else {
      coordonneesbot = coordonneesbot.filter(finbot);
      bot();
      checkvie();
    }
  }
}, 50);

function nouveauBot() {
  if (!pause) {
    coordonneesbot.push({
      x: 140,
      y: entierAlea(70) + 5,
      vitesse: entierAlea(4) + 2,
    });
    bot();
    tempsNouveauBot -= 10;
    setTimeout(nouveauBot, tempsNouveauBot);
  } else {
    setTimeout(nouveauBot, tempsNouveauBot);
  }
}
nouveauBot();

//TIRS BOT
function tirbot() {
  let update = tirs.selectAll(".tirbot.actif").data(coordonneestirbot);
  update
    .enter()
    .append("use")
    .attr("class", "tirbot actif")
    .attr("href", "#feu");

  update.exit().remove();
  update_tirbot();
}

function update_tirbot() {
  tirs
    .selectAll(".actif")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);
}

function fintirbot(d) {
  return d.x > 0;
}

setInterval(function () {
  if (!pause) {
    coordonneestirbot.forEach(function (tir) {
      tir.x -= tir.vitesse / 2 + 1;
    });
    update_tirbot();
    if (coordonneestirbot.every(fintirbot)) {
      update_tirbot();
    } else {
      coordonneestirbot = coordonneestirbot.filter(fintirbot);
      tirbot();
    }
    if (
      suppressionDansTableau(coordonneestirbot, (collisiontirbot) =>
        suppressionDansTableau(
          coordonneesplayer,
          (collisionplayer) => distance(collisiontirbot, collisionplayer) < 3
        )
      )
    ) {
      checkvie();
      tirbot();
    } else {
      update_tirbot();
    }
  }
}, 50);

setInterval(function () {
  if (!pause) {
    coordonneesbot.forEach(function (bot, i) {
      coordonneestirbot.push({
        x: bot.x,
        y: bot.y,
        vitesse: bot.vitesse,
      });

      tirbot();
    });
  }
}, tempsNouveauTirBot);

//COLLISIONS
function distance(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function suppressionDansTableau(tableau, critere) {
  let suppression = false;
  for (let i = tableau.length - 1; i >= 0; i--) {
    if (critere(tableau[i])) {
      tableau.splice(i, 1);
      suppression = true;
    }
  }
  return suppression;
}

//BOUTON PAUSE
let pausebutton = d3.select(".pause img");
pausebutton.on("click", function () {
  pause = false;
  d3.select(".pause").style("display", "none");
});

//BARRE ESPACE
document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    if (mort == false) {
      if (pause == false) {
        pause = true;
        d3.select(".pause").style("display", "flex");
      } else {
        pause = false;
        d3.select(".pause").style("display", "none");
      }
    } else {
      location.replace("jeu.html");
    }
  }
};

//ENTIER ALEATOIRE
function entierAlea(n) {
  return Math.floor(Math.random() * n);
}

//FIN DU JEU
function checkvie() {
  vie--;

  d3.selectAll(".vie").style("opacity", "0");
  for (let i = 1; i < vie + 1; i++) {
    d3.select(".vie" + i).style("opacity", "1");
  }

  if (vie <= 0) {
    pause = true;
    mort = true;
    d3.select(".mort").style("display", "flex");
    d3.select(".mort p span").html(score);
    if (meilleurscore < score) {
      localStorage.setItem("beuleu", score);
    }
  } else {
    player.attr("href", "#" + vie);
  }
}

//BOUTON RECOMMENCER
let retrybutton = d3.select(".mort .bouton");
retrybutton.on("click", function () {
  location.replace("jeu.html");
});

//MEILLEUR SCORE

const stockage = window.localStorage;
const meilleurscore = localStorage.getItem("beuleu");
if (meilleurscore !== null) {
  d3.select(".meilleurscore span").html(meilleurscore);
}
