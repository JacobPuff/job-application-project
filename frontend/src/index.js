import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Table} from './components/Table';
import {Report} from './components/Report';
import {SearchBar} from './components/SearchBar';
import { AlertSnackbar } from './components/Alert';
import {DEFAULT_APP_TITLE} from './config';

const axios = require('axios');

function App() {
    const TABLE_ERROR = "An error occured when getting the table data. Please try again later."
    const TAG_GET_ERROR = "An error occured getting the tags. Please try again later."
    const TAG_UPDATE_ERROR = "An error occured updating tags. Please try again later."
    const [title, setTitle] = useState(DEFAULT_APP_TITLE)
    const [showTable, setShowTable] = useState(true)
    const [showReport, setShowReport] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [selectedPage, setSelectedPage] = useState(1)
    const [initialData, setInitialData] = useState([])
    const [tagDataTagCounts, setTagDataTagCounts] = useState({})
    const [tagDataFileToTags, setTagDataFileToTags] = useState({})
    const [selectedReportMetadata, setSelectedReportMetadata] = useState({})
    const [lastSearch, setLastSearch] = useState("")
    const [alertText, setAlertText] = useState(TABLE_ERROR)
    
    useEffect(()=>{
        GetTableData()
        GetTagData()
        window.onpopstate = HandleHistory
    }, [])

    useEffect(()=>{
        HandleHistory()
    },[initialData, showAlert])

    const GetTableData = () => {
        axios.get('/api')
        .then((response)=>{
            setInitialData(response.data)
        })
        .catch((error)=>{
            console.error(error)
            setAlertText(TABLE_ERROR)
            setShowAlert(true)
        })
    }

    const GetTagData = () => {
        axios.get('/api/tags')
        .then((response)=>{
            setTagDataTagCounts(response.data.tagCounts)
            setTagDataFileToTags(response.data.fileToTags)
        })
        .catch((error)=>{
            console.error(error)
            setAlertText(TAG_GET_ERROR)
            setShowAlert(true)
        })
    }

    const ToggleTags = (tagName, fileNum) => {
        if (tagName == "") {
            return
        }
        if (tagDataFileToTags[fileNum] && tagDataFileToTags[fileNum].includes(tagName)) {
            axios.delete('/api/tags', {data: {"tag": tagName, "fileNum": fileNum}})
            .then(()=>{
                var newTagDataTagCounts = tagDataTagCounts
                newTagDataTagCounts[tagName]>1 ? newTagDataTagCounts[tagName]-=1 : delete newTagDataTagCounts[tagName]

                var newTagDataFileToTags = tagDataFileToTags
                newTagDataFileToTags[fileNum] = newTagDataFileToTags[fileNum].filter(t=>t!=tagName)

                setTagDataTagCounts(() => {
                    return {
                        ...newTagDataTagCounts
                    }
                })
                setTagDataFileToTags(prevFileToTags => {
                    return {
                        ...prevFileToTags,
                        fileNum:newTagDataFileToTags[fileNum]
                    }
                })
            })
            .catch((error)=>{
                console.error(error)
                setAlertText(TAG_UPDATE_ERROR)
                setShowAlert(true)
            })
        } else {
            axios.post('/api/tags', {"tag": tagName, "fileNum": fileNum})
            .then(()=>{
                var newTagDataTagCounts = tagDataTagCounts
                newTagDataTagCounts[tagName] = newTagDataTagCounts[tagName]+1 || 1

                var newTagDataFileToTags = tagDataFileToTags
                if (newTagDataFileToTags[fileNum] == undefined) {
                    newTagDataFileToTags[fileNum] = []
                }
                newTagDataFileToTags[fileNum].push(tagName)

                setTagDataTagCounts(() => {
                    return {
                        ...newTagDataTagCounts
                    }
                })
                setTagDataFileToTags(prevFileToTags => {
                    return {
                        ...prevFileToTags,
                        fileNum:newTagDataFileToTags[fileNum]
                    }
                })
            })
            .catch((error)=>{
                console.error(error)
                setAlertText(TAG_UPDATE_ERROR)
                setShowAlert(true)
            })
        }
    }

    const HandleHistory = (e) => {
        var tempInitialData = initialData
        var setTempState = false
        if (e != undefined && e.state != undefined && e.state.data) {
            tempInitialData = e.state.data
            setTempState = true
        }
        GetTagData()

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
                var fillerMetadata = {"fileNum": params.get("report"), "tags":[]}
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
                setLastSearch(query)
            })
            .catch((error)=>{
                console.error(error)
                setShowAlert(true)
            })
        } else {
            setLastSearch("")
            GetTableData()
        }
    }

    return (
        <div className="app border border-primary">
            <div className="title border-bottom border-3 border-primary">
                <h4 style={{display:"inline-block", width:"70%"}}>{title}</h4>
                <SearchBar style={{width:"30%", marginLeft:"auto", display:"inline-block"}} DoSearch={DoSearch}/>
            </div>
            <Table InitialData={initialData} InitialPageNum={selectedPage} TagDataTagCounts={tagDataTagCounts} SearchQuery={lastSearch}
                TagDataFileToTags={tagDataFileToTags} ToggleTags={ToggleTags} IsVisible={showTable} SelectReport={SelectReport}/>
            <Report ReportMetadata={selectedReportMetadata}  TagDataTagCounts={tagDataTagCounts} TagDataFileToTags={tagDataFileToTags}
                ToggleTags={ToggleTags} IsVisible={showReport} BackToTable={BackToTable}/>
            <AlertSnackbar Text={alertText} AlertType="danger" Show={showAlert}
                HandleClose={()=>{setShowAlert(false)}}/>
        </div>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
)