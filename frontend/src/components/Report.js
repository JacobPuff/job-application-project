import React, {useState, useEffect} from 'react';
import {AlertSnackbar} from './Alert'

const axios = require('axios');

export function Report(props) {
    const [reportText, setReportText] = useState([<h3>loading...</h3>])
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
            console.log(response)
            var tempReportText = response.data
            var splitReportText = tempReportText.split(splitRegex)
            setReportText(splitReportText.map((t,i)=>t?<p key={i}>{t}</p>:null))
            console.log("done")
            setShowAlert(false)
        })
        .catch((error)=>{
            console.log(error)
            if (props.IsVisible) {
                setShowAlert(true)
            }
        })
        return
    }


    return <div style={{display:props.IsVisible?"":"none"}}>
        <div style={{width:"70%", marginTop: "-10px", padding:"50px", textAlign:"center"}} className="border-end border-3 border-primary">
            <pre style={{padding: "10px", wordWrap:"break-word", whiteSpace:"pre-wrap"}}>
                {reportText}
            </pre>
        </div>
        <AlertSnackbar Text="An error occured when getting the report. Please try again later." AlertType="danger" Show={showAlert}/>
    </div>
}