import test from 'tape';
import CustomSelect from '../src';

let select1 = document.createElement('select');
select1.setAttribute('class', 'first-select');
select1.setAttribute('data-custom-id', 'testID');
select1.setAttribute('data-placeholder', 'Choose');

let options1 = [
  'test1',
  'test2',
  'test3'
];

for (let i = 0, len = options1.length; i < len; ++i) {
  let option = document.createElement('option');
  option.innerText = options1[i];

  select1.appendChild(option);
}

document.body.appendChild(select1);

let cs1 = new CustomSelect('.first-select', {
  customClass: 'custom-class'
});

let select2 = document.createElement('select');

let options2 = [
  'test4',
  'test5'
];

let optgroup1 = document.createElement('optgroup');
for (let i = 0, len = options1.length; i < len; ++i) {
  let option = document.createElement('option');

  option.innerText = options1[i];

  optgroup1.appendChild(option);
}
select2.appendChild(optgroup1);

let optgroup2 = document.createElement('optgroup');
for (let i = 0, len = options2.length; i < len; ++i) {
  let option = document.createElement('option');

  option.innerText = options2[i];

  optgroup2.appendChild(option);
}
select2.appendChild(optgroup2);

document.body.appendChild(select2);

let cs2 = new CustomSelect(select2, {
  customClass: 'custom-class'
});

test('constructor valid', (t) => {
  t.plan(5);

  t.equal(typeof CustomSelect, 'function', 'CustomSelect is a function');
  t.equal(cs1.elements[0], select1, 'Can pass a string as element');
  t.equal(cs2.elements[0], select2, 'Can pass an element as element');
  t.equal(cs1.settings.customID, '', 'Has default custom id');
  t.equal(cs1.settings.customClass, 'custom-class', 'Can set custom class');
});

test('DOM setup', (t) => {
  t.plan(8);

  let newSelect = cs1.elements[0].parentNode;
  let options = newSelect.querySelectorAll('.cs-option');
  let label = newSelect.querySelector('.cs-label');
  
  let newSelect2 = cs2.elements[0].parentNode;
  let optgroups = newSelect2.querySelectorAll('.cs-optgroup');
  let optgroupOptions1 = optgroups[0].querySelector('.cs-optgroup-list').querySelectorAll('.cs-option');
  let optgroupOptions2 = optgroups[1].querySelector('.cs-optgroup-list').querySelectorAll('.cs-option');
  let label2 = newSelect2.querySelector('.cs-label');

  t.equal(newSelect.getAttribute('id'), 'testID', 'override options with data');
  
  t.ok(newSelect.classList.contains('cs-select'), 'Parent has been created');
  t.ok(newSelect.classList.contains('custom-class'), 'Parent has custom class');
  
  t.equal(label.querySelector('span').innerText, 'Choose', 'Option placeholder has been set');
  t.equal(label2.querySelector('span').innerText, 'test1', 'Takes first option of first optgroup');
  
  t.equal(options.length, options1.length, 'A div has been created for each option');

  t.equal(optgroups.length, 2, 'A div has been created for each optgroup');
  t.ok(
    ((optgroupOptions1.length == options1.length) &&
    (optgroupOptions2.length == options2.length))
    , 'A div has been created for each option of each optgroup');

  t.end();
});