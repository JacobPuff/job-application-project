import React, {useState} from 'react'

export function Tag(props) {
    const HandleClick = () => {
        if (props.OnClickTag != undefined) {
            props.OnClickTag({tag: props.Tag, enabled: props.Enabled})
        }
    }
    return <div style={{backgroundColor: props.Enabled?"#87e887":"#ff8d8d", paddingLeft:"3px",
        marginBottom:"3px", marginLeft:"1px", marginRight:"1px", borderRadius: "5px"}} onClick={HandleClick}>{props.Tag}</div>
}