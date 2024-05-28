import { _decorator, Component, Node, Prefab, input, Input, tween, UITransform, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('game')
export class game extends Component {
    @property(Node) KnifeNode: Node = null!
    @property(Node) TargetNode: Node = null!
    @property(Prefab) KnifePrefab: Prefab = null!

    // 是否可以抛出
    private canThrow: boolean = true
    // 转动速度
    private rotateSpeed: number = -3
    // 已抛出刀组
    throwKnifes = new Set()

    // 目标位置
    private targetPosition
    // 原始刀的位置
    private originalKnifePosition
    // 游戏状态
    gameState = true

    onLoad () {
        input.on(Input.EventType.TOUCH_START, this.onTouchThrowingKnife, this)
    }

    onDestroy () {
        input.off(Input.EventType.TOUCH_START, this.onTouchThrowingKnife)
    }

    start() {
        this.originalKnifePosition = this.KnifeNode.getPosition()
        this.TargetNode.getChildByName('knifeTarget').setSiblingIndex(this.TargetNode.children.length - 1)
        // 获取目标位置
        this.targetPosition = this.TargetNode.getPosition()
        // y轴减去目标的一半
        this.targetPosition.y = this.targetPosition.y - this.KnifeNode.getComponent(UITransform).height / 2
    }

    update(deltaTime: number) {
        this.gameState && (this.TargetNode.angle = (this.TargetNode.angle + this.rotateSpeed) % 360)
    }

    onTouchThrowingKnife () {
        if (!this.canThrow) return
        this.canThrow = false

        tween(this.KnifeNode)
            .to(0.1, { position: this.targetPosition })
            .call(() => {
                // 获取当前目标靶的欧拉角
                let targetEuler = this.TargetNode.angle
                // 加载预制体
                let knifeNode = instantiate(this.KnifePrefab)
                knifeNode.parent = this.TargetNode
                let knifeTransform = knifeNode.getComponent(UITransform)
                knifeTransform.anchorX = 0.5
                knifeTransform.anchorY = 1
                knifeNode.angle = 360 -targetEuler
                knifeNode.setSiblingIndex(0)

                // 判定游戏死亡15°
                let arr = new Array(15).fill(0)
                arr.map((i, index) => {
                    let num = knifeNode.angle + index
                    console.log(this.throwKnifes)
                    if (this.throwKnifes.has(num)) {
                        console.log(num)
                        this.gameState = false
                    }
                    this.throwKnifes.add(num)

                })
            })
            .call(() => {
                if (!this.gameState) {
                    this.gameState = false
                    console.log('游戏结束')
                    return
                }
                this.KnifeNode.setPosition(this.originalKnifePosition)
                this.canThrow = true
            })
            .start()
    }
}


