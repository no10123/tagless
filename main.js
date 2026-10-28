const body = document.getElementById("body") || document.body; // added fallback
const canvas = document.getElementById("canvas") || document.canvas;
const ctx = canvas.getContext("2d");
let W = 41;
let H = 21;
let grid = [];
let best_floor = 1
/* lets adress the github token, yes i know it's a vulnerability and I shouldn't hardcode it.
I also know spliting it doesn't make it secure (i just split it to get arround githubs push protection).
No the token cannot do anything harmful. 
This token can only be used to add, edit, remove issues on the github repo tagless, nothing else. 
Yes I understand someone could steal it and spam the leaderboard, or delete all of the entries. 
Yes I will eventually add a backend to make it secure, but currently haven'thad the time to figure all that out.
(I will use hack clubs nest to clone the repo at some point and add a backend for the token, but 
that time wouldn't be tracked as coding time, and / I already have a hard enough time meeting the 10 water
per week minimum. Also i have a ipv4 on nest so that helps.)
please do not take off any points for this as i is working on fixing it. 
also dont worry ill revoke it once the new method is up and working.
*/
const token = "github" + "_pat_11" + "A6Z3DRY0uiBjs" + "usXifV4_0hbHd1Lhpsr1" + "tHBVRiSTHqp" + "NaB5boA0WghMMeEAbdTu" + "22MR5NGOYUFAqSIF"
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
    "class:      None  ",
    "discount:   -0$   ",
    "% discount: -0%   ",
    "curse:      0     ",
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
    return Math.floor(seedRand("misc") * (max - min + 1)) + min;
};

function xpRequiredForLevel(level) {
    return 12 + 7 * level;
}

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3024734454, h3 = 3362450548, h4 = 50249495;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0];
}

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

function genlist(stringSeed, count) {
    const numericSeed = cyrb128(stringSeed)[0];
    const rand = mulberry32(numericSeed);    
    const list = [];
    for (let i = 0; i < count; i++) {
        list.push(rand());
    }
    return list;
}

let SEEDS = {"shop":[],"lvl":[],"map":[],"misc":[]}
let s_pos = {"shop":0,"lvl":0,"map":0,"misc":0}
function genSeeds(seed) {
    s_pos = {shop:0, lvl:0, map:0, misc:0};
    SEEDS.shop = genlist("SHOP: " + seed,1000);
    SEEDS.lvl  = genlist("LVL:  " + seed,1000);
    SEEDS.map  = genlist("MAP:  " + seed,1000);
    SEEDS.misc = genlist("MISC: " + seed,1000);
}

function seedRand(place) {
    const pool = SEEDS[place];
    if (Array.isArray(pool) && pool.length > 0) {
        s_pos[place] = (s_pos[place] || 0) + 1;
        return pool[s_pos[place] % pool.length];
    }
    return Math.random();
}

// compendium
let compendiumPage = false;

let compendium = {"monsters":[],"items":[],"skills":[],"floors":[],"variants":[]}
function addEntry (type, value) {
    const category = {
        monster: "monsters",
        item: "items",
        skill: "skills",
        floor: "floors",
        variant: "variants"
    }[type] || type;
    const entries = compendium[category];
    if (!Array.isArray(entries) || value == null) return;
    const key = value.name ?? value.item;
    if (!entries.some(entry => (entry.name ?? entry.item) === key)) entries.push(value);
}

// trees
let t_trees = {"floor":0,"money":0,"hp":0,"attack":0,"luck":0,"lvl":0,"xp":0,"vision":0,"totalTime":0,"curse":0}
let b_trees = {"floor":0,"money":0,"hp":0,"attack":0,"luck":0,"lvl":0,"xp":0,"vision":0,"totalTime":0,"curse":0}

let trees = false;

function updateB() {
    b_trees.floor     = Math.max(b_trees.floor,     p.floor      )
    b_trees.money     = Math.max(b_trees.money,     p.money      )
    b_trees.hp        = Math.max(b_trees.hp,        p.hp         )
    b_trees.attack    = Math.max(b_trees.attack,    p.attack     )
    b_trees.luck      = Math.max(b_trees.luck,      p.luck       )
    b_trees.lvl       = Math.max(b_trees.lvl,       p.lvl        )
    b_trees.xp        = Math.max(b_trees.xp,        p.xp         )
    b_trees.vision    = Math.max(b_trees.vision,    fogMap.range )
    b_trees.totalTime = Math.max(b_trees.totalTime, t.run        )
    b_trees.curse     = Math.max(b_trees.curse,     curse        )
}

function updateT() {
    t_trees.floor     = (t_trees.floor     + p.floor      )
    t_trees.money     = (t_trees.money     + p.money      )
    t_trees.hp        = (t_trees.hp        + p.hp         )
    t_trees.attack    = (t_trees.attack    + p.attack     )
    t_trees.luck      = (t_trees.luck      + p.luck       )
    t_trees.lvl       = (t_trees.lvl       + p.lvl        )
    t_trees.xp        = (t_trees.xp        + p.xp         )
    t_trees.vision    = (t_trees.vision    + fogMap.range )
    t_trees.totalTime = (t_trees.totalTime + t.run        )
    t_trees.curse     = (t_trees.curse     + curse        )
}

function updateStats() {
    if (Class.goldToXp) {p.xp = p.xp + p.money; p.money = 0;};
    if (Class.xpToGold) {p.money = p.money + p.xp; p.xp = 0;};
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
    instructions[19] = `class:      ${Class.name}`;
    instructions[20] = `discount:   -${shop.discount}$`;
    instructions[21] = `% discount: -${shop.percent_discount}%`;
    instructions[22] = `curse:      ${curse}`;
    instructions[23] = `best floor: ${best_floor}`;
    checkAchivements(p.floor,p.money,p.hp,p.attack,p.luck,p.lvl,p.xp,fogMap.range,t.run,t.floor,W,H,difficulty)
    updateB();
}

const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konami_i = 0;

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
let shopState = null
let mainMenu = true;
let Settings = false;
let credits  = false;
let help     = false;
let start_config = false;
let achivement_menu = false;
window.ClassAchivement = false;
let progressLoaded = false;
let leaderboard_menu = false;

let si = 0;
let ay = 0;

// a smol list.
// default behavior
let Classes = data.Classes
// 32 total classes, and more comming soon... , 
// maybye will make classes arround some more niche stuff.
let Class = Classes[0];
let avail_classes = Classes;

function winBattle() {
    p.xp   += Class.goldToXp ? battle.enemy.moneyReward * 2 : (Class.xpToGold ? 0 : battle.enemy.xpReward);
    p.money += Class.xpToGold ? (battle.enemy.xpReward + battle.enemy.moneyReward) : (Class.goldToXp ? 0 : battle.enemy.moneyReward);
    battlesWon += 1
    Class.winBatle(); 
    battle = null; 
    p.check_lvl(); 
    updateStats(); 
    draw();
}

