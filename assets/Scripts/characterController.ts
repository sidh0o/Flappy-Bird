import {
  _decorator,
  Component,
  director,
  Input,
  instantiate,
  lerp,
  Node,
  NodePool,
  Prefab,
  random,
  randomRange,
  randomRangeInt,
  UITransform,
  Vec3, game, Label, UI
} from "cc";

const { ccclass, property } = _decorator;
let birdBounce: boolean = false;
let hurdleStart: boolean = false;
let birdAngle: boolean = false;
let stopHurdleGeneration = false;

let startCollisionDetector = false;
@ccclass("characterController")
export class characterController extends Component {
  score = 0;
  @property({ type: Node })
  flappyBird: Node = null;
  @property({ type: Prefab })
  hurdle: Prefab = null;
  @property
  hurdlePool = null;
  @property
  hurdle_NodePool = null;
  @property
  hurdleReRenderFlag = false;

  @property({type:Prefab})
  backGround:Prefab = null;




  @property({ type: Node })
  gameover: Node = null;

  backgroundNodePool = null;

  onLoad() {
    this.node.on(Input.EventType.TOUCH_START, this.birdController, this);

    this.putNodesOnNodePool();

    // creating backgroundNodePool
    this.createBackGroundPool();
    // director.preloadScene("Start");
    this.node.getChildByName("GameOver").active = false;
    // this.gameover.on(Input.EventType.TOUCH_START, this.loadStartScene)

  }
  createBackGroundPool()
  {
    this.backgroundNodePool = new NodePool();
    let init = 4;
    for(let i=0;i<init;i++)
    {
      let backgroundInstance = instantiate(this.backGround);
     backgroundInstance.name = "background";
     this.backgroundNodePool.put(backgroundInstance);
    }
  }

  createBackGround()
  {
    if(this.backgroundNodePool.size()){
    let backgroundInstance  = this.backgroundNodePool.get();
    let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
    let backGroundSize = backgroundInstance.getComponent(UITransform).contentSize.width;
    let BGPos = backgroundInstance.getPosition();
    BGPos.x = canvasWidth*0.5 + backGroundSize*0.5;
    backgroundInstance.setPosition(BGPos);
    this.node.getChildByName("BackGround").addChild(backgroundInstance);
    }
  }

  // loadStartScene() {

  //   director.loadScene("Start");
  //   startCollisionDetector = true;
  //   stopHurdleGeneration = false;
  // }
  putNodesOnNodePool() {
    this.hurdlePool = new NodePool();
    let init = 5;
    for (let i = 0; i < init; i++) {
      let hurdleInstance = instantiate(this.hurdle);
      hurdleInstance.name = "hurdleName"
      this.hurdlePool.put(hurdleInstance);

    }
    // this.createHurdle();

    this.hurdleReRenderFlag = true;
  }

  start() { this.scheduleOnce(this.scheduleCreateHurdle, 2); 
    this.schedule(this.createBackGround,2);
  }

  scheduleCreateHurdle = () => {


    let num = randomRange(1, 3)
    if (!stopHurdleGeneration) {
      this.createHurdle();
      setTimeout(this.scheduleCreateHurdle, num * 1000)
    }

    // this.unschedule(this.scheduleCreateHurdle);
    // console.log("hello");

    // this.scheduleOnce(this.scheduleCreateHurdle, 3);
  }

  createHurdle() {
    startCollisionDetector = true;
    if (this.hurdlePool.size()) {
      this.hurdle_NodePool = this.hurdlePool.get();
      let pos = this.hurdle_NodePool.getPosition();
      let canvasWidth = this.node.getComponent(UITransform).contentSize.width;

      let hurdleWidth = this.hurdle_NodePool.getComponent(UITransform).width;
      pos.x = (canvasWidth * 0.5 + hurdleWidth * 0.5);
      pos.y = randomRangeInt(-10, 10) * 10;
      this.hurdle_NodePool.setPosition(pos);
      // this.node.getChildByName("Hurdle").getChildByName("hurdleName").children[2].active = true;
      this.hurdle_NodePool.getChildByName("scoreNode").active = true;
      this.node.getChildByName("Hurdle").addChild(this.hurdle_NodePool);
      // this.hurdlePool.put(this.hurdle_NodePool);
    }

    console.log("create hurdle chal riha");

    hurdleStart = true;
  }



  birdController() {
    hurdleStart = true;
    let birdOldPosition: Vec3 = this.flappyBird.getPosition();

    birdOldPosition.y = birdOldPosition.y + 50;
    let birdNewPostion: Vec3 = birdOldPosition;
    this.flappyBird.angle = 15;
    this.flappyBird.setPosition(birdNewPostion);
    birdBounce = true;

    setTimeout(() => {
      birdAngle = true;
    }, 100);


  }



