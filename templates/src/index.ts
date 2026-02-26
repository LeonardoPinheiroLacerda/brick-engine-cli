import { Game, FontSize, ControlKey, ControlEventType, Sound, FontAlign, FontVerticalAlign, Color, Coordinate, StateProperty } from 'brick-engine-js';

export default class MyGame extends Game {
    private playerX = 5;
    private enemies: Coordinate[] = [];
    private spawnRate = 5; // Ticks between spawns
    private initTickInterval = 200;

    /**
     * Called once after the engine and its modules are fully initialized.
     */
    setupGame(): void {
        const { control, session } = this.modules;

        // Register how game data should be serialized and deserialized for the session
        session.register({
            // Unique identifier for the session data
            serialId: 'game-data',
            // Recieves from LocalStorage and restore the game state
            deserialize: (data: string) => {
                if (!data) return;
                const { playerX, enemies } = JSON.parse(data);
                this.playerX = playerX;
                this.enemies = enemies;
            },
            // Prepare data to be saved to LocalStorage
            serialize: () => {
                return JSON.stringify({
                    playerX: this.playerX,
                    enemies: this.enemies,
                });
            },
        });

        this.onStart();

        // Move Left
        control.subscribeForPlayingScreen(ControlKey.LEFT, ControlEventType.PRESSED, () => {
            this.movePlayer(-1);
        });

        // Move Right
        control.subscribeForPlayingScreen(ControlKey.RIGHT, ControlEventType.PRESSED, () => {
            this.movePlayer(1);
        });
    }

    private movePlayer(dx: number): void {
        const { grid, sound } = this.modules;

        const newX = this.playerX + dx;

        if (grid.isCoordinateValid({ x: newX, y: grid.bottomRow })) {
            this.playerX = newX;
            sound.play(Sound.KEY_PRESS);
        }
    }

    /**
     * Logic update on every game "tick".
     */
    update(): void {
        const { grid, state, score, sound, time } = this.modules;

        // 1. Move enemies down
        this.enemies = this.enemies.map(enemy => ({ x: enemy.x, y: enemy.y + 1 })).filter(enemy => grid.isCoordinateValid({ x: enemy.x, y: enemy.y }));

        // 2. Spawn new enemy
        if (time.isTickEvery(this.spawnRate)) {
            const spawnX = Math.floor(Math.random() * grid.width);
            this.enemies.push({ x: spawnX, y: grid.topRow });
        }

        // 3. Check collisions
        const playerY = grid.bottomRow;
        const collision = this.enemies.find(enemy => enemy.x === this.playerX && enemy.y === playerY);

        if (collision) {
            sound.play(Sound.EXPLOSION);
            state.triggerGameOver();
            return;
        }

        // 4. Update Grid
        grid.resetGrid();

        // Draw Player
        grid.stampCell({
            coordinate: { x: this.playerX, y: playerY },
            color: Color.CYAN,
            value: 1,
        });

        // Draw Enemies
        this.enemies.forEach(enemy => {
            grid.stampCell({
                coordinate: enemy,
                color: Color.RED,
                value: 2,
            });
        });

        // 5. Increase score and difficulty
        score.increaseScore(1);

        // Increase speed every 50 points
        if (score.score > 0 && score.score % 50 === 0 && score.level < score.maxLevel) {
            time.setTickInterval(this.initTickInterval - 15 * score.level);

            score.increaseLevel(1);

            if (score.level < 6) {
                sound.play(Sound.SCORE_2);
            } else {
                sound.play(Sound.SCORE_3);
            }
        }
    }

    /**
     * Visual-only rendering (HUD elements).
     */
    render(): void {}

    /**
     * Title Screen Layout.
     */
    drawTitleScreen(): void {
        const { text } = this.modules;

        text.setTextSize(FontSize.MEDIUM);
        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.textOnDisplay('DODGE BRICK', { x: 0.5, y: 0.3 });

        text.setTextSize(FontSize.SMALL);
        text.textOnDisplay('USE ARROWS TO MOVE', { x: 0.5, y: 0.5 });

        text.setTextSize(FontSize.MEDIUM);
        text.textOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }

    /**
     * Game Over Screen Layout.
     */
    drawGameOverScreen(): void {
        const { text, score } = this.modules;

        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.setTextSize(FontSize.MEDIUM);
        text.textOnDisplay('GAME OVER', { x: 0.5, y: 0.4 });

        text.setTextSize(FontSize.SMALL);
        text.textOnDisplay(`FINAL SCORE: ${score.score}`, { x: 0.5, y: 0.55 });

        text.setTextSize(FontSize.MEDIUM);
        text.textOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }

    /**
     * Reset game local state when starting/restarting.
     */
    onStart(): void {
        const { score, time } = this.modules;

        this.playerX = 5;
        this.enemies = [];
        time.setTickInterval(this.initTickInterval - 15 * score.level);
    }
}
