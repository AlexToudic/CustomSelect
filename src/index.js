import 'classlist-shim';
import * as Utils from './utils.js'

export default class CustomSelect {
  constructor (elements, options) {

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
    select.setAttribute('id', scopeSettings.customID);
    select.classList.add('cs-select');
    select.classList.add(scopeSettings.customClass);

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
    element.appendChild(label);
    
    select.appendChild(element);

    select.addEventListener('click, focusin', (event) => {
      this.takeFocus(event, select);
    });
  }

  populateList (list, options) {
    for (let i = 0, len = options.length; i < len; ++i) {
      let item = options[i];

      if (item.tagName === 'OPTION') {
        let option = document.createElement('li');
        option.classList.add('cs-option');
        option.setAttribute('data-value', item.value);
        option.innerText = item.innerText;

        if (item.disabled)
          option.classList.add('disabled');

        if (item.selected)
          option.classList.add('selected');

        list.appendChild(option);
      }
      else {
        let option = document.createElement('li');
        option.classList.add('cs-option');
        option.classList.add('cs-optgroup');
        option.innerText = item.innerText;

        list.appendChild(option);

        let optgroup = document.createElement('ul');
        optgroup.classList.add('cs-optgroup-list');

        option.appendChild(optgroup);

        this.populateList(optgroup, item.children);
      }
    }
  }

  takeFocus(event, select) {
    event.preventDefault();

    if(!select.classList.contains('disabled'))
      select.classList.add('focus');
  }

  blurFocus(event, select) {
    event.preventDefault();

    select.classList.remove('focus');
  }
};