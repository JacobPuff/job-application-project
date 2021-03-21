import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';
import {Report} from './components/Report';
import {DEFAULT_APP_TITLE} from './config';

function App() {
    const [title, setTitle] = useState(DEFAULT_APP_TITLE)
    const [showTable, setShowTable] = useState(true)
    const [showReport, setShowReport] = useState(false)
    const [selectedPage, setSelectedPage] = useState(1)
    const [selectedReportMetadata, setSelectedReportMetadata] = useState({})
    
    useEffect(()=>{
        // HandleHistory()
        window.onpopstate = HandleHistory
    }, [])

    const HandleHistory = () => {

        // I don't like this and would want to refactor GetData, and the url logic into App.
        // Will need to refactor for search bar.
        // Going from report to report won't work with this.
        // Because currently it can get confusing on exactly whats happening.
        // This hides the table, then Table in the background loads the data, and selects the report.
        // If the report doesn't exist in the metadata it selects a fake report.
        var params = new URLSearchParams(window.location.search);
        if (params.get("report")) {
            setShowTable(false)
            setShowReport(true)
        } else {
            setShowTable(true)
            setShowReport(false)
        }
    }

    const SelectReport = (metadata, page) => {
        history.pushState({}, '', window.location.origin+"/?report="+metadata.fileNum)
        setTitle(metadata.title)
        setSelectedReportMetadata(metadata)
        setSelectedPage(page)
        setShowTable(false)
        setShowReport(true)
    }

    const BackToTable = () => {
        history.pushState({}, '', window.location.origin+"/?page="+selectedPage)
        setTitle(DEFAULT_APP_TITLE)
        setSelectedReportMetadata({})
        setShowTable(true)
        setShowReport(false)
    }

    return (
        <div className="app border border-primary">
            <h4 className="title border-bottom border-3 border-primary">{title}{/*<SearchBar/>*/}</h4>
            <Table IsVisible={showTable} SelectReport={SelectReport}/>
            <Report IsVisible={showReport} ReportMetadata={selectedReportMetadata} BackToTable={BackToTable}/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)