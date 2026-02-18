import { Game, ControlKey, ControlEventType, Sound } from 'brick-engine-js';

export default class MyCoolGame extends Game {
    getPersistenceKey(): string {
        return 'teste';
    }
    drawTitleScreen(): void {
        console.log('title screen');
        const { text } = this.modules;

        text.textOnDisplay('Abriu?', { x: 0.5, y: 0.5 });
    }
    drawGameOverScreen(): void {}
    setupGame() {
        console.log('SETUP GAME');

        const { control, sound } = this.modules;

        control.subscribe(ControlKey.ACTION, ControlEventType.PRESSED, () => {
            console.log('aaaa');
            sound.play(Sound.ACTION_1);
        });

        control.subscribe(ControlKey.ACTION, ControlEventType.HELD, () => {
            sound.play(Sound.ACTION_1);
        });
    }

    update() {
        // ... your update logic
    }

    render() {}
}

// CRITICAL: For "Server Mode" (Menu) to work, the game must attach itself to the window
// if it's being compiled as a standalone bundle to be loaded dynamically.
// eslint-disable-next-line
(window as any).BrickEngineGame = MyCoolGame;
