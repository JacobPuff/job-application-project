import React from 'react';

export const AlertSnackbar = (props) => {
    const HandleClose=()=>{
        props.HandleClose()
    }
    return (
        <div style={{position: "absolute", bottom: "25px", display:props.Show ? "unset":"none"}}>
            <div className={`alert alert-dismisable alert-${props.AlertType} alert-dismissable fade ${props.Show ? "show":""}`}
            style={{marginLeft: "auto", marginRight: "auto", width: "fit-content"}}>
                {props.Text}
                <button type="button" style={{marginLeft:"10px"}} className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={HandleClose}></button>
            </div>
        </div>
    )
}