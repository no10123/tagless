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
    "class:      None  ",
    "discount:   -0$   ",
    "% discount: -0%   ",
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

function xpRequiredForLevel(level) {
    return 12 + 7 * level;
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
    instructions[19] = `class:      ${Class.name}`;
    instructions[20] = `discount:   -${shop.discount}$`;
    instructions[21] = `% discount: -${shop.percent_discount}%`;
    instructions[22] = `best floor: ${best_floor}`;
    checkAchivements(p.floor,p.money,p.hp,p.attack,p.luck,p.lvl,p.xp,fogMap.range,t.run,t.floor,W,H,difficulty)
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
let shopState = null
let mainMenu = true;
let Settings = false;
let credits  = false;
let help     = false;
let start_config = false;
let achivement_menu = false;

// a smol list.
let Classes = [
    {"name":"Dude",         "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":true,  "best_floor":0,  "desc":"no buff"},   // baseline
    {"name":"healer",       "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{p.hp = p.hp + 15;},     "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":true,  "best_floor":0,  "desc":"+15 hp per floor"},   // +15hp per floor
    {"name":"theif",        "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{p.money = p.money + 2;},"fleeBattle":()=>{},"coinPickup":()=>{p.money = p.money + 2;},"potionPickup":()=>{},  "unlocked":true,  "best_floor":0,  "desc":"+2 gold to all incomes"},   // + 2 gold to all incomes
    {"name":"fighter",      "GameStart":()=>{p.attack_mult = 1.25},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":true,  "best_floor":0,  "desc":"x1.25 dammage"},   // x1.25 dammage.
    {"name":"cat",          "GameStart":()=>{},"LevelUp":()=>{p.luck = p.luck + 2},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"+2 luck per levl"},  // +3 luck per levl
    {"name":"gambler",      "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"35% 2x dmg, 50% x1, 15% x0"},  // 35% 2x dmg, 50% x1, 15% x0
    {"name":"apprentice",   "GameStart":()=>{p.LevelUp()},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"start with skill of choice (will be tripled)"},  // start with skill of choice (will be tripled)
    {"name":"alchemist",    "GameStart":()=>{p.potion_affect = 1.5},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"x2 potion spawn"},  // x2 potion spawn or affect.
    {"name":"forgotten",    "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"+5 extra skill triggers. and x2 dmg, no shop, no coins, no potions"},  // +5 extra skill triggers. and x2 dmg, no shop, no coins, no potions.
    {"name":"imortal",      "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"block's dmg equal to the floor number"},  // - this.floor dmg
    {"name":"merchant",     "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"deal more dmg with more money"},  // x(1+sqrt(p.money)/5) dmg
    {"name":"executor",     "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"attack's once at start of combat"},  // deal 1 attack at start of combat
    {"name":"tank",         "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"block 5dmg in each combat"},  // block first 5 dmg of each combat
    {"name":"vampire",      "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"heals after each combat."},  // heal floor(attack/3) or 3 after combat.
    {"name":"rober",        "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"steals cheapest item in shop."},  // steal cheapest item in shop.
    {"name":"rich",         "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"start with a free common item and 13$"},  // start with a free common item and +13 starting $
    {"name":"runner",       "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{p.range = p.range + 1},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"+1 vision each floor"},  // +3 hp when you flee and +1 vision each floor
    {"name":"gaurdian",     "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"more dmg with more hp"},  // attack += floor(hp/30) +20 starting hp
    {"name":"batle mage",   "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{ p.attack = p.attack + 1},  "unlocked":false, "best_floor":0,  "desc":"potions have a 10% chance to give +1 attack"},  // potions have a 10% chance to give +1 attack
    {"name":"mystic",       "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"gain a bonus + evry 7 lvl's and attack is increased by luck"},  // gain a bonus + evry 7 levls. and attack += floor(luck/2)
    {"name":"barbarian",    "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"x1.5 dmg, -5hp at start/end of floor"},  // x1.5 dammage. -5hp at start of floor
    {"name":"trickster",    "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"+1 reroll token each floor, 10% to doge attacks"},  // +1 reroll token each floor, 10% to doge attacks
    {"name":"monk",         "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"all gold becomes xp, no shop"},  // all gold becomes xp,  no shop
    {"name":"greed",        "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},                      "BattleStart":()=>{},"winBatle":()=>{},                      "fleeBattle":()=>{},"coinPickup":()=>{},                      "potionPickup":()=>{},  "unlocked":false, "best_floor":0,  "desc":"all xp becomes gold, no skills"},  // all xp becomed gold, no skills

    {"name":"shapeshifter", "GameStart":()=>{},"LevelUp":()=>{},"FloorStart":()=>{},"BattleStart":()=>{},"winBatle":()=>{}, "unlocked":false}, // random class each floor. 
] // 25 total classes
let Class = Classes[0];
let avail_classes = Classes;
let si = 0;
let ay = 0;
window.lines = []

let locked_achivements = [
    // floor based
    {"name":"The begining",     "desc":"get to floor 10","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 10);}},
    {"name":"The Depths",       "desc":"get to floor 20","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20);}},
    {"name":"Endless?",         "desc":"get to floor 30","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 30);}},
    {"name":"Beyond the end",   "desc":"get to floor 40","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 40);}},
    {"name":"How? just how",    "desc":"get to floor 50","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 50);}},
    // money
    {"name":"A doller!",        "desc":"obtain 100 coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 100);}},
    {"name":"A band!",          "desc":"obtain 1000 coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 1000);}},
    {"name":"Broke explorer",   "desc":"have 0 coins on floor 20 or greater.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money == 0 && floor >= 20);}},
    // hp
    {"name":"First Death",      "desc":"die.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp == 0);}},
    {"name":"dual heart",       "desc":"have 200+ hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 200);}},
    {"name":"Five of hearts",   "desc":"have 500+ hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 500);}},
    {"name":"Imortality?",      "desc":"have 1000+ hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 1000);}},
    // attack
    {"name":"baisc sword",      "desc":"have 25+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 25);}},
    {"name":"sharpened sword",  "desc":"have 50+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 50);}},
    {"name":"shiny sword",      "desc":"have 75+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 75);}},
    {"name":"legendary sword",  "desc":"have 100+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 100);}},
    {"name":"accended sword",   "desc":"have 500+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 500);}},
    {"name":"god killer",       "desc":"have 1000+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 1000);}},
    // luck
    {"name":"Pure skill",       "desc":"have 0 luck on floor 20+.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck == 0 && floor >= 20);}},
    {"name":"dice collector",   "desc":"have 5+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 5);}},
    {"name":"shiny penny",      "desc":"have 10+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 10);}},
    {"name":"lucky cat",        "desc":"have 20+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 20);}},
    {"name":"4 leaf clover",    "desc":"have 40+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 40);}},
    {"name":"chosen fate",      "desc":"have 50+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 50);}},
    // lvl
    {"name":"basic adventurer",        "desc":"reach lvl 10+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 10);}},
    {"name":"intermidiete adventurer", "desc":"reach lvl 20+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 20);}},
    {"name":"advanced adventurer",     "desc":"reach lvl 30+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 30);}},
    {"name":"expert adventurer",       "desc":"reach lvl 40+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 40);}},
    {"name":"master adventurer",       "desc":"reach lvl 50+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 50);}},
    {"name":"grand master adventurer", "desc":"reach lvl 100+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 100);}},
    // range
    {"name":"basic eye's",             "desc":"have 10+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 10);}},
    {"name":"platnium eye",            "desc":"have 20+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 20);}},
    {"name":"third eye",               "desc":"have 30+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 30);}},
    {"name":"Glasses!",                "desc":"have 50+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 50);}},
    // unique. 
    {"name":"speedrunner",             "desc":"reach floor 20+ in under 5min","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20 && trun < 300000);}},
    {"name":"GOD mode",                "desc":"have 50+ vision, lvl 100+, 1000+ attack, 1000+ hp, and 1000+ money","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 50 && lvl >= 100 && luck >= 50 && attack >= 1000 && hp >= 1000 && money >= 1000);}},
]

let achivements = [{"name":"open the game","best":6}]
for (let i = 0; i < Classes.length; i++) {
    Classes[i].achivements = achivements
}


function checkAchivements (floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) {
    let i = 0
    while (i < locked_achivements.length) {
        if (locked_achivements[i].req(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty)) {
            if (locked_achivements[i].name in achivements.map(item => item.name)) {
                const p = achivements[achivements.map(item => item.name).indexOf(locked_achivements[i].name)]
                if (difficulty > p.best) {
                    p.best = difficulty
                }
                
            }
            achivements.push({...locked_achivements[i],"best":difficulty})
            Classes[Classes.indexOf(Class)].achivements.push({...locked_achivements[i],"best":difficulty})
            //locked_achivements.splice(i,1)
        } else {
            i++;
        }
    }
    Classes[Classes.indexOf(Class)].best_floor = floor > Classes[Classes.indexOf(Class)].best_floor ? floor : Classes[Classes.indexOf(Class)].best_floor   
}

let Death = null

let reroll_tokens = 0;

let Volume = 10;
let FGI = 0;
let BGI = 0;
let FGL = ["#cdd6f4","#f5e0dc","#cba6f7","#f38ba8","#89b4fa","#a6e3a1","#94e2d5","#f9e2af","#89b4fa","#1e1e2e"]
let BGL = ["#1e1e2e","#5b4242","#565681","#60785e","#876482","#cdd6f4"]

let complexStats = false;

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
        `Score: ${p.floor * 1000 + p.money + p.lvl * 50}`
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
            "insperations: binding of isaac, and dragon quest.",
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
        let lines = [
            border,
            "- s -- achivements -- w -",
            "",
        ];
        for (let i = 0; i < achivements.length; i++) {
            lines.push(`${achivements[i].name} - ${achivements[i].best}`);
        }
        lines.push("")
        lines.push(" -- Locked --")
        for (let i = 0; i < locked_achivements.length; i++) {
            lines.push(`${locked_achivements[i].name} - ${locked_achivements[i].desc}`)
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
            `money: ${p.money}$`,
            `Time: ${t.run}`,
            "",
            `score: ${p.floor * 1000 + p.money + p.lvl * 50}`,
            "",
            gameMessage ? gameMessage : "0 to copy stats.",
            "(press any key to restart)",
            border,
        ];
        let display = "\n  " + " ".repeat(W);
        for (const line of [...lines, ...Array(Math.max(0, H - lines.length)).fill("")].slice(0, H)) {
            const text = line.slice(0, W);
            const left = Math.floor((W - text.length) / 2);
            display += "\n    " + " ".repeat(left) + text.padEnd(W - left);
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
    } else {
        let display = "\n  " + " ".repeat(W);
        let instruction;
        for (let i = 0; i < grid.length; i++) {
            const pannel = [instructions[4],instructions[6],instructions[7],instructions[5],instructions[10],"","C to see full stats"]
            if (!complexStats) {
                instruction = i < pannel.length ? pannel[i] : " ";
            } else {
                instruction = i < instructions.length + 2 ? [...instructions,"","c to see less stats"][i] : " ";
            }
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
        this.sprint = 2
        this.skill_choices = 3;
        this.unique_options = [
            {"name":"bonus items", "func": () => {shop.avail = Math.min(10, shop.avail + 1);},"uses":7},
            {"name":"bonus skills", "func": () => {this.skill_choices = Math.min(10, this.skill_choices + 1);},"uses":5},
        ];
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
                this.money += Math.floor((m.mult + 0.1) * Math.sqrt(this.floor));
                Class.coinPickup();
                updateStats();
            } else if ([PS.sym, PM.sym, PL.sym, PX.sym].includes(grid[nextY][nextX])) {
                this.hp += Math.floor([10,25,50,100][[PS.sym,PM.sym,PL.sym,PX.sym].indexOf(grid[nextY][nextX])] * p.potion_affect)
                Class.potionPickup();
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
        this.xp = Number.isFinite(this.xp) ? this.xp : 0;
        const reqxp = xpRequiredForLevel(this.lvl);
        if (this.xp >= reqxp) {
            this.lvl++
            this.xp = this.xp - reqxp
            this.options = [
                {"name":"sharpen sword", "func": () => {p.attack++;}},
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
        return candidates.sort(() => 0.5 - Math.random()).slice(0, this.skill_choices);
    }

    xpForLevels(count) {
        let requiredXp = 0;
        for (let offset = 0; offset < count; offset++) {
            requiredXp += xpRequiredForLevel(this.lvl + offset);
        }
        return requiredXp;
    }

    selectSkill(skill) {
        Class.LevelUp();
        if (this.lvl % 10 == 0) {
            skill.func();
        }  
        if (this.lvl % 3 == 0) {
            skill.func();
        }   
        skill.func();
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
    constructor(sym) {
        this.l = Math.floor(Math.random() * 10) + 1; 
        this.x = [];
        this.y = [];
        this.sym = sym;
        this.mult = 1
        
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
        newFloor({
                openRatio: 0.34 + Math.random() * 0.16,
            pillars: randomInt([
                Math.max(4, Math.floor(W * H * 0.006)),
                Math.max(8, Math.floor(W * H * 0.018))
            ]),
            brush: Math.random() < 0.8 ? 1 : 2
        });
        new Money(m.sym);
        p.place("@");
        this.place();
        shopState = shop.open(p.floor);
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
            // xp
            {"item":"+3 xp",      "cost":5,  "func": () => {p.xp += 3;}, "rarity":"common"},
            {"item":"+6 xp",      "cost":13, "func": () => {p.xp += 6;}, "rarity":"uncommon"},
            {"item":"+9 xp",      "cost":21, "func": () => {p.xp += 9;}, "rarity":"rare"},
            {"item":"+12 xp",     "cost":30, "func": () => {p.xp += 12;}, "rarity":"mythic"},
            {"item":"+15 xp",     "cost":40, "func": () => {p.xp += 15;},"rarity":"legendary"},
            {"item":"+20 xp",     "cost":75, "func": () => {p.xp += 20;},"rarity":"accended"},
            // lvl's
            {"item":"+1 lvl",     "cost":27, "func": () => {p.xp += p.xpForLevels(1);}, "rarity":"rare"},
            {"item":"+2 lvl",     "cost":50, "func": () => {p.xp += p.xpForLevels(2);}, "rarity":"mythic"},
            {"item":"+3 lvl",     "cost":100,"func": () => {p.xp += p.xpForLevels(3);}, "rarity":"legendary"},
            {"item":"+5 lvl",     "cost":200,"func": () => {p.xp += p.xpForLevels(5);}, "rarity":"accended"},
             // misc
            {"item":"+1 sprint",  "cost":20, "func": () => {p.sprint = p.sprint + 1;}, "rarity":"rare"},
            {"item":"vision +1",  "cost":30, "func": () => {fogMap.adjustRange(1);}, "rarity":"mythic"},
            {"item":"vision +2",  "cost":50, "func": () => {fogMap.adjustRange(2);}, "rarity":"legendary"},
            {"item":"vision +3",  "cost":100,"func": () => {fogMap.adjustRange(3);}, "rarity":"accended"},
            {"item":"lucky coin", "cost":100, "func": () => {p.luck = p.luck + Math.ceil(Math.random() * 20); p.money = p.money + Math.ceil(Math.random() * 20);}, "rarity":"accended"},
            // reroll tokens
            {"item":"1 reroll token",  "cost":8,   "func": () => {reroll_tokens += 1;}, "rarity":"common"},
            {"item":"1 reroll token", "cost":18,  "func": () => {reroll_tokens += 1;}, "rarity":"uncommon"},
            {"item":"2 reroll tokens", "cost":30,  "func": () => {reroll_tokens += 2;}, "rarity":"rare"},
            {"item":"2 reroll tokens", "cost":50,  "func": () => {reroll_tokens += 2;}, "rarity":"mythic"},
            {"item":"3 reroll tokens", "cost":100, "func": () => {reroll_tokens += 3;}, "rarity":"legendary"},
            {"item":"4 reroll tokens", "cost":150, "func": () => {reroll_tokens += 4;}, "rarity":"accended"},
        ]
    }

    open(floor) {
        const rarityUnlockFloor = { common: 1, uncommon: 2, rare: 4, mythic: 6, legendary: 9, accended: 12 };
        const rarityUnlockCost = { common: 0, uncommon: 5, rare: 10, mythic: 20, legendary: 30, accended: 70};
        const available = this.shopPool
            .filter(item => floor >= rarityUnlockFloor[item.rarity] && p.money >= rarityUnlockCost[item.rarity])
            .map(item => ({
                ...item,
                cost: Math.max(1, Math.floor(item.cost * (1 - this.percent_discount) - this.discount))
            }));
        const offers = [];
        while (offers.length < this.avail && available.length > 0) {
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
        p.check_lvl();
        updateStats();
        draw();
    }
}


class Enemy {
    constructor() {
        this.dc = 0
        this.chance = 10
        this.cmax   = W * H
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
        if (r > chance + this.dc) {
            this.dc++
            return;
        } else {
            this.dc = -Math.floor(Math.random() * 10)
        };
        this.id = 0;
        const floorTier = Math.floor((p.floor - 1) / 5);
        const levelBonus = Math.floor(p.lvl / 10);
        this.rate = Math.min(4, floorTier + levelBonus);
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
        const difficultyScale = 1 + difficulty * 0.15;
        const fs = Math.max(0, p.floor - 10);
        this.maxHp = Math.max(1, Math.floor((rolled.hp * Math.pow(1.06, fs) + p.floor * 0.6 + this.rate * 2) * difficultyScale));
        this.attack = Math.max(1, Math.floor((rolled.dmg * Math.pow(1.03, fs) + p.floor * 0.15) * (1 + difficulty * 0.16)));
        this.hp = this.maxHp;
        this.xpReward = Math.max(1, Math.floor(rolled.xp * 0.45 + p.floor * 0.45));
        this.moneyReward = Math.max(0, Math.floor((rolled.gold * 0.6 + p.floor * 0.6) * 0.75));
        this.ac = rolled.ac
    }
    startBattle() {
        if (battle) return;
        Class.BattleStart();
        gameMessage = "";
        battle = {
            enemy: this,
            message: `A ${this.name} attacks!`,
        };
        draw();
    }
    enemyTurn(action) {
        if (!battle) return;
        let damage = Math.min(p.hp, battle.enemy.attack);
        p.hp -= damage;
        battle.message = `${action} -${damage} HP.`;
        if (p.hp <= 0) {
            battle = null;
            Death = true;
            draw();
            return;
        }
        draw();
    }
    playerAttack() {
        if (!battle) return;
        let hit = Math.ceil(Math.random() * 100) + p.luck;
        let damage;
        if (hit > battle.enemy.ac) {
            damage = Math.max(1, Math.round(p.attack * p.attack_mult));
        } else {
            damage = 0;
        }
        battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
        if (battle.enemy.hp === 0) {
            p.xp += battle.enemy.xpReward;
            p.money += battle.enemy.moneyReward;
            gameMessage = `Won! +${battle.enemy.xpReward}xp +$${battle.enemy.moneyReward}`;
            battle = null;
            Class.winBatle();
            p.check_lvl();
            updateStats();
            draw();
            return;
        }
        this.enemyTurn(`Hit ${damage}.`);
    }
    flee() {
        if (!battle) return;
        if (Math.random() * (p.luck/10 + 1) < 0.5) {
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
        let factor = p ? 1 + (p.luck / 10) : 1;
        this.a = Math.floor(this.w[Math.floor(Math.random() * this.w.length)] * factor * (p?p.potion_spawn:1));
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
let shop

function reset() {
    battle = null;
    Death = false;
    gameMessage = "";
    fogOn = true;
    fogMap.range = 4;
    t = new timer();
    p = null;
    newFloor({
        openRatio: 0.34 + Math.random() * 0.16,
        pillars: randomInt([
            Math.max(4, Math.floor(W * H * 0.006)),
            Math.max(8, Math.floor(W * H * 0.018))
        ]),
        brush: Math.random() < 0.8 ? 1 : 2
    });
    shop = new Shop();
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
    if (!music.INPUT) {
        music.beginMusic();
        music.INPUT = true;
    }
    const key = event.key;
    if (Death) {
        if (key === "0") {
            copyRunSummary();
            return;
        }
        reset();
        return;
    }
    if (mainMenu) {
        if (key === "1") {
            mainMenu = false;
            Settings = false;
            credits  = false;
            help     = false;
            achivement_menu = false;
            start_config = true;
            reset();
            draw();
            return;
        } else if (key === "2") {
            mainMenu = false;
            Settings = false;
            credits  = false;
            help     = false;
            achivement_menu = false;
            start_config = false;
            draw();
            return;
        } else if (key === "3") {
            mainMenu = false;
            Settings = true;
            draw();
            return;
        } else if (key === "4") {
            mainMenu = false;
            achivement_menu = true;
            draw();
            return;
        } else if (key === "5") {
            mainMenu = false;
            credits = true;
            draw();
            return;
        } else if (key === "6") {
            mainMenu = false;
            help = true;
            draw();
            return;
        }
    } else if (shopState) {
        if (key === "Escape" || key === "0") {
            shopState = null;
            enemy.spawn();
            draw();
            return;
        } else if (key === "r" || key === "R") {
            if (reroll_tokens > 0) {
                reroll_tokens--;
                shopState = shop.open(p.floor);
                updateStats();
                draw();
            }
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
            p.selectSkill(skill_selection[choice]);
            skill_selection = null;
            p.check_lvl();
            updateStats();
            draw();
        } else if (key === "r" || key === "R") {
            if (reroll_tokens > 0) {
                reroll_tokens--;
                skill_selection = p.rollSkillSelection(skill_selection);
                updateStats();
                draw();
            }
        }
        return;
    } else if (Settings) {
        if (key === "1") {
            Volume = Math.max(0, Volume - 1);
            music.syncMusicVolume();
            draw();
            return;
        } else if (key === "2") {
            Volume = Math.min(20, Volume + 1);
            music.syncMusicVolume();
            draw();
            return;
        } else if (key === "3") {
            FGI = (FGI + 1) % FGL.length;
            body.style.color = FGL[FGI];
            draw();
            return;
        } else if (key === "4") {
            BGI = (BGI + 1) % BGL.length;
            body.style.backgroundColor = BGL[BGI];
            draw();
            return;
        } else if (key === "5") {
            music.toggleMusicMute();
            draw();
            return;
        } else if (key === "6") {
            music.nextMusicTrack();
            draw();
            return;
        } else if (key === "7") {
            mainMenu = true;
            Settings = false;
            draw();
            return;
        }
    } else if (start_config) {
        if (avail_classes.length === 0) return;
        if (key.toLocaleLowerCase() === "w") {
            si = (si - 1 + avail_classes.length) % avail_classes.length;
            Class = avail_classes[si];
            draw();
            return;
        } 
        if (key.toLocaleLowerCase() === "s") {
            si = (si + 1) % avail_classes.length;
            Class = avail_classes[si];
            draw();
            return;
        } 
        if (key.toLocaleLowerCase() === "a") {
            difficulty = Math.max(0, difficulty - 1);
            draw();
            return;
        } 
        if (key.toLocaleLowerCase() === "d") {
            difficulty = Math.min(6, difficulty +1);
            draw();
            return;
        }
        if (key === "0") {
            start_config = false;
            Class.GameStart();
        }
    } else if (achivement_menu) {
        if (key.toLocaleLowerCase() === "w") {
            ay = Math.max(0,ay - 1)
            draw();
            return;
        }
        if (key.toLocaleLowerCase() === "s") {
            ay = Math.min(Math.max(0, window.lines.length - Math.max(1, H - 5)), ay + 1);
            draw();
            return;
        }
    }

    if (key === "m" || key === "M") {
        music.toggleMusicMute();
        draw();
        return;
    } else if (key === "n" || key === "N") {
        music.nextMusicTrack();
        draw();
        return;
    }

    if (["w", "a", "s", "d"].includes(key)) {
        p.move(key, 1);
        draw();
    } else if (["W", "A", "S", "D"].includes(key)) {
        for (let i = 0; i < p.sprint; i++) {
            p.move(key.toLocaleLowerCase(), 1);
            draw();
        }
    } else if (key.toLocaleLowerCase() == "c") {
        complexStats = !complexStats;
        draw();
    } else if (key == "Escape") {
        mainMenu = true;
        draw();
    }
});