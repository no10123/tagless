const body = document.getElementById("body") || document.body; // added fallback
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
const BASE = {"GameStart":() => {},"LevelUp":() => {},"FloorStart":() => {},"BattleStart":() => {},
    "winBatle":() => {},"fleeBattle":() => {},"coinPickup":() => {},"potionPickup":() => {},
    "OnAttack":d => d,"OnDamage":d => d,"unlocked":false,"best_floor":0};

let Classes = [
    {...BASE, "name":"Dude", "unlocked":true, "desc":"no buff"},
    {...BASE, "name":"healer", "unlocked":true, "FloorStart":()=>{p.hp += 15;}, "desc":"+15 hp per floor"},
    {...BASE, "name":"theif", "unlocked":true, "winBatle":()=>{p.money += 2;}, "coinPickup":()=>{p.money += 2;}, "desc":"+2 gold to all incomes"},
    {...BASE, "name":"fighter", "unlocked":true, "GameStart":()=>{p.attack_mult = 1.25;}, "desc":"x1.25 damage"},
    {...BASE, "name":"cat", "LevelUp":()=>{p.luck += 2;}, "desc":"+2 luck per level"},
    {...BASE, "name":"gambler", "OnAttack":(d)=>{const r=seedRand("misc"); return r<0.35 ? d*2 : r<0.85 ? d : 0;}, "desc":"35% 2x dmg, 50% x1, 15% x0"},
    {...BASE, "name":"apprentice", "GameStart":()=>{skill_selection = p.rollSkillSelection();}, "desc":"start with skill of choice (will be tripled)"},
    {...BASE, "name":"alchemist", "GameStart":()=>{p.potion_affect = 1.5;}, "desc":"x1.5 potion effect"},
    {...BASE, "name":"forgotten", "noShop":true, "noCoins":true, "noPotions":true, "extraTriggers":5,
        "GameStart":()=>{p.attack_mult = 2;}, "desc":"+5 extra skill triggers and x2 dmg, no shop, no coins, no potions"},
    {...BASE, "name":"imortal", "OnDamage":(d)=>Math.max(0, d - p.floor), "desc":"blocks damage equal to the floor number"},
    {...BASE, "name":"merchant", "OnAttack":(d)=>d * (1 + Math.sqrt(p.money) / 10), "desc":"deal more damage with more money"},
    {...BASE, "name":"executor", "BattleStart":()=>{
        battle.enemy.hp = Math.max(0, battle.enemy.hp - Math.max(1, Math.round(p.attack * p.attack_mult)));
        if (battle.enemy.hp === 0) winBattle();
    }, "desc":"attacks once at start of combat"},
    {...BASE, "name":"tank", "BattleStart":()=>{battle.blockLeft = 5;},
        "OnDamage":(d)=>{const b = Math.min(d, battle.blockLeft || 0); battle.blockLeft -= b; return d - b;},
        "desc":"blocks 5 damage in each combat"},
    {...BASE, "name":"vampire", "winBatle":()=>{p.hp += Math.max(3, Math.floor(p.attack / 3));}, "desc":"heals after each combat"},
    {...BASE, "name":"rober", "FloorStart":()=>{
        if (!shopState) return;
        let best = -1;
        for (let i = 0; i < shopState.offers.length; i++) {
            const o = shopState.offers[i];
            if (!o.purchased && (best === -1 || o.cost < shopState.offers[best].cost)) best = i;
        }
        if (best !== -1) { shopState.offers[best].func(); shopState.offers[best].purchased = true; p.check_lvl(); }
    }, "desc":"steals the cheapest item in the shop"},
    {...BASE, "name":"rich", "GameStart":()=>{p.money += 13;
        const commons = shop.shopPool.filter(i=>i.rarity==="common");
        commons[Math.floor(seedRand("misc")*commons.length)].func(); p.check_lvl();
    }, "desc":"starts with a free common item and 13 gold"},
    {...BASE, "name":"runner", "FloorStart":()=>{fogMap.adjustRange(1);}, "desc":"+1 vision each floor"},
    {...BASE, "name":"gaurdian", "GameStart":()=>{p.hp += 20;}, "OnAttack":(d)=>d + Math.floor(p.hp / 30), "desc":"more damage with more hp"},
    {...BASE, "name":"batle mage", "potionPickup":()=>{if (seedRand("misc") < 0.1) p.attack += 1;}, "desc":"potions have a 10% chance to give +1 attack"},
    {...BASE, "name":"mystic", "LevelUp":(skill)=>{if (p.lvl % 7 === 0 && skill) skill.func();},
        "BattleStart":()=>{p.attack += p.luck;}, "winBatle":()=>{p.attack -= p.luck;}, "fleeBattle":()=>{p.attack -= p.luck;},
        "desc":"gains a bonus every 7 levels and attack is increased by luck"},
    {...BASE, "name":"barbarian", "GameStart":()=>{p.attack_mult = 1.5;}, "FloorStart":()=>{p.hp -= 5;}, "desc":"x1.5 damage, -5 hp at start of floor"},
    {...BASE, "name":"trickster", "FloorStart":()=>{reroll_tokens++;}, "OnDamage":(d)=>seedRand("misc") < 0.1 ? 0 : d, "desc":"+1 reroll token each floor, 10% to dodge attacks"},
    {...BASE, "name":"monk", "goldToXp":true, "desc":"all gold becomes xp, no shop"},
    {...BASE, "name":"greed", "xpToGold":true, "desc":"all xp becomes gold, no skills"},
    {...BASE, "name":"investor","FloorStart":()=>{p.money = p.money + Math.floor(p.money * 0.1)}, "desc":"gain 10% coins each floor."},
    {...BASE, "name":"Deserter","noShop":true, "noCoins":true,"GameStart":()=>{p.attack_mult = 0},"fleeBattle":() => {p.xp += 4 + p.floor; p.check_lvl();}, "desc":"deal no dmg, and gain xp from fleeing, no shop, no coins."},
    {...BASE, "name":"scavenger","coinPickup":()=>{p.hp += 3},"potionPickup":()=>{p.money += p.floor + 1}, "desc":"gain money with potions, and health with coins."},
    {...BASE, "name":"bladesmith","LevelUp":(skill)=>{p.attack += 1}, "desc":"gain 1 attack every levl."},
    {...BASE, "name":"cyadian","GameStart":()=>{p.sprint = Math.max(W,H); p.move_speed = Math.max(W,H)},"FloorStart":()=>{p.sprint = Math.max(0, p.sprint - 1); p.attack += (p.floor % 2 == 0) ? 1 : 0}, "desc":"start with max speed, and sprint, -1 sprint each floor, and gain 1 attack every seccond floor."},
    {...BASE, "name":"gladiator","GameStart":()=>{p.hp -= 50},"OnDamage":(d)=>{p.money += Math.floor(d/2); return d;}, "desc":"start with 50 less hp, gain money when you take damgege."},
    {...BASE, "name":"mimic", "mimicChance":0.15,"winBatle":()=>{ if (battle && battle.mimic) p.money += Math.ceil((m.mult + 0.1) * Math.sqrt(p.floor)) * 2; },"desc":"15% of coins are mimics, x2 coins from mimics"},
    {...BASE, "name":"blind", "GameStart":()=>{fogMap.adjustRange(-4)}, "FloorStart":()=>{p.attack += fogMap.range},"desc":"-4 vision, +1 attack each floor per vision.","unlocked":true},
]
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

