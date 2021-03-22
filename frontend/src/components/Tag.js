import React, {useState} from 'react'

export function Tag(props) {
    return <div style={{backgroundColor: props.Enabled?"#87e887":"#ff8d8d", paddingLeft:"3px",
        marginBottom:"3px", marginLeft:"1px", marginRight:"1px", borderRadius: "5px"}}>{props.Name}</div>
}