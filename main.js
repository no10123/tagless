const body = document.getElementById("body") || document.body; // added fallback
let W = 41;
let H = 21;
let grid = [];
let best_floor = 1
let instructions = [
    "inputs:          ",
    " wasd to move,   ",
    " SHIFT to sprint ",
    "                 ",
    "floor:      1    ",
    "money:      0$   ",
    "hp:         100  ",
    "attack:     3    ",
    "luck:       0    ",
    "lvl:        0    ",
    "xp:         0    ",
    "vision:     4    ",
    "Fog:        on   ",
    "total time: 0:00 ",
    "floor time: 0:00 ",
    "avg time:   0:00 ",
    "best time:  0:00 ",
    "size:       0 x 0",
    "difficulty: medium",
    "best floor: 1     ",
]
const instructionWidth = 20;

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function randomInt([min, max]) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateStats() {
    instructions[4]  = `floor:      ${p.floor}`;
    instructions[5]  = `money:      ${p.money}$`;
    instructions[6]  = `hp:         ${p.hp}`;
    instructions[7]  = `attack:     ${p.attack}`;
    instructions[8]  = `luck:       ${p.luck}`;
    instructions[9]  = `lvl:        ${p.lvl}`;
    instructions[10] = `xp:         ${p.xp}`;
    instructions[11] = `vision:     ${fogMap.range}`;
    instructions[12] = `Fog:        ${fogOn ? "on" : "off"}`;
    instructions[13] = `total time: ${formatTime(t.run)}`;
    instructions[14] = `floor time: ${formatTime(t.floor)}`;
    instructions[15] = `avg time:   ${formatTime(t.avg)}`;
    instructions[16] = `best time:  ${formatTime(t.best)}`;
    instructions[17] = `size:       ${W} x ${H}`;
    instructions[18] = `difficulty: ${["easy","medium","hard","expert","master","godlike","ascended"][difficulty]}`
    instructions[19] = `best floor: ${best_floor}`;
}

const air = " ";
const wall = "#";

const style = getComputedStyle(document.body);
const fontSize = parseFloat(style.fontSize);
const lineHeight = style.lineHeight === "normal" ? fontSize * 1.2 : parseFloat(style.lineHeight);

const charWidth = fontSize * 0.6;
const columns = Math.floor(document.documentElement.clientWidth / charWidth);
const rows = Math.floor(document.documentElement.clientHeight / lineHeight);

console.log({ columns, rows });
W = Math.max(12, columns - instructionWidth - 20);
H = Math.max(instructions.length, rows - 5);

const fogSymbol = "?";
let fogOn = true;
let enemy = null;
let battle = null;
let gameMessage = "";

let skill_selection = null

function cls() {
    grid = [];
    for (let y = 0; y < H; y++) {
        let row = new Array(W).fill(air);
        if (y === 0 || y === H - 1) {
            row.fill(wall);
        } else {
            row[0] = wall;
            row[W - 1] = wall;
        }
        grid.push(row);
    }
}

function getEmptyTile() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (W - 2)) + 1;
        y = Math.floor(Math.random() * (H - 2)) + 1;
    } while (grid[y][x] !== air);
    return {x, y};
}

function newFloor({ outline = false, openRatio = 0.45, pillars = 15, brush = 1 } = {}) {
    grid = [];
    for (let y = 0; y < H; y++) {grid.push(new Array(W).fill(wall));}

    const targetEmptyTiles = Math.floor(W * H * openRatio); 
    let carvedTiles = 0;
    
    let walkerX = Math.floor(W / 2);
    let walkerY = Math.floor(H / 2);

    if (p) {
        p.x = walkerX;
        p.y = walkerY;}

    while (carvedTiles < targetEmptyTiles) {
        for (let dy = -brush; dy <= brush; dy++) {
            for (let dx = -brush; dx <= brush; dx++) {
                let carveX = walkerX + dx;
                let carveY = walkerY + dy;
                
                if (carveX > 0 && carveX < W - 1 && carveY > 0 && carveY < H - 1) {
                    if (grid[carveY][carveX] === wall) {
                        grid[carveY][carveX] = air;
                        carvedTiles++;}}}}

        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        
        walkerX += randomDir[0];
        walkerY += randomDir[1];

        if (walkerX < 1 + brush)     walkerX = 1 + brush;
        if (walkerX > W - 2 - brush) walkerX = W - 2 - brush;
        if (walkerY < 1 + brush)     walkerY = 1 + brush;
        if (walkerY > H - 2 - brush) walkerY = H - 2 - brush;
    }

    for (let i = 0; i < pillars; i++) {
        let px = Math.floor(Math.random() * (W - 2)) + 1;
        let py = Math.floor(Math.random() * (H - 2)) + 1;
        
        if (grid[py][px] === air && (px !== walkerX || py !== walkerY)) {
            grid[py][px] = wall;}}

    if (outline) {
        const tempGrid = JSON.parse(JSON.stringify(grid));

        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (tempGrid[y][x] === wall) {
                    let touchesAir = false;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (tempGrid[y + dy][x + dx] === air) {
                                touchesAir = true;
                            }
                        }
                    }

                    if (!touchesAir) {
                        grid[y][x] = air;
                    }
                }
            }
        }
    }

    fogMap.reset();
    t.NewFloor();
    PS.spawn();
    PM.spawn();
    PL.spawn();
    PX.spawn();
}

