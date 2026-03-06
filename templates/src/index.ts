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
    ScoreProperty,
} from 'brick-engine-js';

/**
 * This is the main class of your game.
 * It extends 'Game', which provides the lifecycle and access to the engine's modules.
 */
export default class MyGame extends Game {
    /**
     * Initial player state.
     * 'Cell' represents a single square on the grid.
     */
    private initialPlayerCell: Cell = {
        value: 1,
        color: Color.CYAN,
        coordinate: {
            x: 5,
            y: 17,
        },
    };

    // Initial difficulty settings
    private initialSpawnEnemyInterval = 500;
    private spawnEnemyInterval = 500;

    private initialMoveEnemiesDownInterval = 100;
    private moveEnemiesDownInterval = 100;

    // Difficulty increase rates as level goes up
    private increaseMoveEnemiesDownIntervalRate = 5;
    private increaseSpawnEnemyIntervalRate = 25;

    // Current game state
    private player: Cell = this.initialPlayerCell;
    private enemies: Cell[] = [];
    private enemyColor = Color.RED;
    private enemyValue = 2;

    /**
     * setupGame() is called once when the engine is initialized.
     * Use this to configure controls, data persistence, and initial events.
     */
    setupGame(): void {
        // Destructure only the modules we need
        const { control, session, grid, score, sound } = this.modules;

        // Reset game local state when starting/restarting.
        this.player = this.initialPlayerCell;

        /**
         * The 'session' module allows saving and loading game state.
         * This is useful so the player doesn't lose progress on page refresh.
         */
        session.register({
            serialId: 'game-data', // Unique identifier for this data set
            deserialize: (data: string) => {
                if (!data) return;
                const { player, enemies } = JSON.parse(data);
                this.player = player;
                this.enemies = enemies;
            },
            serialize: () => {
                return JSON.stringify({
                    player: this.player,
                    enemies: this.enemies,
                });
            },
        });

        /**
         * Control Configuration.
         * Subscribe functions to be executed when specific keys are pressed or held.
         */

        // Move Left (single press)
        control.subscribeForPlayingScreen(
            ControlKey.LEFT,
            ControlEventType.PRESSED,
            () => {
                this.player = grid.moveCellLeft(this.player);
            },
        );

        // Move Right (single press)
        control.subscribeForPlayingScreen(
            ControlKey.RIGHT,
            ControlEventType.PRESSED,
            () => {
                this.player = grid.moveCellRight(this.player);
            },
        );

        // Move Left (held down)
        control.subscribeForPlayingScreen(
            ControlKey.LEFT,
            ControlEventType.HELD,
            () => {
                this.player = grid.moveCellLeft(this.player);
            },
        );

        // Move Right (held down)
        control.subscribeForPlayingScreen(
            ControlKey.RIGHT,
            ControlEventType.HELD,
            () => {
                this.player = grid.moveCellRight(this.player);
            },
        );

        /**
         * Listen for score changes to increase level and difficulty.
         */
        score.subscribe(ScoreProperty.SCORE, () => {
            // Increase speed every 50 points
            if (
                score.score > 0 &&
                score.score % 50 === 0 &&
                score.level < score.maxLevel
            ) {
                // Adjust time intervals to make the game faster
                this.moveEnemiesDownInterval =
                    this.initialMoveEnemiesDownInterval -
                    score.level * this.increaseMoveEnemiesDownIntervalRate;

                this.spawnEnemyInterval =
                    this.initialSpawnEnemyInterval -
                    score.level * this.increaseSpawnEnemyIntervalRate;

                // Increase level in the score module
                score.increaseLevel(1);
            }
        });

        // Play different sounds as the level increases
        score.subscribe(ScoreProperty.LEVEL, () => {
            if (score.level < 6) {
                sound.play(Sound.SCORE_2);
            } else {
                sound.play(Sound.SCORE_3);
            }
        });
    }

    /**
     * update() is the main game logic loop.
     * It runs every frame to process movement, collisions, and render to the grid.
     */
    update(): void {
        const { grid, state, score, sound, time } = this.modules;

        /**
         * The 'time' module handles timing deterministically.
         * time.every(ms, callback) runs the function every millisecond interval.
         */

        // 1. Move enemies down
        time.every(this.moveEnemiesDownInterval, () => {
            this.enemies = this.enemies
                .filter(enemy => enemy.coordinate.y !== grid.bottomRow) // Remove if they reach the bottom
                .map(enemy => grid.moveCellDown(enemy)); // Move them down

            // 2. Check collisions between enemies and the player (or other occupied areas)
            const collision = this.enemies.find(enemy =>
                grid.isAreaOccupied([enemy.coordinate]),
            );

            if (collision) {
                sound.play(Sound.EXPLOSION);
                state.triggerGameOver(); // End the game
                return;
            }
        });

        // 3. Spawn new enemies at random positions at the top
        time.every(this.spawnEnemyInterval, () => {
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
        });

        /**
         * Grid Rendering.
         * Clear the grid first, then 'stamp' objects onto it.
         */
        grid.resetGrid();

        // Draw Player
        grid.stampCell(this.player);

        // Draw all enemies
        // grid.stampPiece accepts a collection of cells
        grid.stampPiece(this.enemies);

        // 4. Increase score automatically over time
        time.every(this.moveEnemiesDownInterval, () => {
            score.increaseScore(1);
        });
    }

    /**
     * render() is used for visual-only elements that don't affect collision (e.g., HUD).
     */
    render(): void {}

    /**
     * Draw the title screen interface.
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
     * Draw the Game Over screen interface.
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
