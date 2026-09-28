const body = document.getElementById("body") || document.body; // added fallback
let W = 41;
let H = 21;
let grid = [];
let instructions = [
    "move:       ",
    "    w       ",
    "  a s d     ",
    "",
    "floor: 1    ",
    "money: 0$   ",
    "hp:     100 ",
    "attack: 3   ",
    "luck:   0   ",
    "lvl:    0   ",
    "xp:     0   ",
    "vision: 4   ",
    "Fog:    on  "
]

function updateStats() {
    instructions[4]  = `floor:  ${p.floor}`.padEnd(12," ");
    instructions[5]  = `money:  ${p.money}$`.padEnd(11, " ");
    instructions[6]  = `hp:     ${p.hp}`.padEnd(12, " ");
    instructions[7]  = `attack: ${p.attack}`.padEnd(12, " ");
    instructions[8]  = `luck:   ${p.luck}`.padEnd(12, " ");
    instructions[9]  = `lvl:    ${p.lvl}`.padEnd(12, " ");
    instructions[10] = `xp:     ${p.xp}`.padEnd(12, " ");
    instructions[11] = `vision: ${fogMap.range}`.padEnd(12, " ");
    instructions[12] = `Fog:    ${fogOn ? "on" : "off"}`.padEnd(12, " ");
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
W = columns - 14
H = rows - 5

const fogSymbol = "?";
let fogOn = true;

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
}

function draw() {
    fogMap.reveal(p.x, p.y);
    updateStats()
    let display = "\n  " + " ".repeat(W);
    for (let i = 0; i < grid.length; i++) {
        let instruction = i < instructions.length ? instructions[i] : " ";
        const row = grid[i].map((tile, x) => fogOn && !fogMap.isExplored(x, i) ? fogMap.sym : tile).join("");
        display += "\n    " + row + "  " + instruction;
    }
    body.innerText = display;
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
            if (grid[nextY][nextX] == s.sym) goUp = true;
            if (grid[nextY][nextX] == m.sym) {
                this.money += 1;
                updateStats();
            }
            this.place(air);
            this.x = nextX;
            this.y = nextY;
            this.place(this.sym);
            if (goUp) s.next();
        }
    }

    sword(l) {
        let dir = this.lastMove;
        for (let i = 1; i < l; i++) {
            let nextX = this.x;
            let nextY = this.y;
            
            if (dir == "w") nextY -= i;
            if (dir == "a") nextX -= i;
            if (dir == "s") nextY += i;
            if (dir == "d") nextX += i;
            
            if (nextY >= 0 && nextY < H && nextX >= 0 && nextX < W) {
                grid[nextY][nextX] = "*";
            }
        }
        draw();
        
        for (let i = 1; i < l; i++) {
            let nextX = this.x;
            let nextY = this.y;
            
            if (dir == "w") nextY -= i;
            if (dir == "a") nextX -= i;
            if (dir == "s") nextY += i;
            if (dir == "d") nextX += i;
            
            if (nextY >= 0 && nextY < H && nextX >= 0 && nextX < W) {
                grid[nextY][nextX] = air;
            }
        }
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
        newFloor();
        new Money(m.sym);
        p.place("@");
        this.place();
        updateStats();
        draw();
    }
}

class Enemy {
    constructor(sym) {
        this.sym = sym;
        let {x,y} = getEmptyTile();
        this.x = x;
        this.y = y;
        grid[y][x] = sym;
    }
    place(sym) {
        grid[this.y][this.x] = sym;
    }
    move() {
        let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        let randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        let nextX = this.x + randomDir[0];
        let nextY = this.y + randomDir[1];
        if (grid[nextY][nextX] !== wall && grid[nextY][nextX] !== this.sym) {
            this.place(air);
            this.x = nextX;
            this.y = nextY;
            this.place(this.sym);
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

const fogMap = new Fog(4, fogSymbol);

let p;
newFloor();
p = new Player(Math.floor(W / 2), Math.floor(H / 2), "@");
updateStats();
const m = new Money("$");
const s = new stairs(">");
s.place();
draw();

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
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
    }
});