function draw() {
    fogMap.reveal(p.x, p.y);
    updateStats()
    if (battle) {
        const border = "+" + "-".repeat(Math.max(0, W - 2)) + "+";
        const outTop = [];
        outTop.push(border)
        outTop.push("")
        outTop.push(battle.enemy.name.toUpperCase())
        outTop.push(`HP: ${battle.enemy.hp}/${battle.enemy.maxHp} ATK: ${battle.enemy.attack}`)
        outTop.push("")
        outTop.push(`[ ${battle.enemy.name} ]`)
        outTop.push("")
        let message = battle.message || gameMessage;
        const messageLines = [];
        while (message && messageLines.length < H - 15) {
            let line = message.slice(0, W);
            if (message.length > W && line.includes(" ")) line = line.slice(0, line.lastIndexOf(" "));
            messageLines.push(line);
            message = message.slice(line.length).trimStart();
        }
        outTop.push(...messageLines);

        const outBottom = [];
        outBottom.push(`HERO HP: ${p.hp}`)
        outBottom.push(`ATK: ${p.attack}  XP: ${p.xp}`)
        outBottom.push(`GOLD: ${p.money}$`)
        outBottom.push("1. Attack")
        outBottom.push("2. Item")
        outBottom.push("3. Parry")
        outBottom.push("4. Flee")
        outBottom.push(border)
        const outs = [...outTop,...Array(Math.max(0, H - outTop.length - outBottom.length)).fill(""),...outBottom].slice(0, H);

        let display = "\n  " + " ".repeat(W);
        for (const out of outs) {
            const line = String(out).slice(0, W);
            const left = Math.floor((W - line.length) / 2);
            display += "\n    " + " ".repeat(left) + line.padEnd(W - left);
        }
        body.innerText = display;
    } else if (skill_selection) {
        out = []
        const border = "+" + "-".repeat(Math.max(0, W - 2)) + "+";
        out.push(border)
        out.push("Skill Selection:")
        out.push(`lvl: ${p.lvl}`)
        for (let i = 0; i < skill_selection.length; i++) {
            out.push(`${i}. ${skill_selection[i].name}`)
        }
        out.push("\n" * (H - out.length - 2))
        out.push(border)
        for (let i = 0; i < out.length; i++) {
            grid[i] = [...out[i], " " * (W - out[i].length)]
        }
    } else {
        let display = "\n  " + " ".repeat(W);
        for (let i = 0; i < grid.length; i++) {
            let instruction = i < instructions.length ? instructions[i] : " ";
            const row = grid[i].map((tile, x) => fogOn && !fogMap.isExplored(x, i) ? fogMap.sym : tile).join("");
            display += "\n    " + row + "  " + instruction;
        }
        body.innerText = display;
    }
}

class Player {
    constructor(x, y, sym) {
        this.x = x;
        this.y = y;
        this.sym = sym;
        this.lastMove = "w"
        // stats
        this.floor  = 1
        this.money  = 0
        this.hp     = 100
        this.attack = 3
        this.luck   = 0
        this.lvl    = 0
        this.xp     = 0
        this.sprint = 2
        this.place(this.sym);
    }    
    
    place(sym) {
        grid[this.y][this.x] = sym;
    }    
    
