const body = document.getElementById("body");
let W = 40;
let H = 20;
let grid = [];
const air = "#"

function cls() {
    grid = [];
    for (let i = 0; i < H; i++) {
        grid.push(new Array(W).fill(air));
    }
}

function draw() {
    let display = "\n  " + " ".repeat(W);    
    for (let i = 0; i < grid.length; i++) {
        display += "\n    " + grid[i].join(""); 
    }    
    body.innerText = display; 
}

class Player {
    constructor(x, y, sym) {
        this.x = x;
        this.y = y;
        this.sym = sym;
        this.place(this.sym);
    }    
    place(sym) {
        grid[this.y][this.x] = sym;
    }    
    move(dir, a) {
        this.place(air); 
        if (dir == "w") this.y -= a;
        if (dir == "a") this.x -= a;
        if (dir == "s") this.y += a;
        if (dir == "d") this.x += a;
        this.place(this.sym);
    }
}

cls();

const p = new Player(10, 10, "@"); 

draw();
document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    
    if (["w", "a", "s", "d"].includes(key)) {
        p.move(key, 1);
        draw();
    }
});