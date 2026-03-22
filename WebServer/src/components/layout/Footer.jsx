/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./Footer.scss";
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Footer component that displays copyright information and, in mobile view, buttons to switch between 
 ** the three panels.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function Footer({activePanel, setActivePanel}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const copyright = `Copyright © ${new Date().getFullYear()} Herbert M. Potechius. All rights reserved`;
    const buttonData = [
        { label: '1', panel: 'left' },
        { label: '2', panel: 'center' },
        { label: '3', panel: 'right' },
    ];


    const isMobile = useMediaQuery("(max-width:900px)");

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <Box className="footer">
            <Box className="footer-content">
                <Box className="footer-text">
                    {copyright}
                </Box>
                {/* 
                In mobile view, we display buttons to switch between the three panels:
                1. Algorithms
                2. Renderer / Console
                3. Database
                */}
                {isMobile && (
                    <Box className="footer-button-box">
                        {buttonData.map(({ label, panel }) => (
                            <Button
                                key={panel}
                                className="footer-button"
                                size="small"
                                variant={activePanel === panel ? "contained" : "outlined"}
                                onClick={() => setActivePanel(panel)}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}