import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';
import {Report} from './components/Report';
import {SearchBar} from './components/SearchBar';
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
        HandleHistory()
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
        var tempInitialData = initialData
        var setTempState = false
        if (e != undefined && e.state != undefined && e.state.data) {
            tempInitialData = e.state.data
            setTempState = true
        }
        setSelectedReportMetadata({})
        //Internet Explorer doens't support URLSearchParams.
        var params = new URLSearchParams(window.location.search);
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
        var pageNum = 1
        if (params.get("page")) {
            pageNum = parseInt(params.get("page"), 10)
        }
        setSelectedPage(pageNum)
        if (tempShowReport == false){
            setTitle(DEFAULT_APP_TITLE)
            setSelectedReportMetadata({})
            setShowTable(true)
            setShowReport(false)
        }

        if (setTempState) {
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
    
    const DoSearch = (query) => {
        if (query != "") {
            axios.post('/api',{"query":query})
            .then((response)=>{
                setInitialData(response.data.results)
                setShowAlert(false)
            })
            .catch((error)=>{
                console.log(error)
                setShowAlert(true)
            })
        }
    }

    return (
        <div className="app border border-primary">
            <div className="title border-bottom border-3 border-primary">
                <h4 style={{display:"inline-block", width:"70%"}}>{title}</h4>
                <SearchBar style={{width:"30%", marginLeft:"auto", display:"inline-block"}} DoSearch={DoSearch}/>
            </div>
            <Table InitialData={initialData} InitialPageNum={selectedPage} IsVisible={showTable} SelectReport={SelectReport}/>
            <Report IsVisible={showReport} ReportMetadata={selectedReportMetadata} BackToTable={BackToTable}/>
            <AlertSnackbar Text="An error occured when getting the table data. Please try again later." AlertType="danger" Show={showAlert}
                HandleClose={()=>{setShowAlert(false)}}/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)