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
            fetch("https://api.github.com/repos/no10123/tagless/issues", {
                method: "POST",
                headers: {"Authorization": "token " + token, "Content-Type": "application/json", "Accept": "application/vnd.github+json"},
                body: JSON.stringify({
                    title: `[${score}] ${name} | floor ${p.floor} | ${Class.name} | ${formatTime(t.run)} | ${difficulty}`,
                    labels: ["score"],
                    body: JSON.stringify({score, floor: p.floor, lvl:p.lvl, money:p.money, cls: Class.name, time: t.run})
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
            renderMode = renderMode === "ascii" ? "art" : "ascii"; 
            localStorage.setItem("tagless_render_mode", renderMode); 
            updateWH();  
            if (p) { 
                newFloor({ 
                    openRatio: 0.34 + seedRand("map") * 0.16, 
                    pillars: randomInt([ Math.max(4, Math.floor(W * H * 0.006)), Math.max(8, Math.floor(W * H * 0.018)) ]), 
                    brush: seedRand("map") < 0.8 ? 1 : 2, countAsFloor: false 
                }); 
                if (s) s.place(); 
                if (m) { 
                    if (Class.noCoins) m.clear(); 
                    else m.spawn(); 
                } 
                enemy = new Enemy(); 
            } 
            draw();
        } else if (key === "8") {
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