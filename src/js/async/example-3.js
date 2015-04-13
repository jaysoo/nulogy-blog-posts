import _ from 'lodash';

const f = async() => {
  if (Math.random() < 0.5) {
    return 'success';
  } else {
    throw new Error('Failed');
  }
};

const run = async() => {
  for (let i = 0; i < 10; i++) {

  }
};

export {run};