  goDown = (deltaTime) => {
    if (birdAngle == false) {
      this.flappyBird.angle = -30;
    }
    let birdOldPosition: Vec3 = this.flappyBird.getPosition();
    let canvasSize = this.node.getComponent(UITransform).contentSize.height;
    let birdHeight = (this.node.getComponent(characterController).flappyBird.getComponent(UITransform).contentSize.height) / 2 + 3;

    if (birdBounce == true &&
      Math.floor(birdOldPosition.y) >
      -1 * Math.ceil(canvasSize / 2) + birdHeight
    ) {


      lerp(birdOldPosition.y, birdOldPosition.y - 20, 0.01);
      birdOldPosition.y = birdOldPosition.y - 150 * deltaTime;
      let birdNewPostion: Vec3 = birdOldPosition;
      this.flappyBird.setPosition(birdNewPostion);

      if (Math.floor(birdOldPosition.y) == -1 * Math.ceil(canvasSize / 2) + birdHeight) {
        birdBounce = false;
        
      }
    }else{startCollisionDetector = false;
      stopHurdleGeneration = true;
      this.node.getChildByName("GameOver").active = true;}
  };

  hurdleMovement(deltaTime) {
    this.flappyBird.angle = -10;
    if (hurdleStart) {
      let hurdleChildrenArray = this.node.getChildByName("Hurdle").children
      // for (let i = 0; i < hurdleSize - 1; i++) 
      // {
      hurdleChildrenArray.forEach((hurdleElement) => {
        if (hurdleElement.name == "hurdleName") {
          let node = hurdleElement;
          let hurdleUp_1: Vec3 = node.getPosition();
          hurdleUp_1.x = hurdleUp_1.x - 200 * deltaTime;
          node.setPosition(hurdleUp_1);
          let canvasWidth = this.node.getComponent(UITransform).contentSize.width;

          let hurdleWidth = node.getComponent(UITransform).width;
          if (node.getPosition().x < ((-1 * (canvasWidth) * 0.5)) - (hurdleWidth / 2)) {
            this.hurdlePool.put(node);
          }
        }
      })

    }

  }


  //COLLISION DETECTION

  collisionDetector() {

    let hurdleArray = this.node.getChildByName("Hurdle").children;

    // let hurdleUpBoundingBox = this.node.getChildByName("Hurdle").getChildByName("hurdleName").getChildByName("hurdleUp").getComponent(UITransform).getBoundingBoxToWorld();
    // let hurdleDownBoundingBox = this.node.getChildByName("Hurdle").getChildByName("hurdleName").getChildByName("hurdleDown").getComponent(UITransform).getBoundingBoxToWorld();
    let birdBoundingBox = this.node.getChildByName("Character").getChildByName("bird").getComponent(UITransform).getBoundingBoxToWorld();


    hurdleArray.forEach((e) => {
      if (e.name == "hurdleName") {
        let scoreNodeBoundingBox = e.children[2].getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleUpBoundingBox = e.getChildByName("hurdleUp").getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleDownBoundingBox = e.getChildByName("hurdleDown").getComponent(UITransform).getBoundingBoxToWorld();

        if (birdBoundingBox.intersects(hurdleDownBoundingBox) || birdBoundingBox.intersects(hurdleUpBoundingBox)) {
          console.log("collision with Down hurdle detected");
          // director.loadScene("GameOver");
          this.node.getChildByName("GameOver").active = true;
          startCollisionDetector = false;
          stopHurdleGeneration = true;
         
          // game.pause();
        }

        if (birdBoundingBox.intersects(scoreNodeBoundingBox) && e.getChildByName("scoreNode").active) {

          e.getChildByName("scoreNode").active = false;
          this.score = this.score + 1;
          console.log("Score updated",)

          this.node.getChildByName("score").getComponent(Label).string = String(this.score);
          // game.pause()
        }
      }
    })


  }



  //BackGround Movement
  backGroundMovement(deltaTime)
  {

    
    // let oldBGPos = this.backGround.getPosition();
    // oldBGPos.x = oldBGPos.x - 10*deltaTime;
    // this.backGround.setPosition(oldBGPos); 
    let backGroundArr = this.node.getChildByName("BackGround").children;
    backGroundArr.forEach(element => {
        if(element.name == "background")
        {
          let oldBGPos =element.getPosition();
    oldBGPos.x = oldBGPos.x - 200*deltaTime;
    element.setPosition(oldBGPos); 
    let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
    let backGroundWidth = element.getComponent(UITransform).contentSize.width;
    
    if(oldBGPos.x < (-1*(canvasWidth*0.5) - backGroundWidth*0.5))
    {
      this.backgroundNodePool.put(element);
    }
        }
    });
  }


  update(deltaTime: number) {
    // if (this.hurdleReRenderFlag) {
    //   this.createHurdle();
    // }
    if (startCollisionDetector) {
      this.hurdleMovement(deltaTime);
      this.goDown(deltaTime);
      this.backGroundMovement(deltaTime);
    }


    

    if (startCollisionDetector) { this.collisionDetector(); }
  }

}
