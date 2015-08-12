import 'classlist-shim';
import * as Utils from './utils.js'

export default class CustomSelect {
  constructor (elements, options = {}) {

    if (typeof elements === 'string')
      elements = Array.prototype.slice.call(document.querySelectorAll(elements));
    else if (typeof elements !== 'array')
      elements = [elements];

    this.elements = elements;

    let defaults = {
      customID:    '',    // String   - Custom id
      customClass: '',    // String   - Custom Class
      placeholder: '',    // String   - Value if non empty string, else first
      loop:        false, // Boolean  - Should keyboard navigation loop ?
      size:        0,     // Integer  - If not 0, number of displayed items
      onChange:    null   // Function - Callback after change
    };

    Utils.defaultify(options, defaults);

    this.settings = options;

    for (let i = this.elements.length-1; i >= 0; --i)
      this.replaceDOMelement(this.elements[i]);

    this.blurCallback = this.blurFocus.bind(this);
    document.querySelector('html').addEventListener('click', this.blurCallback);
  }

  replaceDOMelement (element) {
    let scopeSettings = Utils.clone(this.settings);

    let keys = Object.keys(this.settings), i = keys.length;
    while (i--) {
      let key = keys[i],
          data = element.getAttribute(`data-${ Utils.fileCase(key) }`);

      if (data != null)
        scopeSettings[key] = data;
    }

    let options = element.children;

    if (!scopeSettings.placeholder) {
      let first = options[0];

      if (first.tagName === 'OPTGROUP')
        first = first.children[0]

      scopeSettings.placeholder = first.innerText;
    }

    let select = document.createElement('div');
    if(scopeSettings.customID) select.setAttribute('id', scopeSettings.customID);
    select.classList.add('cs-select');
    if(scopeSettings.customClass) select.classList.add(scopeSettings.customClass);

    if (element.disabled)
      select.classList.add('disabled');

    element.parentNode.insertBefore(select, element);

    let wrapper = document.createElement('div');
    wrapper.classList.add('cs-wrapper');
    select.appendChild(wrapper);

    let list = document.createElement('ul');
    list.classList.add('cs-list');
    wrapper.appendChild(list);

    this.populateList(list, options);

    let label = document.createElement('div');
    label.classList.add('cs-label');
    let labelTxt = document.createElement('span');
    labelTxt.innerText = scopeSettings.placeholder;
    label.appendChild(labelTxt);
    select.appendChild(label);


    select.appendChild(element);

    select.focusCallback = (event) => {
      this.triggerSelect(event, select);
    };
    select.addEventListener('click', select.focusCallback);
  }

  update() {
    if (!this.elements) return;

    let i = this.elements.length, elem;
    while (i--) {
      elem = this.elements[i];

      this.destroy(elem);

      let wrapper = elem.parentNode, parent = wrapper.parentNode;
      parent.insertBefore(elem, wrapper);
      parent.removeChild(wrapper);

      this.replaceDOMelement(elem);
    }
  }

  populateList (list, options) {
    for (let i = 0, len = options.length; i < len; ++i) {
      let item = options[i];

      let option = document.createElement('li');
      option.classList.add('cs-option');

      if (item.tagName === 'OPTION') {
        option.setAttribute('data-value', item.value);
        option.innerText = item.innerText;

        if (item.disabled)
          option.classList.add('disabled');

        if (item.selected)
          option.classList.add('selected');

        list.appendChild(option);
      }
      else {
        option.classList.add('cs-optgroup');
        option.innerText = item.innerText;

        list.appendChild(option);

        let optgroup = document.createElement('ul');
        optgroup.classList.add('cs-optgroup-list');

        option.appendChild(optgroup);

        this.populateList(optgroup, item.children);
      }

      option.clickCallback = this.optionClick.bind(this);
      option.addEventListener('click', option.clickCallback);

      option.overCallback = this.optionHover;
      option.addEventListener('mousemove', option.overCallback);
    }
  }

  destroy(elem){
    let destroyElements = (elem) ? [elem] : this.elements;

    let i = destroyElements.length, select;
    while (i--) {
      select = destroyElements[i];

      select.removeEventListener('click', select.focusCallback);

      let options = select.querySelectorAll('li.cs-option')

      let j = options.length, option;
      while (j--) {
        option = options[j];

        option.removeEventListener('click', option.clickCallback);
        option.removeEventListener('mousemove', option.overCallback);
      }
    }

    if(!elem){
      document.querySelector('html').removeEventListener('click', this.blurCallback);
    }
    else {
      this.elements.splice(this.elements.indexOf(elem), 1);
    }
  }

  blurFocus(event) {

    let i = this.elements.length, el, parent, bounding;
    while (--i) {
      el = this.elements[i];
      parent = el.parentNode;
      bounding = parent.getBoundingClientRect();

      if(parent.classList.contains('open')){
        if((event.clientX < bounding.left || event.clientX > (bounding.left + bounding.width)) || (event.clientY < bounding.top || event.clientY > (bounding.top + bounding.height)) ){
          parent.classList.remove('open');
        }
      }
    }
  }

  triggerSelect(event, select){
    event.preventDefault();

    if(!select.classList.contains('disabled')){
      this.checkViewport(select);
      select.classList.add('open');
    }
  }

  optionHover(event){
    let option = event.currentTarget;
    let list = option.parentNode;
    let options = list.querySelectorAll('li.cs-option');

    if(!option.classList.contains('disabled') || option.classList.contains('cs-optgroup')){

      let i = options.length;
      while (i--) {
        options[i].classList.remove('active');
      }

      option.classList.add('active');
    }
  }

  optionClick(event){
    event.stopPropagation();

    let option = event.currentTarget;
    let select = option.parentNode.parentNode.parentNode;
    let options = select.querySelectorAll('li.cs-option');
    let index = Utils.indexInParent(option);

    if(!option.classList.contains('disabled') || option.classList.contains('cs-optgroup')){

      select.querySelector('.cs-option.selected').classList.remove('selected');
      option.classList.add('selected');

      let realSelect = select.querySelector('select');

      let realOptions = realSelect.querySelectorAll('option');

      let i = realOptions.length;
      while(i--) {
        realOptions[i].selected = false;
      }

      realOptions[index].selected = true;

      select.querySelector('.cs-label').innerText = option.innerText;

      var event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, false);
      realSelect.dispatchEvent(event);
    }

    select.classList.remove('open');
  }

  checkViewport(select){
    let bounding = select.getBoundingClientRect();
    let listHeight = select.querySelector('.cs-list').offsetHeight;

    if ( (bounding.bottom + listHeight + 10) > window.innerHeight && (bounding.top - listHeight) > 10 ) {
      select.classList.add('above');
    }
    else {
      select.classList.remove('above');
    }
  }

};