    move(dir, a) {
        let nextX = this.x;
        let nextY = this.y;
        
        if (dir == "w") nextY -= a;
        if (dir == "a") nextX -= a;
        if (dir == "s") nextY += a;
        if (dir == "d") nextX += a;
        this.lastMove = dir;

        if (grid[nextY][nextX] !== wall) {
            let goUp = false
            if (grid[nextY][nextX] == s.sym) {
                goUp = true;
            } else if (grid[nextY][nextX] == m.sym) {
                this.money += 1;
                updateStats();
            } else if ([PS.sym, PM.sym, PL.sym, PX.sym].includes(grid[nextY][nextX])) {
                this.hp += [10,25,50,100][[PS.sym,PM.sym,PL.sym,PX.sym].indexOf(grid[nextY][nextX])]
                updateStats();
            }
            this.place(air);
            this.x = nextX;
            this.y = nextY;
            this.place(this.sym);
            if (goUp) s.next();
            enemy.spawn()
        }
    }

    check_lvl () {
        const reqxp = 8 + 4 * this.lvl
        if (this.xp > reqxp) {
            this.lvl++
            this.xp = this.xp - reqxp
            this.options = [
                {"name":"+ attack", "func": () => {p.attack++;}},
                {"name":"+hp",      "func": () => {p.hp = p.hp + p.lvl * 4;}},
                {"name":"+3$",      "func": () => {p.money = p.money + 3;}}]
            // 3 random skills.
            skill_selection = [...this,options].sort(() => 0.5 - Math.random()).slice(0, 3);
            this.attack++
            this.hp = this.hp + this.lvl * 4
            this.check_lvl()
        }
    }

    handleInput () {

    }
}

class Money {
    constructor(sym) {
        this.l = Math.floor(Math.random() * 10) + 1; 
        this.x = [];
        this.y = [];
        this.sym = sym;
        
        for (let i = 0; i < this.l; i++) {
            let {x,y} = getEmptyTile();
            this.x.push(x);
            this.y.push(y);
        }
        this.place();
    }
    
    place() {
        for (let i = 0; i < this.l; i++) {
            grid[this.y[i]][this.x[i]] = this.sym;
        }
    }
}

class stairs {
    constructor (sym) {
        this.sym = sym
    }
    place () {
        let {x,y} = getEmptyTile();
        grid[y][x] = this.sym;
    }
    next () {
        p.floor++;
        best_floor = Math.max(best_floor, p.floor)
        newFloor();
        new Money(m.sym);
        p.place("@");
        this.place();
        enemy.spawn();
        updateStats();
        draw();
    }
}

class Enemy {
    constructor() {
        this.chance = 20
        this.cmax   = 1000
        this.monsters = [
            {"name":"goblin","hp":12,"dmg":[1,4], "ac":5, "gold":[2,5],"xp":[1,6], "lvl":0},
            {"name":"ghost", "hp":6 ,"dmg":[1,12],"ac":10,"gold":[1,3],"xp":[3,12],"lvl":0},
        ]
    }
    spawn() {
        const r = Math.ceil(Math.random() * this.cmax)
        if (r > this.chance) return;
        this.setStats()
        this.startBattle()
    }
    setStats() {
        this.id = 0;
        this.monster = this.monsters[this.id];

        const rolled = Object.fromEntries(
            Object.entries(this.monster).map(([key, value]) => [
                key,
                Array.isArray(value) ? randomInt(value) : value
            ])
        );
        this.name = rolled.name;
        this.maxHp = rolled.hp + p.floor * 2;
        this.hp = this.maxHp;
        this.attack = rolled.dmg + p.floor;
        this.xpReward = rolled.xp + p.floor * 2;
        this.moneyReward = rolled.gold;
    }
    startBattle() {
        if (battle) return;
        gameMessage = "";
        battle = {
            enemy: this,
            message: `A ${this.name} attacks!`,
            parrying: false
        };
        draw();
    }
    enemyTurn(action) {
        if (!battle) return;
        const damage = Math.min(p.hp, battle.enemy.attack);
        if (battle.parrying) {
            battle.parrying = false;
            damage - (p.dmg - 1);
            battle.enemy.hp = Math.max(0, battle.enemy.hp - Math.max(1, Math.floor(p.attack/2)));
        }
        p.hp -= damage;
        battle.message = `${action} -${damage} HP.`;
        if (p.hp == 0) {
            battle = null
            reset()
        } 
        draw();
    }
    playerAttack() {
        if (!battle) return;
        const damage = Math.max(1, p.attack);
        battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
        if (battle.enemy.hp === 0) {
            p.xp += battle.enemy.xpReward;
            p.money += battle.enemy.moneyReward;
            gameMessage = `Won! +${battle.enemy.xpReward}xp +$${battle.enemy.moneyReward}`;
            battle = null;
            p.check_lvl();
            updateStats();
            draw();
            return;
        }
        this.enemyTurn(`Hit ${damage}.`);
    }
    flee() {
        if (!battle) return;
        if (Math.random() < 0.5) {
            gameMessage = "You escaped!";
            battle = null;
            draw();
            return;
        }
        this.enemyTurn("Flee failed.");
    }
    handleInput(key) {
        if (!battle) return;
        if (key === "1") {
            this.playerAttack();
        } else if (key === "2") {
            battle.message = "Items unavailable.";
            draw();
        } else if (key === "3") {
            battle.parrying = true;
            this.enemyTurn("You parry.");
        } else if (key === "4") {
            this.flee();
        }
    }
}

