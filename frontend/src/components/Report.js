import React, {useState, useEffect} from 'react';
import {AlertSnackbar} from './Alert'

const axios = require('axios');

export function Report(props) {
    const LOADING_STATE = <h3 key={-1}>loading...</h3>
    const ERROR_STATE = <h3 key={-2}>An error occured...</h3>
    const [reportText, setReportText] = useState([LOADING_STATE])
    const [showAlert, setShowAlert] = useState(false)
    const splitRegex = new RegExp(/[\r\n]\s[\n\r\s]+/, 'g');

    useEffect(()=>{
        if (props.ReportMetadata.fileNum) {
            GetReport()
        }
    }, [props])

    const GetReport = () => {
        axios.get('/api?report='+props.ReportMetadata.fileNum)
        .then((response)=>{
            var tempReportText = response.data
            var splitReportText = tempReportText.split(splitRegex)
            setReportText(splitReportText.map((t,i)=>t?<p key={i}>{t}</p>:null))
            setShowAlert(false)
        })
        .catch((error)=>{
            console.log(error)
            setReportText([ERROR_STATE])
            if (props.IsVisible) {
                setShowAlert(true)
            }
        })
        return
    }

    const BackToTable = () => {
        setReportText(LOADING_STATE)
        props.BackToTable()
    }


    return <div style={{display:props.IsVisible?"":"none"}}>
        <div>
            <div style={{width:"70%", marginTop: "-10px", padding:"50px", display:"inline-block"}} className="border-end border-3 border-primary">
                <button type="button" className="btn btn-primary" onClick={BackToTable}>Back</button>
                <pre style={{padding: "10px", wordWrap:"break-word", textAlign:"center", whiteSpace:"pre-wrap"}}>
                    {reportText}
                </pre>
            </div>
            <div style={{width:"70px", height:"70px", display:"inline-block", verticalAlign:"top", margin:"10px"}}>Tags will go here</div>
        </div>
        <AlertSnackbar Text="An error occured when getting the report. Please try again later." AlertType="danger" Show={showAlert}/>
    </div>
}