import React, {useState, useEffect} from 'react';
import {AlertSnackbar} from './Alert'
import { Tag } from './Tag';

const axios = require('axios');

export function Report(props) {
    const LOADING_STATE = <h3 key={-1}>loading...</h3>
    const ERROR_STATE = <h3 key={-2}>An error occured...</h3>
    const [reportText, setReportText] = useState([LOADING_STATE])
    const [showAlert, setShowAlert] = useState(false)
    const splitRegex = new RegExp(/[\r\n]\s[\n\r\s]+/, 'g');

    useEffect(()=>{
        if (props.ReportMetadata.fileNum && props.IsVisible) {
            GetReport()
        } else {
            setReportText(LOADING_STATE)
            setShowAlert(false)
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

    const ToggleTags = (tagData) => {
        props.ToggleTags(tagData.tag, props.ReportMetadata.fileNum)
    }

    const HandleShorcuts = (e) => {

    }

    const GenerateTags = () => {
        if (props.TagDataFileToTags == undefined || props.TagDataTagCounts == undefined){
            return
        }
        var sortedTagsArray = []
        var filesTags = props.TagDataFileToTags[props.ReportMetadata.fileNum] || []
        for (const tag in props.TagDataTagCounts) {
            sortedTagsArray.push({
                tag: tag,
                count: props.TagDataTagCounts[tag],
                enabled: filesTags.includes(tag),
                shortcut: undefined})
        }
        sortedTagsArray.sort((a, b)=> {
            if (a.count == b.count) {
                return a.tag.localeCompare(b.tag)
            }
            return a.count < b.count ? 1:-1
        })

        // Get top 10 most used. They will be displayed first.
        var topTenTags = sortedTagsArray.splice(0,10)
        topTenTags = topTenTags.map((t, i)=>{return {...t, shortcut:(i+1)%10}})
        var enabledTags = sortedTagsArray.filter(t=>t.enabled)
        var disabledTags = sortedTagsArray.filter(t=>!t.enabled)
        return <div>
            <h6>Shortcuts</h6>
            {topTenTags.map((tag, i)=> <Tag key={i} Tag={`(${(i+1)%10}) `+tag.tag} Enabled={tag.enabled} OnClickTag={()=>{ToggleTags(tag)}}/>)}
            <hr className="dropdown-divider"/>
            <h6>Enabled</h6>
            {enabledTags.map((tag, i)=> <Tag key={i} Tag={tag.tag} Enabled={tag.enabled} OnClickTag={ToggleTags}/>)}
            <hr className="dropdown-divider"/>
            <h6>Disabled</h6>
            {disabledTags.map((tag, i)=> <Tag key={i} Tag={tag.tag} Enabled={tag.enabled} OnClickTag={ToggleTags}/>)}
        </div>
    }

    return <div style={{display:props.IsVisible?"unset":"none"}}>
            <div style={{width:"70%", padding:"50px", display:"inline-block"}} className="border-end border-3 border-primary">
                <button type="button" className="btn btn-primary" onClick={BackToTable}>Back</button>
                <pre style={{padding: "10px", wordWrap:"break-word", textAlign:"center", whiteSpace:"pre-wrap"}}>
                    {reportText}
                </pre>
            </div>
            <div className="border-start border-3 border-primary"
            style={{marginLeft:"-3px", width:"30%", display:"inline-block", verticalAlign:"top", padding:"10px"}}>
                <h4>Tags</h4>
                <hr className="dropdown-divider"/>
                {GenerateTags()}
            </div>
        <AlertSnackbar Text="An error occured when getting the report. Please try again later." AlertType="danger" Show={showAlert}
            HandleClose={()=>{setShowAlert(false)}}/>
    </div>
}