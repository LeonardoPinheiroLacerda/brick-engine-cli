import {
    Game,
    FontSize,
    ControlKey,
    ControlEventType,
    Sound,
    FontAlign,
    FontVerticalAlign,
    Color,
    Cell,
} from 'brick-engine-js';

export default class MyGame extends Game {
    private initialPlayerCell: Cell = {
        value: 1,
        color: Color.CYAN,
        coordinate: {
            x: 5,
            y: 17,
        },
    };
    private initialTickInterval = 200;

    private player: Cell = this.initialPlayerCell;

    private enemies: Cell[] = [];
    private enemyColor = Color.RED;
    private enemyValue = 2;

    private spawnRate = 5; // Ticks between spawns

    /**
     * Called once after the engine and its modules are fully initialized.
     */
    setupGame(): void {
        const { control, session, grid, score, time } = this.modules;

        // Reset game local state when starting/restarting.
        this.player = this.initialPlayerCell;
        time.setTickInterval(this.initialTickInterval);

        // Register how game data should be serialized and deserialized for the session
        session.register({
            // Unique identifier for the session data
            serialId: 'game-data',
            // Recieves from LocalStorage and restore the game state
            deserialize: (data: string) => {
                if (!data) return;
                const { player, enemies } = JSON.parse(data);
                this.player = player;
                this.enemies = enemies;
            },
            // Prepare data to be saved to LocalStorage
            serialize: () => {
                return JSON.stringify({
                    player: this.player,
                    enemies: this.enemies,
                });
            },
        });

        // Move Left
        control.subscribeForPlayingScreen(
            ControlKey.LEFT,
            ControlEventType.PRESSED,
            () => {
                this.player = grid.moveCellLeft(this.player);
            },
        );

        // Move Right
        control.subscribeForPlayingScreen(
            ControlKey.RIGHT,
            ControlEventType.PRESSED,
            () => {
                this.player = grid.moveCellRight(this.player);
            },
        );
    }

    /**
     * Logic update on every game "tick".
     */
    update(): void {
        const { grid, state, score, sound, time } = this.modules;

        // 1. Move enemies down
        this.enemies = this.enemies
            .filter(enemy => enemy.coordinate.y !== grid.bottomRow)
            .map(enemy => grid.moveCellDown(enemy));

        // 2. Spawn new enemy
        if (time.isTickEvery(this.spawnRate)) {
            const spawnX = Math.floor(Math.random() * grid.width);

            const newEnemy = {
                coordinate: {
                    x: spawnX,
                    y: grid.topRow,
                },
                color: this.enemyColor,
                value: this.enemyValue,
            };

            this.enemies.push(newEnemy);
        }

        // 3. Check collisions
        const collision = this.enemies.find(enemy =>
            grid.isAreaOccupied([enemy.coordinate]),
        );

        if (collision) {
            sound.play(Sound.EXPLOSION);
            state.triggerGameOver();
            return;
        }

        // 4. Update Grid
        grid.resetGrid();

        // Draw Player
        // Cell is a class that represents a single cell in the grid
        grid.stampCell(this.player);

        // Draw Enemies
        // Piece is a class that represents a collection of cells in the grid
        grid.stampPiece(this.enemies);

        // 5. Increase score and difficulty
        score.increaseScore(1);

        // Increase speed every 50 points, limit to 10 levels
        if (
            score.score > 0 &&
            score.score % 50 === 0 &&
            score.level < score.maxLevel
        ) {
            // Set tick interval to 200ms minus 15ms per level
            time.setTickInterval(this.initialTickInterval - 15 * score.level);

            // Increase level
            score.increaseLevel(1);

            // Play sound based on level
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

        text.setActiveText();
        text.setTextSize(FontSize.MEDIUM);
        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.writeOnDisplay('DODGE BRICK', { x: 0.5, y: 0.3 });

        text.setTextSize(FontSize.SMALL);
        text.writeOnDisplay('USE ARROWS TO MOVE', { x: 0.5, y: 0.5 });

        text.setTextSize(FontSize.MEDIUM);
        text.writePulsingTextOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }

    /**
     * Game Over Screen Layout.
     */
    drawGameOverScreen(): void {
        const { text, score } = this.modules;

        text.setActiveText();
        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.setTextSize(FontSize.MEDIUM);
        text.writeOnDisplay('GAME OVER', { x: 0.5, y: 0.4 });

        text.setTextSize(FontSize.SMALL);
        text.writeOnDisplay(`FINAL SCORE: ${score.score}`, { x: 0.5, y: 0.55 });

        text.setTextSize(FontSize.MEDIUM);
        text.writePulsingTextOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }
}
