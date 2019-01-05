import React, {Component} from 'react';
import ReactDataGrid from 'react-data-grid';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Editors, Formatters } from 'react-data-grid-addons';
import './Order.css';
const { DropDownEditor } = Editors;
export default class Order extends Component{
    constructor(props){
        super(props)
        this.state = {
            rows: [],
            newRows: [],
            selectedIndexes: [],
            menuItems: [],
            menuItemsDropDown: [],
            itemPriceMap: new Map(),
            orderPlaced: false
        }
        this.fetchData()
    }

    fetchData = () => {
        axios.get('/menu/').then(response => {
            let rows = [];
            let itemPriceMap = new Map()
            for(let i = 0; i < response.data.length; i++){
                let element = response.data[i]
                rows.push({id:element._id,name:element.name, price:element.price})
                itemPriceMap.set(element.name, element.price)
            }
            this.setState({
                rows: rows,
                itemPriceMap: itemPriceMap,
                orderPlaced: false
            })
        })
    }

    placeNewOrder = (rows) => {
        let temp = []
        let totalCost = 0;
        for(let i = 0; i < rows.length; i++){
            let element = rows[i]
            if(element.quantity != null && element.quantity != undefined){
                temp.push({id:element._id,name:element.name, quantity: element.quantity})
                totalCost += this.state.itemPriceMap.get(element.name) * element.quantity
            }
        }
        if(temp.length >0){
            axios.post('/placeOrder/'+totalCost,temp).then(response => {
                this.setState({
                    orderPlaced: true
                })
            }).catch(error => {
                console.log("Error ",error)
            })    
        }
    }

    /*handleAddRow = () => {
        const newRow = {
            "ID":"",
            "name": "",
            "price": "",
        };
        let rows = this.state.rows.slice();
        let newRows = [...this.state.newRows];
        rows = update(rows, {$unshift: [newRow]});
        newRows = update(newRows, {$unshift: [newRow]});
        this.setState({
            rows: rows,
            newRows: newRows
        })
    }*/

    onRowsSelected = (rows) => {
        this.setState({
            selectedIndexes: this.state.selectedIndexes.concat(
              rows.map(r => r.rowIdx)
            )
          });
    }

    onRowsDeselected = (rows) => {
        let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
    }

    onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
        this.setState(state => {
          const rows = state.rows.slice();
          for (let i = fromRow; i <= toRow; i++) {
            rows[i] = { ...rows[i], ...updated };
          }
          return { rows };
        });
    };

    render(){
        const rows = this.state.rows;
        const menuItemsColumns = [{key:"name", name:"Name", editor: <DropDownEditor options={this.state.menuItemsDropDown} />},
                                  {key:"quantity", name:'Quantity', editable:true}];
        const rowGetter = rowNumber => rows[rowNumber];
        return(
            <div>
                    <div>
                        <ReactDataGrid
                            enableCellSelect={true}
                            columns={menuItemsColumns}
                            rowGetter={rowGetter}
                            rowsCount={this.state.rows.length}
                            onGridRowsUpdated={this.onGridRowsUpdated}
                        />
                        <Button bsStyle="success" onClick={() => {this.placeNewOrder(this.state.rows)}}>Place Order</Button>
                        <Button bsStyle="success" onClick={() => {this.fetchData()}}>New Order</Button>
                    </div>
                    {this.state.orderPlaced ? (
                        <h1 style={{"color":"#7CFC00", "textAlign":"center"}}>Order placed</h1>
                    ):(
                        <div/>
                    )}
            </div>
        )
    }
}