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
    "debug: none",
]
const instructionWidth = 20;
let lastConsoleLog = "none";

function debugLog(...values) {
    lastConsoleLog = values.map((value) => {
        if (typeof value === "string") return value;
        try {
            return JSON.stringify(value) ?? String(value);
        } catch {
            return String(value);
        }
    }).join(" ");
    console.log(...values);
}

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
    instructions[20] = `debug: ${lastConsoleLog}`.slice(0, instructionWidth);
}

const air = " ";
const wall = "#";

const style = getComputedStyle(document.body);
const fontSize = parseFloat(style.fontSize);
const lineHeight = style.lineHeight === "normal" ? fontSize * 1.2 : parseFloat(style.lineHeight);

const charWidth = fontSize * 0.6;
const columns = Math.floor(document.documentElement.clientWidth / charWidth);
const rows = Math.floor(document.documentElement.clientHeight / lineHeight);

debugLog({ columns, rows });
W = Math.max(12, columns - instructionWidth - 20);
H = Math.max(instructions.length, rows - 5);

const fogSymbol = "?";
let fogOn = true;
let enemy = null;
let battle = null;
let gameMessage = "";

let skill_selection = null
let shopState = null

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
    if (shopState) {
        const lines = [
            `SHOP - FLOOR ${p.floor}`,
            `Gold: ${p.money}$`,
            "",
            ...shopState.offers.map((item, index) =>
                `${index + 1}. ${item.item} - ${item.cost}$ [${item.rarity}]${item.purchased ? " SOLD" : ""}`
            ),
            "",
            "0. Continue to floor",
            "ESC. Continue to floor"
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (battle) {
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
        const border = "+" + "-".repeat(Math.max(0, W - 2)) + "+";
        const out = [border, "Skill Selection:", `lvl: ${p.lvl}`];
        for (let i = 0; i < skill_selection.length; i++) {
            out.push(`${i + 1}. ${skill_selection[i].name}`);
        }
        out.push(border);
        const lines = [...out.slice(0, H), ...Array(Math.max(0, H - out.length)).fill("")];
        let display = "\n  " + " ".repeat(W);
        for (const line of lines) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
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
            if (!shopState) enemy.spawn();
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
                {"name":"+3$",      "func": () => {p.money = p.money + 3;}},
                {"name":"+luck",    "func": () => {p.luck++;}},
            ]
            skill_selection = this.options.slice().sort(() => 0.5 - Math.random());
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
        best_floor = Math.max(best_floor, p.floor)
        newFloor();
        new Money(m.sym);
        p.place("@");
        this.place();
        shopState = shop.open(p.floor);
        updateStats();
        draw();
    }
}

class Shop {
    constructor () {
        this.shopPool = [
            // + attack
            {"item":"+1 attack",  "cost":5, "func":  () => {p.attack = p.attack + 1;}, "rarity":"common"},
            {"item":"+3 attack",  "cost":13, "func": () => {p.attack = p.attack + 3;}, "rarity":"uncommon"},
            {"item":"+5 attack",  "cost":21, "func": () => {p.attack = p.attack + 5;}, "rarity":"rare"},
            {"item":"+7 attack",  "cost":30, "func": () => {p.attack = p.attack + 7;}, "rarity":"mythic"},
            {"item":"+10 attack", "cost":40, "func": () => {p.attack = p.attack + 10;},"rarity":"legendary"},
            {"item":"+20 attack", "cost":75, "func": () => {p.attack = p.attack + 20;},"rarity":"accended"},
            // + hp
            {"item":"+10 hp",     "cost":5,  "func": () => {p.hp = p.hp + 10;}, "rarity":"common"},
            {"item":"+25 hp",     "cost":13, "func": () => {p.hp = p.hp + 25;}, "rarity":"uncommon"},
            {"item":"+50 hp",     "cost":21, "func": () => {p.hp = p.hp + 50;}, "rarity":"rare"},
            {"item":"+75 hp",     "cost":30, "func": () => {p.hp = p.hp + 75;}, "rarity":"mythic"},
            {"item":"+100 hp",    "cost":40, "func": () => {p.hp = p.hp + 100;},"rarity":"legendary"},
            {"item":"+200 hp",    "cost":75, "func": () => {p.hp = p.hp + 200;},"rarity":"accended"},
            // + luck
            {"item":"+1 luck",    "cost":5,  "func": () => {p.luck = p.luck + 1;}, "rarity":"common"},
            {"item":"+2 luck",    "cost":13, "func": () => {p.luck = p.luck + 2;}, "rarity":"uncommon"},
            {"item":"+3 luck",    "cost":21, "func": () => {p.luck = p.luck + 3;}, "rarity":"rare"},
            {"item":"+4 luck",    "cost":30, "func": () => {p.luck = p.luck + 4;}, "rarity":"mythic"},
            {"item":"+5 luck",    "cost":40, "func": () => {p.luck = p.luck + 5;},"rarity":"legendary"},
            {"item":"+10 luck",   "cost":75, "func": () => {p.luck = p.luck + 10;},"rarity":"accended"},
             // misc
            {"item":"+1 sprint",  "cost":20, "func": () => {p.sprint = p.sprint + 1;}, "rarity":"rare"},
            {"item":"vision +1",  "cost":30, "func": () => {fogMap.adjustRange(1);}, "rarity":"mythic"},
            {"item":"lucky coin", "cost":100, "func": () => {p.luck = p.luck + Math.ceil(Math.random() * 20); p.money = p.money + Math.ceil(Math.random() * 20);}, "rarity":"accended"},
        ]
    }