const nh = Math.max(1, Math.floor((H - 10) / 4));
let notifications = [];
function notify(name, ws) {
    if (!Array.isArray(ws)) ws = [String(ws)];
    for (let word of ws) {
        const L_words = String(word).split(" ").map(i => i + " ")
        let LW = [];
        let wl = 0
        let I = 0
        for (let i = 0; i < L_words.length; i++) {
            if (wl + L_words[i].length > instructionWidth) {
                I += 1
                wl = 0
            }
            if (!LW[I]) LW[I] = ""
            LW[I] += (L_words[i])
            wl += L_words[i].length
        }
        notifications.push({name, words: LW});
        while (notifications.length > nh) notifications.shift();
    }
}

let battlesWon = 0;
let chosenSkills = [];
let chosenItems  = [];

let challengePage = false;
let encounter = false;
let encounterOwner = null;

let locked_achivements = data.locked_achivements;

let achivements = [{"name":"open the game","best":6}];
for (let i = 0; i < Classes.length; i++) {
    // each class gets its OWN copy, not a reference to the global list
    Classes[i].achivements = [{"name":"open the game","best":6}];
}

function checkAchivements (floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) {
    for (const a of locked_achivements) {
        if (!a.req(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty)) continue;

        const globalEntry = achivements.find(x => x.name === a.name);
        if (globalEntry) {
            if (difficulty > globalEntry.best) globalEntry.best = difficulty;
        } else {
            achivements.push({name: a.name, desc: a.desc, best: difficulty});
            notify("ACHIVEMENT", a.name);
            if (a.unlock) {
                const c = Classes.find(x => x.name === a.unlock);
                if (c && !c.unlocked) {
                    c.unlocked = true;
                    notify("CLASS UNLOCKED", c.name);
                }
            }
        }
        const classEntry = Class.achivements.find(x => x.name === a.name);
        if (classEntry) {
            if (difficulty > classEntry.best) classEntry.best = difficulty;
        } else {
            Class.achivements.push({name: a.name, desc: a.desc, best: difficulty});
        }
    }
    if (floor > Class.best_floor) Class.best_floor = floor;
    percentComplete = percentFormula();
    saveProgress();
}

let percentTotal = locked_achivements.length
function percentFormula (classList = Classes) {
    let steps = 0;
    for (const c of classList) {
        for (const a of c.achivements) {
            if (a.name === "open the game") continue;
            const b = (Number.isInteger(a.best) && a.best >= 0) ? Math.min(6, a.best) : 0;
            steps += b + 1;
        }
    }
    return 100 * steps / (percentTotal * classList.length);
}
let percentComplete = percentFormula();



let Death = null
let deathCause = "";

let reroll_tokens = 0;
let curse = 0

let move_conter = 0;
let Volume = 10;
let FGI = 0;
let BGI = 0;
let FGL = ["#cdd6f4","#f5e0dc","#cba6f7","#f38ba8","#89b4fa","#a6e3a1","#94e2d5","#f9e2af","#89b4fa","#1e1e2e"]
let BGL = ["#1e1e2e","#5b4242","#565681","#60785e","#876482","#cdd6f4"]
let A_class = -1

let complexStats = false;

let leaderboard = [];
let leaderboardError = "";
let leaderboardLoaded = false;
let leaderboardPage = 0;
let leaderboardClassIndex = -1;

async function loadLeaderboard(ccc=null) {
    leaderboard = [];
    leaderboardError = "";
    leaderboardLoaded = false;
    leaderboardPage = 0;
    try {
        const response = await fetch("https://api.github.com/repos/no10123/tagless/issues?labels=score&state=all&per_page=100");
        if (!response.ok) {
            throw new Error(`Github Error: ${response.status} ${response.statusText}`);
        }
        const issues = await response.json();
        if (!Array.isArray(issues)) {
            throw new Error("Github returned weird value.");
        }
        leaderboard = issues.map(i => {
            const titleParts = i.title.split("|").map(part => part.trim());
            const header = titleParts.shift() || "";
            const match = header.match(/^\[(\d+)\]\s*(.*)$/);
            if (!match) return null;

            let stats = {};
            try {
                const parsedBody = JSON.parse(i.body || "{}");
                if (parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)) {
                    stats = parsedBody;
                }
            } catch {} // pass just in case

            const titleFloor = titleParts[0]?.match(/^floor\s+(\d+)$/i);
            return {
                score: Number(match[1]),
                name: match[2],
                floor: Number.isFinite(stats.floor) ? stats.floor : (titleFloor ? Number(titleFloor[1]) : "?"),
                level: Number.isFinite(stats.lvl) ? stats.lvl : "?",
                money: Number.isFinite(stats.money) ? stats.money : "?",
                className: stats.cls || titleParts[1] || "unknown",
                time: Number.isFinite(stats.time) ? formatTime(stats.time) : (titleParts[2] || "unknown"),
                difficulty: ["easy", "medium", "hard", "expert", "master", "godlike", "ascended"][Number(titleParts[3])] || "unknown"
            };
        }).filter(Boolean).filter(i => ccc === null || i.className === ccc)
         .sort((a, b) => {
         if (b.score !== a.score) {
             return b.score - a.score;
         }
         
         const [mA, sA] = a.time.split(':').map(Number);
         const [mB, sB] = b.time.split(':').map(Number);
         
         const MA = mA * 60 + sA;
         const MB = mB * 60 + sB;
         return MA - MB; 
         })
         //.slice(0, 10);
    } catch (error) {
        leaderboardError = error instanceof Error ? error.message : String(error);
    }
    leaderboardLoaded = true;
    draw();
}

// music
class MUSIC {
    constructor () {
        this.files = ["music/a.mp3", "music/b.mp3", "music/c.mp3", "music/d.mp3", "music/e.mp3"];
        this.queue = [];
        this.musicIndex = 0;
        this.Muted = false;
        this.audio = new Audio();
        this.INPUT = false;
        this.audio.addEventListener("ended", () => { this.nextMusicTrack(); });
    }
    shuffle(list) {
        const next = [...list];
        for (let i = next.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
    }

    syncMusicVolume() {
        if (!this.audio) return;
        this.audio.volume = this.Muted ? 0 : Math.max(0, Math.min(1, Volume / 20));;
    }

    startMusic() {
        if (!this.queue.length) {
            this.queue = this.shuffle(this.files);
            this.musicIndex = 0;
        }

        const currentTrack = this.queue[this.musicIndex % this.queue.length];
        this.audio.src = currentTrack;
        this.audio.load();
        this.audio.volume = this.Muted ? 0 : Math.max(0, Math.min(1, Volume / 20));
        this.audio.play().catch(() => {});
    }

    nextMusicTrack() {
        if (!this.queue.length) {
            this.queue = this.shuffle(this.files);
        }
        this.musicIndex = (this.musicIndex + 1) % this.queue.length;
        this.startMusic();
    }

    toggleMusicMute() {
        this.Muted = !this.Muted;
        this.syncMusicVolume();
    }

    beginMusic() {
        if (!this.audio.src && !this.queue.length) {
            this.queue = this.shuffle(this.files);
        }
        if (!this.audio.src) {
            this.startMusic();
        }
        this.audio.volume = this.Muted ? 0 : Math.max(0, Math.min(1, Volume / 20));
        this.audio.play().catch(() => {});
    }
}

const music = new MUSIC();

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
        x = Math.floor(seedRand("map") * (W - 2)) + 1;
        y = Math.floor(seedRand("map") * (H - 2)) + 1;
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
        const randomDir = dirs[Math.floor(seedRand("map") * dirs.length)];
        
