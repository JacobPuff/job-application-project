import React, {useState, useEffect} from 'react';
import { AlertSnackbar } from './Alert';
import { DEFAULT_MAX_PER_PAGE, RELATIVE_PAGE_RANGE } from '../config';

const axios = require('axios');



export function Table(props) {
    const [data, setData] = useState([])
    const [numOfPages, setNumOfPages] = useState(-1)
    const [page, setPage] = useState(-1)
    const [show, setShow] = useState(false)

    useEffect(()=> {
        GetTableData()
        //Internet Explorer doens't support URLSearchParams.
        var params = new URLSearchParams(window.location.search);
        if (params.get("page")) {
            setPage(parseInt(params.get("page"), 10))
        } else {
            setPage(1)
        }
    }, [])

    useEffect(()=> {
        setNumOfPages(Math.ceil(data.length/DEFAULT_MAX_PER_PAGE))
    }, [data])

    const GetTableData = () => {
        axios.get('/api')
        .then((response)=>{
            setData(response.data)
        })
        .catch((error)=>{
            console.log(error)
            setShow(true)
        })
    }

    const GenerateTableRows = () => {
        var start = (page-1)*DEFAULT_MAX_PER_PAGE
        var end = start+DEFAULT_MAX_PER_PAGE
        return data.slice(start,end).map(d=>
            <tr key={d.fileNum}>
                <th scope="row">{d.fileNum}</th>
                <td>{d.title}<p className="text-muted">{d.subtitle}</p></td>
                <td>{d.author}</td>
                <td>{d.startingText}</td>
            </tr>)
    }
9 
    const GetPages = () => {
        var pagesAvailable = []
        var start = page - RELATIVE_PAGE_RANGE/2
        var end = page + RELATIVE_PAGE_RANGE/2
        if (page == -1 || numOfPages == -1) {
            return
        } 

        if (numOfPages-page < RELATIVE_PAGE_RANGE/2) {
            start -= RELATIVE_PAGE_RANGE/2-(numOfPages-page)
        }
        if (page <= RELATIVE_PAGE_RANGE/2) {
            end += RELATIVE_PAGE_RANGE/2-(page-1)
        }

        for (var i=start; i<=end; i++) {
            if (i >= 1 && i <= numOfPages) {
                pagesAvailable.push(
                    <li key={i} className={`page-item page-secondary ${i==page?"active":""}`}><a className="page-link" href={`?page=${i}`}>{i}</a></li>
                )
            }
        }
        return pagesAvailable
    }

    return (
        <div id="appTable">
            <table className="table" style={{padding:"10px"}}>
                <thead>
                    <tr>
                        <th scope="col" width="7%">File Num</th>
                        <th scope="col" width="30%">"Report" Title</th>
                        <th scope="col" width="20%">Author</th>
                        <th scope="col" width="43%">Preview</th>
                    </tr>
                </thead>
                <tbody>
                    {GenerateTableRows()}
                </tbody>
            </table>
            <nav>
                <ul className="pagination">
                    <li className="page-item page-primary"><a className="page-link" href={`?page=${page-1}`} aria-disabled={page==1}>Previous</a></li>
                    {GetPages()}
                    <li className="page-item page-primary"><a className="page-link" href={`?page=${page+1}`} aria-disabled={page==numOfPages}>Next</a></li>
                </ul>
            </nav>
            <AlertSnackbar Text="An error occured when getting the table data" AlertType="danger" Show={show}/>
        </div>
    )
}