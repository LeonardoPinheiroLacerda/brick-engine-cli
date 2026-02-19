import { Game, FontSize, ControlKey, ControlEventType, Sound, FontAlign, FontVerticalAlign } from 'brick-engine-js';

export default class MyGame extends Game {
    /**
     * Called once after the engine and its modules are fully initialized.
     * Ideal for setting initial state, text sizes, and subscribing to controls.
     */
    setupGame(): void {
        // Example: Subscriber to ACTION button
        this.modules.control.subscribe(ControlKey.ACTION, ControlEventType.PRESSED, () => {
            console.log('Action pressed!');
            this.modules.sound.play(Sound.ACTION_1);
        });
    }

    /**
     * Called on every logic "tick". The frequency is defined by the game's tickInterval.
     * This is where movement, collision, and state updates should happen.
     * Logic here ONLY runs when the game is in the PLAYING state.
     */
    update(deltaTime: number): void {
        // Move players, check collisions, etc.
    }

    /**
     * Called every rendering frame (60fps).
     * Used for visual-only effects that don't impact game state (e.g. animations).
     * Runs during PLAYING and PAUSED states.
     */
    render(): void {
        const { text } = this.modules;

        text.setTextSize(FontSize.MEDIUM);
        text.setTextAlign(FontAlign.CENTER, FontVerticalAlign.CENTER);
        text.textOnDisplay('MY GAME', { x: 0.5, y: 0.2 });

        text.setTextSize(FontSize.SMALL);
        text.textOnDisplay('running on', { x: 0.5, y: 0.48 });
        text.textOnDisplay('render', { x: 0.5, y: 0.55 });

        text.setTextSize(FontSize.MEDIUM);
        text.textOnDisplay('Playing', { x: 0.5, y: 0.8 });
    }

    /**
     * returns a unique key for LocalStorage.
     * Prevents data collisions between different games on the same domain.
     */
    getPersistenceKey(): string {
        return 'my-awesome-game-v1';
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
        this.modules.text.textOnDisplay('GAME OVER', { x: 0.5, y: 0.5 });
    }
}

// CRITICAL: For "Bundle Mode" to work, the game must attach itself to the window
// after is published.
// If it's being compiled as a standalone bundle to be loaded dynamically.
// eslint-disable-next-line
(window as any).BrickEngineGame = MyGame;
