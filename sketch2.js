/*
어제 
*/

//let x1_vals = [14063434, 43811016, 22327173, 29703942, 23677989, 28130533, 28490496, 25000338, 24077996]; // 거래량
let x2_vals = []; // 전일 저가
let x3_vals = []; // 전일 고가
let x4_vals = []; // 전일 종가
let x5_vals = []; // 전일 시가

let y_vals = []; // 금일 시가

let m1, m2, m3, m4, m5, b, rows;

let learnignRate,optimizer;

let 예상가 = 0;

function test() {
  return "test";
}

function setup() {
  m1 = tf.variable(tf.scalar(random(1)));
  m2 = tf.variable(tf.scalar(random(1)));
  m3 = tf.variable(tf.scalar(random(1)));
  m4 = tf.variable(tf.scalar(random(1)));
  m5 = tf.variable(tf.scalar(random(1)));
  b = tf.variable(tf.scalar(random(1)));
}

function readExcel() {
  learnignRate = 0.000000000001;
  optimizer = tf.train.sgd(learnignRate);
  예상가 = 0;

  let input = event.target;
  let reader = new FileReader();
  reader.onload = function () {
      let data = reader.result;
      let workBook = XLSX.read(data, { type: 'binary' });
      workBook.SheetNames.forEach(function (sheetName) {
          //console.log('SheetName: ' + sheetName);
          rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
          //console.log(JSON.stringify(rows));
          dataSet(rows);
      })
  };
  reader.readAsBinaryString(input.files[0]);
}

function 알파고출력(text) {
  var t = document.getElementById('알파고');
  t.value = text;
}

function 시가입력(rows, type='시가') {
  var t = document.getElementById(type);
  t.value = Math.round(String(predict(parseFloat(rows[0].저가.replace(',','')),parseFloat(rows[0].고가.replace(',','')),parseFloat(rows[0].종가.replace(',','')),parseFloat(rows[0].시가.replace(',','')))).replace('Tensor','').replace(/a/gi,""));
  
  //console.log("t.value : " + Number(t.value));
  //console.log("예상가 : " + Number(예상가));
  console.log("차이 : " + Math.abs(Number(t.value) - Number(예상가)));

  let 소숫점예상가 = Number(String(predict(parseFloat(rows[0].저가.replace(',','')),parseFloat(rows[0].고가.replace(',','')),parseFloat(rows[0].종가.replace(',','')),parseFloat(rows[0].시가.replace(',','')))).replace('Tensor','').replace(/a/gi,""));

  let 갭 = Math.abs(소숫점예상가 - 예상가);
  if(갭 > 0.1) {
    let 러닝배율 = 1;
    if(갭 > 1) {
      러닝배율 = 1.01;
    } else if(갭 <= 1) {
      러닝배율 = 0.99;
    }

    예상가 = t.value;
    learnignRate = learnignRate * 러닝배율;
    console.log("learnignRate:"+learnignRate);
    optimizer = tf.train.sgd(learnignRate);
    start(type);
  }
}

function start(type='시가') {
  if(type=='시가') {
    $('span[id=loading시가]').removeClass('d-none');
  } else if (type=='저가') {
    dataSet(rows, '저가');
    $('span[id=loading저가]').removeClass('d-none');
  } else if (type=='고가') {
    dataSet(rows, '고가');
    $('span[id=loading고가]').removeClass('d-none');
  }

  setTimeout(function() {
    tf.tidy(() => {
      for(let i = 0; i < 10; i++) {
        const ys = tf.tensor(y_vals); // 진짜 y
        optimizer.minimize(() => loss(predict(x2_vals, x3_vals, x4_vals, x5_vals), ys));
      }
    });

    if(type=='시가') {
      $('span[id=loading시가]').addClass('d-none');
      시가입력(rows);
    } else if (type=='저가') {
      $('span[id=loading저가]').addClass('d-none');
      시가입력(rows, '저가');
    } else if (type=='고가') {
      $('span[id=loading고가]').addClass('d-none');
      시가입력(rows, '고가');
    }
  }, 1);
}

function dataSet(arr, type='시가') {
  x2_vals = []; // 전일 저가
  x3_vals = []; // 전일 고가
  x4_vals = []; // 전일 종가
  x5_vals = []; // 전일 시가
  y_vals = []; // 금일 시가
  
  let 금일시가 = 0;

  arr.reduceRight((누적값, t, i, 요소) => {
    

    if(getData() != t['일자'] && 금일시가 != 0) {
      //console.log(getData() +"!=" + t['년/월/일']);
      //console.log("날짜 : " +t['년/월/일'].replace('/','.'));
      //console.log("저가 : " +parseFloat(t.저가.replace(',','')) );
      x2_vals.push(parseFloat(t['저가'].replace(',','')));

      //console.log("고가 : " +parseFloat(t.고가.replace(',','')) );
      x3_vals.push(parseFloat(t['고가'].replace(',','')));

      //console.log("종가 : " +parseFloat(t.종가.replace(',','')) );
      x4_vals.push(parseFloat(t['종가'].replace(',','')));

      //console.log("시가 : " +parseFloat(t.시가.replace(',','')) );
      x5_vals.push(parseFloat(t['시가'].replace(',','')));

      //console.log("금일시가 : " + 금일시가);

      y_vals.push(금일시가);
    }

    금일시가 = type=='저가' ? parseFloat(t['저가'].replace(',','')) : type=='고가' ? parseFloat(t['고가'].replace(',','')) : parseFloat(t['시가'].replace(',',''));
  });
}

function getData() {
  let today = new Date();
  today.setDate(today.getDate()-1); //하루 전

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜
  let day = today.getDay();  // 요일

  return year + '/' + month + '/' + date;
}

function loss(pred, labels) { // 오차 구하기..
  return pred.sub(labels).square().mean();
}

function predict(x2, x3, x4, x5) { // 계산하여 y 구하기
  //const xs1 = tf.tensor(x1);
  const xs2 = tf.tensor(x2);
  const xs3 = tf.tensor(x3);
  const xs4 = tf.tensor(x4);
  const xs5 = tf.tensor(x5);
  // y = mx1 + mx2 + mx3 + b;

  //const mx1 = xs1.mul(m1);
  const mx2 = xs2.mul(m2);
  const mx3 = xs3.mul(m3);
  const mx4 = xs4.mul(m4);
  const mx5 = xs5.mul(m5);

  const ys = mx2.add(mx3).add(mx4).add(mx5).add(b);
  //console.log(ys.dataSync());

  return ys;
}

//function mousePressed() { // 값 넣기
//  let x = map(mouseX, 0, width, 0, 1);
//  let y = map(mouseY, 0, height, 1, 0);
//  x_vals.push(x);
//  y_vals.push(y);
//}

function draw() { // tensorflow.js 104 선형회귀

  

  //$('#알파고').val(_ys);
  

  /*
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
  */

  //noLoop();
}
