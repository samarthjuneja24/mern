import React, { Component } from 'react';
import './App.css';
import { Button } from 'react-bootstrap';
import KitchenDisplay from './components/Kitchen Display/KitchenDisplay';
import Order from './components/Order/Order';
import PredictedOrders from './components/Predicted Orders/PredictedOrders';
import ViewOrder from './components/Order/ViewOrder';
class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      component: ""
    }
  }
  changeComponent = (value) => {
    if(value == 1){
      this.setState({
        component: "Place Orders"
      })
    }
    else if(value == 2){
      this.setState({
        component: "Predicted Orders"
      })
    }
    else if(value == 3){
      this.setState({
        component: "Kitchen Display"
      })      
    }
    else if(value == 4){
      this.setState({
        component: "View Orders"
      })      
    }
  }

  render() {
    return (
      <div className="App">
        <Button bsStyle="success" onClick={() => {this.changeComponent(1)}}>Place Orders</Button>
        <Button bsStyle="success" onClick={() => {this.changeComponent(2)}}>Predicted Orders</Button>
        <Button bsStyle="success" onClick={() => {this.changeComponent(3)}}>Kitchen Display</Button>
        <Button bsStyle="success" onClick={() => {this.changeComponent(4)}}>View Orders</Button>
        {this.state.component == "Place Orders" ? (<Order />)
          :this.state.component == "Kitchen Display" ? (<KitchenDisplay />)
          : this.state.component == "Predicted Orders" ? (<PredictedOrders />)
          : this.state.component == "View Orders" ? (<ViewOrder />)
          :""}
      </div>
    );
  }
}

export default App;
