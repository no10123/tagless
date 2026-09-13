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
    "xp:     0   "
]

function updateStats() {
    instructions[4]  = `floor:  ${p.floor}`.padEnd(12," ");
    instructions[5]  = `money:  ${p.money}$`.padEnd(11, " ");
    instructions[6]  = `hp:     ${p.hp}`.padEnd(12, " ");
    instructions[7]  = `attack: ${p.attack}`.padEnd(12, " ");
    instructions[8]  = `luck:   ${p.luck}`.padEnd(12, " ");
    instructions[9]  = `lvl:    ${p.lvl}`.padEnd(12, " ");
    instructions[10] = `xp:     ${p.xp}`.padEnd(12, " ");
}

const air = " ";
const wall = "#";

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

function newFloor() {
    grid = [];
    for (let y = 0; y < H; y++) {
        grid.push(new Array(W).fill(wall));
    }
    const directions = [[0, -2],[0, 2],[-2, 0],[2, 0]];

    function carve(x, y) {
        grid[y][x] = air;
        let dirs = [...directions].sort(() => Math.random() - 0.5);

        for (let [dx, dy] of dirs) {
            const nextX = x + dx;
            const nextY = y + dy;

            if (
                nextY > 0 && nextY < H - 1 &&
                nextX > 0 && nextX < W - 1 &&
                grid[nextY][nextX] === wall
            ) {
                grid[y + dy / 2][x + dx / 2] = air;
                carve(nextX, nextY);
            }
        }
    }
    carve(p.x, p.y);
}

function draw() {
    let display = "\n  " + " ".repeat(W);    
    for (let i = 0; i < grid.length; i++) {
        let I = i < instructions.length ? instructions[i] : " ";
        display += "\n    " + grid[i].join("") + "  " + I; 
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
        cls();
        new Money(m.sym);
        p.place("@");
        this.place();
        updateStats();
        draw();
    }
}

cls();
const p = new Player(10, 10, "@");
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
    }
});