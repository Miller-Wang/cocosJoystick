import {
  _decorator,
  Component,
  Node,
  Director,
  input,
  Input,
  macro,
  KeyCode,
  Quat,
  SkeletalAnimation,
  Vec3,
  EventTouch,
  misc,
  CCInteger,
  v3,
} from "cc";
const { ccclass, property } = _decorator;

import { instance, SpeedType, SET_JOYSTICK_TYPE, JoystickType } from "./Joystick";
import type { JoystickDataType } from "./Joystick";

@ccclass("Hero")
export class Hero extends Component {
  input: any = {};

  @property({
    displayName: "Move Dir",
    tooltip: "移动方向",
  })
  moveDir = new Vec3(1, 0, 0);

  @property({
    tooltip: "速度级别",
  })
  _speedType: SpeedType = SpeedType.STOP;

  @property({
    type: CCInteger,
    tooltip: "移动速度",
  })
  _moveSpeed = 0;

  speed: number = 3;

  hero: Node = null;

  heroAnim: SkeletalAnimation = null;

  onLoad() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    instance.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    instance.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    instance.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

    instance.emit(SET_JOYSTICK_TYPE, JoystickType.FIXED);
  }

  onTouchStart() {
    this.heroAnim.play("run");
  }

  onTouchMove(event: EventTouch, data: JoystickDataType) {
    this._speedType = data.speedType;
    this.moveDir = v3(-data.moveVec.x, 0, data.moveVec.y);

    this.onSetMoveSpeed(this._speedType);
  }

  onTouchEnd(event: EventTouch, data: JoystickDataType) {
    this._speedType = data.speedType;

    this.onSetMoveSpeed(this._speedType);
    this.heroAnim.play("idle01");
  }

  /**
   * set moveSpeed by SpeedType
   * @param speedType
   */
  onSetMoveSpeed(speedType: SpeedType) {
    switch (speedType) {
      case SpeedType.STOP:
        this._moveSpeed = 0;
        break;
      case SpeedType.NORMAL:
        this._moveSpeed = 2;
        break;
      case SpeedType.FAST:
        this._moveSpeed = 3;
        break;
      default:
        break;
    }
  }

  /**
   * 移动
   */
  move() {
    // 设置方向
    this.hero.setRotationFromEuler(0, misc.radiansToDegrees(Math.atan2( this.moveDir.x, this.moveDir.z)));

    const oldPos = this.node.getPosition();
    const newPos = oldPos.add(
      // fps: 60
      this.moveDir.clone().multiplyScalar(this._moveSpeed / 60)
    );
    console.log(this._moveSpeed / 60);
    this.node.setPosition(newPos);

    console.log(newPos);
  }

  start() {
    this.hero = this.node.getChildByName("girlAll");
    this.heroAnim = this.hero.getComponent(SkeletalAnimation);
    // girl.getComponent();
    // @ts-ignore
    window.heroNode = this.hero;
  }

  onKeyDown(e) {
    this.input[e.keyCode] = true;
    this.heroAnim.play("run");

    if (this.input[KeyCode.ARROW_LEFT] || this.input[KeyCode.KEY_A]) {
      console.log("左");
      this.hero.setRotationFromEuler(0, 90);
    } else if (this.input[KeyCode.ARROW_UP] || this.input[KeyCode.KEY_W]) {
      console.log("上");
      this.hero.setRotationFromEuler(0, 0);
    } else if (this.input[KeyCode.ARROW_DOWN] || this.input[KeyCode.KEY_S]) {
      console.log("下");
      this.hero.setRotationFromEuler(0, 180);
    } else if (this.input[KeyCode.ARROW_RIGHT] || this.input[KeyCode.KEY_D]) {
      console.log("右");
      this.hero.setRotationFromEuler(0, -90);
    }
  }

  onKeyUp(e) {
    this.input[e.keyCode] = false;
    this.heroAnim.play("idle01");
  }

  update(dt: number) {
    const pos = this.node.getPosition();
    if (this.input[KeyCode.ARROW_LEFT] || this.input[KeyCode.KEY_A]) {
      console.log("左");
      pos.x += this.speed * dt;
    } else if (this.input[KeyCode.ARROW_UP] || this.input[KeyCode.KEY_W]) {
      console.log("上");
      pos.z += this.speed * dt;
    } else if (this.input[KeyCode.ARROW_DOWN] || this.input[KeyCode.KEY_S]) {
      console.log("下");
      pos.z -= this.speed * dt;
    } else if (this.input[KeyCode.ARROW_RIGHT] || this.input[KeyCode.KEY_D]) {
      console.log("右");
      pos.x -= this.speed * dt;
    }
    this.node.setPosition(pos);

    if (this._speedType !== SpeedType.STOP) {
      this.move();
    }
  }
}
