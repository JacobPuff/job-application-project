import React from 'react';

export const AlertSnackbar = (props) => {
    return (
        <div style={{position: "absolute", bottom: "25px"}}>
            <div className={`alert alert-dismisable alert-${props.AlertType} alert-dismissable fade ${props.Show ? "show":""}`}
            style={{marginLeft: "auto", marginRight: "auto", width: "fit-content"}}>
                {props.Text}
                <button type="button" style={{marginLeft:"10px"}} className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    )
}