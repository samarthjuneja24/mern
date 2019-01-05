import React, {Component} from 'react';
import ReactDataGrid from 'react-data-grid';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Editors } from 'react-data-grid-addons';
import './PredictedOrders.css';
const { DropDownEditor } = Editors;
export default class PredictedOrders extends Component{
    constructor(props){
        super(props)
        this.state = {
            rows: [],
            newRows: [],
            selectedIndexes: [],
            menuItems: [],
            menuItemsDropDown: [],
            orderPlaced: false
        }
        this.fetchData()
    }

    fetchData = () => {
        axios.get('/menu/').then(response => {
            let rows = [];
            for(let i = 0; i < response.data.length; i++){
                let element = response.data[i]
                rows.push({id:element._id,name:element.name, predicted:element.predicted})
            }
            this.setState({
                rows: rows,
                orderPlaced: false
            })
        })
    }

    savePredictions = (rows) => {
        let temp = []
        for(let i = 0; i < rows.length; i++){
            let element = rows[i]
            if(element.predicted != null && element.predicted != undefined){
                temp.push({name:element.name, quantity: element.predicted})
            }
        }
        if(temp.length >0){
            axios.post('/predicted/',temp).then(response => {
                this.setState({
                    orderPlaced: true
                })
            }).catch(error => {
                console.log("Error ",error)
            })    
        }
    }

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
                                  {key:"predicted", name:'Predicted', editable:true}];
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
                        <Button bsStyle="success" onClick={() => {this.savePredictions(this.state.rows)}}>Save predictions</Button>
                    </div>
                    {this.state.orderPlaced ? (
                        <h1 style={{"color":"#7CFC00", "textAlign":"center"}}>Predictions saved</h1>
                    ):(
                        <div/>
                    )}
            </div>
        )
    }
}