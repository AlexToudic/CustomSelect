import 'classlist-shim';
import * as Utils from './utils.js'

export default class CustomSelect {
  constructor (elements, options = {}) {

    if (typeof elements === 'string')
      elements = document.querySelectorAll(elements);
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

    document.querySelector('html').addEventListener('click', this.blurFocus.bind(this));
  }

  replaceDOMelement (element) {
    let scopeSettings = Utils.clone(this.settings);

    let keys = Object.keys(this.settings);
    for (let i = keys.length-1; i >= 0; --i) {
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

    select.addEventListener('click', (event) => {
      this.triggerSelect(event, select);
    });
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

      option.addEventListener('click', this.optionClick.bind(this));
      option.addEventListener('mousemove', this.optionHover);
    }
  }

  destroy(elem){
    let destroyElements = (elem) ? [elem] : this.elements;

    Array.prototype.forEach.call(destroyElements, (select) => {

      select.removeEventListener('click', this.takeFocus);

      let options = select.querySelectorAll('li.cs-option')

      Array.prototype.forEach.call(options, (option) => {
        option.removeEventListener('click', this.optionClick);
        option.removeEventListener('mousemove', this.optionHover);
      });

    });

    if(!elem){
      document.querySelector('html').removeEventListener('click', this.blurFocus);
    }
    else {
      this.elements.splice(this.elements.indexOf(elem), 1);
    }
  }

  blurFocus(event) {
    if(event) event.preventDefault();

    Array.prototype.forEach.call(this.elements, (el) => {
      let parent = el.parentNode;

      let bounding = parent.getBoundingClientRect();

      if(parent.classList.contains('open')){
        if((event.clientX < bounding.left || event.clientX > (bounding.left + bounding.width)) || (event.clientY < bounding.top || event.clientY > (bounding.top + bounding.height)) ){
          parent.classList.remove('open');
        }
      }

    });
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

      Array.prototype.forEach.call(options, (el) => {
        el.classList.remove('active');
      });

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

      Array.prototype.forEach.call(realOptions, (el) => {
        el.selected = false;
      });

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