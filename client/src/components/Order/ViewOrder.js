import React, {Component} from 'react';
import ReactDataGrid from 'react-data-grid';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import './Order.css';
export default class ViewOrder extends Component{
    constructor(props){
        super(props)
        this.state = {
            rows: [],
            orders: [],
            newRows: [],
            selectedIndexes: [],
            menuItems: [],
            menuItemsDropDown: [],
            orderPlaced: false,
            finishedOrders: []
        }
        this.fetchData()
    }

    fetchData = () => {
        axios.get('/orders/').then(response => {
            let rows = [];
            if(response.data.length != 0){
                for(let i = 0; i < response.data.length; i++){
                    let element = response.data[i]
                    let orderItems = ""
                    for(let j = 0; j < element.order[0].length; j++){
                        let element1 = element.order[0][j]
                        orderItems = orderItems + element1.name + "(" + element1.quantity + "), "
                    }
                    rows.push({id:response.data[i]._id, name: orderItems, order: element.order[0]})
                }
                this.setState({
                    rows: rows,
                    orders: rows,
                    orderPlaced: false
                })    
            }
        })
    }

    orderFinished = (rows) => {
        for(let i = 0; i < rows.length; i++){
            axios.put('/orderFinished/'+rows[i].id).then(() => {
                this.fetchData()
            }).catch(error => {
                console.log("Error ",error)
            })
        }
        this.fetchData()
    }

    onRowsSelected = (rows) => {
        let row = [...this.state.finishedOrders]
        for(let i = 0; i < rows.length; i++){
            let element = rows[i]
            row.push({id:element.row.id})
        }
        this.setState({
            selectedIndexes: this.state.selectedIndexes.concat(
              rows.map(r => r.rowIdx)
            ),
            finishedOrders: row
          });
    }

    onRowsDeselected = (rows) => {
        let rowIndexes = rows.map(r => r.rowIdx);
        let row = Array.from(this.state.finishedOrders)
        for(let i = 0; i < row.length; i++){
            let element = row[i]
            if(element.id == rows[0].row.id){
                row.splice(i,1)
            }
        }
        this.setState({
            selectedIndexes: this.state.selectedIndexes.filter(
                i => rowIndexes.indexOf(i) === -1
            ),
            finishedOrders: row
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
        const menuItemsColumns = [{key:"name", name:"Name"},];
        const rowGetter = rowNumber => rows[rowNumber];
        return(
            <div>
                    <div>
                        <ReactDataGrid
                            enableCellSelect={true}
                            columns={menuItemsColumns}
                            rowGetter={rowGetter}
                            rowsCount={this.state.rows.length}
                            rowSelection={{
                                showCheckbox: true,
                                enableShiftSelect: true,
                                onRowsSelected: this.onRowsSelected,
                                onRowsDeselected: this.onRowsDeselected,
                                selectBy: {
                                    indexes: this.state.selectedIndexes
                                }
                            }}
                            onGridRowsUpdated={this.onGridRowsUpdated}
                        />
                        <Button bsStyle="success" onClick={() => {this.orderFinished(this.state.finishedOrders)}}>Order finished</Button>
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