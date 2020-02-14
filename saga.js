import { put, takeEvery, all } from "redux-saga/effects";

const delay = ms => new Promise(res => setTimeout(res, ms));
// 해당 시간 후에 resolve가 될 함수
// generator를 막기 위해 사용할 것임

function* helloSaga() {
  console.log("Hello Sagas!");
}

// worker saga: 비동기 task를 수행해 줄 것임
export function* incrementAsync() {
  // 사가는 generator 함수로 만들어진다. 이 제너레이터 함수는 redux-saga middleware가 해석할 수 있는 object를 반환한다.
  // 이 object는 수행해야 될 명령?을 담고 있다. saga middleware가 캐치해서 해석하고 task를 수행한다.
  // promise가 yield되면 미들웨어는 promise가 끝나기 전까지 saga를 멈춰놓는다.
  yield delay(1000);
  // put은 Effect중에 하나.
  yield put({ type: "INCREMENT" });
  // effect는 미들웨어가 수행할 명령을 담은 plain 자바스크립트 오브젝트임.
  // 미들웨어가 saga로 부터 생성된 Effect를 캐치하면 이 명령을 다 수행할 때 까지 saga는 멈춰짐
}
/** 이거 next 호출했을때 결과
 * { value: Promise { <pending> }, done: false }
    {
      value: { '@@redux-saga/IO': true, PUT: { channel: null, action: [Object] } },
      done: false
    }
    { value: undefined, done: true }
 */

// watcher saga: 매 INCREMENT_ASYNC 액션마다 incrementAsync를 생성해냄
function* watchIncrementAsync() {
  // takeEvery는 helper function
  yield takeEvery("INCREMENT_ASYNC", incrementAsync);
  //`incrementAsync` 액션이 dispatch 될 때마다 incrementAsync를 호출함.
}

// 이 2개의 사가(helloSaga와 watchIncrementAsync)를 동시에 실행시키기 위해
// 두 가지 사가를 rootSaga 하나로 묶어서 export 함
export default function* rootSaga() {
  yield all([helloSaga(), watchIncrementAsync()]);
  // 이 사가는 두 사가를 부른 결과를 array로 yield함
  // 두 generator는 동시에(parallel하게) 시작될 것임
}

// summary: watcher saga가 액션이 디스패치 되는 걸 기다렸다가 액션에 맞는 worker 사가를 실행시킴
// worker 사가는 task object(effect)를 yield 시킴.
// 이걸 사가 미들웨어가 잡아서 차례로 수행함.
