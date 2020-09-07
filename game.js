/*
**  Project:        Javascript Bounce Game with Canvas
**  Author:         Nwosu Darlington Chukwuemeka ~Fritz Darl
**  Date Started:   31st August 2020
**  Date Ended:     6th September 2020
*/

let canvas = document.getElementById("canvas"), cy = window.innerHeight, cx = window.innerWidth;
window.overflow = 'hidden'
canvas.width = cx;
canvas.height = cy -100;
canvas.style.overflow = 'hidden';
let ctx = canvas.getContext("2d");
let i, j, go, grav = 0.5, t = cx/9, score = 0, scoreInc = 0, hitObstacleTime;
t = t - 10;
let obstacles = [], removed_obstackles = [], cordinates = [], bouncer = ball();
let start, stop, d = 1, sd = 10;

let rows = Math.floor(cx/t) //Determine how many rows according to device width
let u = 0;
let reqAnim;
let score_thousand_multiple = 1000;

/* Variables for giving special priviledge */
let scoregreaterthan1k, eatObstackleFast;

function gameOver() {
    obstacles = [];
    removed_obstackles = [];
    hitObstacleTime = null;
    scoreInc = 0;
    scoregreaterthan1k = null;
    eatObstackleFast = null;
    start = null;
    stop = null;
    d = 1;
    sd = 10;
    let highscore = localStorage.getItem("high_score");
    if(!highscore || +highscore < score) {
        localStorage.setItem("high_score", score);
    }
    playbtn.style.display = 'none';
    go = true;
    let div = document.createElement('div')
    div.id = 'game_over_container';
    div.style.color = '#fff';
    div.style.background = 'black';
    div.style.height = '200px';
    div.style.width = '100%';
    div.style.textAlign = 'center';
    div.style.boxShadow = '1px 0px 2px 1px #ded1d1';
    div.style.marginTop = -cy/2 + 'px';
    div.style.position = 'relative';
    
    let template = `
            <h1 id="game_over" style="word-spacing: 60px; font-size: 0px; font-weight: bold; font-family:cursive, monospace; text-shadow: 3px 4px 2px tomato; padding: 40px 0 0;">Game over</h1>

            <p>
                <span id="game_score" style="font-size:0px;">
                    <strong style="background:purple; color: #fff; border-radius:5px; padding: 3px;">
                        Score:
                    </strong>
                    <strong style="padding:5px;">${score}</strong>
                </span>
                <span id="high_score" style="font-size:20px;">
                    <strong style="background:orange; color: #fff; border-radius:5px; padding: 3px;">
                        Highscore:
                    </strong>
                    <strong style="padding:5px;">${localStorage.getItem("high_score")}</strong>
                </span>
                
            </p>

            
            <div><input style="color:#fff; background-color:#1e1e48; border:none; font-size:15px; border-radius:5px; padding:5px" type="submit" value="Replay" onclick="replay()"></div>
            `
            
    div.innerHTML = template;
    document.body.appendChild(div);
    let w = 1;
    let timer = setTimeout(function tick(){
        game_over_container.style.display = '';
        game_over.style.fontSize = w + 'px';
        game_score.style.fontSize = w/2 + 'px'
        high_score.style.fontSize = w/2 + 'px'
        timer = setTimeout(tick, 10)
        if(w == 36) {
            clearTimeout(timer);
        }
        w++;
        
    }, 10);
    score = 0;
}
function playGame() {
    let c = document.getElementById('game_over_container')
    if(go){bouncer = ball()}
    if(c){c.remove()}
    let val = playbtn.value;
    val = val.toLowerCase() == 'play' ? 'Pause' : 'Play'
    playbtn.value = val;

    if(val.toLowerCase() == 'play') {
        cancelAnimationFrame(reqAnim); 
    } else {
        requestAnimationFrame(animate)
    }
}
function random(length, start = 0, rand = true) {
    if(!rand) {
        return  Math.random() * length + start;
    }
    return Math.floor(Math.random() * length) + start;
}
function toDegrees(angle) {
    return angle * (180 / Math.PI)
}

function compare(array, search_array) {
    let bool = false, obj;
    array.forEach((el, ind) => {
        if((search_array[0].x >= el.x && search_array[0].x < el.lx+20) && (search_array[0].y <= el.y + 12 && search_array[0].y > el.y) ) {
            removed_obstackles.push(array[ind])
            array.splice(ind, 1)
            scoreInc++;
            if(scoreInc == d) {
                start = Date.now();
            }
            if(scoreInc == sd) {
                d = sd + 1;
                sd = sd + 10;
                stop = Date.now();
                hitObstacleTime = stop - start;
            }
           let s = 10;
           if(el.color == "orange"){
               s = 56;
            } else if(el.color == 'red') {
                s =  112;
            }
            score = score + s;
            scores.innerHTML = score;
            
            
            bool = true;
            obj = {bool, x: el.x, lx: el.lx}
        }
    });
    return obj;
}
function reRenderObstacles(i, y) {
    
    for(let j = 0; j < i; j++) {
        let block = removed_obstackles[random(removed_obstackles.length -1, 0)];
        if(y == block.y){
            continue;
        }
        obstacles.push(block);
    }
}
function rects() {
    for(i = 0; i < 4; i++) {
        for(j = 0; j < rows; j++) {
            let x = 10 + j * t;
            let y = 10 + i * 20;
            let lx = x + (t-10);
            let ob = {
                x,
                y,
                lx,
                color: 'blue',

                draw() {
                    ctx.beginPath();
                    ctx.lineWidth = 12;
                    ctx.strokeStyle = this.color;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.lx, this.y);
                    ctx.stroke()
                }
            }

            obstacles.push(ob);
        }
    }
}

