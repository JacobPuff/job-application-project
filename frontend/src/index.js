import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';
import {Report} from './components/Report';
import {DEFAULT_APP_TITLE} from './config';

function App() {
    const [title, setTitle] = useState(DEFAULT_APP_TITLE)
    const [showTable, setShowTable] = useState(true)
    const [showReport, setShowReport] = useState(false)
    const [selectedReportMetadata, setSelectedReportMetadata] = useState({})

    const SelectReport = (metadata) => {
        setTitle(metadata.title)
        setSelectedReportMetadata(metadata)
        setShowTable(false)
        setShowReport(true)
    }

    return (
        <div className="app border border-primary">
            <h4 className="title border-bottom border-3 border-primary">{title}{/*<SearchBar/>*/}</h4>
            <Table IsVisible={showTable} SelectReport={SelectReport}/>
            <Report IsVisible={showReport} ReportMetadata={selectedReportMetadata}/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)