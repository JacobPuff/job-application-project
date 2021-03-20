import React, {useState, useEffect} from 'react';
import { AlertSnackbar } from './Alert.js';

const axios = require('axios');



export function Table(props) {
    const [data, setData] = useState([])
    const [show, setShow] = useState(false)

    useEffect(()=> {
        GetTableData()
    }, [])

    const GetTableData = () => {
        axios.get('/api')
        .then((response)=>{
            setData(response.data)
            setShow(true)
        })
        .catch((error)=>{
            console.log(error)
            setShow(true)
        })
    }

    const GenerateTableRows = () => {
        console.log(data)
        return data.map(d=>
            <tr key={d.fileNum}>
                <th scope="row">{d.fileNum}</th>
                <td>{d.title}<p className="text-muted">{d.subtitle}</p></td>
                <td>{d.author}</td>
                <td>{d.startingText}</td>
            </tr>)
    }

    return (
        <div>
        <table className="table">
            <thead>
                <tr>
                    <th scope="col" width="5%">File Num</th>
                    <th scope="col" width="30%">"Report" Title</th>
                    <th scope="col" width="30%">Author</th>
                    <th scope="col" width="35%">Preview</th>
                </tr>
            </thead>
            <tbody>
                {GenerateTableRows()}
            </tbody>
        </table>
            <AlertSnackbar Text="An error occured when getting the table data" AlertType="danger" Show={show}/>
        </div>
    )
}