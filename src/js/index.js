import fetch from 'node-fetch';

const f = async () => {
    if (Math.random() < 0.7) {
        return "hello";
    } else {
        throw new Error('f() failed');
    }
}

const g = async () => {
    if (Math.random() < 0.7) {
        return "world"
    } else {
        throw new Error('g() failed');
    }
}

const h = async () => {
    try {
        console.log(`${await f()} ${await g()}`);
    } catch (err) {
        console.error(err);
    }
}
h();
//
//f().then(
//  (message) => console.log(message),
//  (err) => console.error(err)
//);
//fetch('http://localhost:8081/data/foo.json')
//  .then(function(res) {
//      console.log(res.json());
//  });

//const h = async () => {
//    const response = await fetch('http://localhost:8081/data/foo.json');
//    const json = await response.json();
//    console.log(json);
//}
//h();