    open(floor) {
        const rarityUnlockFloor = { common: 1, uncommon: 2, rare: 4, mythic: 6, legendary: 9, accended: 12 };
        const rarityUnlockCost = { common: 0, uncommon: 5, rare: 10, mythic: 20, legendary: 30, accended: 70};
        const available = this.shopPool.filter(item => floor >= rarityUnlockFloor[item.rarity] && p.money >= rarityUnlockCost[item.rarity]);
        const offers = [];
        while (offers.length < 3 && available.length > 0) {
            const index = Math.floor(Math.random() * available.length);
            offers.push({ ...available.splice(index, 1)[0], purchased: false });
        }
        return { offers };
    }

    buy(index) {
        const item = shopState?.offers[index];
        if (!item || item.purchased || p.money < item.cost) return;
        p.money -= item.cost;
        item.func();
        item.purchased = true;
        updateStats();
        draw();
    }
}


const shop = new Shop();
class Enemy {
    constructor() {
        this.chance = 20
        this.cmax   = 1000
        this.monsters = [
            // generic monsters
            {"name":"goblin",        "hp":12,           "dmg":[1,4],        "ac":1,       "gold":[2,5],        "xp":[1,6],     "lvl":0},
            {"name":"ghost",         "hp":6,            "dmg":[1,12],       "ac":3,       "gold":[1,3],        "xp":[3,12],    "lvl":0},
            {"name":"zombie",        "hp":30,           "dmg":[1,6],        "ac":10,      "gold":[1,3],        "xp":[3,12],    "lvl":1},
            {"name":"skeleton",      "hp":20,           "dmg":[1,8],        "ac":5,       "gold":[2,6],        "xp":[4,15],    "lvl":1},
            {"name":"orc",           "hp":40,           "dmg":[1,10],       "ac":15,      "gold":[3,8],        "xp":[5,20],    "lvl":2},
            {"name":"troll",         "hp":60,           "dmg":[1,12],       "ac":20,      "gold":[4,10],       "xp":[6,25],    "lvl":2},
            {"name":"ogre",          "hp":80,           "dmg":[1,14],       "ac":25,      "gold":[5,12],       "xp":[7,30],    "lvl":3},
            {"name":"dragon",        "hp":100,          "dmg":[1,16],       "ac":30,      "gold":[6,15],       "xp":[8,35],    "lvl":3},
            {"name":"drake",         "hp":[50,200],     "dmg":[10,20],      "ac":[1,20],  "gold":[1,20],       "xp":[1,40],    "lvl":4},
            // weak stuff
            {"name":"slime",         "hp":15,           "dmg":[1,3],        "ac":0,       "gold":[1,2],        "xp":[2,5],     "lvl":0},
            {"name":"giant rat",     "hp":8,            "dmg":[1,4],        "ac":2,       "gold":[0,1],        "xp":[1,4],     "lvl":0},
            {"name":"kobold",        "hp":10,           "dmg":[1,5],        "ac":4,       "gold":[2,4],        "xp":[2,7],     "lvl":0},
            {"name":"bandit",        "hp":25,           "dmg":[1,6],        "ac":8,       "gold":[5,15],       "xp":[4,14],    "lvl":1},
            {"name":"cultist",       "hp":18,           "dmg":[1,8],        "ac":4,       "gold":[3,10],       "xp":[5,15],    "lvl":1},
            {"name":"ghoul",         "hp":35,           "dmg":[1,8],        "ac":12,      "gold":[2,5],        "xp":[6,18],    "lvl":1},
            {"name":"hobgoblin",     "hp":45,           "dmg":[1,10],       "ac":18,      "gold":[4,10],       "xp":[8,22],    "lvl":2},
            {"name":"harpy",         "hp":50,           "dmg":[1,10],       "ac":14,      "gold":[5,12],       "xp":[10,25],   "lvl":2},
            {"name":"lizardfolk",    "hp":55,           "dmg":[1,12],       "ac":22,      "gold":[3,9],        "xp":[9,24],    "lvl":2},
            // stuff
            {"name":"minotaur",      "hp":95,           "dmg":[2,12],       "ac":28,      "gold":[8,20],       "xp":[15,35],   "lvl":3},
            {"name":"manticore",     "hp":110,          "dmg":[2,14],       "ac":26,      "gold":[10,25],      "xp":[18,40],   "lvl":3},
            {"name":"chimera",       "hp":130,          "dmg":[2,15],       "ac":32,      "gold":[12,30],      "xp":[20,45],   "lvl":3},
            {"name":"lich",          "hp":150,          "dmg":[3,16],       "ac":35,      "gold":[20,50],      "xp":[30,60],   "lvl":4},
            {"name":"kraken",        "hp":250,          "dmg":[4,20],       "ac":40,      "gold":[25,60],      "xp":[40,80],   "lvl":4},
            {"name":"behemoth",      "hp":300,          "dmg":[5,25],       "ac":45,      "gold":[30,75],      "xp":[50,100],  "lvl":4},            
            {"name":"wyvern",        "hp":[180,260],    "dmg":[12,24],      "ac":[15,30], "gold":[15,40],      "xp":[45,90],   "lvl":4},
            // strong stuff
            {"name":"death knight",  "hp":350,          "dmg":[15,30],      "ac":50,      "gold":[40,90],      "xp":[75,150],  "lvl":5},
            {"name":"phoenix",       "hp":[300,450],    "dmg":[20,35],      "ac":[25,45], "gold":[50,120],     "xp":[90,180],  "lvl":5},
            {"name":"storm giant",   "hp":500,          "dmg":[25,45],      "ac":55,      "gold":[60,150],     "xp":[120,240], "lvl":6},
            {"name":"ancient wyrm",  "hp":[600,800],    "dmg":[30,60],      "ac":[35,60], "gold":[100,250],    "xp":[200,400], "lvl":6},
            {"name":"demon lord",    "hp":1200,         "dmg":[50,100],     "ac":70,      "gold":[250,500],    "xp":[300,600], "lvl":7},
            {"name":"archangel",     "hp":1500,         "dmg":[60,120],     "ac":75,      "gold":[300,600],    "xp":[400,800], "lvl":7},
            {"name":"titan",         "hp":2500,         "dmg":[80,150],     "ac":80,      "gold":[400,800],    "xp":[450,900], "lvl":8},
            {"name":"a chair",       "hp":3,            "dmg":[800,900],    "ac":99,      "gold":[100,1000],   "xp":[50,1000], "lvl":8},
            {"name":"god",           "hp":9999,         "dmg":[-99,99],     "ac":90,      "gold":[99,999],     "xp":[500,1000],"lvl":9},
            // really strong stuff
            {"name":"primal god",    "hp":7777,         "dmg":[500,2000],   "ac":20,      "gold":[0,10000],    "xp":[0,100000],     "lvl":9},
            {"name":"cosmic dragon", "hp":[3000,6000],  "dmg":[150,400],    "ac":[50,85], "gold":[500,2000],   "xp":[1000,5000],    "lvl":10},
            {"name":"cosmic titan",  "hp":[4500,8000],  "dmg":[200,600],    "ac":[30,90], "gold":[1000,5000],  "xp":[3000,10000],   "lvl":12},
            {"name":"void dragon",   "hp":12000,        "dmg":[-500,800],   "ac":95,      "gold":[2500,10000], "xp":[15000,30000],  "lvl":14},
            {"name":"time weaver",   "hp":[8000,15000], "dmg":[400,1200],   "ac":[70,110],"gold":[5000,25000], "xp":[25000,50000],  "lvl":16},
            {"name":"accended god",  "hp":20000,        "dmg":[1000,3000],  "ac":120,     "gold":[10000,50000],"xp":[60000,100000], "lvl":18},
            {"name":"master of all", "hp":[50000,99999],"dmg":[5000,15000], "ac":[1,200], "gold":[0,1000000],  "xp":[250000,500000],"lvl":20}
        ];
        this.lvls = {}
        for (let i = 0; i < this.monsters.length; i++) {
            this.lvls[i] = this.monsters[i].lvl
        }
    }
    spawn() {
        const chance = Math.min(this.cmax, Math.round(this.chance * (41 * 21) / (W * H)));
        const r = Math.ceil(Math.random() * this.cmax)
        if (r > chance) return;
        this.id = 0;
        this.rate = Math.floor(((p.floor + p.lvl) ** 1.1) / 4 * (1 + difficulty * 0.5));
        this.mp = []
        for (let i = 0; i < this.monsters.length; i++) {
            if (this.lvls[i] <= this.rate) {
                this.mp.push(i);
            }
        }
        if (this.mp.length === 0) {
            this.id = 0;
        } else {
            this.id = this.mp[Math.floor(Math.random() * this.mp.length)];
        }
        this.setStats()
        this.startBattle()
    }
    setStats() {
        this.monster = this.monsters[this.id];

        const rolled = Object.fromEntries(
            Object.entries(this.monster).map(([key, value]) => [
                key,
                Array.isArray(value) ? randomInt(value) : value
            ])
        );
        this.name = rolled.name;
        this.maxHp = Math.floor(rolled.hp + p.floor * (1 + difficulty * 0.5));
        this.hp = Math.floor(this.maxHp + this.rate);
        this.attack = Math.floor(rolled.dmg + p.floor * (0.5 + difficulty * 0.5));
        this.xpReward = Math.floor(rolled.xp + p.floor * (1 + difficulty * 0.5));
        this.moneyReward = Math.floor(rolled.gold + p.floor * (1 + difficulty * 0.5));
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
        let damage = Math.min(p.hp, battle.enemy.attack);
        if (battle.parrying) {
            battle.parrying = false;
            damage = Math.max(0, damage - (p.attack - 1));
            battle.enemy.hp = Math.max(0, battle.enemy.hp - Math.max(1, Math.floor(p.attack / 2)));
        }
        p.hp -= damage;
        battle.message = `${action} -${damage} HP.`;
        if (p.hp <= 0) {
            battle = null;
            reset();
            return;
        }
        draw();
    }
    playerAttack() {
        if (!battle) return;
        let hit = Math.ceil(Math.random() * 100) + p.luck;
        let damage;
        if (hit > this.monster.ac) {
            damage = Math.max(1, p.attack);
        } else {
            damage = 0;
        }
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
        let factor;
        if (p) {
            factor = difficulty === 0 ? 1 : 1 + (p.luck / (difficulty + 0.5));
        } else {
            factor = 1;
        }
        this.a = this.w[Math.floor(Math.random() * this.w.length * factor)];
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
    if (shopState) {
        if (key === "Escape" || key === "0") {
            shopState = null;
            enemy.spawn();
            draw();
            return;
        }
        const choice = Number(key) - 1;
        if (Number.isInteger(choice) && choice >= 0 && choice < shopState.offers.length) {
            shop.buy(choice);
        }
        return;
    } else if (battle) {
        enemy.handleInput(key);
        return;
    } else if (skill_selection) {
        const choice = Number(key) - 1;
        if (Number.isInteger(choice) && choice >= 0 && choice < skill_selection.length) {
            skill_selection[choice].func();
            skill_selection = null;
            p.check_lvl();
            updateStats();
            draw();
        }
        return;
    }

    if (["w", "a", "s", "d"].includes(key)) {
        p.move(key, 1);
        draw();
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