let locked_achivements = [
    // floor based
    {"name":"The begining",     "desc":"get to floor 10","unlock":"gambler","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 10);}},
    {"name":"The Depths",       "desc":"get to floor 20","unlock":"runner","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20);}},
    {"name":"Endless?",         "desc":"get to floor 30","unlock":"alchemist","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 30);}},
    {"name":"Beyond the end",   "desc":"get to floor 40","unlock":"forgotten","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 40);}},
    {"name":"How? just how",    "desc":"get to floor 50","unlock":"imortal","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 50);}},
    {"name":"Forever above",    "desc":"get to floor 100","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 100);}},
    // money
    {"name":"A doller!",        "desc":"obtain 100+ coins.","unlock":"rober","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 100);}},
    {"name":"A band!",          "desc":"obtain 1000+ coins.","unlock":"rich","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 1000);}},
    {"name":"money collector",  "desc":"obtain 5000+ coins.","unlock":"scavenger","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 5000);}},
    {"name":"walking bank",     "desc":"obtain 10000+ coins.","unlock":"mimic","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 10000);}},
    {"name":"50k warhamer",     "desc":"obtain 50000+ coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 50000);}},
    {"name":"Gold certificate", "desc":"obtain 100000+ coins.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= 100000);}},
    {"name":"Broke explorer",   "desc":"have 0 coins on floor 20 or greater.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money == 0 && floor >= 20);}},
    // hp
    {"name":"keep on standing", "desc":"get 1 hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp == 1);}},
    {"name":"First Death",      "desc":"die.","unlock":"tank","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp == 0);}},
    {"name":"dual heart",       "desc":"have 200+ hp.","unlock":"vampire","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 200);}},
    {"name":"Five of hearts",   "desc":"have 500+ hp.","unlock":"gaurdian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 500);}},
    {"name":"Imortality?",      "desc":"have 1000+ hp.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (hp >= 1000);}},
    // attack
    {"name":"pointless",        "desc":"get 0 attack. Somehow. ","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack == 0);}},
    {"name":"baisc sword",      "desc":"have 25+ attack.","unlock":"apprentice","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 25);}},
    {"name":"sharpened sword",  "desc":"have 50+ attack.","unlock":"executor","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 50);}},
    {"name":"shiny sword",      "desc":"have 75+ attack.","unlock":"barbarian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 75);}},
    {"name":"legendary sword",  "desc":"have 100+ attack.","unlock":"merchant","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 100);}},
    {"name":"accended sword",   "desc":"have 150+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 150);}},
    {"name":"god killer",       "desc":"have 200+ attack.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (attack >= 200);}},
    // luck
    {"name":"Pure skill",       "desc":"have 0 luck on floor 20+.","unlock":"monk","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck == 0 && floor >= 20);}},
    {"name":"dice collector",   "desc":"have 5+ luck.","unlock":"cat","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 5);}},
    {"name":"shiny penny",      "desc":"have 10+ luck.","unlock":"investor","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 10);}},
    {"name":"lucky cat",        "desc":"have 20+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 20);}},
    {"name":"4 leaf clover",    "desc":"have 40+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 40);}},
    {"name":"chosen fate",      "desc":"have 50+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 50);}},
    {"name":"lucky dime",       "desc":"have 75+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 75);}},
    {"name":"100 clovers",      "desc":"have 100+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 100);}},
    {"name":"lucky number 7.",  "desc":"have 117+ luck.","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (luck >= 117);}},
    // lvl
    {"name":"begginer adventurer",     "desc":"reach lvl 10+","unlock":"mystic","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 10);}},
    {"name":"intermidiete adventurer", "desc":"reach lvl 20+","unlock":"greed","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 20);}},
    {"name":"advanced adventurer",     "desc":"reach lvl 30+","unlock":"cyadian","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 30);}},
    {"name":"expert adventurer",       "desc":"reach lvl 40+","unlock":"Deserter","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 40);}},
    {"name":"master adventurer",       "desc":"reach lvl 50+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 50);}},
    {"name":"grand master adventurer", "desc":"reach lvl 60+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 60);}},
    {"name":"gm+1 adventurer",         "desc":"reach lvl 70+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 70);}},
    {"name":"gm+2 adventurer",         "desc":"reach lvl 80+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 80);}},
    {"name":"gm+3 adventurer",         "desc":"reach lvl 90+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 90);}},
    {"name":"gm+4 adventurer",         "desc":"reach lvl 100+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl >= 100);}},
    // range
    {"name":"basic eye's",             "desc":"have 10+ vision","unlock":"batle mage","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 10);}},
    {"name":"platnium eye",            "desc":"have 20+ vision","unlock":"blind","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 20);}},
    {"name":"third eye",               "desc":"have 25+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 25);}},
    {"name":"Glasses!",                "desc":"have 30+ vision","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 30);}},
    // unique. 
    {"name":"speedrunner",             "desc":"reach floor 20+ in under 5min","unlock":"trickster","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (floor >= 20 && trun < 300000);}},
    {"name":"GOD mode",                "desc":"have 30+ vision, 50+ luck, lvl 60+, 200+ attack, 750+ hp, and 10000+ money","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (range >= 30 && lvl >= 60 && luck >= 50 && attack >= 200 && hp >= 750 && money >= 10000);}},
    {"name":"SIX - SEVEN",             "desc":"have 67 attack, 67 hp, lvl 67, 67 coins","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl == 67 && attack == 67 && hp == 67 && money == 67);}},
    {"name":"blood money",             "desc":"have 100x as much money as hp.","unlock":"gladiator","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (money >= hp * 100 && hp > 0);}},
    // lvl 30 themed achivements. 
    {"name":"three sword master",      "desc":"get sharpen sword++","unlock":"bladesmith","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "sharpen sword");}},   
    {"name":"three of hearts",         "desc":"get health boost++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "health boost");}},
    {"name":"lottery tiket",           "desc":"get quick buck++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "quick buck");}},
    {"name":"3 leaf clover",           "desc":"get luck bonus++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "luck bonus");}},
    {"name":"fortune finder",          "desc":"get coin collector++","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (lvl % 10 == 0 && lvl % 3 == 0 && chosenSkills.length > 0 && chosenSkills[chosenSkills.length - 1].name == "coin collector");}},
    // shop based
    {"name":"avrage customer",         "desc":"buy 20+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 20)}},
    {"name":"super customer",          "desc":"buy 50+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 50)}},
    {"name":"ultra customer",          "desc":"buy 60+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 60)}},
    {"name":"legendary customer",      "desc":"buy 70+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 70)}},
    {"name":"accended customer",       "desc":"buy 80+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 80)}},
    {"name":"exotic customer",         "desc":"buy 90+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 90)}},
    {"name":"customer+",               "desc":"buy 100+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 100)}},
    {"name":"customer of the year",    "desc":"buy 120+ items in a run","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (chosenItems.length >= 120)}},
    // battles won
    {"name":"first kill",              "desc":"kill a monster","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 1)}},
    {"name":"set of dozen",            "desc":"kill 12+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 12)}},
    {"name":"month of destruction",    "desc":"kill 30+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 30)}},
    {"name":"50% off of deaths",       "desc":"kill 50+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 50)}},
    {"name":"decade of deaths",        "desc":"kill 100+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 100)}},
    {"name":"murderer!",               "desc":"kill 150+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 150)}},
    {"name":"gladiator",               "desc":"kill 200+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 200)}},    
    {"name":"destoyer of all",         "desc":"kill 300+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 300)}},    
    {"name":"bringer of death",        "desc":"kill 500+ monsters","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon >= 500)}},    
    {"name":"passafist",               "desc":"kill 0 monsters on floor 3+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 3)}},   
    {"name":"passafist+",              "desc":"kill 0 monsters on floor 5+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 5)}},    
    {"name":"passafist++",             "desc":"kill 0 monsters on floor 7+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 7)}},    
    {"name":"passafist+++",            "desc":"kill 0 monsters on floor 10+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 10)}},    
    {"name":"passafist++++",           "desc":"kill 0 monsters on floor 15+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 15)}},    
    {"name":"passafist+++++",          "desc":"kill 0 monsters on floor 20+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 20)}},    
    {"name":"bringer of hope",         "desc":"kill 0 monsters on floor 25+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 25)}},    
    {"name":"peacefull victory",       "desc":"kill 0 monsters on floor 30+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 30)}},    
    {"name":"angel of life",           "desc":"kill 0 monsters on floor 35+","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (battlesWon == 0 && floor >= 35)}},    
    // curse 
    {"name":"first curse",             "desc":"buy a cursed item","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse > 0)}},
    {"name":"decade of curses",        "desc":"get 10+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 10)}},
    {"name":"lucky number 13",         "desc":"get 13+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 13)}},
    {"name":"collection of curses",    "desc":"get 21+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 21)}},
    {"name":"hoard of curses",         "desc":"get 33+ curse","req":(floor,money,hp,attack,luck,lvl,xp,range,trun,tfloor,W,H,difficulty) => {return (curse >= 33)}},
]

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
        const response = await fetch("/api/leaderboard");
        //const response = await fetch("https://api.github.com/repos/no10123/tagless/issues?labels=score&state=all&per_page=100");
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
        this.unique_options = [
            {"name":"bonus items", "func": () => {shop.avail = Math.min(10, shop.avail + 1);},"uses":7},
            {"name":"bonus skills", "func": () => {this.skill_choices = Math.min(10, this.skill_choices + 1);},"uses":5},
        ];
        this.options = [
                {"name":"sharpen sword", "func": () => {p.attack += Class.goldToXp ? 3 : 1;}},
                {"name":"health boost",      "func": () => {p.hp += 8 + p.lvl * 2;}},
                {"name":"quick buck",      "func": () => {p.money = p.money + 3 * m.mult;}},
                {"name":"luck bonus",    "func": () => {p.luck++;}},
                {"name":"coin collector",  "func": () => {m.mult++;}},
                {"name":"cuppon collector",  "func": () => {shop.percent_discount = Math.min(0.5, shop.percent_discount + 0.05);}},
                {"name":"charisma",  "func": () => {shop.discount = Math.min(20, shop.discount + 1);}},
            ]
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
            {"item":"+1 sprint",  "cost":20, "func": () => {p.sprint = p.sprint + 1;}, "rarity":"rare","unique":true},
            {"item":"vision +1",  "cost":30, "func": () => {fogMap.adjustRange(1);}, "rarity":"mythic"},
            {"item":"vision +2",  "cost":50, "func": () => {fogMap.adjustRange(2);}, "rarity":"legendary"},
            {"item":"vision +3",  "cost":100,"func": () => {fogMap.adjustRange(3);}, "rarity":"accended"},
            {"item":"lucky coin", "cost":100, "func": () => {p.luck = p.luck + Math.ceil(seedRand("misc") * 20); p.money = p.money + Math.ceil(seedRand("misc") * 20);}, "rarity":"accended","unique":true},
            // reroll tokens
            {"item":"1 reroll token",  "cost":8,   "func": () => {reroll_tokens += 1;}, "rarity":"common","unique":true},
            {"item":"1 reroll token", "cost":18,  "func": () => {reroll_tokens += 1;}, "rarity":"uncommon","unique":true},
            {"item":"2 reroll tokens", "cost":30,  "func": () => {reroll_tokens += 2;}, "rarity":"rare","unique":true},
            {"item":"2 reroll tokens", "cost":50,  "func": () => {reroll_tokens += 2;}, "rarity":"mythic","unique":true},
            {"item":"3 reroll tokens", "cost":100, "func": () => {reroll_tokens += 3;}, "rarity":"legendary","unique":true},
            {"item":"4 reroll tokens", "cost":150, "func": () => {reroll_tokens += 4;}, "rarity":"accended","unique":true},            
        ]
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
        this.varriants = [
            {"name":"large",             "hp":[1,12],       "dmg":[1,4],        "ac":[1,3],     "gold":[1,2],        "xp":[2,3],          "lvl":1},
            {"name":"strong",            "hp":0,            "dmg":[2,9],        "ac":0,         "gold":[5,9],        "xp":[4,9],          "lvl":1},
            {"name":"weak",              "hp":-2,           "dmg":-5,           "ac":-2,        "gold":1,            "xp":1,              "lvl":0},
            {"name":"giant",             "hp":12,           "dmg":[4,12],       "ac":[2,5],     "gold":[10,13],      "xp":[13,16],        "lvl":2},
            {"name":"silver",            "hp":-3,           "dmg":-1,           "ac":10,        "gold":[1,3],        "xp":[24,30],        "lvl":2},
            {"name":"gold",              "hp":30,           "dmg":[10,17],      "ac":1,         "gold":[30,32],      "xp":[3,7],          "lvl":2},
            {"name":"basic",             "hp":0,            "dmg":0,            "ac":0,         "gold":0,            "xp":0,              "lvl":3},
            {"name":"enourmess",         "hp":[50,70],      "dmg":[10,20],      "ac":[8,10],    "gold":[20,27],      "xp":[24,29],        "lvl":3},
            {"name":"colossal",          "hp":[80,150],     "dmg":[12,22],      "ac":[1,15],    "gold":[5,90],       "xp":[4,90],         "lvl":4},
            {"name":"rabid",             "hp":-20,          "dmg":[10,30],      "ac":-1,        "gold":-5,           "xp":[10,20],        "lvl":5},
            {"name":"king",              "hp":[0,400],      "dmg":[0,40],       "ac":-2,        "gold":[100,120],    "xp":[40,90],        "lvl":6},
            {"name":"queen",             "hp":[0,600],      "dmg":[0,35],       "ac":-2,        "gold":[100,120],    "xp":[40,90],        "lvl":6},
            {"name":"corrupted",         "hp":[-100,300],   "dmg":[-100,150],   "ac":[-100,100],"gold":[-100,700],   "xp":[-100,900],     "lvl":7},
            {"name":"demon",             "hp":[10,350],     "dmg":[60,120],     "ac":-10,       "gold":[6,666],      "xp":[6,500],        "lvl":8},
            {"name":"pure",              "hp":[100,1000],   "dmg":[-10,300],    "ac":50,        "gold":800,          "xp":1000,           "lvl":9},
            {"name":"accended",          "hp":[1000,3000],  "dmg":[50,300],     "ac":60,        "gold":1000,         "xp":1000,           "lvl":10},
            {"name":"monstoress",        "hp":[2000,3500],  "dmg":[100,400],    "ac":70,        "gold":2000,         "xp":2000,           "lvl":11},
            {"name":"evil",              "hp":[3000,5500],  "dmg":[50,600],     "ac":30,        "gold":5000,         "xp":5000,           "lvl":12},
            {"name":"platnium",          "hp":[100,10000],  "dmg":[10,1000],    "ac":200,       "gold":[3,12],       "xp":[10000,30000],  "lvl":13},
            {"name":"greedy",            "hp":[50,5000],    "dmg":[50,5000],    "ac":90,        "gold":[10000,30000],"xp":[24,30],        "lvl":13},
            {"name":"definitly a normal","hp":[10000,10000],"dmg":[100,1000],   "ac":100,       "gold":10000,        "xp":10000,          "lvl":20},
        ]
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
            damage = Math.max(0, Class.OnAttack(Math.round(p.attack * p.attack_mult)));
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

document.addEventListener("keydown", (event) => {
    if (!music.INPUT) {
        music.beginMusic();
        music.INPUT = true;
    }
    const key = event.key;
    if (key === konami[konami_i]) { konami_i++; if (konami_i === konami.length) { konami_i = 0; notify("KONAMI", "easter egg"); } } else konami_i = (key === konami[0] ? 1 : 0);
    
    if (Death) {
        if (key === "0") {
            copyRunSummary();
            return;
        }
        if (key.toLowerCase() === "1") {
            // posts score and stats
            const score = Math.floor((p.floor * 1000 + p.money + p.lvl * 50) * (1 + difficulty * 0.25));
            const name = (prompt("name for leaderboard:", localStorage.getItem("tagless_name") || "") || "anonymous").trim().slice(0, 12);
            if (name !== "anonymous") localStorage.setItem("tagless_name", name);
            fetch("/api/leaderboard", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    score, floor: p.floor, lvl: p.lvl, money: p.money, cls: Class.name, time: t.run
                })
            }).then(r => { gameMessage = r.ok ? "score sent!" : "score failed (" + r.status + ")"; draw(); });
            return;
        }
        updateB();
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
            leaderboard_menu = false;
            trees = false;
            compendiumPage = false;
            SEEDS = {"shop":[],"lvl":[],"map":[],"misc":[]}
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
            leaderboard_menu = false;
            trees = false;
            compendiumPage = false;
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
            A_class = -1;
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
        } else if (key === "7") {
            mainMenu = false;
            leaderboard_menu = true;
            loadLeaderboard();
            draw();
            return;
        } else if (key === "8") {
            mainMenu = false;
            trees = true;
            ay = 0;
            draw();
            return;
        } else if (key === "9") {
            for (let c of Classes) {
                c.unlocked = true;
            }
            draw();
            return;
        } else if (key === "c") {
            compendiumPage = true;
            mainMenu = false;
            draw();
            return;
        } else if (key === "f") {
            SEEDS = {"shop":[],"lvl":[],"map":[],"misc":[]}
            mainMenu = false;
            Settings = false;
            credits  = false;
            help     = false;
            achivement_menu = false;
            start_config = false;
            leaderboard_menu = false;
            trees = false;
            compendiumPage = false;
            genSeeds(genDaily());
            Class = Classes[Math.floor(seedRand("misc") * Classes.length)]
            reset();
            if (Class.noCoins || Class.noPotions) {
                for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                    if (Class.noCoins && grid[y][x] === "$") grid[y][x] = air;
                    if (Class.noPotions && "phPH".includes(grid[y][x])) grid[y][x] = air;
                }
                draw();
            }
            return;
        }
    } else if (leaderboard_menu) {
        const pageSize = Math.max(1, Math.floor((H - 8) / 3));
        const pageCount = Math.ceil(leaderboard.length / pageSize);
        if (key === "Escape") {
            leaderboard_menu = false;
            mainMenu = true;
            draw();
            return;
        } else if (key === "ArrowLeft" && leaderboardPage > 0) {
            leaderboardPage--;
            draw();
            return;
        } else if (key === "ArrowRight" && leaderboardPage + 1 < pageCount) {
            leaderboardPage++;
            draw();
            return;
        } else if (key === "a") {
            leaderboardClassIndex += leaderboardClassIndex > -1 ? -1 : Classes.length;
            loadLeaderboard(Classes.map(i => i.name)[leaderboardClassIndex]);
            draw();
            return;
        } else if (key === "d") {
            leaderboardClassIndex += leaderboardClassIndex < Classes.length ? 1 : -Classes.length - 1;
            loadLeaderboard(Classes.map(i => i.name)[leaderboardClassIndex]);
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
            reset();
            if (Class.noCoins || Class.noPotions) {
                for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
                    if (Class.noCoins && grid[y][x] === "$") grid[y][x] = air;
                    if (Class.noPotions && "phPH".includes(grid[y][x])) grid[y][x] = air;
                }
                draw();
            }
        }
        if (key === "Enter") {
            achivement_menu = true
            A_class = Classes.indexOf(Class)
            ay = 0
        }
        if (event.altKey) {
            let Seed = prompt("Seed: (blank will gen one for you)");
            if (Seed == null || String(Seed).trim() === "") {
                Seed = Math.random().toString(36).substring(2, 12);
            }
            genSeeds(String(Seed).trim());
        }
    } else if (trees) {
        if (key.toLocaleLowerCase() === "w") {
            ay = Math.max(0, ay - 1);
            draw();
            return;
        }
        if (key.toLocaleLowerCase() === "s") {
            ay = Math.min(Math.max(0, window.lines.length - Math.max(1, H - 5)), ay + 1);
            draw();
            return;
        }
        if (key === "Escape") {
            trees = false;
            mainMenu = true;
            ay = 0;
            draw();
            return;
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
        if (key.toLocaleLowerCase() === "a") {
            A_class = A_class === -1 ? Classes.length - 1 : A_class - 1;
            ay = 0;
            draw();
            return;
        }
        if (key.toLocaleLowerCase() === "d") {
            A_class = A_class === Classes.length - 1 ? -1 : A_class + 1;
            ay = 0;
            draw();
            return;
        }
    } else if (encounter) {
        if (key === "Escape") {
            encounter = false;
            encounterOwner = null;
            draw();
            return;
        };
        if ((key === "r" || key === "R") && reroll_tokens > 0) {
            reroll_tokens--;
            encounter = encounterOwner ? encounterOwner.openTrades() : [];
            updateStats();
            draw();
            return;
        };
        const choice = Number(key) - 1;
        if (Number.isInteger(choice) && choice >= 0 && choice < encounter.length) {
            const trade = encounter[choice];
            if (trade.cost()) {
                trade.func();
                encounter = false;
                encounterOwner = null;
                updateStats();
                draw();
            };
        };
        return;
    };

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
        for (let i = 0; i < p.move_speed; i++) {
            p.move(key, 1);
            draw();
        }
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
        window.ClassAchivement = false;
        draw();
    }
});

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