class Fog {
    constructor(range, sym) {
        this.range = range;
        this.sym = sym;
        this.reset();
    }

    reset() {
        this.explored = Array.from({ length: H }, () => new Array(W).fill(false));
    }

    reveal(x, y) {
        for (let row = Math.max(0, y - this.range); row <= Math.min(H - 1, y + this.range); row++) {
            for (let column = Math.max(0, x - 4 * this.range); column <= Math.min(W - 1, x + 4 * this.range); column++) {
                const dx = column - x;
                const dy = row - y;
                if (dx * dx + dy * dy <= this.range * this.range) {
                    this.explored[row][column] = true;
                }
            }
        }
    }

    isExplored(x, y) {
        return this.explored[y][x];
    }

    adjustRange(amount) {
        this.range = Math.max(1, this.range + amount);
    }
}

class timer {
    constructor () {
        this.start = Date.now();
        this.start_floor = Date.now();
        this.run   = 0
        this.floor = 0
        this.best  = 0
        this.avg   = 0
        this.l3ft = []
    }
    tick() {
        const now = Date.now();
        this.run = now - this.start;
        this.floor = now - this.start_floor;
    }
    NewFloor() {
        this.tick();
        this.l3ft.push(this.floor)
        if (this.l3ft.length > 3) this.l3ft.splice(0,1)
        if (this.floor < this.best) this.best = this.floor
        this.avg = (this.l3ft.reduce((accumulator, currentValue) => accumulator + currentValue, 0))/this.l3ft.length
        this.start_floor = Date.now();
        this.tick()
    }
}

class potion {
    constructor (sym,lvl) {
        this.sym = sym
        this.value = [10,25,50,100][lvl]
        this.w = [[1,2,3,4],[0,0,0,0,1,2],[0,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,1]][lvl]
    }
    place () {
        let {x,y} = getEmptyTile();
        grid[y][x] = this.sym;
    }
    spawn () {
        this.a = this.w[Math.floor(Math.random() * this.w.length)]
        if (this.a > 0) {
            for (let i = 0; i < this.a; i++) {
                this.place()
            }
        }
    }
}

const fogMap = new Fog(4, fogSymbol);

let t;
let p;
let PS = new potion("p",0); // +10
let PM = new potion("h",1); // +25
let PL = new potion("P",2); // +50
let PX = new potion("H",3); // +100
let m;
let s;
let difficulty = 1; // 0 = easy, 1 = medium, 2 = hard, 3 = expert, 4 = master, 5 = godlike, 6 = accended. (could use exponitional.) 

function reset() {
    battle = null;
    gameMessage = "";
    fogOn = true;
    fogMap.range = 4;
    t = new timer();
    p = null;
    newFloor();
    p = new Player(Math.floor(W / 2), Math.floor(H / 2), "@");
    m = new Money("$");
    s = new stairs(">");
    s.place();
    enemy = new Enemy();
    enemy.spawn();
    updateStats();
    draw();
}

reset();

setInterval(() => {
    t.tick();
    draw();
}, 1000);

document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (battle) {
        enemy.handleInput(key);
        return;
    } else if (skill_selection) {
        return;
    }

    if (["w", "a", "s", "d"].includes(key)) {
        p.move(key, 1);
        draw();
    } else if (key === " ") {
        p.sword(4);
    } else if (key === "f") {
        fogOn = !fogOn;
        draw();
    } else if (key === "[") {
        fogMap.adjustRange(-1);
        draw();
    } else if (key === "]") {
        fogMap.adjustRange(1);
        draw();
    } else if (["W", "A", "S", "D"].includes(key)) {
        for (let i = 0; i < p.sprint; i++) {
            p.move(key.toLocaleLowerCase(), 1);
            draw();
        }
    } else if (key == "-") {
        difficulty = Math.max(0,difficulty - 1);
        updateStats();
    } else if (key == "=") {
        difficulty = Math.min(6,difficulty + 1);
        updateStats();
    }
});