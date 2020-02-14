// Lesson 2. delay 값은 일반적인 값이 아니라 promise 값이라 값에 대한 테스트를 어떻게 해야할까?
// 답 > call을 써봐라!!!
import { put, takeEvery, all, call } from "redux-saga/effects";
// call을 통해 delay를 간접적으로 호출해라

export const delay = ms => new Promise(res => setTimeout(res, ms));
// 해당 시간 후에 resolve가 될 함수
// generator를 막기 위해 사용할 것임

function* helloSaga() {
  console.log("Hello Sagas!");
}

// worker saga: 비동기 task를 수행해 줄 것임
export function* incrementAsync() {
  // call은 put처럼 effect 함수임.
  // *effect 함수는 디스패치나 asyncronous call을 직접 하는 게 아니라 미들웨어에 명령을 전달하는 역할만 함
  // plain javascript object임!!
  yield call(delay, 1000); // => { CALL: {fn: delay, args: [1000]}};
  // call을 쓰지 않고 그냥 delay(1000)를 yield할 경우 promise의 값이 value로 넘어가지만
  // call은 이 함수를 호출하라고 넘김
  // effect 생성과 effect 수행을 분리하는 것은 테스트를 아주 쉽게 만들어줌
  // *put은 해당 액션을 스토어에 dispatch하라고 명령하고
  // *call은 해당 함수를 호출하라고 명령함

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
