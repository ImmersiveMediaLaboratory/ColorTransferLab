/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import './Textures.scss';
import useMediaQuery from '@mui/material/useMediaQuery';

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Renders the textures of the mesh for the source, reference and output renderer. 
 ** If no texture is available, a chess pattern is shown.
 ******************************************************************************************************************
 ******************************************************************************************************************/
function Textures({activeRenderer, meshTexture}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** STATES & REFERENCES & VARIABLES
     **************************************************************************************************************
     **************************************************************************************************************/

    /*------------------------------------------------------------------------------------------------------------
    -- VARIABLES
    -------------------------------------------------------------------------------------------------------------*/
    const isMobile = useMediaQuery("(max-width:900px)");

    // Visibility: Desktop → all visible; Mobile → only activeRenderer
    const showSrc  = !isMobile || activeRenderer === "src";
    const showRef  = !isMobile || activeRenderer === "ref";
    const showOut  = !isMobile || activeRenderer === "out";

    const chessPattern = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><defs><pattern id='c' width='8' height='8' patternUnits='userSpaceOnUse'><rect width='8' height='8' fill='%23ccc'/><rect width='4' height='4' fill='%23eee'/><rect x='4' y='4' width='4' height='4' fill='%23eee'/></pattern></defs><rect width='64' height='64' fill='url(%23c)'/></svg>";

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className='textures_content'>
            {/* SRC-Infos */}
            <div
                className='sub_textures_content'
                style={{ display: showSrc ? undefined : "none" }}
            >
                <div className="texture-container">
                    <img 
                        className="texture" 
                        src={meshTexture?.src || chessPattern
                        }
                        alt="Texture"
                    />
                </div>
            </div>

            {/* REF-Infos */}
            <div
                className='sub_textures_content'
                style={{ display: showRef ? undefined : "none" }}
            >
                <div className="texture-container">
                    <img 
                        className="texture" 
                        src={meshTexture?.ref || chessPattern}
                    />
                </div>
            </div>

            {/* OUT-Infos */}
            <div
                className='sub_textures_content'
                style={{ display: showOut ? undefined : "none" }}
            >
                <div className="texture-container">
                    <img
                        className="texture" 
                        src={meshTexture?.out || chessPattern}
                    />
                </div>
            </div>
        </div>
    );
}

export default Textures;