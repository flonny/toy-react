import { ToyReact, Component } from "./ToyReact";
class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>true</span>
        <span></span>
        <span></span>
    <span>{this.children}</span>
      </div>
    );
  }
}
let a = (
  <MyComponent id="a" name="b">
    <div>123123</div>
  </MyComponent>
);
ToyReact.render(a, document.getElementById("root"));