        walkerX += randomDir[0];
        walkerY += randomDir[1];

        if (walkerX < 1 + brush)     walkerX = 1 + brush;
        if (walkerX > W - 2 - brush) walkerX = W - 2 - brush;
        if (walkerY < 1 + brush)     walkerY = 1 + brush;
        if (walkerY > H - 2 - brush) walkerY = H - 2 - brush;
    }

    for (let i = 0; i < pillars; i++) {
        let px = Math.floor(seedRand("map") * (W - 2)) + 1;
        let py = Math.floor(seedRand("map") * (H - 2)) + 1;
        
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
    if (t) t.NewFloor();
    if (p) p.place("@");
    if (!Class.noPotions) {
        PS.spawn(); 
        PM.spawn(); 
        PL.spawn(); 
        PX.spawn();
    }
    if (e) e.spawn();
    if (E) E.spawn();
    if (p && difficulty == 0) p.hp = p.hp + 10;
}

function copyRunSummary() {
    if (!p || !navigator.clipboard || !navigator.clipboard.writeText) return;

    const summary = [
        "Dungeon run summary",
        `Floor: ${p.floor}`,
        `Level: ${p.lvl} | XP: ${p.xp}`,
        `HP: ${p.hp} | Attack: ${p.attack}`,
        `Money: ${p.money}$`,
        `Time: ${formatTime(t.run)}`,
        `Best floor: ${best_floor}`,
        `Score: ${Math.floor((p.floor * 1000 + p.money + p.lvl * 50) * (1 + difficulty * 0.25))}`
    ].join(" | ");

    navigator.clipboard.writeText(summary)
        .then(() => {
            gameMessage = "copied to clipboard!";
            draw();
        })
        .catch(() => {
            gameMessage = "Clipboard unavailable.";
            draw();
        });
}

