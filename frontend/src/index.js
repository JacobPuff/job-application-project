import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';
import {Report} from './components/Report';
import { AlertSnackbar } from './components/Alert';
import {DEFAULT_APP_TITLE} from './config';

const axios = require('axios');

function App() {
    const [title, setTitle] = useState(DEFAULT_APP_TITLE)
    const [showTable, setShowTable] = useState(true)
    const [showReport, setShowReport] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [selectedPage, setSelectedPage] = useState(1)
    const [initialData, setInitialData] = useState([])
    const [selectedReportMetadata, setSelectedReportMetadata] = useState({})
    
    useEffect(()=>{
        GetTableData()
        window.onpopstate = HandleHistory
    }, [])

    useEffect(()=>{
        if (initialData == []) {
            HandleHistory()
        }
    },[initialData])

    const GetTableData = () => {
        axios.get('/api')
        .then((response)=>{
            setInitialData(response.data)
            HandleHistory()
            setShowAlert(false)
        })
        .catch((error)=>{
            console.log(error)
            setShowAlert(true)
        })
    }

    const HandleHistory = (e) => {
        // For some reason InitialData is not set when moving between pages. I set st
        var tempInitialData = initialData
        if (e != undefined) {
            tempInitialData = e.state.data
        }
        //Internet Explorer doens't support URLSearchParams.
        var params = new URLSearchParams(window.location.search);
        var pageNum = 1
        var tempShowReport = false
        if (params.get("report")) {
            var reportMetadata = tempInitialData.filter(d=>d.fileNum == params.get("report"))
            if (reportMetadata[0]) {
                setSelectedReportMetadata(reportMetadata[0])
                setTitle(reportMetadata[0].title)
            } else {
                var fillerMetadata = {"fileNum": params.get("report")}
                setSelectedReportMetadata(fillerMetadata)
            }
            setShowTable(false)
            setShowReport(true)
            tempShowReport=true
        }
        if (params.get("page")) {
            pageNum = parseInt(params.get("page"), 10)
        }
        setSelectedPage(pageNum)
        if (tempShowReport == false){
            setTitle(DEFAULT_APP_TITLE)
            setShowTable(true)
            setShowReport(false)
        }

        if (e != undefined) {
            setInitialData(tempInitialData)
        }
    }

    const SelectReport = (metadata, page) => {
        history.pushState({data:initialData}, '', window.location.origin+"/?report="+metadata.fileNum)
        setTitle(metadata.title)
        setSelectedReportMetadata(metadata)
        setSelectedPage(page)
        setShowTable(false)
        setShowReport(true)
    }

    const BackToTable = () => {
        history.pushState({data:initialData}, '', window.location.origin+"/?page="+selectedPage)
        setTitle(DEFAULT_APP_TITLE)
        setSelectedReportMetadata({})
        setShowTable(true)
        setShowReport(false)
    }

    return (
        <div className="app border border-primary">
            <h4 className="title border-bottom border-3 border-primary">{title}{/*<SearchBar/>*/}</h4>
            <Table InitialData={initialData} InitialPageNum={selectedPage} IsVisible={showTable} SelectReport={SelectReport}/>
            <Report IsVisible={showReport} ReportMetadata={selectedReportMetadata} BackToTable={BackToTable}/>
            <AlertSnackbar Text="An error occured when getting the table data. Please try again later." AlertType="danger" Show={showAlert}/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)