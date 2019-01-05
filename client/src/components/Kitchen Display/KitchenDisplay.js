import React, {Component} from 'react';
import ReactDataGrid from 'react-data-grid';
import axios from 'axios';
import Workbook from 'react-excel-workbook'
export default class KitchenDisplay extends Component{

    constructor(props){
        super(props)
        this.state = ({
            rows: [],
            createdOrders: new Map()
        })
        this.fetchData();
    }

    fetchData = () => {
        axios.all([axios.get('/todayOrders/'),axios.get('/predicted/')])
        .then(axios.spread((response1, response2) => {
            let createdOrders = new Map()
            for(let i = 0; i < response1.data.length; i++){
                let element = response1.data[i]
                for(let j = 0; j < element.order[0].length; j++){
                    let element1 = element.order[0][j]
                    if(createdOrders.get(element1.name) == undefined){
                        createdOrders.set(element1.name, element1.quantity)
                    }
                    else{
                        createdOrders.set(element1.name, createdOrders.get(element1.name) + element1.quantity)
                    }
                }    
            }
            let rows = []
            for(let i = 0; i < response2.data.length; i++){
                let element = response2.data[i].order[0]
                for(let j = 0; j < element.length; j++){
                    let element1 = element[j]
                    rows.push({name:element1.name, created:createdOrders.get(element1.name), predicted:element1.quantity})
                }
            }
            this.setState({
                rows: rows
            })            
        }))
    }

    render(){
        const rows = [...this.state.rows]
        let excelData = []
        for(let i = 0; i < rows.length; i++){
            excelData.push({name:rows[i].name, created: rows[i].created, predicted: rows[i].predicted})
        }
        const columns = [{ key: 'name', name: 'Name' },
                         { key: 'created', name: 'Created' },
                         { key: 'predicted', name: 'Predicted' }];
        const rowGetter = rowNumber => rows[rowNumber];
        return(
            <div>
                <ReactDataGrid
                    columns={columns}
                    rowGetter={rowGetter}
                    rowsCount={rows.length}
                    minHeight={400} 
                />
                <div className="row text-center" style={{marginTop: '100px'}}>
                    <Workbook filename="Kitchen report.xlsx" element={<button>Download report</button>}>
                    <Workbook.Sheet data={excelData} name="Sheet A">
                        <Workbook.Column label="Name" value="name"/>
                        <Workbook.Column label="Created" value="created"/>
                        <Workbook.Column label="Predicted" value="predicted"/>
                    </Workbook.Sheet>
                    </Workbook>
                </div>
            </div>
            )
        }
}