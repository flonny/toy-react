export class Component {
  constructor(type) {
    this._type =type
    this.children = [];
    this.props = Object.create(null);
  }
 get type() {
   return this._type || this.constructor.name
 }
 set type(val) {
   this._type =val
 }
  setAttribute(name, value) {
    this.props[name] = value;
    // this[name] = value;
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }
  mountTo(range) {
    this.range = range;
    this.updated();
  }
  updated() {
    
    // let placeholder = document.createComment("placeholder");
    // let range = document.createRange();
    // range.setStart(this.range.endContainer, this.range.endOffset);
    // range.setEnd(this.range.endContainer, this.range.endOffset);
    // range.insertNode(placeholder);
    let isSameNode = (node1, node2) => {
      if (node1.type !== node2.type) {
        return false;
      }
      for (let name in node1.props) {
        const newProp = node1.props[name];
        const oldProp = node2.props[name];
        if(typeof newProp === 'function' && typeof oldProp === 'function') {
          if( String(newProp)===String(oldProp)) {
            continue
          }
        }
        if(typeof newProp === 'object' && typeof oldProp === 'object') {
          if( JSON.stringify(newProp)===JSON.stringify(oldProp)) {
            continue
          }
        }
        if (
          Object.keys(node1.props).length !== Object.keys(node2.props).length
        ) {
          return false;
        }
        if (newProp !== oldProp) {
          console.log('deffirent')
          return false;
        }
      }
      // console.log('all same')
      return true;
    };
    let isSameTree = (node1, node2) => {
      if (!isSameNode(node1, node2)) {
        return false;
      }
      if (node1.children.length !== node2.children.length) {
        return false;
      }
      for (let i = 0; i < node1.children.length; i++) {
        if (!isSameTree(node1.children[i], node2.children[i])) {
          return false;
        }
      }
      return true;
    };
    let replace = (newT, oldT) => {
      if (oldT && isSameTree(newT, oldT)) {
        return;
      }
      if (!oldT || !isSameNode(newT, oldT)) {
        if (oldT && oldT.range) {
          console.log(newT,oldT.vdom.range)
          newT.mountTo(oldT.vdom.range);
        } else {
          // const range =document.createRange()
          // newT.mountTo(range)
        }
      } else {
        for (let i = 0; i < newT.children.length; i++) {
          replace(newT.children[i], oldT.children[i]);
        }
      }
    };
    let vdom = this.render();
    if (this.vdom) { 
      if (!isSameNode(vdom, this.vdom)) {
        vdom.mountTo(this.range);
        this.vdom = vdom;
      } else {
        replace(vdom, this.vdom);
      }
    } else {
      this.vdom = vdom;
      vdom.mountTo(this.range);
    }
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array) {
              oldState[p] = [];
            } else {
              oldState[p] = {};
            }
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.updated();
  }
}
class ElementWrapper extends Component {
  constructor(type) {
    super(type);
  }
  get vdom() {
    
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    let element = document.createElement(this.type);
    for (let name in this.props) {
      if (name.match(/^on([\s\S]+)$/)) {
        const eventType = RegExp.$1.replace(/^[\s\S]/, (s) =>
          s.toLocaleLowerCase()
        );
        element.addEventListener(eventType, this.props[name]);
      }
      if (name === "className") {
        element.setAttribute("class", this.props[name]);
      } else {
        element.setAttribute(name, this.props[name]);
      }
    }
    for (let vchild of this.children) {
      const range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      vchild.mountTo(range);
    }
    range.insertNode(element);
  }
}
class TextWrapper extends Component {
  constructor(content) {
    super("#text");
    this.type = "#text";
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}
export let ToyReact = {
  createElement(type, arrtributes, ...children) {
    let element;
    if (typeof type === "string") {
      element = new ElementWrapper(type);
    } else {
      element = new type();
    }
    for (let name in arrtributes) {
      element.setAttribute(name, arrtributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) {
            child = "";
          }
          if (!(child instanceof Component)) {
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    return element;
  },
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length > 0) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
