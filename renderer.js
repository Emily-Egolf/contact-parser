let val = id =>
  document.getElementById(id).value;

let set = (id, val) => {
  const e = document.getElementById(id).value = val;
  M.updateTextFields()};

let btnMap = {
  'file-btn': 'report',
  'directory-btn': 'output-folder'};

let eventHandlers = {
  'file-select': b =>
    b.addEventListener('click', e => {
      window.api.send('file-select', {
        type: e.target.id[0] === 'f' ? 'openFile' : 'openDirectory',
        resId: btnMap[e.target.id],
        currPath: val(btnMap[e.target.id])})}),
  'run-parser': b =>
    b.addEventListener('click', e => {
      window.api.send('run-parser', ['report','output-folder'].map(id => val(id)))})};

window.api.receive('response', ({resId,filePath}) =>
  set(resId, filePath));

(_ =>
  Object.entries(eventHandlers).forEach(([c,f]) =>
    [...document.getElementsByClassName(c)].forEach(e => f(e))))()