rects()

let obstacles_sum = obstacles.length,
    h = (cx/2) - 35, //keep record of the postion of the x cordinate of the slider control e.g => moveTo(h, y), where y is the y-axis cordinate
    g = (cx/2) + 35, //keep record of the length of the slider controls e.g => lineTo(g, y), where "y" is the y-axis cordinate
    s = cy - 300; //keep record of the postion of the y cordinate of the slider control e.g => moveTo(x, s), where "x" is the x-axis cordinate

function batton(h, g, s) {
    ctx.beginPath();
    ctx.lineWidth = 12
    ctx.strokeStyle = 'blue';
    ctx.moveTo(h, s);
    ctx.lineTo(g , s);
    ctx.stroke()
}

batton(h, g, s)

let slide_val = +rag.value 
function moveBatton() {
    
    let val = +rag.value;

    let i = cx/100;
    
    ctx.clearRect(h-10, cy/2-100, cx, cy)
    if(slide_val < val) {
        h = h + (i)*2;
        g = g + (i)*2;
        slide_val = val;
    } else {
        h = h - (i)*2;
        g = g - (i)*2;
        slide_val = val;
    }

    batton(h, g, s);
    
}


function ball() {
    let sign = [1, -1],
        color = 'green';
        radius = 5;
        x = (cx/2);
        y = cy/2 -200
        dy = 4;
        dx = (Math.random() * (Math.random() * 2 + Math.tan(grav))) * sign[random(sign.length)];
        vel = 0.005;
    return {
        radius, x, y, dy, dx, vel, color,
        update() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
  }


  function animate() {    
    reqAnim = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, cx, s);

    for(let j = 0; j < obstacles.length; j++) {
        obstacles[j].draw() //draw the rectangular blocks
    }

    batton(h, g, s) //move the batton in correspondance with the slider

    bouncer.update();
    bouncer.y += bouncer.dy;
    bouncer.x += bouncer.dx;
    if(obstacles.length < obstacles_sum * 0.75 && ((bouncer.y + bouncer.radius) >= cy/2-200) ) {
        /*
            Add more block if player has eaten quater of the blocks.
            Add those blocks only if the bouncer is below the blocks.
        */
        reRenderObstacles(random(removed_obstackles.length-1, 0), (bouncer.y + bouncer.radius))
    }

    if(score > score_thousand_multiple) {
        score_thousand_multiple *= 2
        unlockSpecial({color:'orange', special:'scoresgreaterthan1k'});
    }

    if(hitObstacleTime <= 5000) {
        unlockSpecial({color:'red', special:'eatobstaclefast'})
        hitObstacleTime = null;
        eatObstackleFast = null;

    }

    if(obj = compare(obstacles, [{x: bouncer.x+bouncer.radius, y: bouncer.y + bouncer.radius}])) {
        /*
            Remove block if the bouncer touches it.
        */
        let block_len = obj.lx - obj.x;
        let bx =  obj.lx - bouncer.x > block_len/2 ? -2 : 2;
        bouncer.dy = -bouncer.dy;
        bouncer.dx += bx * bouncer.vel * grav;
    }

    if(bouncer.y + bouncer.radius >= s-10 && (bouncer.x + bouncer.radius >= h && bouncer.x + bouncer.radius <= (h + 80))) {
        /*
            Bounce the ball if only it hits the batton
            use random angles to change the direction of the bounce
        */
        let left_angles = [45, 35, 25, 15, 15.5]
        right_angles = [45, 19, 46, 15.5]
        let dir_cord = bouncer.x - h;
        let dir = dir_cord > 35 ? 'right' : 'left';
        let bx = dir == 'right' ? Math.cos(toDegrees(right_angles[random(right_angles.length-1,0)])) + bouncer.vel * grav: -Math.cos(toDegrees(right_angles[random(left_angles.length-1,0)])) + bouncer.vel * grav;
        bouncer.dx = bx + grav;
        bouncer.dy = -bouncer.dy;

    } else if(bouncer.y  > (s-10) && (bouncer.x + bouncer.radius < h || bouncer.x + bouncer.radius > (h + 80))) {
        /*
            Stop game if it does not hit the batton
            only stop game if the ball is moving in y directions <<<downwards
        */
        gameOver();
        cancelAnimationFrame(reqAnim);
    } 
    if(bouncer.x + bouncer.radius >= cx-10 || bouncer.x - bouncer.radius < 0) {
        /*
            bounce the ball back when it hits the x-axis
        */
        bouncer.dx = -bouncer.dx;
    }

    if(bouncer.y + bouncer.radius <= 0) {
        /*
            bounce down the ball when it hits the +y-axis <<<above
        */
        bouncer.dy = -bouncer.dy;
    }

  //End of the animation
  }
  
//   animate()

  function replay() {
    scores.innerHTML = 0;
    score = 0;
    playbtn.style.display = '';
      game_over_container.remove();
      rects();
      bouncer = ball();
      animate();
  }

  function unlockSpecial(obj) {
      if(!scoregreaterthan1k && obj.special == 'scoresgreaterthan1k') {

        for(j = 0; j < 4; j++) {
          i = random(obstacles.length-1,0);
          if(obstacles[i].special != true) {
            obstacles[i].color = obj.color;
            obstacles[i].special = true;
            scoregreaterthan1k = true;
          }
        }

      }
      if(!eatObstackleFast && obj.special == 'eatobstaclefast') {

        for(j = 0; j < Math.floor(hitObstacleTime/1000); j++) {
            i = random(obstacles.length-1,0);
            if(obstacles[i].special != true) {
                obstacles[i].color = obj.color;
                obstacles[i].special = true;
                eatObstackleFast = true;
            }
        }

      }
  }
  

