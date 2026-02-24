import { Game, FontSize, ControlKey, ControlEventType, Sound, FontAlign, FontVerticalAlign, Color } from 'brick-engine-js';

export default class MyGame extends Game {
    y = 0;
    x = 5;

    /**
     * Called once after the engine and its modules are fully initialized.
     * Ideal for setting initial state, text sizes, and subscribing to controls.
     */
    setupGame(): void {
        const { grid, control, sound } = this.modules;

        // Example: Subscriber to ACTION button
        control.subscribe(ControlKey.ACTION, ControlEventType.PRESSED, () => {
            sound.play(Sound.ACTION_1);
            grid.stampCell({
                coordinate: { x: this.x, y: this.y },
                color: Color.CYAN,
                value: 1,
            });
            this.modules.time.decrementTickInterval(this.y);
            this.y++;
        });

        this.modules.session.register({
            serialId: 'coords',
            deserialize: data => {
                const { x, y } = JSON.parse(data);
                this.x = x;
                this.y = y;
            },
            serialize: () => {
                return JSON.stringify({ x: this.x, y: this.y });
            },
        });
    }

    /**
     * Called on every logic "tick". The frequency is defined by the game's tickInterval.
     * This is where movement, collision, and state updates should happen.
     * Logic here ONLY runs when the game is in the PLAYING state.
     */
    update(deltaTime: number): void {
        const actualCoordinate = { x: this.x, y: this.y };

        if (!this.modules.grid.isValidCoordinate(actualCoordinate)) {
            this.modules.state.triggerGameOver();
        }

        this.modules.score.increaseScore(1);
    }

    /**
     * Called every rendering frame (60fps).
     * Used for visual-only effects that don't impact game state (e.g. animations).
     * Runs during PLAYING and PAUSED states.
     */
    render(): void {
        const { text } = this.modules;

        text.setTextSize(FontSize.EXTRA_SMALL);
        text.setTextAlign(FontAlign.LEFT, FontVerticalAlign.TOP);
        text.textOnDisplay('press', { x: 0.05, y: 0.05 });
        text.textOnDisplay('action', { x: 0.05, y: 0.1 });
    }

    /**
     * Rendered every frame when the device is ON but the game hasn't started.
     * Usually displays the title and "Press Start" instructions.
     */
    drawTitleScreen(): void {
        const { text } = this.modules;

        text.setTextSize(FontSize.MEDIUM);
        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.textOnDisplay('MY GAME', { x: 0.5, y: 0.2 });

        text.setTextSize(FontSize.SMALL);
        text.textOnDisplay('running on', { x: 0.5, y: 0.48 });
        text.textOnDisplay('drawTitleScreen', { x: 0.5, y: 0.55 });

        text.setTextSize(FontSize.MEDIUM);
        text.textOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }

    /**
     * Rendered every frame when the game state reaches GAME OVER.
     * Replaces standard `render()` calls to show scores or restart messages.
     * Usually displays the game over message and "Press START to restart" instructions, and the final score.
     */
    drawGameOverScreen(): void {
        this.modules.text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);

        this.modules.text.textOnDisplay('GAME OVER', { x: 0.5, y: 0.5 });

        this.modules.text.setTextSize(FontSize.MEDIUM);
        this.modules.text.textOnDisplay('PRESS START', { x: 0.5, y: 0.8 });
    }

    getGameId() {
        return 'tetris';
    }
}
