/*
function setup() {
  const data = tf.tensor([1, 2, 3, 4]);
  console.log("data1 :" + data.toString());

  const data2 = tf.tensor([0,0,127,255], [2, 2]);
  console.log("data2 :" + data2.toString());

  const data3 = tf.tensor([0,0,127,255, 100, 50, 24, 54], [2, 2, 2]);
  console.log("data3 :" + data3.toString());

  const data4 = tf.tensor([0,0,127.5,255, 100, 50, 24, 54], [2, 2, 2], 'int32');
  console.log("data4 :" + data4.toString());

  const values = [];
  for (let i = 0; i < 15; i++) {
    values[i] = Math.random() * 100;
  }

  const shape = [5, 3];
  const data5 = tf.tensor(values, shape);

  console.log("data5 :" + data5.toString());

  const values2 = [];
  for (let i = 0; i < 30; i++) {
    values2[i] = Math.random() * 100;
  }

  const shape2 = [2, 5, 3];
  const data6 = tf.tensor(values2, shape2);

  console.log("data6.toString() :" + data6.toString());

  const num = tf.scalar(4);
  num.print();

  const num2 = tf.tensor(4);
  num2.print();

  const values3 = [];
  for (let i = 0; i < 30; i++) {
    values3[i] = Math.random() * 100;
  }

  const shape3 = [2, 5, 3];
  const tense = tf.tensor3d(values3, shape3, 'int32');
  const vtense = tf.variable(tense); // 텐서를 변수로 만들어 줍니다.

  console.log("vtense : " + vtense);

  console.log("tense.toString() :" + tense.toString());
  console.log("tense.data() :" + tense.data());

  console.log("tense.print() === console.log(tense.toString())");
  tense.print();

  

  tense.data().then((stuff) => {
    // console.log("tense.data().then => "+ stuff);
  });

  // 1차원으로 돌아간걸 알수 있음..
  console.log("tense.dataSync() => "+ tense.dataSync());
  
  // get(0) 안됨
  // console.log(tense.get(0));
  console.log(tense.dataSync()[0]);


  const tense2 = tf.tensor3d(values3, shape3, 'int32');
  console.log("tense : " + tense.toString());
  console.log("tense2 : " + tense2.toString());
  
  console.log("tense.add(tense2) : " + tense.add(tense2).toString());

  console.log("tense.mul(tense2) : " + tense.mul(tense2).toString());

  // 아래 렬 곱은 애러가 난다. 행과 열이 뭐 같아야 곱이 된다.
  // console.log("tense.matMul(tense2) : " + tense.mul(tense2).toString());

  const shapeA = [5,3];
  const shapeB = [3,5];

  const tenseA = tf.tensor2d(values, shapeA, 'int32');
  const tenseB = tf.tensor2d(values, shapeB, 'int32');
  const tenseC = tf.tensor2d(values, shapeA, 'int32').transpose();

  console.log("tenseA : "+tenseA.toString());
  console.log("tenseB : "+tenseB.toString());
  console.log("tenseC : "+tenseC.toString());

  console.log("tenseA.matMul(tenseB)");
  tenseA.matMul(tenseB).print();

  console.log("tenseA.matMul(tenseC)");
  tenseA.matMul(tenseC).print();
};

function draw() {
  const values = [];
  for (let i = 0; i < 15; i++) {
    values[i] = Math.random() * 100;
  }

  const shape = [5,3];

  const tenseA = tf.tensor(values, shape, 'int32');
  const tenseB = tf.tensor(values, shape, 'int32');
  const tenseB_t = tenseB.transpose();

  const tenseC = tenseA.matMul(tenseB_t);
  
  // 메모리 누수 막기

  tenseA.dispose();
  tenseB.dispose();
  tenseC.dispose();
  tenseB_t.dispose();

  console.log(tf.memory().numTensors);
}

function draw2() {
  const values = [];
  for (let i = 0; i < 15; i++) {
    values[i] = Math.random() * 100;
  }

  const shape = [5,3];

  // 메모리 누수 막기
  tf.tidy(() => {
    const tenseA = tf.tensor(values, shape, 'int32');
    const tenseB = tf.tensor(values, shape, 'int32');
    const tenseB_t = tenseB.transpose();

    const tenseC = tenseA.matMul(tenseB_t);
  });

  console.log(tf.memory().numTensors);
}
*/

let x_vals = [];
let y_vals = [];

let m, b;

const learnignRate = 0.005;
const optimizer = tf.train.sgd(learnignRate);

function setup() {
  createCanvas(400, 400);
  m = tf.variable(tf.scalar(random(1)));
  b = tf.variable(tf.scalar(random(1)));
}

function loss(pred, labels) { // 오차 구하기..
  return pred.sub(labels).square().mean();
}

function predict(x) { // 선형식
  const xs = tf.tensor1d(x);
  // y = mx + b;

  const ys = xs.mul(m).add(b);
  return ys;
}

function mousePressed() {
  let x = map(mouseX, 0, width, 0, 1);
  let y = map(mouseY, 0, height, 1, 0);
  x_vals.push(x);
  y_vals.push(y);
}

function draw() { // tensorflow.js 104 선형회귀

  tf.tidy(() => {
    if (x_vals.length > 0) {
      const ys = tf.tensor1d(y_vals);
      optimizer.minimize(() => loss(predict(x_vals), ys));
    }
  });

  background(0);

  stroke(255);
  strokeWeight(8);
  for (let i = 0; i< x_vals.length; i++) {
    let px = map(x_vals[i], 0, 1, 0, width);
    let py = map(y_vals[i], 0, 1, height, 0);

    point(px, py);
  }

  const lineX = [0, 1];
  const ys = tf.tidy(() => predict(lineX));
  let lineY = ys.dataSync();
  ys.dispose();

  let x1 = map(lineX[0], 0, 1, 0, width);
  let x2 = map(lineX[1], 0, 1, 0, width);

  let y1 = map(lineY[0], 0, 1, height, 0);
  let y2 = map(lineY[1], 0, 1, height, 0);

  strokeWeight(2);
  line(x1, y1, x2, y2);

  //noLoop();
}