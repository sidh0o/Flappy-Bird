import { _decorator, Component, director, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startScript')
export class startScript extends Component {
    onLoad() {
        director.preloadScene("gamePlay");
        this.node.on(Input.EventType.TOUCH_START, this.startGame, this);
    }
    start() {




    }
    startGame() {
        director.loadScene('gamePlay');
    }

    update(deltaTime: number) {

    }
}