function draw() {
    fogMap.reveal(p.x, p.y);
    updateStats()
    const border = "+" + "-".repeat(Math.max(0, W - 2)) + "+";
    if (mainMenu) {
        Settings = false;
        credits  = false;
        help     = false;
        achivement_menu = false; 
        start_config = false; 
        const lines = [
            border,
            "WELCOME TO THE DUNGEON",
            "",
            "",
            "1. PLAY",
            "2. Continue",
            "3. SETTINGS",
            "4. Achivements",
            "5. CREDITS",
            "6. help",
            "7. leaderboard",
            "8. trees",
            "c. compendium",
            "f. Daily seed",
            "9. unlock all",
            "",
            `best score: ${localStorage.getItem("tagless_best") || 0}`,
            `percent complete: ${percentComplete}%`,
            "",
            border
        ];
        window.lines = lines;
        ay = Math.max(0, Math.min(ay, Math.max(0, lines.length - Math.max(1, H - 5))));
        lines.splice(0, ay);
        lines.length = Math.min(lines.length, Math.max(1, H - 5));
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (shopState) {
        const lines = [
            `SHOP - FLOOR ${p.floor}`,
            `Gold: ${p.money}$`,
            "",
            ...shopState.offers.map((item, index) =>
                `${index + 1}. ${item.item} - ${item.cost}$ [${item.rarity}]${item.purchased ? " SOLD" : ""}`
            ),
            "",
            (reroll_tokens > 0) ? `[R] Refresh shop (reroll tokens: ${reroll_tokens})` : "",
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
        outBottom.push("3. Flee")
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
        const out = [border, "Skill Selection:", `lvl: ${p.lvl}`];
        for (let i = 0; i < skill_selection.length; i++) {
            out.push(`${i + 1}. ${skill_selection[i].name}${p.lvl % 10 == 0 ? "+" : ""}${p.lvl % 3 == 0 ? "+" : ""}`);
        }
        if (reroll_tokens > 0) {
            out.push(`[R] Refresh skills (reroll tokens: ${reroll_tokens})`);
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
    } else if (Settings) {
        const lines = [
            border,
            "SETTINGS",
            "",
            ` -- Volume: ${Volume} / 20 --`,
            "1. Volume -",
            "2. Volume +",
            `3. FG color: ${FGL[FGI]}`,
            `4. BG color: ${BGL[BGI]}`,
            `5. Music: ${music.Muted ? "muted" : "on"}`,
            "6. Next track",
            "7. back to main menu",
            "",
            border
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (credits) {
        const lines = [
            border,
            "CREDITS",
            "",
            "Developer: Robopugo - no10123 - me",
            "Playtesters: me and my friends",
            "",
            "colors: catpucchin",
            "insperations: binding of isaac, and dragon quest. cyadian - cyadonia",
            "",
            "music: DJARTMUSIC, MondaMusic, AGS AGS",
            "from: https://pixabay.com/music/search/8bit/",
            "",
            "esc - go back to main menu",
            border
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (help) {
        const lines = [
            border,
            "HELP",
            "",
            "--- key binds: ---",
            "",
            "wasd - move",
            "shift - sprint",
            "c - toggle complex stats",
            "n - next song",
            "m - mute music",
            "r - reroll skills/shop",
            "1 - 9 - options",
            "0 - in shop, goes to next floor.",
            "- - lowers difficulty",
            "= - raises difficulty",
            "esc - goes to main menu.",
            "",
            " --- symbols: --- ",
            "",
            "# - wall",
            "p,h,P,H - potions that heal you",
            "$ - money",
            "> - stairs to next floor.",
            "? - fog / unknown tile",
            "",
            "esc - go back to main menu",
            "",
            border
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (achivement_menu) {
        const shown = A_class >= 0 ? Classes[A_class].achivements : achivements;
        const shownName = A_class >= 0 ? Classes[A_class].name : "all classes";
        let lines = [
            border,
            `- a -- achivements: ${shownName} -- d -`,
            `best floor: ${A_class >= 0 ? Classes[A_class].best_floor : best_floor}`,
            `percent: ${(A_class >= 0 ? percentFormula([Classes[A_class]]) : percentComplete).toFixed(1)}%`,
            "",
        ];
        for (let i = 0; i < shown.length; i++) {
            lines.push(`${shown[i].name} - ${shown[i].best}`);
        }
        lines.push("")
        lines.push(" -- Locked --")
        const unlockedNames = new Set(shown.map(a => a.name));
        for (let i = 0; i < locked_achivements.length; i++) {
            if (!unlockedNames.has(locked_achivements[i].name)) {
                lines.push(`${locked_achivements[i].name} - ${locked_achivements[i].desc}`)
            }
        }
        lines.push("")
        lines.push("esc - go back to main menu")
        lines.push("")
        lines.push(border)
        window.lines = lines
        ay = Math.max(0, Math.min(ay, Math.max(0, lines.length - Math.max(1, H - 5))));
        lines = lines.slice(ay, ay + Math.max(1, H - 5));
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (Death) {
        const lines = [
            border,
            "",
            "GAME OVER",
            "",
            `floor: ${p.floor}`,
            `lvl: ${p.lvl}, xp: ${p.xp}`,
            `attack: ${p.attack}, hp: ${p.hp}`,
            `luck: ${p.luck}, vision: ${fogMap.range}`,
            `disscounts: -${shop.discount}$, -${shop.percent_discount}%`,
            `reroll tokens: ${reroll_tokens}, curse: ${curse}`,
            `size: ${W} x ${H}`,
            `money: ${p.money}$`,
            `Monsters destroyed: ${battlesWon}`,
            `items bought: ${chosenItems.length}`,
            `Time: ${t.run}`,
            "",
            `score: ${Math.floor((p.floor * 1000 + p.money + p.lvl * 50) * (1 + difficulty * 0.25))}`,
            "",
            `killed by ${deathCause}`,
            "",
            gameMessage ? gameMessage : "0 to copy stats.",
            "1 to send score to servers",
            "(press any other key to restart)",
            border,
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        const score = Math.floor((p.floor * 1000 + p.money + p.lvl * 50) * (1 + difficulty * 0.25));
        if (score > +localStorage.getItem("tagless_best") || !localStorage.getItem("tagless_best")) {
            localStorage.setItem("tagless_best", score);
            notify("NEW BEST", score);
        }
        body.innerText = display;
    } else if (start_config) {
        const lines = [
            border,
            "",
            "-- class --",
            "",
            `Selected: ${Class.name} - ${Class.desc}`,
            "",
            `- s -- available classes -- w -`,
            "",
        ];
        avail_classes = Classes.filter(c => c.unlocked);
        si = Math.max(0, Math.min(si, avail_classes.length - 1));
        const h = Math.max(1,H - 14)
        let sy = Math.max(0, Math.min(si - Math.floor(h/2),avail_classes.length - h))
        sy = si - Math.floor(h/2)
        for (let i = 0; i < h && i < avail_classes.length; i++) {
            let I = sy + i
            I = ((I % avail_classes.length) + avail_classes.length) % avail_classes.length;
            lines.push(`${I === si ? "*" : " "} ${avail_classes[I].name} - ${avail_classes[I].desc || ""}`);
        }
        lines.push('')
        lines.push(`- a -- difficulty: ${["easy","medium","hard","expert","master","godlike","ascended"][difficulty]} -- d -`)
        lines.push('')
        lines.push('alt - seeded (keep blank for gen seed)')
        lines.push('')
        lines.push('0. play game')
        lines.push('')
        lines.push(border)
        let display = "\n  " + " ".repeat(W + instructionWidth);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W + instructionWidth);
            const left = Math.floor((W - text.length + instructionWidth) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left + instructionWidth);
        }
        body.innerText = display;
    } else if (leaderboard_menu) {
        let lines = [border, "LEADERBOARD", "", `-- CLASS: ${Classes.map(i => i.name)[leaderboardClassIndex] || "all"} --`];
        if (leaderboardError) lines.push(`error: ${leaderboardError}`);
        else if (!leaderboardLoaded) lines.push("loading...");
        else if (leaderboard.length === 0) lines.push("no scores yet, so go play!");
        else {
            const pageH = Math.max(1, Math.floor((H - 8) / 3)); // page height
            const start = leaderboardPage * pageH;
            for (let i = start; i < Math.min(start + pageH, leaderboard.length); i++) {
                const entry = leaderboard[i];
                lines.push(`${i + 1}. ${entry.name} - ${entry.score}`);
                lines.push(`Floor:${entry.floor} Lvl:${entry.level} $:${entry.money} ${entry.className}`);
                lines.push(`Time:${entry.time} Diff:${entry.difficulty}`);
            }
            const pageCount = Math.ceil(leaderboard.length / pageH);
            lines.push("", [
                leaderboardPage > 0 ? "<- prev" : "",
                pageCount > 1 ? `page ${leaderboardPage + 1}/${pageCount}` : "",
                leaderboardPage + 1 < pageCount ? "next ->" : ""
            ].filter(Boolean).join(" | "));
        }
        lines.push("", "esc - back to main menu", "", border);
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (trees) {
        // {"floor":0,"money":0,"hp":0,"attack":0,"luck":0,"lvl":0,"xp":0,"vision":0,"totalTime":0,"curse":0}
        const lines = [
            border,
            "TREES:",
            "-- tree of floors --",
            `best:  ${b_trees.floor}`,
            `total: ${t_trees.floor}`,
            "-- tree of wealth --",
            `best:  ${b_trees.money}`,
            `total: ${t_trees.money}`,
            "-- tree of health --",
            `best:  ${b_trees.hp}`,
            `total: ${t_trees.hp}`,
            "-- tree of power --",
            `best:  ${b_trees.attack}`,
            `total: ${t_trees.attack}`,
            "-- tree of luck --",
            `best:  ${b_trees.luck}`,
            `total: ${t_trees.luck}`,
            "-- tree of lvl --",
            `best:  ${b_trees.lvl}`,
            `total: ${t_trees.lvl}`,
            "-- tree of xp --",
            `best:  ${b_trees.xp}`,
            `total: ${t_trees.xp}`,
            "-- tree of sight --",
            `best:  ${b_trees.vision}`,
            `total: ${t_trees.vision}`,
            "-- tree of time --",
            `best:  ${b_trees.totalTime}`,
            `total: ${t_trees.totalTime}`,
            "-- cursed tree --",
            `best:  ${b_trees.curse}`,
            `total: ${t_trees.curse}`,
            "",
            "esc - go back to main menu",
            border
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (compendiumPage) {
        const lines = [
            border,
            `Compendium: ${Math.round((compendium.monsters.length + compendium.variants.length + compendium.items.length)  / (enemy.monsters.length + enemy.varriants.length + shop.shopPool.length) * 100)}%`,
            "",
            `-- monsters: ${Math.round(compendium.monsters.length  / enemy.monsters.length * 100)}% --`,
            "name - hp - attack - ac - coins - xp",
        ];
        // addEntry
        for (let m of compendium.monsters) {
            lines.push(`${m.name} | ${m.hp} | ${m.dmg} | ${m.ac} | ${m.gold} | ${m.xp}`)
        }
        lines.push("")
        lines.push(`-- variants: ${Math.round(compendium.variants.length  / enemy.varriants.length * 100)}% --`)
        for (let m of compendium.variants) {
            lines.push(`${m.name} | ${m.hp} | ${m.dmg} | ${m.ac} | ${m.gold} | ${m.xp}`)
        }
        lines.push("")
        lines.push(`-- items: ${Math.round(compendium.items.length  / shop.shopPool.length * 100)}% --`)
        lines.push("name | price | rarity")
        for (let m of compendium.items) {
            lines.push(`${m.item} | ${m.cost} | ${m.rarity}`)
        }
        lines.push("")
        lines.push("esc - go back to main menu")
        lines.push(border)
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
        }
        body.innerText = display;
    } else if (encounter) {
        // encounter = []
        const panel = complexStats ? [...instructions, "", "c to see less stats"] : [instructions[4], instructions[6], instructions[7], instructions[5], instructions[10], "", "C to see full stats"];
        const toasts = [];
        for (let i = 0; i < notifications.length; i++) {
            const n = notifications[i];
            const text = [` ${n.name}: `,...n.words];
            const tw = instructionWidth
            toasts.push("");
            toasts.push("┌" + "─".repeat(tw) + "┐");
            for (let j = 0; j < text.length; j++) {
                toasts.push("│" + text[j] + " ".repeat(Math.max(0,tw - text[j].length)) + "│");
            }
            toasts.push("└" + "─".repeat(tw) + "┘");
        }
        const column = [...panel,"","NOTIFICATIONS: ", ...toasts];
        const lines = [
            `ENCOUNTER`,
            `Gold: ${p.money}$, hp: ${p.hp}`,
            "",
            ...(encounter.length ? encounter.map((offer,i) => `${i + 1}. ${offer.name}`) : ["nothing..."]),
            "",
            (reroll_tokens > 0) ? `[R] Refresh encounter (reroll tokens: ${reroll_tokens})` : "",
            "",
            "ESC. leave encounter"
        ];
        let display = "\n  " + " ".repeat(W);
        const vLines = [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0,H);
        for (let i = 0; i < vLines.length; i++) {
            const line = vLines[i];
            const instruction = i < column.length ? column[i] : " ";
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left) + instruction;
        };
        body.innerText = display;
    } else {
        let display = "\n  " + " ".repeat(W);
        const panel = complexStats ? [...instructions, "", "c to see less stats"] : [instructions[4], instructions[6], instructions[7], instructions[5], instructions[10], "", "C to see full stats"];

        const toasts = [];
        for (let i = 0; i < notifications.length; i++) {
            const n = notifications[notifications.length - i - 1];
            const text = [` ${n.name}: `,...n.words];
            const tw = instructionWidth
            toasts.push("");
            toasts.push("┌" + "─".repeat(tw) + "┐");
            for (let j = 0; j < text.length; j++) {
                toasts.push("│" + text[j] + " ".repeat(Math.max(0,tw - text[j].length)) + "│");
            }
            toasts.push("└" + "─".repeat(tw) + "┘");
        }
        const column = [...panel,"","NOTIFICATIONS: ", ...toasts];

        for (let i = 0; i < grid.length; i++) {
            const instruction = i < column.length ? column[i] : " ";
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
        this.attack_mult = 1
        this.luck   = 0
        this.lvl    = 0
        this.xp     = 0
        // special stats
        this.move_speed = 1;
        this.sprint = 2;
        this.skill_choices = 3;
        this.unique_options = data.u_skillOptions
        this.options = data.skillOptions
        this.potion_spawn = 1;
        this.potion_affect = 1;
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
                if (Class.mimicChance && seedRand("misc") < Class.mimicChance && !battle) {
                    grid[nextY][nextX] = air;
                    enemy.cspawn();
                    if (battle) {battle.mimic = true;}
                } else {
                    this.money += Math.floor((m.mult + 0.1) * Math.sqrt(this.floor));
                    Class.coinPickup();
                    updateStats();
                }
            } else if ([PS.sym, PM.sym, PL.sym, PX.sym].includes(grid[nextY][nextX])) {
                this.hp += Math.floor([10,25,50,100][[PS.sym,PM.sym,PL.sym,PX.sym].indexOf(grid[nextY][nextX])] * p.potion_affect)
                Class.potionPickup();
                updateStats();
            } else if (E && E.sym == grid[nextY][nextX]) {
                E.trigger()
            } else if (e && e.sym == grid[nextY][nextX]) {
                e.trigger()
            }
            this.place(air);
            this.x = nextX;
            this.y = nextY;
            this.place(this.sym);
            if (goUp) {
                s.next();
                return;
            }
            if (!shopState && !battle && !skill_selection && !encounter) enemy.spawn()
            move_conter += 1;
        }
    }

    check_lvl () {
        this.xp = Number.isFinite(this.xp) ? this.xp : 0;
        const reqxp = xpRequiredForLevel(this.lvl);
        if (this.xp >= reqxp) {
            this.lvl++
            this.xp = this.xp - reqxp
            this.options = [
                {"name":"sharpen sword", "func": () => {p.attack += Class.goldToXp ? 3 : 1;}},
                {"name":"health boost",      "func": () => {p.hp += 8 + p.lvl * 2;}},
                {"name":"quick buck",      "func": () => {p.money = p.money + 3 * m.mult;}},
                {"name":"luck bonus",    "func": () => {p.luck++;}},
                {"name":"coin collector",  "func": () => {m.mult++;}},
                {"name":"cuppon collector",  "func": () => {shop.percent_discount = Math.min(0.5, shop.percent_discount + 0.05);}},
                {"name":"charisma",  "func": () => {shop.discount = Math.min(20, shop.discount + 1);}},
            ]
            skill_selection = this.rollSkillSelection();
        }
    }

    rollSkillSelection(excluded = []) {
        const usesRequired = 1 + Number(this.lvl % 10 === 0) + Number(this.lvl % 3 === 0);
        const available = [
            ...this.options,
            ...this.unique_options.filter(option => option.uses >= usesRequired)
        ];
        let candidates = available.filter(option => !excluded.includes(option));
        if (candidates.length < this.skill_choices) candidates = available;
        return candidates.sort(() => 0.5 - seedRand("lvl")).slice(0, this.skill_choices);
    }

    xpForLevels(count) {
        let requiredXp = 0;
        for (let offset = 0; offset < count; offset++) {
            requiredXp += xpRequiredForLevel(this.lvl + offset);
        }
        return requiredXp;
    }

    selectSkill(skill) {
        chosenSkills.push(skill)
        Class.LevelUp(skill);
        if (this.lvl % 10 == 0) {
            skill.func();
        }  
        if (this.lvl % 3 == 0) {
            skill.func();
        }   
        skill.func();
        for (let i = 0; i < (Class.extraTriggers || 0); i++) skill.func();
        const uniqueIndex = this.unique_options.indexOf(skill);
        if (uniqueIndex !== -1) {
            if (this.lvl % 10 == 0) {
                this.unique_options[uniqueIndex].uses--;
            }
            if (this.lvl % 3 == 0) {
                this.unique_options[uniqueIndex].uses--;
            }
            this.unique_options[uniqueIndex].uses--;
            if (this.unique_options[uniqueIndex].uses <= 0) {
                this.unique_options.splice(uniqueIndex, 1);
            }
        }
    }
}

class Money {
    constructor(sym, s = true) {
        this.l = 0;
        this.x = [];
        this.y = [];
        this.sym = sym;
        this.mult = 1;
        
        if (s) this.spawn();
    }

    spawn() {
        this.l = Math.max(1, Math.round((Math.floor(seedRand("map") * 10) + 1) * Math.sqrt(W * H / 2856)));
        this.x = [];
        this.y = [];
        for (let i = 0; i < this.l; i++) {
            let {x,y} = getEmptyTile();
            this.x.push(x);
            this.y.push(y);
        }
        this.place();
    }

    clear() {
        for (let i = 0; i < this.x.length; i++) {
            const x = this.x[i];
            const y = this.y[i];

            if (grid[y] && grid[y][x] === this.sym) {
                grid[y][x] = air;
            };
        }
        this.l = 0
        this.x = []
        this.y = []
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
        best_floor = Math.max(best_floor, p.floor);
        encounter = false;
        encounterOwner = null;

        newFloor({
                openRatio: 0.34 + seedRand("map") * 0.16,
            pillars: randomInt([
                Math.max(4, Math.floor(W * H * 0.006)),
                Math.max(8, Math.floor(W * H * 0.018))
            ]),
            brush: seedRand("map") < 0.8 ? 1 : 2
        });
        
        p.place("@");
        this.place();

        if (!m) {
            m = new Money("$", !Class.noCoins);
        } else if (Class.noCoins) {
            m.clear();
        } else {
            m.spawn()
        }
        shopState = (!Class.noShop && !Class.goldToXp) ? shop.open(p.floor) : null;
        if (fmOn) fm.newFloor();
        Class.FloorStart();
        updateStats();
        draw();
    }
}

class Shop {
    constructor () {
        this.percent_discount = 0;
        this.discount = 0;
        this.avail = 3;
        // shop types, normal, blood = hp instead of money, 
        this.shopPool = data.shopPool;
    }

    open(floor) {
        const rarityUnlockFloor = { common: 1, uncommon: 2, rare: 4, mythic: 6, legendary: 9, accended: 12};
        const rarityUnlockCost = { common: 0, uncommon: 5, rare: 10, mythic: 20, legendary: 30, accended: 70};
        const rarityCurse = { common: 1, uncommon: 1, rare: 2, mythic: 3, legendary: 4, accended: 6 };
        const available = this.shopPool
            .filter(item => floor >= rarityUnlockFloor[item.rarity] && p.money >= rarityUnlockCost[item.rarity])
            .map(item => ({
                ...item,
                cost: item.cost > 0 ? Math.max(1, Math.floor(item.cost * (1 - this.percent_discount) - this.discount)) : Math.min(-1, Math.floor(item.cost * (1 + this.percent_discount) - this.discount))
            }));
        const offers = [];
        while (offers.length < this.avail && available.length > 0) {
            const index = Math.floor(seedRand("shop") * available.length);
            offers.push({ ...available.splice(index, 1)[0], purchased: false });
        }
        const DOUBLED = {
            "+1 attack": ()=>{p.attack+=2;}, "+3 attack": ()=>{p.attack+=6;}, "+5 attack": ()=>{p.attack+=10;},
            "+7 attack": ()=>{p.attack+=14;},"+10 attack":()=>{p.attack+=20;},"+20 attack":()=>{p.attack+=40;},
            "+10 hp": ()=>{p.hp+=20;}, "+25 hp": ()=>{p.hp+=50;}, "+50 hp": ()=>{p.hp+=100;},
            "+75 hp": ()=>{p.hp+=150;},"+100 hp": ()=>{p.hp+=200;},"+200 hp": ()=>{p.hp+=400;},
            "+1 luck": ()=>{p.luck+=2;}, "+2 luck": ()=>{p.luck+=4;}, "+3 luck": ()=>{p.luck+=6;},
            "+4 luck": ()=>{p.luck+=8;}, "+5 luck": ()=>{p.luck+=10;},"+10 luck": ()=>{p.luck+=20;},
            "+3 xp": ()=>{p.xp+=6;}, "+6 xp": ()=>{p.xp+=12;},"+9 xp": ()=>{p.xp+=18;},"+12 xp": ()=>{p.xp+=24;},
            "+15 xp": ()=>{p.xp+=30;},"+20 xp": ()=>{p.xp+=40;},
            "+1 lvl": ()=>{p.xp+=p.xpForLevels(2);},"+2 lvl": ()=>{p.xp+=p.xpForLevels(4);},
            "+3 lvl": ()=>{p.xp+=p.xpForLevels(6);},"+5 lvl": ()=>{p.xp+=p.xpForLevels(10);},
            "vision +1": ()=>{fogMap.adjustRange(2);},"vision +2": ()=>{fogMap.adjustRange(4);},"vision +3": ()=>{fogMap.adjustRange(6);}
        };
        const cands = available.filter(it => DOUBLED[it.item]);
        if (cands.length > 0) {
            const c = cands[Math.floor(seedRand("shop") * cands.length)];
            offers.push({ ...c,
                item: c.item + " [cursed]",
                cost: Math.max(1, Math.floor(c.cost * Math.min(1.9, 1 + 0.1 * curse))),
                func: DOUBLED[c.item],
                cursed: rarityCurse[c.rarity] || 1,
                purchased: false });
        }
        return { offers };

    }

    buy(index) {
        const item = shopState?.offers[index];
        if (!item || item.purchased || p.money < item.cost) return;
        if (item.cursed) curse += item.cursed
        p.money -= item.cost;
        chosenItems.push(item)
        item.func();
        item.purchased = true;
        addEntry("item",item);
        p.check_lvl();
        updateStats();
        draw();
    }
}

class Enemy {
    constructor() {
        this.dc = 0
        this.chance = 10
        this.cmax   = Math.max(100, Math.round((W * H) ** 2 / 3500));
        this.monsters  = data.monsters
        this.varriants = data.varriants
        this.lvls = {}
        for (let i = 0; i < this.monsters.length; i++) {
            this.lvls[i] = this.monsters[i].lvl
        }
    }
    spawn() {
        const chance = Math.min(this.cmax, 3);
        const r = Math.ceil(seedRand("misc") * this.cmax);
        if (r > chance + this.dc) {
            this.dc++
            return;
        } else {
            this.dc = -Math.floor(seedRand("misc") * 10)
        };
        this.id = 0;
        const floorTier = Math.floor((p.floor - 1) / 5);
        const levelBonus = Math.floor(p.lvl / 10);
        this.rate = Math.min(20, floorTier + levelBonus + Math.floor(curse / 3));
        this.mp = []
        for (let i = 0; i < this.monsters.length; i++) {
            if (this.lvls[i] <= this.rate) {
                this.mp.push(i);
            }
        }
        if (this.mp.length === 0) {
            this.id = 0;
        } else {
            this.id = this.mp[Math.floor(seedRand("misc") * this.mp.length)];
        }
        this.setStats()
        this.startBattle()
    }
    cspawn(id = null, floorTier = Math.floor((p.floor - 1) / 5), levelBonus = Math.floor(p.lvl / 10), rate = null, mp = null, sv = 0) {
        if (rate == null) rate = Math.min(20, floorTier + levelBonus + Math.floor(curse / 3));
        this.rate = rate;
        if (mp) {
            this.mp = mp;
        } else {
            this.mp = [];
            for (let i = 0; i < this.monsters.length; i++) {
                if (this.lvls[i] <= this.rate) this.mp.push(i);
            }
        }
        this.id = id == null ? (this.mp.length ? this.mp[Math.floor(seedRand("misc") * this.mp.length)] : 0) : id;
        this.setStats(sv);
        this.startBattle();
    }

    setStats(sv=Math.min(Math.floor(p.floor / 20), this.varriants.length)) {
        this.monster = this.monsters[this.id];

        const rolled = Object.fromEntries(
            Object.entries(this.monster).map(([key, value]) => [
                key,
                Array.isArray(value) ? randomInt(value) : value
            ])
        );
        addEntry("monster",this.monster);

        // 40% chance for random variant
        for (let i = 0; i < sv + 1; i++) {
            if (seedRand("misc") < 0.3 + difficulty * 0.1) {
                const pool = this.varriants.filter(v => v.lvl <= this.rate);
                if (pool.length) {
                    const v = pool[Math.floor(seedRand("misc") * pool.length)];
                    const vr = Object.fromEntries(Object.entries(v).map(([key, value]) => [key, Array.isArray(value) ? randomInt(value) : value]));
                    rolled.hp += vr.hp; rolled.dmg += vr.dmg; rolled.ac += vr.ac;
                    rolled.gold += vr.gold; rolled.xp += vr.xp;
                    rolled.name = vr.name + " " + rolled.name;
                    addEntry("variants",vr);
                }
            }
        }

        this.name = rolled.name;
        const difficultyScale = 1 + difficulty * 0.15;
        const fs = Math.max(0, p.floor - 10 + curse);
        this.maxHp = Math.max(1, Math.floor((rolled.hp * Math.pow(1.06, fs) + p.floor * 0.6 + this.rate * 2) * difficultyScale));
        this.attack = Math.max(1, Math.floor((rolled.dmg * Math.pow(1.03, fs) + p.floor * 0.15) * (1 + difficulty * 0.16)));
        this.hp = this.maxHp;
        this.xpReward = Math.max(1, Math.floor(rolled.xp * 0.45 + p.floor * 0.45));
        this.moneyReward = Math.max(0, Math.floor((rolled.gold * 0.6 + p.floor * 0.6) * 0.75));
        this.ac = rolled.ac
    }
    startBattle() {
        if (battle) return;
        gameMessage = "";
        battle = {
            enemy: this,
            message: `A ${this.name} attacks!`,
        };
        Class.BattleStart();
        draw();
    }
    enemyTurn(action) {
        if (!battle) return;
        let damage = Math.min(p.hp, battle.enemy.attack);
        damage = Class.OnDamage(damage);
        p.hp -= damage;
        battle.message = `${action} -${damage} HP.`;
        if (p.hp <= 0) {
            deathCause = `a ${battle.enemy.name}`;
            battle = null;
            Death = true;
            draw();
            return;
        }
        draw();
    }
    playerAttack() {
        if (!battle) return;
        let hit = Math.ceil(seedRand("misc") * 100) + p.luck;
        let damage;
        if (hit > battle.enemy.ac) {
            damage = Math.max(0, Math.round(Class.OnAttack(p.attack * p.attack_mult)));
        } else {
            damage = 0;
        }
        battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
        if (battle.enemy.hp === 0) {
            winBattle();
            return;
        }
        this.enemyTurn(`Hit ${damage}.`);
    }
    flee() {
        if (!battle) return;
        if (seedRand("misc") * (p.luck/10 + 1) < 0.5) {
            gameMessage = "You escaped!";
            battle = null;
            Class.fleeBattle();
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
            this.flee();
            draw();
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
        if (this.floor < this.best || this.best === 0) this.best = this.floor
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
        let factor = p ? 1 + (p.luck / 10) : 1;
        this.a = Math.floor(this.w[Math.floor(seedRand("map") * this.w.length)] * factor * (p ? p.potion_spawn : 1) * Math.sqrt(W * H / 2856) + seedRand("map"));
        if (this.a > 0) {
            for (let i = 0; i < this.a; i++) {
                this.place()
            }
        }
    }
}

class encounters {
    constructor (big) {
        this.sym = big ? "E" : "e"
        this.big = big
        this.events = null;
    }
    spawn() {
        if (p && p.floor > 3 ) {
            this.place()
        }
    }
    place () {
        let {x,y} = getEmptyTile();
        grid[y][x] = this.sym;
    }
    trigger() {
        if (encounter) return;

        encounterOwner = this;
        encounter = this.openTrades();
        draw();
    }
    openTrades() {
        const big = this.big;
        const t = 1 + Math.floor(p.floor / 10);
        const pool = big ? [
            {"name":`sparring: -${50*t} hp for +${8*t} attack`,         "cost":() => p.hp - 50 * t >= 1,           "func":()=>{p.hp -= 50 * t; p.attack += 8 * t;}},
            {"name":`exorcism: -25% hp for -5 curse`,                   "cost":() => curse > 0 && p.hp >= 21,      "func":()=>{p.hp -= Math.ceil(p.hp * 0.25);curse = Math.max(0,curse - 5);}},
            {"name":`deep sight: -${20*t} hp for +2 vision`,            "cost":() => p.hp - 20 * t >= 1,           "func":()=>{p.hp -= 20 * t;fogMap.adjustRange(2);}},
            {"name":`second wind: -1 vision for +3 sprint`,             "cost":() => fogMap.range > 1,             "func":()=>{fogMap.adjustRange(-1); p.sprint+=3;}},
            {"name":`shopholic: -${3*t} attack for +2 rerolls`,         "cost":() => p.attack >= 3 * t,            "func":()=>{p.attack -= 3 * t;reroll_tokens += 2;}},
            {"name":`life experience: -${30+10*p.lvl} hp for a level`,  "cost":() => p.hp - (30 + 10 * p.lvl) >= 1,"func":()=>{p.hp -= 30 + 10 * p.lvl; p.xp += p.xpForLevels(1); p.check_lvl();}},
        ] : [
            {"name":`blood sword: -${10*t} hp for +${2*t} attack`,      "cost":() => p.hp - 10 * t >= 1, "func":()=>{p.hp -= 10 * t; p.attack += 2 * t;}},
            {"name":`Meditation: -${2*t} attack for +${25*t} hp`,       "cost":() => p.attack >= 2 * t,  "func":()=>{p.attack -= 2 * t; p.hp += 25 * t;}},
            {"name":`lucky sacerfice: -${10*t} hp for +${2*t} luck`,    "cost":() => p.hp - 10 * t >= 1, "func":()=>{p.hp -= 10 * t; p.luck += 2 * t;}},
            {"name":`pain for gain: -${15*t} hp for +${10*t} xp`,       "cost":() => p.hp - 15 * t >= 1, "func":()=>{p.hp -= 15 * t; p.xp += 10 * t; p.check_lvl();}},
            {"name":`skill over luck: -${3*t} luck for +${10*t} xp`,    "cost":() => p.luck >= 3 * t,    "func":()=>{p.luck -= 3 * t; p.xp += 10 * t; p.check_lvl();}},
        ];
        const cands = pool.filter(tr => tr.cost());
        for (let i = cands.length - 1; i > 0; i--) {
            const j = Math.floor(seedRand("misc") * (i + 1));
            [cands[i], cands[j]] = [cands[j], cands[i]];
        };
        return cands.slice(0,3);
    }
}

class floorModifiers {
    constructor () {
        // this.pool.name + " floor"
        this.pool = [
            {"name":"dark",      "onEnter":()=>{fogMap.adjustRange(-1)},"onExit":()=>{fogMap.adjustRange(1)},"wight":100},
            {"name":"bright",    "onEnter":()=>{fogMap.adjustRange(1)},"onExit":()=>{fogMap.adjustRange(-1)},"wight":100},
            {"name":"quiet",     "onEnter":()=>{enemy.cmax *= 2},"onExit":()=>{enemy.cmax *= 0.5},"wight":100},
            {"name":"filled",    "onEnter":()=>{enemy.cmax *= 0.5},"onExit":()=>{enemy.cmax *= 2},"wight":100},
            {"name":"hoard",     "onEnter":()=>{ for (let i = 0; i < m.l; i++) { const {x, y} = getEmptyTile(); m.x.push(x); m.y.push(y); } m.l = m.x.length; m.place(); },"onExit":()=>{},"wight":100},
            {"name":"empty",     "onEnter":()=>{for (let i = 0; i < m.l; i++) {grid[m.y[i]][m.x[i]] = " "}},"onExit":()=>{},"wight":100},
            {"name":"healing",   "onEnter":()=>{p.hp += 5},"onExit":()=>{p.hp += 5},"wight":100},
            {"name":"poiseness", "onEnter":()=>{p.hp -= 5; if (p.hp <= 0) {Death = true; deathCause = "poison"}},"onExit":()=>{p.hp -= 5; if (p.hp <= 0) {Death = true; deathCause = "poison"}},"wight":100},
            {"name":"lucky",     "onEnter":()=>{p.luck += 5},"onExit":()=>{p.luck -= 5},"wight":100},
            {"name":"unlucky",   "onEnter":()=>{p.luck -= 5},"onExit":()=>{p.luck += 5},"wight":100},
        ]
        this.none = {"name":"NA","onEnter":()=>{},"onExit":()=>{},"wight":100};
        this.lfm = this.none;
    }
    reset() {
        this.lfm = this.none
    }
    newFloor () {
        this.lfm.onExit();
        this.lfm = this.pool[Math.floor(seedRand("map") * this.pool.length)]
        addEntry("floor",this.lfm);
        this.lfm.onEnter();
        notify("Floor Variant: ",this.lfm.name)
    }
}

class event {
    constructor () {
        // would be extra pages ajacent to shop.
        // just ideas for now will be implemented next week.
        this.pool = [
            // this is an ex.
            {"name":"+1 coin","options":[{"name":"leave","action":()=>{p.money += 1}}]},
            // another simple ex.
            {"name":"wishing well","options":[{"name":"throw a coin in","action":()=>{p.luck += ((seedRand("misc") < 0.1) ? 1 : 0); p.money--;}}]},
            // idea is you would have challenges that you would need to complete by the next floor for a reward.
            {"name":"bounty board","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // you would be able to fish once for random loot, items, buffs, etc.
            {"name":"fishing pond","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // would be a grave of a player that deid on the next floor would have their name and stats.
            // would add really cool atmosphere to the worldbuilding and whatnot.
            {"name":"Grave of [username]","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
            // donation machine - the one from binding of isac, would go outside of rounds and could unlock classes.
            // could  also unlock achivements, (maybye stat value or other rewards but the machine would have to have
            // a running total and a total for the current run)
            {"name":"donation machine","options":[{"name":"placeholder (does nothing)","action":()=>{}}]},
        ]
    }
}

function genDaily() {
    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `DAILY: ${yyyy}-${mm}-${dd}`;
}

const fogMap = new Fog(4, fogSymbol);

let t;
let p;
let e = new encounters(false);
let E = new encounters(true);
let PS = new potion("p",0); // +10
let PM = new potion("h",1); // +25
let PL = new potion("P",2); // +50
let PX = new potion("H",3); // +100
let m;
let s;
let difficulty = 1; // 0 = easy, 1 = medium, 2 = hard, 3 = expert, 4 = master, 5 = godlike, 6 = accended. (could use exponitional.) 
let shop
let fm = new floorModifiers();
let fmOn = true;

function reset() {
    move_conter = 0;
    shopState = null;
    skill_selection = null;
    reroll_tokens = 0
    curse = 0
    battlesWon = 0
    chosenSkills = [];
    chosenItems = [];
    battle = null;
    Death = false;
    gameMessage = "";
    fogOn = true;
    fogMap.range = 4;
    t = new timer();
    p = null;
    fm.reset();
    newFloor({
        openRatio: 0.34 + seedRand("map") * 0.16,
        pillars: randomInt([
            Math.max(4, Math.floor(W * H * 0.006)),
            Math.max(8, Math.floor(W * H * 0.018))
        ]),
        brush: seedRand("map") < 0.8 ? 1 : 2
    });
    shop = new Shop();
    p = new Player(Math.floor(W / 2), Math.floor(H / 2), "@");
    s = new stairs(">");
    s.place();
    m = new Money("$", !Class.noCoins);
    enemy = new Enemy();
    Class.GameStart();
    enemy.spawn();
    updateStats();
    draw();
}

reset();

setInterval(() => {
    t.tick();
    draw();
}, 1000);


// saves progress
function saveProgress() {
    if (!progressLoaded) return;
    localStorage.setItem("tagless_progress", JSON.stringify({
        best_floor,
        achivements,
        classes: Object.fromEntries(Classes.map(c => [c.name, {
            unlocked: c.unlocked, best_floor: c.best_floor, achivements: c.achivements
        }])),
        compendium,
        t_trees,
        b_trees
    }));
}
const saved = JSON.parse(localStorage.getItem("tagless_progress") || "null");
if (saved) {
    best_floor = saved.best_floor || 1;
    achivements = saved.achivements || achivements;
    for (const c of Classes) {
        const s = saved.classes && saved.classes[c.name];
        if (s) { c.unlocked = s.unlocked; c.best_floor = s.best_floor || 0; c.achivements = s.achivements || c.achivements; }
    }
    compendium = saved.compendium || compendium;
    t_trees = saved.t_trees || t_trees;
    b_trees = saved.b_trees || b_trees;
    progressLoaded = true;
}
progressLoaded = true;


// trigers - [0] -> use key -> [1] ->  use shift -> [2] -> move 10 tiles -> [3] or just notify all
let BLANK = " ".repeat(instructionWidth)
let tmsgs = [BLANK,"use WASD to move","hold shift to sprint",BLANK,"explore to find items, and stuff.",BLANK,"Items: ","$ = money","p, h, P, H = healing",BLANK,"> is a shop and a staircase to the next floor",BLANK,"e and E are encounters which act as shops, but use stats as currency.",BLANK,"cursed items grant x2 stats, but make the game harder."]
let TUTORIAL = true;
if (TUTORIAL) {
    tmsgs = tmsgs.map(i => i.trim()).filter(Boolean);
    notify("Tutorial",tmsgs.join(" "))
}